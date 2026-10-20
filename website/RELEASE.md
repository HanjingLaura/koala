# Kora v0.19 团队体验站发布

2026-10-20 已更新原公开体验站，保持 public。

- 从头体验：https://kora-companion-cora.pearly-mesa-9438.chatgpt.site/?demo=cora-v19-new 。新体验使用独立 sessionStorage，不覆盖原档案；刷新恢复本次体验。
- GitHub 功能提交：`e42f62a9f55c3dddc87a837ee1d37ffdb79fab81`，分支 `Cora`。
- 沿用 PR #5：https://github.com/HanjingLaura/koala/pull/5 ，Laura 审核，未合并 main。
- Sites 项目：`appgprj_6ad70d461de88191b7ae41768c3fc950`。
- Sites v4：`appgprj_6ad70d461de88191b7ae41768c3fc950~appgver_3666b9143a4c8191b33b0ccdd0126d04`。
- 托管源码：`5af6c5f3b631f005fca319de6e3ae264268aba7b`。
- 部署：`appgdep_6ad758375dac81919a7fffa31ec0b5e7`，状态 `succeeded`。
- 72 个运行文件共 3,655,378 bytes，逐一与功能提交 SHA256 一致；打包加 hosting manifest 共 73 文件。排除原 PNG/TTF、提示词、测试、内部文档和完整角色库。
- 68 项自动检查通过。线上开场、六人格 WebP、新脚本标记、731px 布局和控制台核验通过。答题稳定性、展开结果零位移、52px 控件和 390px 双语日常页等本地证据见 QA.md。未把本地结果当作公网测速或完整线上流程验收。

仍为浏览器本地存储原型，没有真实 AI、账户、云同步或通知。

以下为历史发布记录。

# Kora v0.18 团队体验站发布

2026-10-20 已更新原公开体验站：
https://kora-companion-cora.pearly-mesa-9438.chatgpt.site/

- GitHub 功能提交：`7f561e9fc5fb6ca58938e54a5f999450e02ff6c8`，分支 `Cora`。
- PR： https://github.com/HanjingLaura/koala/pull/5 ，已邀请 `HanjingLaura` 审批；本轮未自动合并 main。
- Sites 项目：`appgprj_6ad70d461de88191b7ae41768c3fc950`，保持 public。
- Sites v2：`appgprj_6ad70d461de88191b7ae41768c3fc950~appgver_55e94ca673288191841dce2fb2036e15`。
- 托管源码提交：`fb3e547f924ff71956228b9c1d1d3126881101f0`。
- 部署：`appgdep_6ad73f2d67a481919cca072d248910c7`，返回 `succeeded`。
- 运行包 48 个文件（另含 hosting manifest），逐一与 GitHub 功能提交下的网页文件核对 SHA256 相同。排除提示词、历史素材、测试、文档和完整角色资产库；浏览器资料不参与发布。

验证：62 项自动检查通过；线上资源标记为 `20261020-profile-live`，六张人格 PNG 加载正常，中英文六人格标题正确，678px 页面无横向溢出，当前可见角色的 live renderer 正常，控制台无 warn/error。

限制：线上没有再次逐项执行完整测试、训练、商店和档案流程；这些流程的本地验证见 QA.md。仍为本地浏览器存储的前端原型，没有真实 AI、账户、云同步或通知。
