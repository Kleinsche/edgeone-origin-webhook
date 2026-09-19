/**
 * EdgeOne（TEO）开放 API 客户端
 *
 * 实现了腾讯云 API 3.0 的 TC3-HMAC-SHA256 签名，用于调用：
 *   - DescribeAccelerationDomains：查询站点下加速域名及其源站配置
 *   - ModifyAccelerationDomain：修改回源 IP（OriginInfo）与 HTTP/HTTPS 回源端口
 *
 * 只依赖 Node.js 内置 crypto / fetch，无需安装 tencentcloud-sdk-nodejs，
 * 适合直接部署到 EdgeOne Makers 的 Cloud Functions。
 */

import crypto from 'node:crypto';

const SERVICE = 'teo';
const API_VERSION = '2022-09-01';
const DEFAULT_ENDPOINT = 'https://teo.tencentcloudapi.com';
const DEFAULT_TIMEOUT_MS = 15000;

export class TeoApiError extends Error {
  constructor(code, message, requestId, httpStatus) {
    super(message);
    this.name = 'TeoApiError';
    this.code = code;
    this.requestId = requestId;
    this.httpStatus = httpStatus;
  }
}

const sha256Hex = (data) => crypto.createHash('sha256').update(data, 'utf8').digest('hex');
const hmacSha256 = (key, data) => crypto.createHmac('sha256', key).update(data, 'utf8').digest();

/**
 * 生成 TC3-HMAC-SHA256 Authorization 头
 * 签名流程参见 https://cloud.tencent.com/document/api/213/30654
 * 导出以便单元测试与排障，业务代码无需直接调用。
 *
 * @returns {{authorization: string, canonicalRequest: string, stringToSign: string, signature: string, credentialScope: string, signedHeaders: string}}
 */
export function buildSignature({
  secretId,
  secretKey,
  action,
  payload,
  timestamp,
  host,
  contentType = 'application/json',
  service = SERVICE,
}) {
  // 签名中的日期必须为 UTC 日期（不能用本地时区，否则跨零点必然失败）
  const date = new Date(timestamp * 1000).toISOString().slice(0, 10);

  const canonicalHeaders = `content-type:${contentType}\nhost:${host}\nx-tc-action:${action.toLowerCase()}\n`;
  const signedHeaders = 'content-type;host;x-tc-action';

  const canonicalRequest = [
    'POST',
    '/',
    '',
    canonicalHeaders,
    signedHeaders,
    sha256Hex(payload),
  ].join('\n');

  const credentialScope = `${date}/${service}/tc3_request`;
  const stringToSign = [
    'TC3-HMAC-SHA256',
    String(timestamp),
    credentialScope,
    sha256Hex(canonicalRequest),
  ].join('\n');

  const secretDate = hmacSha256(`TC3${secretKey}`, date);
  const secretService = hmacSha256(secretDate, service);
  const secretSigning = hmacSha256(secretService, 'tc3_request');
  const signature = hmacSha256(secretSigning, stringToSign).toString('hex');

  // 注意：Algorithm 与 Credential 之间是空格，后续各段之间是 ", "
  const authorization =
    `TC3-HMAC-SHA256 Credential=${secretId}/${credentialScope}, ` +
    `SignedHeaders=${signedHeaders}, Signature=${signature}`;

  return { authorization, canonicalRequest, stringToSign, signature, credentialScope, signedHeaders };
}

export class TeoClient {
  constructor({ secretId, secretKey, endpoint = DEFAULT_ENDPOINT, timeoutMs = DEFAULT_TIMEOUT_MS, region }) {
    if (!secretId || !secretKey) {
      throw new Error('缺少 SecretId / SecretKey，请在环境变量中配置');
    }
    this.secretId = secretId;
    this.secretKey = secretKey;
    this.endpoint = endpoint;
    this.timeoutMs = timeoutMs;
    this.region = region;
    this.host = new URL(endpoint).host;
  }

  /**
   * 调用 TEO 接口
   * @param {string} action 接口名，如 DescribeAccelerationDomains
   * @param {object} payload 业务参数
   */
  async call(action, payload = {}) {
    const body = JSON.stringify(payload);
    const timestamp = Math.floor(Date.now() / 1000);

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);

    let res;
    let raw;
    try {
      res = await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-TC-Action': action,
          'X-TC-Version': API_VERSION,
          'X-TC-Timestamp': String(timestamp),
          ...(this.region ? { 'X-TC-Region': this.region } : {}),
          Authorization: buildSignature({
            secretId: this.secretId,
            secretKey: this.secretKey,
            action,
            payload: body,
            timestamp,
            host: this.host,
          }).authorization,
        },
        body,
        signal: controller.signal,
      });
      raw = await res.text();
    } catch (err) {
      if (err.name === 'AbortError') {
        throw new TeoApiError('RequestTimeout', `调用 ${action} 超时（${this.timeoutMs}ms）`, null, null);
      }
      throw new TeoApiError('NetworkError', `${action} 请求失败：${err.message}`, null, null);
    } finally {
      clearTimeout(timer);
    }

    let json;
    try {
      json = JSON.parse(raw);
    } catch {
      throw new TeoApiError(
        'InvalidResponse',
        `${action} 返回了非 JSON 内容：${raw.slice(0, 300)}`,
        null,
        res.status,
      );
    }

    const response = json.Response || {};
    if (response.Error) {
      throw new TeoApiError(
        response.Error.Code || 'UnknownError',
        response.Error.Message || '未知错误',
        response.Error.RequestId || response.RequestId || null,
        res.status,
      );
    }
    if (!res.ok) {
      throw new TeoApiError('HttpError', `${action} HTTP ${res.status}`, response.RequestId, res.status);
    }
    return response;
  }

  /**
   * 按域名精确查询加速域名（DescribeAccelerationDomains）
   * @returns {Promise<object|null>} AccelerationDomain，不存在时返回 null
   */
  async findAccelerationDomain(zoneId, domainName) {
    const response = await this.call('DescribeAccelerationDomains', {
      ZoneId: zoneId,
      Filters: [{ Name: 'domain-name', Values: [domainName], Fuzzy: false }],
      Limit: 200,
      Offset: 0,
      Match: 'all',
    });
    const list = response.AccelerationDomains || [];
    return list.find((item) => item.DomainName === domainName) || null;
  }

  /**
   * 分页拉取站点下全部加速域名
   */
  async listAccelerationDomains(zoneId, { limit = 200, offset = 0 } = {}) {
    const response = await this.call('DescribeAccelerationDomains', {
      ZoneId: zoneId,
      Limit: limit,
      Offset: offset,
    });
    return {
      total: response.TotalCount || 0,
      domains: response.AccelerationDomains || [],
      requestId: response.RequestId || null,
    };
  }

  /**
   * 修改加速域名（ModifyAccelerationDomain）
   * @param {object} params
   * @param {string} params.zoneId
   * @param {string} params.domainName
   * @param {{OriginType: string, Origin: string}} [params.originInfo]
   * @param {number} [params.httpOriginPort]
   * @param {number} [params.httpsOriginPort]
   * @param {string} [params.originProtocol] FOLLOW / HTTP / HTTPS
   */
  async modifyAccelerationDomain({ zoneId, domainName, originInfo, httpOriginPort, httpsOriginPort, originProtocol }) {
    const payload = {
      ZoneId: zoneId,
      DomainName: domainName,
    };
    if (originInfo) payload.OriginInfo = originInfo;
    if (Number.isInteger(httpOriginPort)) payload.HttpOriginPort = httpOriginPort;
    if (Number.isInteger(httpsOriginPort)) payload.HttpsOriginPort = httpsOriginPort;
    if (originProtocol) payload.OriginProtocol = originProtocol;

    const response = await this.call('ModifyAccelerationDomain', payload);
    return response.RequestId || null;
  }
}
