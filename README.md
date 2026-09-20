# EdgeOne 回源配置更新 Webhook

<table><tr>
<td align="center">
  <a href="https://console.cloud.tencent.com/edgeone/makers/new?repository-url=https%3A%2F%2Fgithub.com%2FKleinsche%2Fedgeone-origin-webhook&repository-name=edgeone-origin-webhook&project-name=edgeone-origin-webhook&root-directory=%2F&install-command=npm%20install&env=EO_SECRET_ID%2CEO_SECRET_KEY%2CEO_ZONE_ID%2CWEBHOOK_TOKEN&env-description=EO_SECRET_ID%20%2F%20EO_SECRET_KEY%20%E4%BB%8E%E8%85%BE%E8%AE%AF%E4%BA%91%20CAM%20%E5%AF%86%E9%92%A5%E6%8E%A7%E5%88%B6%E5%8F%B0%E8%8E%B7%E5%8F%96%EF%BC%8C%E5%BB%BA%E8%AE%AE%E6%8E%88%E4%BA%88%E6%9C%80%E5%B0%8F%E6%9D%83%E9%99%90%E7%AD%96%E7%95%A5%EF%BC%9BEO_ZONE_ID%20%E4%B8%BA%E9%BB%98%E8%AE%A4%E7%AB%99%E7%82%B9%20ID%EF%BC%88%E5%85%B6%E4%BB%96%E7%AB%99%E7%82%B9%E5%8F%AF%E5%9C%A8%E8%AF%B7%E6%B1%82%E4%BD%93%E4%BC%A0%20zoneId%20%E6%8C%87%E5%AE%9A%EF%BC%89%EF%BC%9BWEBHOOK_TOKEN%20%E4%B8%BA%E8%B0%83%E7%94%A8%E4%BB%A4%E7%89%8C%EF%BC%8C%E5%BC%BA%E7%83%88%E5%BB%BA%E8%AE%AE%E8%AE%BE%E7%BD%AE&env-link=https%3A%2F%2Fconsole.cloud.tencent.com%2Fcam%2Fcapi"><img src="assets/buttons/btn-cn.svg" alt="部署到 EdgeOne（中国站）" height="32"></a><br>
  <sub>中国站</sub>
</td>
<td align="center">
  <a href="https://console.tencentcloud.com/edgeone/makers/new?repository-url=https%3A%2F%2Fgithub.com%2FKleinsche%2Fedgeone-origin-webhook&repository-name=edgeone-origin-webhook&project-name=edgeone-origin-webhook&root-directory=%2F&install-command=npm%20install&env=EO_SECRET_ID%2CEO_SECRET_KEY%2CEO_ZONE_ID%2CWEBHOOK_TOKEN&env-description=EO_SECRET_ID%20%2F%20EO_SECRET_KEY%20%E4%BB%8E%E8%85%BE%E8%AE%AF%E4%BA%91%20CAM%20%E5%AF%86%E9%92%A5%E6%8E%A7%E5%88%B6%E5%8F%B0%E8%8E%B7%E5%8F%96%EF%BC%8C%E5%BB%BA%E8%AE%AE%E6%8E%88%E4%BA%88%E6%9C%80%E5%B0%8F%E6%9D%83%E9%99%90%E7%AD%96%E7%95%A5%EF%BC%9BEO_ZONE_ID%20%E4%B8%BA%E9%BB%98%E8%AE%A4%E7%AB%99%E7%82%B9%20ID%EF%BC%88%E5%85%B6%E4%BB%96%E7%AB%99%E7%82%B9%E5%8F%AF%E5%9C%A8%E8%AF%B7%E6%B1%82%E4%BD%93%E4%BC%A0%20zoneId%20%E6%8C%87%E5%AE%9A%EF%BC%89%EF%BC%9BWEBHOOK_TOKEN%20%E4%B8%BA%E8%B0%83%E7%94%A8%E4%BB%A4%E7%89%8C%EF%BC%8C%E5%BC%BA%E7%83%88%E5%BB%BA%E8%AE%AE%E8%AE%BE%E7%BD%AE&env-link=https%3A%2F%2Fconsole.tencentcloud.com%2Fcam%2Fcapi"><img src="assets/buttons/btn-intl.svg" alt="部署到 EdgeOne（国际站）" height="32"></a><br>
  <sub>国际站</sub>
</td>
<td align="center">
  <a href="https://edgeone.ai/pages/new?repository-url=https%3A%2F%2Fgithub.com%2FKleinsche%2Fedgeone-origin-webhook&repository-name=edgeone-origin-webhook&project-name=edgeone-origin-webhook&root-directory=%2F&install-command=npm%20install&env=EO_SECRET_ID%2CEO_SECRET_KEY%2CEO_ZONE_ID%2CWEBHOOK_TOKEN&env-description=EO_SECRET_ID%20%2F%20EO_SECRET_KEY%20%E4%BB%8E%E8%85%BE%E8%AE%AF%E4%BA%91%20CAM%20%E5%AF%86%E9%92%A5%E6%8E%A7%E5%88%B6%E5%8F%B0%E8%8E%B7%E5%8F%96%EF%BC%8C%E5%BB%BA%E8%AE%AE%E6%8E%88%E4%BA%88%E6%9C%80%E5%B0%8F%E6%9D%83%E9%99%90%E7%AD%96%E7%95%A5%EF%BC%9BEO_ZONE_ID%20%E4%B8%BA%E9%BB%98%E8%AE%A4%E7%AB%99%E7%82%B9%20ID%EF%BC%88%E5%85%B6%E4%BB%96%E7%AB%99%E7%82%B9%E5%8F%AF%E5%9C%A8%E8%AF%B7%E6%B1%82%E4%BD%93%E4%BC%A0%20zoneId%20%E6%8C%87%E5%AE%9A%EF%BC%89%EF%BC%9BWEBHOOK_TOKEN%20%E4%B8%BA%E8%B0%83%E7%94%A8%E4%BB%A4%E7%89%8C%EF%BC%8C%E5%BC%BA%E7%83%88%E5%BB%BA%E8%AE%AE%E8%AE%BE%E7%BD%AE&env-link=https%3A%2F%2Fconsole.tencentcloud.com%2Fcam%2Fcapi"><img src="assets/buttons/btn-ai.svg" alt="部署到 EdgeOne（EdgeOne.ai）" height="32"></a><br>
  <sub>EdgeOne.ai</sub>
</td>
</tr></table>

按你的账号所在平台点任意一个按钮，会跳转到对应的 EdgeOne Makers 控制台，下面这些字段链接已自动带好，无需手填：

| 按钮 | 底色 / 描边 | Logo（本地文件） | 控制台域名 | 适用账号 |
| --- | --- | --- | --- | --- |
| 中国站 | 浅蓝 | 腾讯云深墨蓝字标 | `console.cloud.tencent.com` | 腾讯云中国站账号 |
| 国际站 | 浅绿 | 腾讯云亮蓝字标 | `console.tencentcloud.com` | 腾讯云国际站账号，适合站点开在海外、不走中国站的情况 |
| EdgeOne.ai | 浅橙 | EdgeOne 深蓝字标 | `edgeone.ai` | EdgeOne 海外独立站点账号 |

| 字段 | 预填值 |
| --- | --- |
| 部署来源 | GitHub 仓库 `https://github.com/Kleinsche/edgeone-origin-webhook` |
| 项目名称 | `edgeone-origin-webhook` |
| 分支 | `main` |
| 构建根目录 | `/` |
| 安装命令 | `npm install` |
| 构建命令 / 输出目录 | 均留空（本项目只有云函数，无静态产物） |
| 环境变量清单 | `EO_SECRET_ID`、`EO_SECRET_KEY`、`EO_ZONE_ID`、`WEBHOOK_TOKEN` |

环境变量的**取值**仍要在控制台补齐：密钥到 CAM 控制台获取（[中国站](https://console.cloud.tencent.com/cam/capi) / [国际站](https://console.tencentcloud.com/cam/capi)），`EO_ZONE_ID` 填你最常用的那个站点 ID（在站点概览页获取，它会作为**默认站点**），`WEBHOOK_TOKEN` 填一个高强度随机串，这四项填完即可部署。`EO_ALLOWED_DOMAINS`、`EO_ALLOWED_ZONE_IDS` 不在预填清单里，属于可选加固项，需要限制调用范围时再按下方 [环境变量](#环境变量) 的说明自行添加。

部署在 **EdgeOne Makers Cloud Functions** 上的中间脚本：对外暴露一个 HTTP 接口，接收 Webhook 请求后调用腾讯云 EdgeOne（TEO）开放 API，更新指定加速域名的**回源 IP** 与 **HTTP/HTTPS 回源端口**。

密钥 SecretId / SecretKey 与默认 ZoneId 统一从环境变量读取，不落盘、不回显在响应中；单次调用要作用到其他站点时，由请求体 `zoneId` 临时指定。

## 目录结构

```
.
├── edgeone.json                    # EdgeOne Pages/Makers 项目配置（部署地域）
├── cloud-functions                 # Cloud Functions 根目录（固定名称，不可改）
│   ├── update-origin.js            # Webhook 入口，路由 /update-origin
│   └── lib
│       └── teo-client.js           # 辅助模块：TC3-HMAC-SHA256 签名 + 接口封装（不注册路由）
├── .env.example                    # 环境变量样例
└── package.json
```

`cloud-functions/` 下的文件按路径自动映射为路由，`update-origin.js` 对应端点 `/update-origin`。
只有导出了 `onRequest` 等 Handler 的文件才会注册为路由；`lib/` 下的文件未导出 Handler，仅作为辅助模块打进构建产物。

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
| `EO_ZONE_ID` | 是 | **默认站点 ID**，形如 `zone-225qgrnvbi9w`，在站点概览页获取。请求不带 `zoneId` 时作用于该站点；其他站点可用请求体 `zoneId` 临时指定 |
| `WEBHOOK_TOKEN` | 否 | Webhook 调用令牌。**强烈建议设置**，否则任何人都能改你的回源配置 |
| `EO_ALLOWED_DOMAINS` | 否 | 域名白名单，逗号分隔，支持通配子域，如 `*.example.com,assets.example.com` |
| `EO_ALLOWED_ZONE_IDS` | 否 | 站点白名单，逗号分隔；不设置时不限制 `zoneId`。若希望限制调用方只能操作指定站点，务必配置，如`zone-xxxxxxxx,zone-yyyyyyyy` |
| `EO_ORIGIN_SEPARATOR` | 否 | 多源站分隔符，默认 `,` |
| `EO_API_ENDPOINT` | 否 | 自定义接入点 |
| `EO_API_TIMEOUT_MS` | 否 | 单次 API 调用超时，默认 `15000` |
| `EO_API_REGION` | 否 | `X-TC-Region`，TEO 为全球服务，一般无需设置 |
| `EO_ALLOW_GET_UPDATE` | 否 | 设为 `true` 时允许用 **GET** 触发更新，方便只能拼接 URL 的调用方（如各类计划任务）。默认关闭 |
| `EO_ALLOW_DESCRIBE` | 否 | 设为 `true` 时开放 GET 查询单个域名的回源配置。**默认关闭**，建议仅排障时临时开启 |
| `EO_CORS_ORIGIN` | 否 | 允许的跨域来源，如 `https://example.com`。不设置则不返回 `Access-Control-Allow-Origin`，即不开放跨域 |

### 站点怎么指定（多站点）

`EO_ZONE_ID` 填的是**默认站点**：请求里不带站点参数时，操作就落在它上面。

同一个密钥下有多个站点时，不必每个站点部署一份。只部署这一份，把最常用的站点填进 `EO_ZONE_ID`，其余站点在调用时用请求体的 `zoneId` 指定：

| 调用时 | 实际生效的站点 |
| --- | --- |
| 不传 `zoneId` 或传空值 | 环境变量 `EO_ZONE_ID`（默认站点） |
| 传站点 ID，如 `zone-abcdef123456` | 该站点，仅本次请求生效 |

```json
{
  "zoneId": "zone-abcdef123456",
  "domain": "www.other-site.com",
  "ip": "1.2.3.4"
}
```

GET 传参同样支持：`?zoneId=zone-abcdef123456&domain=www.other-site.com&ip=1.2.3.4`。

> 注意放宽范围带来的风险：能传 `zoneId` 就意味着拿到 `WEBHOOK_TOKEN` 的人可以操作该密钥下**任意**站点。若只想开放固定几个站点，务必同时配置 `EO_ALLOWED_ZONE_IDS`（逗号分隔），白名单外的站点会被拒绝并返回 `403 ZoneForbidden`。

本地调试：复制 `.env.example` 为 `.env`。

> 令牌可放在三种位置任一：`X-Webhook-Token` 头、`Authorization: Bearer <token>` 头，或请求体/query 里的 `token` 字段。调用方不方便设置请求头时（如只能在计划任务里填参数的工具），用 `token` 字段最省事。

## 接口说明

### 1. 更新回源配置

```http
POST /update-origin
Content-Type: application/json
X-Webhook-Token: <WEBHOOK_TOKEN>
```

```json
{
  "zoneId": "zone-225qgrnvbi9w",
  "domain": "www.example.com",
  "ip": "1.2.3.4",
  "httpPort": 80,
  "httpsPort": 443
}
```

| 字段 | 必填 | 说明 |
| --- | --- | --- |
| `zoneId` | 否 | 站点 ID，缺省使用环境变量 `EO_ZONE_ID`（同义字段：`zone_id` / `zone`） |
| `domain` | 是 | 加速域名（同义字段：`domainName` / `hostname`） |
| `ip` | 是 | 回源 IP，支持 IPv4 / IPv6 / 域名；多个源站可用逗号分隔或传数组（同义字段：`ipAddress` / `origin`） |
| `httpPort` | 否 | HTTP 回源端口，1-65535，默认 `80` |
| `httpsPort` | 否 | HTTPS 回源端口，1-65535，默认 `443` |
| `originProtocol` | 否 | **仅在需要变更回源协议时填写**：`FOLLOW` / `HTTP` / `HTTPS`。不填则保持域名现有协议不变；取值非法返回 `400` |
| `dryRun` | 否 | `true` 时只做校验并返回变更预览，不下发修改 |

也支持 `application/x-www-form-urlencoded` 或直接在 URL query 上传参。

`zoneId` 可省略：省略时使用环境变量 `EO_ZONE_ID` 对应的默认站点，传了则以传入的站点为准。多站点用法见上文「环境变量 → 站点怎么指定」小节。若服务端配置了 `EO_ALLOWED_ZONE_IDS`，传入的站点必须落在白名单内，否则返回 `403 ZoneForbidden`。

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

### 2. 查询当前回源配置（默认关闭）

出于安全考虑，查询能力默认关闭，直接 `GET /update-origin` 会返回 `404 Not Found`。
仅在排障时给环境变量临时设置 `EO_ALLOW_DESCRIBE=true`，用完改回 `false`。

```http
GET /update-origin?domain=www.example.com&token=<WEBHOOK_TOKEN>
```

一次请求只返回指定域名的回源配置，不再返回全站点域名清单，响应中也不含 `zoneId`，避免源站拓扑外泄。

> **务必先配置 `WEBHOOK_TOKEN`**：若令牌与上述查询开关都被意外放开，任何人打开该 URL 都能读到站点下全部域名及其源站 IP、回源协议与端口。

## 调用示例

```bash
curl -X POST https://<你的 EdgeOne 域名>/update-origin \
  -H "Content-Type: application/json" \
  -H "X-Webhook-Token: your-strong-random-token" \
  -d '{"domain":"www.example.com","ip":"1.2.3.4","httpPort":80,"httpsPort":443}'
```

要更新**默认站点以外**的其他站点，请求体里带上 `zoneId`：

```bash
curl -X POST https://<你的 EdgeOne 域名>/update-origin \
  -H "Content-Type: application/json" \
  -H "X-Webhook-Token: your-strong-random-token" \
  -d '{"zoneId":"zone-abcdef123456","domain":"www.other-site.com","ip":"1.2.3.4"}'
```

令牌也可通过 `Authorization: Bearer <token>` 或请求体 `"token": "<token>"` 传递。

## Webhook 调用

本接口就是一个普通 HTTP 接口，任何能发请求的工具都可以调用：DDNS 客户端、路由器或 NAS 的计划任务、`cron` + `curl`、CI 流水线、各类 Webhook 触发器。调用方只需填好「URL + 请求头 + 请求体」，下面以 **Lucky** 的计划任务为例，其他工具按对应关系填写即可。

### 方式一：POST + JSON 请求体（推荐）

以 Lucky 为例：添加计划任务 → 子任务类型选 **Callweb**，按下面填写：

| 字段 | 填写内容 |
| --- | --- |
| 请求 URL | `https://<你的 EdgeOne 域名>/update-origin` |
| 请求方式 | `POST` |
| 请求头 | `Content-Type: application/json` 换行 `X-Webhook-Token: your-strong-random-token` |
| 请求体 | `{"domain":"www.example.com","ip":"{CRON_任务名称_1}","httpPort":80,"httpsPort":443}`；站点不是默认站点时，开头补一段 `"zoneId":"zone-abcdef123456",` |

上面请求体里的 `{CRON_任务名称_1}` 是 Lucky 的变量写法（单花括号），Lucky 支持这些：

| 变量 | 含义 |
| --- | --- |
| `{CRON_任务名称_N}` | 第 N 个子任务（脚本 / Callweb）的执行结果，序号从 1 开始 |
| `{STUN_规则名_IP}` | 引用某条 STUN 穿透规则的穿透 IP |
| `{DNS_TXT_域名_IP}` | 从 DNS TXT 记录解析出的 IP |

典型做法是**两个子任务配合**：子任务 1 用 Callweb 请求公网 IP 查询接口（如 Lucky 官网的 `66666.host`）拿到 IP，子任务 2 引用 `{CRON_任务名称_1}` 作为 `ip` 值调用本接口。

### 方式二：GET（只能拼 URL 时使用）

若调用端不方便自定义请求头或请求体（有些计划任务只能拼 URL），可先在项目环境变量里设置 `EO_ALLOW_GET_UPDATE=true`，然后（示例中的 `{CRON_任务名称_1}` 是 Lucky 变量，其他工具换成自己的变量或直接写 IP）：

```
https://<你的 EdgeOne 域名>/update-origin?domain=www.example.com&ip={CRON_任务名称_1}&httpPort=80&httpsPort=443&token=your-strong-random-token
```

规则：`GET /update-origin?domain=...&ip=...` 触发更新；不带 `ip` 时默认返回 `404`（查询能力需 `EO_ALLOW_DESCRIBE=true` 才会开放）。令牌放在 query 的 `token` 参数中同样有效。

> 注意 GET 请求可能被 CDN 或浏览器缓存，且 URL 会带明文令牌，建议仅在可信的内网/服务端调用场景使用。

## 部署

### 命令行部署

```bash
npm install -g edgeone
edgeone login      # 首次需要授权
edgeone deploy
```

### 必要的一步：配置环境变量

命令行部署不会上传 `.env`。请在 **EdgeOne Makers 控制台 → 项目 → 项目设置 → 环境管理** 中添加（生产环境与预览环境的变量相互独立）：

```
EO_SECRET_ID     = 你的 SecretId
EO_SECRET_KEY    = 你的 SecretKey
EO_ZONE_ID       = zone-xxxxxxxx            # 默认站点 ID，必填
WEBHOOK_TOKEN    = 高强度随机串（建议设置）
```

配置完成后用下面的命令验证是否已经生效（返回 `ok: true`）：

```bash
curl -X POST "https://tencent-teo-sync-y4evv21v.edgeone.cool/update-origin" \
  -H "X-Webhook-Token: <WEBHOOK_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"domain":"www.example.com","ip":"127.0.0.1","dryRun":true}'
```

`dryRun` 只返回变更预览，不会真正下发。若想用 GET 排障，需额外设置 `EO_ALLOW_DESCRIBE=true`。

若仍返回 `MissingConfig`（消息为「缺少 ZoneId：请在请求体传入 zoneId，或在服务端配置 EO_ZONE_ID」），说明环境变量未保存或未触发重新部署，需要在控制台手动"重新部署"一次。

### 部署后检查

所谓"构建"实际就是识别 `cloud-functions/` 目录并将其中的 Handler 注册为路由。若部署后访问 `/update-origin` 返回 404，优先检查两点：

1. 目录名是否为 `cloud-functions`（不是 `node-functions`）
2. 入口文件是否导出了 `onRequest`

另外，环境变量修改后需要**重新部署**才会生效；`.env` 已被 `.gitignore` 忽略不会被上传，密钥始终在控制台维护。


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
3. 若域名当前源站类型是 `COS`、`ORIGIN_GROUP` 等对象存储/源站组，脚本会沿用其 `OriginType` 直接改写地址，可先临时设置 `EO_ALLOW_DESCRIBE=true` 后用 `GET /update-origin?domain=xxx&token=<令牌>` 确认再操作，或直接用 `dryRun` 预览变更。
4. API 请求签名依赖机器时间，需保证云函数运行环境时间准确（TEO 要求时间戳偏差不超过 5 分钟）。

## 开源许可证

本项目采用 [GNU AGPL-3.0](LICENSE) 许可证。

AGPL-3.0 是强 copyleft 协议：你可以自由使用、修改和分发本项目，但把修改后的版本通过网络对外提供服务时，必须向使用者提供该版本的完整源码；二次分发时也必须沿用同一许可证。
