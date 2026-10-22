# 百炼聊天：本地运行与服务端部署

## 本地

需要 Node.js 22.9 或更新版本、Python 3。没有 npm 依赖，不需要 npm install。

1. 在项目根目录 `.env` 保存 `DASHSCOPE_API_KEY`。模板见 `.env.example`，不要覆盖已有的 Key。
2. `npm run dev`，访问 http://127.0.0.1:4179/#chat。首次使用仍需完成设置。
3. `npm test` 运行前后端检查。

默认使用北京地域 `qwen-plus`，`enable_thinking=false`，最多输出 512 token。北京旧域名仍受官方支持；也可以将 `DASHSCOPE_BASE_URL` 配成控制台的业务空间专属 HTTPS URL（结尾为 `/compatible-mode/v1`）。其他地域必须使用对应地域的 Key 和 URL。不要使用 Coding Plan 专用凭据代替模型调用 Key。

没有配置 Key 时网页仍能打开，聊天会明确提示尚未配置；不会伪装成模型回复。使用原 Python 静态预览命令不会启动 AI 接口。

## 容器与线上

本次只准备部署，不自动发布、不改变已有 Sites 站点。部署同一个 Node 服务来托管网页与 `/api/chat`，前端不跨域直连百炼。

```sh
docker build -t kora .
# .env 中另外设置至少 16 个字符的随机 CHAT_ACCESS_TOKEN。
docker run --rm --env-file .env \
  -e NODE_ENV=production -e HOST=0.0.0.0 -e PORT=8080 \
  -p 127.0.0.1:8080:8080 kora
```

使用 Docker Compose 时可执行 `docker compose up --build -d`。生产启动缺少 Key 或访问口令会直接失败。API Key 和聊天口令都应放到主机环境变量或部署平台的 Secret 配置，不构建进镜像。

在 HTTPS 反向代理后运行。代理 `/api/chat` 时关闭响应缓冲，保留原始 `Host`，连接读取超时至少 60 秒，例如 Nginx：

```nginx
location / {
    proxy_pass http://127.0.0.1:8080;
    proxy_set_header Host $http_host;
    proxy_buffering off;
    proxy_read_timeout 65s;
}
```

团队成员首次发送会看到聊天访问口令输入框。该口令只保留在页面内存，刷新后重新输入；它不是百炼 API Key，也不代表已有用户账号系统。

`GET /api/health` 仅检查服务端是否配置 Key，不验证百炼额度或实时连通性。上线验收还需要一条真实聊天；不能只以健康检查返回 200 判断模型可用。

## 数据和用量

- 只发送近期对话、教练语气和语言；不会自动发送昵称、身高、体重或历史健康记录。
- 浏览器中的对话在刷新后消失；服务端不落盘、不记录对话或提供商错误正文。阿里云按其服务政策处理请求，不能承诺第三方零留存。
- 模型输出不执行工具调用，不修改计划、餐食、计时、积分或提醒。
- 失败后由用户点击重试，可能产生新的一次调用；已经部分输出的请求不会自动重试。
- 每 IP 每分钟默认 20 次、同时最多 4 次，45 秒超时。只适用于单实例团队体验。代理后所有用户可能共用同一 IP，因此限流会更保守，不信任任意客户端提供的转发 IP。
- 扩展到公开多实例服务前，需要账号鉴权、共享限流/配额及服务商侧费用上限。本版本的共享口令不是正式用户系统。
- `.env` 已被 Git 忽略，并从 Docker 构建上下文排除。生产镜像只包含运行资源与服务端代码；不含完整角色库、生成提示词或测试。

## 模型依据

选用 qwen-plus 作为文本陪伴的初始基线，关闭思考以避免把思维链展示给用户。保留环境变量可切换模型；没有宣称它在情绪支持上优于其他模型。正式产品仍应使用真实中文场景做质量和成本评估。

- https://help.aliyun.com/zh/model-studio/qwen-plus
- https://help.aliyun.com/zh/model-studio/qwen-api-via-openai-chat-completions
