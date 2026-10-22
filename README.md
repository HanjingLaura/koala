# koala

## 本地百炼聊天接入

`feat/bailian-chat` 增加服务端真实聊天。根目录 `.env` 配置 `DASHSCOPE_API_KEY` 后执行 `npm run dev`，访问 http://127.0.0.1:4179 。默认模型 `qwen-plus`，保留四种教练语气、流式回复、停止和重试；不自动修改计划或记录。根目录 `npm test` 验证前后端。

[本地配置、容器和线上部署说明](docs/DEPLOYMENT.md)。此变更尚未发布到现有公开体验站。下面的原型说明和历史发布记录描述此前静态版本。

Kora 私有协作仓库：面向减脂过程中容易中断的人，提供能继续下去的日常陪伴。

## 网站原型

[网站说明与演示路线](website/README.md) · [验证记录](website/QA.md) · [素材来源](website/ASSETS.md)

Cora 分支新增 v0.20：默认关闭的站内运动提醒、跟随已选教练的三轮敲门、首次建档后的铃铛引导，以及统一品牌绿。已通过本地审核，本轮提交供 Laura 审核；公开体验站现已更新为 v0.20，支持从头体验。

v0.19 已有功能：六种运动习惯人格、四种教练语气与独立推荐，中英文 12 题测试同步档案。图片与字体已减重，答题和结果布局更稳定，资料控件统一，食物和运动页增加同风格插画。

原有正常训练、缩短 / 休息 / 改期、每周七节点路线、互动 Kora、叶子商店与周月报保留。它是浏览器本地前端原型；聊天为预设情境演示，没有账号、真实 AI、后台推送或云端同步。

在仓库根目录运行：

```sh
python3 -m http.server 4179 --bind 127.0.0.1 --directory website
```

打开 http://127.0.0.1:4179 。运行现有检查（需要 Node.js）：

```sh
node --test website/daily.test.cjs website/tests/*.test.cjs
```

## 在线体验

[从头体验 v0.20](https://kora-companion-cora.pearly-mesa-9438.chatgpt.site/?demo=cora-v20-team) · [Kora 在线体验站](https://kora-companion-cora.pearly-mesa-9438.chatgpt.site/)（已上线，拿到链接即可访问）。首次进入先完成人格测试与资料设置。每位访问者的记录保存在自己的浏览器；当前没有真实 AI 或云同步。

## 角色资产库

进入 [Kora 角色资产库](kora-library/README.md)，或查看 [素材索引](kora-library/ASSET_INDEX.md)。资产库 1.0.1 快照包含 43 项用途记录、42 张原始 PNG，以及角色规范和使用限制。待审和历史素材保留原状态，收录不代表批准；网站的生活人格插画不替换主参考。

## 协作

网站更新在 `Cora` 分支维护，通过 `Cora → main` 的 PR 提交 Laura 审核。更新提交到 `Cora`，由 Laura 在 PR 中审核后决定是否合并。在线体验站通过 Sites 独立托管网站运行文件；仓库继续保持 Private，不启用 GitHub Pages。体验站数据保存在访问者各自的浏览器，没有账号或云同步。

最新体验版 v0.19 已发布至原公开链接；本轮 Cora → main 由 [PR #5](https://github.com/HanjingLaura/koala/pull/5) 请 Laura 审批，详见 [发布记录](website/RELEASE.md)。

[从头体验新版](https://kora-companion-cora.pearly-mesa-9438.chatgpt.site/?demo=cora-v19-new)：使用独立体验记录，不覆盖普通档案；刷新保留本次进度，退出体验可返回原档案。
