# EdgeOne 回源配置更新 Webhook

部署在 **EdgeOne Makers Cloud Functions** 上的中间脚本：对外暴露一个 HTTP 接口，接收 Webhook 请求后调用腾讯云 EdgeOne（TEO）开放 API，更新指定加速域名的**回源 IP** 与 **HTTP/HTTPS 回源端口**。

密钥 SecretId / SecretKey / ZoneId 统一从环境变量读取，不落盘、不回显在响应中。

## 目录结构

```
.
├── edgeone.json                    # EdgeOne Pages/Makers 项目配置（部署地域）
├── lib
│   └── teo-client.js               # TEO OpenAPI 客户端：TC3-HMAC-SHA256 签名 + 接口封装
├── node-functions
│   └── update-origin.js            # Webhook 入口，路由 /update-origin
├── .env.example                    # 环境变量样例
└── package.json
```

`node-functions/*.js` 会被自动映射为路由，`update-origin.js` 对应端点 `/update-origin`。

## 涉及的 EdgeOne API

| 接口 | 用途 |
| --- | --- |
| `DescribeAccelerationDomains` | 校验域名是否存在于该站点，并读取当前源站配置（`OriginDetail`、`HttpOriginPort`、`HttpsOriginPort`、`OriginProtocol`） |
| `ModifyAccelerationDomain` | 下发新的 `OriginInfo`（源站 IP）与 `HttpOriginPort` / `HttpsOriginPort` |

API 版本：`2022-09-01`，服务名：`teo`，接入点：`https://teo.tencentcloudapi.com`。

> 签名未使用 `tencentcloud-sdk-nodejs`，而是内置实现了官方 **TC3-HMAC-SHA256** 签名流程（仅依赖 Node 内置 `crypto` / `fetch`），避免引入体积庞大的 SDK。

## 环境变量

在 EdgeOne Makers 控制台 → 项目设置 → 环境变量中配置。

| 变量 | 必填 | 说明 |
| --- | --- | --- |
| `EO_SECRET_ID` | 是 | 腾讯云 SecretId（兼容别名 `TENCENTCLOUD_SECRET_ID`） |
| `EO_SECRET_KEY` | 是 | 腾讯云 SecretKey（兼容别名 `TENCENTCLOUD_SECRET_KEY`） |
| `EO_ZONE_ID` | 是 | EdgeOne 站点 ID，形如 `zone-225qgrnvbi9w` |
| `WEBHOOK_TOKEN` | 否 | Webhook 调用令牌。**强烈建议设置**，否则任何人都能改你的回源配置 |
| `EO_DEFAULT_ORIGIN_PROTOCOL` | 否 | 缺省回源协议 `FOLLOW` / `HTTP` / `HTTPS`，不设置则沿用域名现有配置 |
| `EO_ALLOWED_DOMAINS` | 否 | 域名白名单，逗号分隔，支持通配子域，如 `*.example.com,assets.example.com` |
| `EO_ORIGIN_SEPARATOR` | 否 | 多源站分隔符，默认 `,` |
| `EO_API_ENDPOINT` | 否 | 自定义接入点 |
| `EO_API_TIMEOUT_MS` | 否 | 单次 API 调用超时，默认 `15000` |
| `EO_API_REGION` | 否 | `X-TC-Region`，TEO 为全球服务，一般无需设置 |

本地调试：复制 `.env.example` 为 `.env`。

## 接口说明

### 1. 更新回源配置

```http
POST /update-origin
Content-Type: application/json
X-Webhook-Token: <WEBHOOK_TOKEN>
```

```json
{
  "domain": "www.example.com",
  "ip": "1.2.3.4",
  "httpPort": 80,
  "httpsPort": 443
}
```

| 字段 | 必填 | 说明 |
| --- | --- | --- |
| `domain` | 是 | 加速域名（同义字段：`domainName` / `hostname`） |
| `ip` | 是 | 回源 IP，支持 IPv4 / IPv6 / 域名；多个源站可用逗号分隔或传数组（同义字段：`ipAddress` / `origin`） |
| `httpPort` | 否 | HTTP 回源端口，1-65535，默认 `80` |
| `httpsPort` | 否 | HTTPS 回源端口，1-65535，默认 `443` |
| `originProtocol` | 否 | `FOLLOW` / `HTTP` / `HTTPS`，不传则沿用现有配置 |
| `dryRun` | 否 | `true` 时只做校验并返回变更预览，不下发修改 |

也支持 `application/x-www-form-urlencoded` 或直接在 URL query 上传参。

成功响应：

```json
{
  "ok": true,
  "dryRun": false,
  "requestId": "b6f3xxxx-xxxx-xxxx-xxxx-xxxx",
  "zoneId": "zone-225qgrnvbi9w",
  "domain": "www.example.com",
  "applied": {
    "originType": "IP_DOMAIN",
    "origin": "1.2.3.4",
    "originProtocol": "FOLLOW",
    "httpOriginPort": 80,
    "httpsOriginPort": 443
  },
  "before": { "origin": "9.9.9.9", "httpOriginPort": 8080, "httpsOriginPort": 8443 },
  "after":  { "origin": "1.2.3.4", "httpOriginPort": 80,   "httpsOriginPort": 443  },
  "notes": ["回源协议为 FOLLOW/HTTP 时使用 HttpOriginPort，HTTPS 时使用 HttpsOriginPort。"]
}
```

失败响应：

```json
{ "ok": false, "error": { "code": "InvalidParameter", "message": "缺少必填参数 domain（加速域名）" } }
```

常见状态码：`400` 参数错误、`401` 令牌校验失败、`403` 域名不在白名单、`404` 域名不存在、`405` 方法不允许、`5xx` EdgeOne API 错误。

> `after` 为下发后立即回读的结果，若 EdgeOne 配置尚未下发完成，可能仍是旧值，以 `requestId` 为准。

### 2. 查询当前回源配置

```http
GET /update-origin?domain=www.example.com
GET /update-origin              # 列出站点下所有域名及其源站配置
GET /update-origin?limit=50&offset=0
```

## 调用示例

```bash
curl -X POST https://<你的 EdgeOne 域名>/update-origin \
  -H "Content-Type: application/json" \
  -H "X-Webhook-Token: your-strong-random-token" \
  -d '{"domain":"www.example.com","ip":"1.2.3.4","httpPort":80,"httpsPort":443}'
```

令牌也可通过 `Authorization: Bearer <token>` 或请求体 `"token": "<token>"` 传递。

## 部署

```bash
npm install -g edgeone
edgeone deploy
```

或在 EdgeOne Makers 控制台直接关联 Git 仓库自动构建。

## 权限最小化建议

为调用 API 的子账号/密钥授以下策略（避免使用全局 `AdministratorAccess`）：

```json
{
  "version": "2.0",
  "statement": [
    {
      "effect": "allow",
      "action": ["teo:DescribeAccelerationDomains", "teo:ModifyAccelerationDomain"],
      "resource": "*"
    }
  ]
}
```

## 注意事项

1. `HttpOriginPort` 仅在回源协议为 `FOLLOW` / `HTTP` 时生效，`HttpsOriginPort` 仅在 `HTTPS` 时生效，脚本会在 `notes` 中给出提示。
2. 修改 `OriginInfo` 会覆盖原主源站；多源站请用逗号分隔一次传入全部地址。
3. 若域名当前源站类型是 `COS`、`ORIGIN_GROUP` 等对象存储/源站组，脚本会沿用其 `OriginType` 直接改写地址，请先用 `GET /update-origin?domain=xxx` 确认再操作。
4. API 请求签名依赖机器时间，需保证云函数运行环境时间准确（TEO 要求时间戳偏差不超过 5 分钟）。
