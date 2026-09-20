# EdgeOne 回源配置更新 Webhook

[![使用 EdgeOne Makers 部署](https://cdnstatic.tencentcs.com/edgeone/pages/deploy.svg)](https://edgeone.ai/pages/new?repository-url=https%3A%2F%2Fgithub.com%2FKleinsche%2Fedgeone-origin-webhook&repository-name=edgeone-origin-webhook&project-name=edgeone-origin-webhook&root-directory=%2F&install-command=npm%20install&env=EO_SECRET_ID%2CEO_SECRET_KEY%2CEO_ZONE_ID%2CWEBHOOK_TOKEN%2CEO_ALLOWED_DOMAINS&env-description=EO_SECRET_ID%20%2F%20EO_SECRET_KEY%20%E4%BB%8E%20CAM%20%E5%AF%86%E9%92%A5%E6%8E%A7%E5%88%B6%E5%8F%B0%E8%8E%B7%E5%8F%96%EF%BC%8C%E5%BB%BA%E8%AE%AE%E6%8E%88%E4%BA%88%E6%9C%80%E5%B0%8F%E6%9D%83%E9%99%90%E7%AD%96%E7%95%A5%EF%BC%9BEO_ZONE_ID%20%E4%B8%BA%20EdgeOne%20%E7%AB%99%E7%82%B9%20ID%EF%BC%9BWEBHOOK_TOKEN%20%E4%B8%BA%E8%B0%83%E7%94%A8%E4%BB%A4%E7%89%8C%EF%BC%8C%E5%BC%BA%E7%83%88%E5%BB%BA%E8%AE%AE%E8%AE%BE%E7%BD%AE%EF%BC%9BEO_ALLOWED_DOMAINS%20%E4%B8%BA%E5%85%81%E8%AE%B8%E6%93%8D%E4%BD%9C%E7%9A%84%E5%9F%9F%E5%90%8D%E7%99%BD%E5%90%8D%E5%8D%95&env-link=https%3A%2F%2Fconsole.cloud.tencent.com%2Fcam%2Fcapi)

点上面的按钮会跳转到 EdgeOne Makers，下面这些字段链接已自动带好，无需手填：

| 字段 | 预填值 |
| --- | --- |
| 部署来源 | GitHub 仓库 `https://github.com/Kleinsche/edgeone-origin-webhook` |
| 项目名称 | `edgeone-origin-webhook` |
| 分支 | `main` |
| 构建根目录 | `/` |
| 安装命令 | `npm install` |
| 构建命令 / 输出目录 | 均留空（本项目只有云函数，无静态产物） |
| 环境变量清单 | `EO_SECRET_ID`、`EO_SECRET_KEY`、`EO_ZONE_ID`、`WEBHOOK_TOKEN`、`EO_ALLOWED_DOMAINS` |

环境变量的**取值**仍要在控制台补齐：密钥到 [CAM 控制台](https://console.cloud.tencent.com/cam/capi) 获取，`EO_ZONE_ID` 在站点概览页获取，`WEBHOOK_TOKEN` 填一个高强度随机串，`EO_ALLOWED_DOMAINS` 填允许操作的域名白名单。完整说明见下方 [环境变量](#环境变量)。

部署在 **EdgeOne Makers Cloud Functions** 上的中间脚本：对外暴露一个 HTTP 接口，接收 Webhook 请求后调用腾讯云 EdgeOne（TEO）开放 API，更新指定加速域名的**回源 IP** 与 **HTTP/HTTPS 回源端口**。

密钥 SecretId / SecretKey / ZoneId 统一从环境变量读取，不落盘、不回显在响应中。

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
| `EO_ZONE_ID` | 是 | EdgeOne 站点 ID，形如 `zone-225qgrnvbi9w` |
| `WEBHOOK_TOKEN` | 否 | Webhook 调用令牌。**强烈建议设置**，否则任何人都能改你的回源配置 |
| `EO_DEFAULT_ORIGIN_PROTOCOL` | 否 | 缺省回源协议 `FOLLOW` / `HTTP` / `HTTPS`，不设置则沿用域名现有配置 |
| `EO_ALLOWED_DOMAINS` | 否 | 域名白名单，逗号分隔，支持通配子域，如 `*.example.com,assets.example.com` |
| `EO_ORIGIN_SEPARATOR` | 否 | 多源站分隔符，默认 `,` |
| `EO_API_ENDPOINT` | 否 | 自定义接入点 |
| `EO_API_TIMEOUT_MS` | 否 | 单次 API 调用超时，默认 `15000` |
| `EO_API_REGION` | 否 | `X-TC-Region`，TEO 为全球服务，一般无需设置 |
| `EO_ALLOW_GET_UPDATE` | 否 | 设为 `true` 时允许用 **GET** 触发更新，方便只能拼接 URL 的调用方（如 Lucky Callweb）。默认关闭 |
| `EO_ALLOW_DESCRIBE` | 否 | 设为 `true` 时开放 GET 查询单个域名的回源配置。**默认关闭**，建议仅排障时临时开启 |
| `EO_CORS_ORIGIN` | 否 | 允许的跨域来源，如 `https://example.com`。不设置则不返回 `Access-Control-Allow-Origin`，即不开放跨域 |

本地调试：复制 `.env.example` 为 `.env`。

> 令牌可放在三种位置任一：`X-Webhook-Token` 头、`Authorization: Bearer <token>` 头，或请求体/query 里的 `token` 字段。Lucky 不易设置请求头时，用 `token` 字段最省事。

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

令牌也可通过 `Authorization: Bearer <token>` 或请求体 `"token": "<token>"` 传递。

## 从 Lucky 调用

Lucky 通过**计划任务 → Callweb 子任务**发起请求，变量语法是单花括号 `{变量名}`。

### 方式一：POST + JSON 请求体（推荐）

添加计划任务 → 子任务类型选 **Callweb**：

| 字段 | 填写内容 |
| --- | --- |
| 请求 URL | `https://<你的 EdgeOne 域名>/update-origin` |
| 请求方式 | `POST` |
| 请求头 | `Content-Type: application/json` 换行 `X-Webhook-Token: your-strong-random-token` |
| 请求体 | `{"domain":"www.example.com","ip":"{CRON_任务名称_1}","httpPort":80,"httpsPort":443}` |

请求体中的 IP 用 Lucky 变量替换，可用写法：

| 变量 | 含义 |
| --- | --- |
| `{CRON_任务名称_N}` | 第 N 个子任务（脚本 / Callweb）的执行结果，序号从 1 开始 |
| `{STUN_规则名_IP}` | 引用某条 STUN 穿透规则的穿透 IP |
| `{DNS_TXT_域名_IP}` | 从 DNS TXT 记录解析出的 IP |

典型做法是**两个子任务配合**：子任务 1 用 Callweb 请求公网 IP 查询接口（如 Lucky 官网的 `66666.host`）拿到 IP，子任务 2 引用 `{CRON_任务名称_1}` 作为 `ip` 值调用本接口。

### 方式二：GET（只能拼 URL 时使用）

若调用端不方便设置请求头或请求体，可先在项目环境变量里设置 `EO_ALLOW_GET_UPDATE=true`，然后：

```
https://<你的 EdgeOne 域名>/update-origin?domain=www.example.com&ip={CRON_任务名称_1}&httpPort=80&httpsPort=443&token=your-strong-random-token
```

规则：`GET /update-origin?domain=...&ip=...` 触发更新；不带 `ip` 时默认返回 `404`（查询能力需 `EO_ALLOW_DESCRIBE=true` 才会开放）。令牌放在 query 的 `token` 参数中同样有效。

> 注意 GET 请求可能被 CDN 或浏览器缓存，且 URL 会带明文令牌，建议仅在可信的内网/服务端调用场景使用。

## 部署

### 当前线上地址

- 站点：`https://tencent-teo-sync-y4evv21v.edgeone.cool`
- Webhook 端点：`POST https://tencent-teo-sync-y4evv21v.edgeone.cool/update-origin`
- 控制台：https://console.cloud.tencent.com/edgeone/pages/project/makers-icufee8xbs4j

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
EO_ZONE_ID       = zone-xxxxxxxx
WEBHOOK_TOKEN    = 高强度随机串（建议设置）
EO_ALLOWED_DOMAINS = *.example.com
```

配置完成后用下面的命令验证是否已经生效（返回 `ok: true`）：

```bash
curl -X POST "https://tencent-teo-sync-y4evv21v.edgeone.cool/update-origin" \
  -H "X-Webhook-Token: <WEBHOOK_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"domain":"www.example.com","ip":"127.0.0.1","dryRun":true}'
```

`dryRun` 只返回变更预览，不会真正下发。若想用 GET 排障，需额外设置 `EO_ALLOW_DESCRIBE=true`。

若仍返回 `{"ok":false,"error":{"code":"MissingConfig","message":"服务端未配置 EO_ZONE_ID"}`，说明环境变量未保存或未触发重新部署，需要在控制台手动"重新部署"一次。

### 关联 GitHub（CI 自动部署）

本项目已初始化 Git 仓库并完成首次提交。剩下的两步需要在 GitHub 与 EdgeOne 控制台完成：

1. **推送到 GitHub**

   仓库已建好在 <https://github.com/Kleinsche/edgeone-origin-webhook>，本地也已关联 `origin`（`main` 分支），直接推送即可：

   ```bash
   git push -u origin main
   ```

   推送前建议把提交作者改成你自己的身份：

   ```bash
   git -c user.name="你的名字" -c user.email="你的邮箱" commit --amend --reset-author --no-edit
   ```

   若使用 SSH：`git remote set-url origin git@github.com:Kleinsche/edgeone-origin-webhook.git`

2. **在 EdgeOne Makers 控制台导入仓库**

   **推荐直接点击文首的一键部署按钮**，仓库、项目名、根目录、环境变量清单都会自动填好，跳过下面的授权与选仓步骤。

   也可以手动打开 <https://console.cloud.tencent.com/edgeone/pages>，首次使用点击**立即开通**：

   - 点击 **GitHub** 图标连接您的仓库
   - 在 GitHub 授权页允许 EdgeOne 访问，并选择要授权的仓库（可只勾选本仓库，或授权全部）
   - 选中 `edgeone-origin-webhook` 仓库，`main` 分支

3. **填写构建配置**

   | 配置项 | 建议值 | 说明 |
   | --- | --- | --- |
   | 项目名称 | `edgeone-origin-webhook` | 会影响默认域名前缀 |
   | 根目录 | `/` | 保持默认 |
   | 构建命令 | 留空 | 本项目不含静态站点无需编译；若平台强制要求，可填 `npm install` |
   | 输出目录 | 留空 | 无静态产物 |
   | 加速区域 | 按需选择 | 决定节点资源与自定义域名是否需备案 |

   点击**开始部署**，等待构建完成即可获得形如 `https://xxx.edgeone.app` 的默认域名。

4. **配置环境变量**

   进入项目 → **设置 → 环境变量**，添加密钥（见上表）。注意两点：

   - 环境变量**作用于整个项目，不区分生产/预览环境**
   - 修改后需要**重新部署**才会生效

5. **自动部署**

   上述步骤完成后，向 `main` 分支的每次 `git push` 都会自动触发构建部署，无需手动操作。

> 所谓"构建"实际就是识别 `cloud-functions/` 目录并将其中的 Handler 注册为路由。若部署后访问 `/update-origin` 返回 404，请优先检查目录名是否为 `cloud-functions`（不是 `node-functions`）以及文件是否导出了 `onRequest`。

> `.env` 已被 `.gitignore` 忽略，密钥不会进入 GitHub；环境变量始终在 EdgeOne 控制台维护。

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
