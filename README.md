# koala

Kora 私有协作仓库：面向减脂过程中容易中断的人，提供能继续下去的日常陪伴。

## 网站原型

[网站说明与演示路线](website/README.md) · [验证记录](website/QA.md) · [素材来源](website/ASSETS.md)

当前 v0.8 包含中英文页面、四种生活人格趣味测试、四种陪伴语气、首页小行动与休息安排、按日记录，以及与档案同步的偏好设置。它是浏览器本地前端原型；聊天为预设情境演示，没有账号、真实 AI、后台推送或云端同步。

在仓库根目录运行：

```sh
python3 -m http.server 4179 --bind 127.0.0.1 --directory website
```

打开 http://127.0.0.1:4179 。运行现有检查（需要 Node.js）：

```sh
node --test website/daily.test.cjs website/tests/*.test.cjs
```

## 角色资产库

进入 [Kora 角色资产库](kora-library/README.md)，或查看 [素材索引](kora-library/ASSET_INDEX.md)。资产库 1.0.1 快照包含 43 项用途记录、42 张原始 PNG，以及角色规范和使用限制。待审和历史素材保留原状态，收录不代表批准；网站的生活人格插画不替换主参考。

## 协作

网站更新在 `Cora` 分支维护，通过 `Cora → main` 的 PR 提交 Laura 审核。本次不自动合并或部署。保持 Private，不启用 GitHub Pages。
