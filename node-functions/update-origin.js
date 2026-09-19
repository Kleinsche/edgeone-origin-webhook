/**
 * EdgeOne 回源配置更新 Webhook
 *
 * 路由：POST /update-origin
 *
 * 请求体（application/json）：
 * {
 *   "domain":    "www.example.com",   // 必填，EdgeOne 上已接入的加速域名
 *   "ip":        "1.2.3.4",           // 必填，回源 IP（多个用逗号分隔或传数组）
 *   "httpPort":  80,                  // HTTP 回源端口，缺省 80
 *   "httpsPort": 443,                 // HTTPS 回源端口，缺省 443
 *   "originProtocol": "FOLLOW",       // 可选：FOLLOW / HTTP / HTTPS，缺省沿用现有配置
 *   "dryRun":    false                // 可选：true 时只做校验与预览，不真正下发
 * }
 *
 * 环境变量：
 *   EO_SECRET_ID   腾讯云 SecretId（也支持 TENCENTCLOUD_SECRET_ID）
 *   EO_SECRET_KEY  腾讯云 SecretKey（也支持 TENCENTCLOUD_SECRET_KEY）
 *   EO_ZONE_ID     站点 ID，如 zone-2xxx
 *   WEBHOOK_TOKEN  可选，配置后 Webhook 需携带该令牌
 *   EO_DEFAULT_ORIGIN_PROTOCOL  可选，缺省回源协议（FOLLOW / HTTP / HTTPS）
 *   EO_ALLOWED_DOMAINS           可选，允许操作的域名白名单，逗号分隔，支持 *.example.com
 *   EO_ORIGIN_SEPARATOR          可选，多源站分隔符，默认 ","
 *   EO_API_ENDPOINT              可选，默认 https://teo.tencentcloudapi.com
 *   EO_API_TIMEOUT_MS            可选，接口超时，默认 15000
 */

import { TeoClient, TeoApiError } from '../lib/teo-client.js';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, X-Webhook-Token, Authorization',
};

const JSON_HEADERS = { 'Content-Type': 'application/json; charset=utf-8', ...CORS_HEADERS };

function json(body, status = 200) {
  return new Response(JSON.stringify(body, null, 2), { status, headers: JSON_HEADERS });
}

function fail(status, code, message, extra = {}) {
  return json({ ok: false, error: { code, message }, ...extra }, status);
}

/** 合并 context.env 与 process.env，两者任一存在即可 */
function env(context, key) {
  const fromContext = context?.env?.[key];
  if (fromContext !== undefined && fromContext !== '') return fromContext;
  const fromProcess = typeof process !== 'undefined' ? process.env?.[key] : undefined;
  return fromProcess;
}

function envFirst(context, ...keys) {
  for (const key of keys) {
    const value = env(context, key);
    if (value !== undefined && value !== '') return value;
  }
  return undefined;
}

const IPV4_RE = /^(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/;
// 形似 IPv4（四段纯数字）但不合法，如 999.1.1.1，必须拒绝而不是当作域名放行
const IPV4_LIKE_RE = /^\d{1,3}(\.\d{1,3}){3}$/;
const DOMAIN_RE = /^(?=.{1,253}$)([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
// 仅做基础格式判断，完整 IPv6 交由 EdgeOne 后端校验
const IPV6_RE = /^[0-9a-fA-F:]{2,45}$/;

function isOriginAddress(value) {
  if (IPV4_RE.test(value)) return true;
  if (IPV4_LIKE_RE.test(value)) return false;
  if (DOMAIN_RE.test(value)) return true;
  return IPV6_RE.test(value) && (value.match(/:/g) || []).length >= 2;
}

function normalizePort(value, name, fallback) {
  if (value === undefined || value === null || value === '') return fallback;
  const port = typeof value === 'string' ? Number(value.trim()) : Number(value);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new ValidationError(`${name} 端口无效：${value}，取值范围 1-65535`);
  }
  return port;
}

class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
  }
}

/** 取出 body 中第一个有值的字段，兼容多种命名习惯 */
function pick(payload, keys) {
  for (const key of keys) {
    const value = payload?.[key];
    if (value !== undefined && value !== null && value !== '') return value;
  }
  return undefined;
}

function normalizeDomain(raw) {
  const value = String(raw).trim().toLowerCase().replace(/\.$/, '');
  if (!DOMAIN_RE.test(value)) {
    throw new ValidationError(`域名格式无效：${raw}`);
  }
  return value;
}

function normalizeOrigins(raw, separator) {
  const list = (Array.isArray(raw) ? raw : String(raw).split(/[,;\s]+/))
    .map((item) => String(item).trim())
    .filter(Boolean);

  const invalid = list.filter((item) => !isOriginAddress(item));
  if (invalid.length > 0) {
    throw new ValidationError(`回源地址无效：${invalid.join(', ')}（需为 IPv4 / IPv6 / 域名）`);
  }
  return list.join(separator);
}

/** 域名白名单：支持完整域名与通配子域，如 *.example.com */
function isDomainAllowed(context, domain) {
  const whitelist = env(context, 'EO_ALLOWED_DOMAINS');
  if (!whitelist) return true;
  const rules = whitelist.split(',').map((item) => item.trim().toLowerCase()).filter(Boolean);
  if (rules.length === 0) return true;
  return rules.some((rule) => {
    if (rule === domain) return true;
    if (rule.startsWith('*.')) {
      const parent = rule.slice(2);
      return domain === parent || domain.endsWith(`.${parent}`);
    }
    return false;
  });
}

/** 令牌校验，未配置 WEBHOOK_TOKEN 时放行 */
function isTokenValid(context, request, payload) {
  const expected = env(context, 'WEBHOOK_TOKEN');
  if (!expected) return true;
  const provided =
    request.headers.get('x-webhook-token') ||
    (request.headers.get('authorization') || '').replace(/^Bearer\s+/i, '') ||
    payload?.token ||
    '';
  return String(provided).trim() === String(expected).trim();
}

function buildClient(context) {
  return new TeoClient({
    secretId: envFirst(context, 'EO_SECRET_ID', 'TENCENTCLOUD_SECRET_ID'),
    secretKey: envFirst(context, 'EO_SECRET_KEY', 'TENCENTCLOUD_SECRET_KEY'),
    endpoint: env(context, 'EO_API_ENDPOINT') || undefined,
    timeoutMs: Number(env(context, 'EO_API_TIMEOUT_MS')) || undefined,
    region: env(context, 'EO_API_REGION') || undefined,
  });
}

function describeOriginConfig(domain) {
  const detail = domain.OriginDetail || {};
  return {
    originType: detail.OriginType || null,
    origin: detail.Origin || null,
    backupOrigin: detail.BackupOrigin || null,
    originGroupName: detail.OriginGroupName || null,
    originProtocol: domain.OriginProtocol || null,
    httpOriginPort: domain.HttpOriginPort ?? null,
    httpsOriginPort: domain.HttpsOriginPort ?? null,
    domainStatus: domain.DomainStatus || null,
    cname: domain.Cname || null,
  };
}

async function handleDescribe(context, url) {
  const zoneId = env(context, 'EO_ZONE_ID');
  if (!zoneId) return fail(500, 'MissingConfig', '服务端未配置 EO_ZONE_ID');
  if (!isTokenValid(context, context.request, {})) {
    return fail(401, 'Unauthorized', 'Webhook 令牌校验失败');
  }

  const domainParam = url.searchParams.get('domain');
  if (!domainParam) {
    try {
      const client = buildClient(context);
      const result = await client.listAccelerationDomains(zoneId, {
        limit: Math.min(Number(url.searchParams.get('limit')) || 200, 200),
        offset: Number(url.searchParams.get('offset')) || 0,
      });
      return json({
        ok: true,
        zoneId,
        total: result.total,
        domains: result.domains.map((item) => ({
          domain: item.DomainName,
          ...describeOriginConfig(item),
        })),
        requestId: result.requestId,
      });
    } catch (err) {
      return handleError(err, '查询加速域名列表失败');
    }
  }

  let domain;
  try {
    domain = normalizeDomain(domainParam);
  } catch (err) {
    return fail(400, 'InvalidParameter', err.message);
  }

  try {
    const client = buildClient(context);
    const found = await client.findAccelerationDomain(zoneId, domain);
    if (!found) {
      return fail(404, 'DomainNotFound', `站点 ${zoneId} 下不存在加速域名 ${domain}`);
    }
    return json({ ok: true, zoneId, domain: found.DomainName, origin: describeOriginConfig(found) });
  } catch (err) {
    return handleError(err, '查询加速域名失败');
  }
}

function handleError(err, prefix) {
  if (err instanceof TeoApiError) {
    const statusMap = {
      ResourceUnavailable: 404,
      AuthFailure: 401,
      UnauthorizedOperation: 403,
      InvalidParameter: 400,
      InvalidParameterValue: 400,
      RequestLimitExceeded: 429,
      LimitExceeded: 429,
    };
    const status = err.httpStatus && err.httpStatus !== 200
      ? err.httpStatus
      : (statusMap[err.code?.split('.')[0]] || 502);
    return fail(status, err.code || 'TeoApiError', `${prefix}：${err.message}`, { requestId: err.requestId });
  }
  if (err instanceof ValidationError) {
    return fail(400, 'InvalidParameter', err.message);
  }
  return fail(500, 'InternalError', `${prefix}：${err.message}`);
}

export async function onRequest(context) {
  const { request } = context;

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  if (request.method === 'GET') {
    const url = new URL(request.url);
    return handleDescribe(context, url);
  }

  if (request.method !== 'POST') {
    return fail(405, 'MethodNotAllowed', '仅支持 GET / POST，请使用 POST 提交更新请求');
  }

  // ---------- 解析请求体 ----------
  // 支持 application/json、application/x-www-form-urlencoded 以及纯 query 传参
  const contentType = request.headers.get('content-type') || '';
  const query = Object.fromEntries(new URL(request.url).searchParams.entries());

  let payload = {};
  let raw = '';
  try {
    raw = await request.text();
  } catch {
    raw = '';
  }

  if (raw.trim()) {
    if (contentType.includes('application/x-www-form-urlencoded')) {
      payload = Object.fromEntries(new URLSearchParams(raw).entries());
    } else {
      try {
        payload = JSON.parse(raw);
      } catch (err) {
        return fail(400, 'InvalidBody', `请求体不是合法 JSON：${err.message}`);
      }
    }
  }

  // 请求体为空或非对象时，回退到 URL query 参数
  const invalidPayload = typeof payload !== 'object' || payload === null || Array.isArray(payload);
  if (invalidPayload || Object.keys(payload).length === 0) {
    if (invalidPayload) return fail(400, 'InvalidBody', '请求体必须是 JSON 对象');
    payload = query;
  }

  // ---------- 鉴权 ----------
  if (!isTokenValid(context, request, payload)) {
    return fail(401, 'Unauthorized', 'Webhook 令牌校验失败');
  }

  // ---------- 参数校验 ----------
  const zoneId = env(context, 'EO_ZONE_ID');
  if (!zoneId) return fail(500, 'MissingConfig', '服务端未配置 EO_ZONE_ID');

  const separator = env(context, 'EO_ORIGIN_SEPARATOR') || ',';

  let domain;
  let origin;
  let httpPort;
  let httpsPort;
  try {
    const rawDomain = pick(payload, ['domain', 'domainName', 'hostname', 'host']);
    if (!rawDomain) throw new ValidationError('缺少必填参数 domain（加速域名）');
    domain = normalizeDomain(rawDomain);

    const rawIp = pick(payload, ['ip', 'ipAddress', 'origin', 'origins', 'ipList']);
    if (!rawIp) throw new ValidationError('缺少必填参数 ip（回源 IP 地址）');
    origin = normalizeOrigins(rawIp, separator);

    httpPort = normalizePort(pick(payload, ['httpPort', 'http_port', 'http']), 'HTTP', 80);
    httpsPort = normalizePort(pick(payload, ['httpsPort', 'https_port', 'https']), 'HTTPS', 443);
  } catch (err) {
    if (err instanceof ValidationError) return fail(400, 'InvalidParameter', err.message);
    throw err;
  }

  if (!isDomainAllowed(context, domain)) {
    return fail(403, 'DomainForbidden', `域名 ${domain} 不在 EO_ALLOWED_DOMAINS 白名单内`);
  }

  const dryRun = payload.dryRun === true || String(payload.dryRun).toLowerCase() === 'true';
  const requestedProtocol = pick(payload, ['originProtocol', 'protocol']);

  // ---------- 调用 EdgeOne API ----------
  try {
    const client = buildClient(context);

    // 1) 确认域名归属该站点，并取得当前源站配置
    const current = await client.findAccelerationDomain(zoneId, domain);
    if (!current) {
      return fail(404, 'DomainNotFound', `站点 ${zoneId} 下不存在加速域名 ${domain}`);
    }

    const before = describeOriginConfig(current);
    const originType = before.originType || 'IP_DOMAIN';

    const originInfo = { OriginType: originType, Origin: origin };
    const protocol =
      requestedProtocol ||
      env(context, 'EO_DEFAULT_ORIGIN_PROTOCOL') ||
      before.originProtocol ||
      undefined;

    if (dryRun) {
      return json({
        ok: true,
        dryRun: true,
        zoneId,
        domain,
        before,
        after: {
          originType,
          origin,
          originProtocol: protocol || null,
          httpOriginPort: httpPort,
          httpsOriginPort: httpsPort,
        },
      });
    }

    // 2) 下发修改
    const requestId = await client.modifyAccelerationDomain({
      zoneId,
      domainName: domain,
      originInfo,
      httpOriginPort: httpPort,
      httpsOriginPort: httpsPort,
      originProtocol: protocol,
    });

    // 3) 回读确认
    let after = null;
    let verifyError = null;
    try {
      const updated = await client.findAccelerationDomain(zoneId, domain);
      after = updated ? describeOriginConfig(updated) : null;
    } catch (err) {
      verifyError = err.message;
    }

    return json({
      ok: true,
      dryRun: false,
      requestId,
      zoneId,
      domain,
      applied: {
        originType,
        origin,
        originProtocol: protocol || null,
        httpOriginPort: httpPort,
        httpsOriginPort: httpsPort,
      },
      before,
      after,
      ...(verifyError ? { verifyError } : {}),
      notes: [
        protocol === 'HTTPS'
          ? '当前回源协议为 HTTPS，HttpOriginPort 不会生效，仅 HttpsOriginPort 生效。'
          : '回源协议为 FOLLOW/HTTP 时使用 HttpOriginPort，HTTPS 时使用 HttpsOriginPort。',
      ],
    });
  } catch (err) {
    return handleError(err, '更新回源配置失败');
  }
}
