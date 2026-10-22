# 邀请制内测部署

## Vercel 预览版

运行 `python scripts/prepare-beta.py`，输出一个仓库外的新目录。也可用 `--output` 指定仓库外的空目录。现有文件不会被删除。

部署包仅含运行页面、`api/index.mjs` 和聊天服务模块；不包含 `.env`、测试、原始角色素材或 Git 历史。原有 Sites 项目标识不会复制到 Vercel 项目。

登录 Vercel 后，先将输出目录关联到新的内测项目，再设置 **Preview** 环境变量：

- `DASHSCOPE_API_KEY`：使用已有本地 Key，设为敏感值。
- 不再设置 `CHAT_ACCESS_TOKEN`；访客通过 Vercel 内测分享链接进入后可直接聊天。
- `DASHSCOPE_BASE_URL`、`DASHSCOPE_MODEL`：可沿用本地配置。
- 建议内测使用 `CHAT_RATE_LIMIT=10`、`CHAT_CONCURRENCY=2`。

配置已设置 `NODEJS_HELPERS=0`，保留原始请求流供既有 64 KB 请求体限制使用；`CHAT_AUTH_MODE=vercel` 仅在 `VERCEL=1` 的运行环境生效，使用平台的访问保护。不要关闭项目的 Vercel Authentication。自有服务器仍默认要求聊天口令。函数最长 60 秒，聊天服务内部 45 秒超时。API 路由重写到同一个函数，网页与聊天同源；Vercel 提供 HTTPS。

使用 `vercel deploy --environment preview` 明确发布 Preview，不加 `--prod`。不要把根目录 `.env` 复制进部署目录或通过构建变量公开。发布时生成受邀成员可用的 Vercel 分享链接，保留部署访问保护，聊天无需额外口令。分享链接可设置有效期，续期或更换版本时重新生成。

## 验收与限制

- 页面、初始化、计划/餐食记录、视频播放器、手机布局可用。
- 未持有有效分享链接的访客由 Vercel 拦截；通过链接进入后可直接聊天，可停止和手动重试。
- 计划与饮食仍在各自浏览器本地保存；聊天刷新后消失，暂不跨设备同步。
- Vercel 多实例的内存限流不是账号配额或全站费用硬上限；本版仅限受邀小组，提供商侧另设费用提醒/限制。若扩大规模，先加持久化鉴权和共享配额。
- 目标网络下的 YouTube 播放需要成员实测。不要保证国内网络都能播放。

## 回滚

保留上一版 Preview URL。出现问题时停用当前内测入口或在控制台删除该部署；若分享链接泄露，撤销并重新生成分享链接。密钥配置变更不会自动应用到旧的 Vercel 部署，需要另行关闭不再使用的旧版本。

## 个人网站子路径

运行 `python scripts/prepare-beta.py --base-path /koala` 生成挂载包。聊天使用当前目录下的 `api/chat`，生成配置处理 `/koala/` 素材与 API 路由，同时保留独立根目录入口。

个人网站在 `/koala/` 提供服务端代理，将页面、素材和聊天转发到现有受保护的 `koala-exercise.vercel.app`。代理仅在服务端发送 Vercel Automation Bypass 密钥，不依赖会过期的分享链接，也不将密钥发给浏览器。Hobby 分组已经有两个子应用，因此不新增 Microfrontends 成员。

个人网站代理检查来源、限制路径和请求体，并移除上游认证 Cookie 与重定向。模型 Key 继续只保存在 Koala 项目服务端；原内测分享链接仍可使用。
