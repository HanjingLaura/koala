# 素材与第三方资源

## Kora

- `assets/kora-avatar.png`：来自仓库 `kora-library/assets/identity/KOR-ID-001_A-avatar.png`。
- `assets/kora-companion.png`：来自仓库 `kora-library/assets/website/KOR-WEB-004_kora_v11_ariana_approved_transparent.png`。
- `assets/kora-sport-v1.png`：2026-10-18 在用户授权下，通过图像生成工具，以上述角色参考创作的运动版候选图。绿色运动服、头带、瑜伽垫和水瓶；保持大耳、小眼、深色鼻子和无尾巴。仅用于本原型，状态为 **待 Cora 视觉确认**，没有替换角色主库或正式参考。
- 餐盘和界面图标为原型代码内绘制的 SVG；favicon 为代码绘制品牌符号。

## 字体

v0.2 界面使用设备自带的系统无衬线字体，不请求字体 CDN，也未下载 Apple 专用字体。以下字体文件和许可继续保留，v0.4 重新启用其展示层用途。

- Manrope：Google Fonts 官方仓库 `https://github.com/google/fonts/tree/main/ofl/manrope`，许可副本 `assets/Manrope-OFL.txt`。
- ZCOOL XiaoWei / 站酷小薇：Google Fonts 官方仓库 `https://github.com/google/fonts/tree/main/ofl/zcoolxiaowei`，许可副本 `assets/Xiaowei-OFL.txt`。
- v0.4：站酷小薇用于中文展示标题和性格名；Manrope 用于英文字母与数字；英文展示标题用系统 Georgia。两种本地字体均使用 `font-display: swap`，中文正文保持系统字体。

## GSAP

- GSAP 3.14.2，https://gsap.com/ 。第三方脚本保留版权与许可标头，许可见 https://gsap.com/standard-license 。
- 动效参考官方技能 https://github.com/greensock/gsap-skills 中的 core、timeline、performance；使用 matchMedia 尊重减少动态效果设置，切换页面时清理动画上下文。v0.2 使用短距离淡入，移除持续呼吸/漂浮，同路由数据刷新不重复入场。

## 视频与健康内容

原型不托管或复制第三方健身视频。作者频道仅作为待整理的资源入口；卡片不声称已验证具体视频或提供医疗适用性评估。示例食品热量不是已接入的营养数据库。

## v0.3 运动装性格图 · 2026-10-19

使用内置 imagegen，参考既有 `kora-companion.png` 的身份和 `kora-sport-v1.png` 的运动服方向，每个性格单独生成。四张图均为透明背景 PNG，已复制到当前项目：

- `assets/kora-calm-sport.png`：淡淡型，绿色运动外套、短裤、奶白发带。
- `assets/kora-snark-sport.png`：毒舌型，深灰运动上衣与短裤、灰色发带，挑眉和摊手。
- `assets/kora-fiery-sport.png`：暴躁型，暖橙运动套装、奶白发带，皱眉叉腰。
- `assets/kora-gentle-sport.png`：温柔型，柔粉运动卫衣与短裤、粉色发带，微笑合掌。

完整最终提示词见 `assets/persona-prompts.json`。本版只集成以上四张穿衣结果，未集成此前无服装的中间稿。状态为本原型候选衍生素材，未替换正式角色主库。用户提出的运动服、粉色温柔型已落实，但四张具体图的正式主库身份未获批准。

## 表情收敛修订 · 2026-10-19

按用户反馈，用内置 imagegen 编辑两张原运动装图，参考淡淡型的自然面部比例。衣服、姿势与配色保持原方向；新版本去掉夸张浓眉、大面积眼白和张嘴表情。

- 当时毒舌型：`assets/kora-snark-sport-v2.png`，自然小黑眼睛、浅笑。
- 当时暴躁型：`assets/kora-fiery-sport-v2.png`，自然小黑眼睛、轻微抿嘴。
- 原图保留用于版本追溯，该次页面统一引用 v2（已被后续 v4 替代）；温柔型和淡淡型未修改。
- 编辑提示词：`assets/persona-face-v2-prompts.json`。仍为原型候选图，未更新正式身份主库。

## 原版身份与腿脚比例修订 · 2026-10-19

- 使用原始 `kora-avatar.png` 与 `kora-companion.png` 重新约束脸型、鼻子、小黑眼睛与毛发特征；生成的 v3 表情由用户明确回复“表情可以通过了”。此批准只针对表情，不表示整张身体比例或正式主库身份获批。
- 随后按用户反馈，只针对 v3 下半身缩短腿部、缩小脚掌并收拢坐姿。v4 仍沿用灰色 / 橙色运动服及已确认表情方向。
- 网站当前统一使用 `assets/kora-snark-sport-v4.png` 和 `assets/kora-fiery-sport-v4.png`。原图及 v2 保留作为历史版本，v3 表情参考保存在本地工作目录 `work/design-v03/approved-faces/`。
- 最终提示词与两阶段编辑说明：`assets/persona-v4-prompts.json`。使用内置 imagegen；未修改淡淡型、温柔型或正式角色主库。

## 淡淡与温柔腿脚修订 · 2026-10-19

使用内置 imagegen 分别编辑两张原图，以暴躁型 v4 作为下半身比例参考，缩短腿部、缩小脚掌并收拢坐姿，保留各自表情、服装与手势。

- 当前淡淡型：`assets/kora-calm-sport-v2.png`。
- 当前温柔型：`assets/kora-gentle-sport-v2.png`。
- 毒舌 / 暴躁仍使用 v4，所有页面经公共 portrait 函数引用新版。
- 完整提示词：`assets/persona-calm-gentle-proportions-prompts.json`。旧文件保留，未修改正式角色主库。

## v0.4 排版与动效 · 2026-10-19

- 参考官方 GSAP skills 中的 Timeline 与 Performance：https://github.com/greensock/gsap-skills 。
- 按当前官方 matchMedia 文档验证响应式清理方式：https://gsap.com/docs/v3/GSAP/gsap.matchMedia()/ 。
- 仅使用现有 GSAP 核心库：有标签结构的两行文本按时间线进入，装饰线使用 scaleX，卡片使用 transform。无新增插件。
- 不拆散文本的可访问名称；装饰线和大字标记 aria-hidden。保留四张已接入的考拉图片。

## v0.5 闭眼关键帧与动态陪伴 · 2026-10-19

- 采用内置 imagegen，逐张参考当前已集成的运动装原图，仅请求两眼闭合。保存为 `assets/kora-calm-blink.png`、`assets/kora-snark-blink.png`、`assets/kora-fiery-blink.png`、`assets/kora-gentle-blink.png`；提示词见 `assets/persona-blink-prompts.json`。
- 生成图已逐张目检。运行时只对两眼周围使用带羽化边界的局部遮罩，其余位置始终使用原运动装图，避免整帧切换引起脸型 / 衣服变化。
- 原运动装 PNG 与 v0.4 包逐字节一致；新增闭眼图为本项目动画用途，未更新角色主库。
- 动画模块 `companion.js`：GSAP 负责时序；WebGL 负责局部连续形变和眼睑混合。参考官方 https://gsap.com/docs/v3/GSAP/gsap.timeline()/ 。


## v0.8 生活人格插画

使用内置 image_gen，原运动装图制作首版，再加入 `kora-avatar.png` 与 `kora-companion.png` 对齐原版耳脸比例。绿色省电 / 粉色心情当前为 `assets/kora-life-lazy-v3.png`、`assets/kora-life-feel-v3.png`；红色热启动 / 蓝色忙碌当前为 `assets/kora-life-spark-v4.png`、`assets/kora-life-busy-v4.png`。后两张依据用户反馈增加耳朵饱满度并恢复圆润脸颊。

v1 与 v3 作为本轮衍生图迭代参考保留，页面只引用上述四张。按百分比缩小耳朵的 v2 被用户否定，未集成。提示词见 `assets/lifestyle-prompts.json`、`assets/lifestyle-ear-revision.json`、`assets/lifestyle-face-revision.json`。所有新图为本原型衍生素材，待用户视觉验收；未修改 kora-library 正式主库。


### 绿粉耳朵对齐 · 当前四种生活人格均使用 v4

按用户要求，使用内置 image_gen，以红色 `kora-life-spark-v4.png` 与蓝色 `kora-life-busy-v4.png` 为耳朵比例参考，编辑绿色 / 粉色 v3，保持各自脸型、表情、服装和姿势。当前新增素材为 `assets/kora-life-lazy-v4.png`、`assets/kora-life-feel-v4.png`，页面与人格卡片导出统一引用四种 v4；红蓝图未改。提示词见 `assets/lifestyle-ear-match.json`。旧图保留追溯，未修改角色主库。


### v0.9 探头鼓励

`assets/kora-cheer-head-v2.png` 由内置 image_gen 编辑原 `kora-avatar.png`，只移除背景、保留头部身份与毛发边缘，带透明 alpha。用于训练完成与饮食记录的探头反馈；保留原图，不替换正式主库。提示词见 `assets/cheer-head-prompt.json`。用户要求放大、探头与活泼鼓励，本轮视觉待用户确认。


### v0.9 框内开心鼓励 · 历史版本

用户否定探头形式后，改为 `assets/kora-cheer-happy-v3.png`。使用内置 image_gen 编辑 v2 透明头：保留原角色耳朵、脸型、毛发和鼻子，改成笑眼与张嘴开心表情。头部完整放在提示框内，旧图保留但不再用于鼓励。提示词见 `assets/cheer-happy-prompt.json`。未修改角色主库。


### v0.9 Wink 鼓励 · 当前版本

用户反馈张嘴笑脸不自然后，改用 `assets/kora-cheer-wink-v4.png`。由内置 image_gen 基于 v2 中性透明头制作，单眼 wink、嘴角轻吐舌，保留原耳脸比例、毛发与鼻子。继续使用框内布局，旧版本保留追溯。提示词见 `assets/cheer-wink-prompt.json`。未修改角色主库，待用户视觉确认。


### v0.10 路线与风景

路线、脚印、树荫 / 溪边 / 星光收藏由原生 SVG 与 CSS 绘制在 `app.js` / `styles.css`，不使用第三方游戏素材。节点沿用当前运动装 Kora，未重新生成或修改正式角色图。GSAP 沿用仓库内现有版本；此次未找到可用的 GSAP 技能文件。


### v0.11 场景路线

首页使用原生 SVG 绘制低对比树影、溪流、帐篷和星光作为整页背景。复用原运动装 Kora 与 WebGL / GSAP 陪伴动作，未生成或修改角色图像；原收藏图保留在档案背景选择中。


### v0.12 精细树荫侧景

新增 `assets/kora-trail-tree.svg`，以原生 SVG 绘制分层树冠、枝条、叶脉、草木和石头，左右侧景复用并改变朝向、大小和透明度。底部地面、溪流及帐篷仍由代码绘制，未使用第三方游戏素材。Kora 角色与陪伴动画资产保持原版。

### v0.13 商店与奖励风景

新增原创原生 SVG：`kora-shop-bird.svg`（歪头 / 翅膀轻动，支持减少动态效果）、`kora-scene-creek.svg`（溪水、石头、芦苇、帐篷）、`kora-scene-stars.svg`（星光、蕨草与地景）。月亮、商店木屋和场景缩略图由页面原生 SVG 绘制。复用原树冠与已确认的 Kora，不改角色身份。用于本地商店预览和兑换后的首页场景。

### v0.15 三套风景精修

继续使用代码绘制的原创原生 SVG，重绘 `kora-trail-tree.svg`、`kora-scene-creek.svg` 和 `kora-scene-stars.svg`；新增 `kora-trail-fern.svg`、`kora-creek-bank.svg`、`kora-campsite.svg`、`kora-scene-moon.svg`。树冠带稀疏点纹，溪流仅拉伸水面层，植物 / 帐篷 / 月亮等物件通过独立图片保持比例。星光装饰均为静态，不增加持续动效。商店与首页共享素材，未修改已确认 Kora 图像。

### v0.15.1 小溪优先的构图

溪边场景不再渲染左侧大树、远树与左下蕨草，水层在地形之后绘制，避免树干和地形挡住水面。溪流描边加宽、蓝绿颜色更清楚；少量河岸植物沿右岸摆放，右侧树木退后。其他两套场景素材与构图保留。
