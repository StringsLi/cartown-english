# 车车英语乐园

<p align="center">
  <img src="src/static/ui/cartown-mini-program-icon-144.png" width="112" alt="车车英语乐园图标" />
</p>

<p align="center">
  面向 4-5 岁儿童的汽车探索与亲子英语启蒙小程序。<br />
  从车车故事出发，也能玩颜色、动物、水果、动作、数字、形状、天气和心情八个短时主题。
</p>

<p align="center">
  <img alt="Vue 3" src="https://img.shields.io/badge/Vue-3.5-42b883" />
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5.7-3178c6" />
  <img alt="uni-app" src="https://img.shields.io/badge/uni--app-WeChat-07c160" />
</p>

## 项目简介

车车英语乐园是一款以汽车为主题的儿童互动启蒙微信小程序，并融合了“小小英语乐园”的八个亲子英语主题。产品强调大按钮、低阅读门槛、自然语音、正向反馈和短时任务，不要求儿童具备英文阅读能力。

当前版本不包含登录、社交或排行榜。跟读练习会在用户主动点击录音后申请麦克风权限，录音和学习记录默认保存在当前设备。

<table>
  <tr>
    <td><img src="docs/ui-audit/wechat-final/01-home-top.png" alt="首页" /></td>
    <td><img src="docs/ui-audit/wechat-final/03-vehicles-top.png" alt="认识车辆" /></td>
    <td><img src="docs/ui-audit/wechat-final/05-car-logos-top.png" alt="认识车标" /></td>
  </tr>
  <tr>
    <td align="center">探索首页</td>
    <td align="center">车辆认知</td>
    <td align="center">50 个车标</td>
  </tr>
</table>

## 主要功能

- 汽车探索首页：集中进入绘本、车辆、车标、颜色、数字、交通和世界地图内容。
- 小小英语乐园：8 个主题、40 个配图词汇；先点图听词，再完成随机听音找图游戏。每个主题都有迷你故事、原创节奏儿歌和线下亲子任务。
- 车车英语小冒险：3 个送货故事串联颜色、水果、数量和目的地；3 个亲子小剧场支持逐句点读、交换角色和线下续玩。
- 车辆认知：通过高清车辆图片、英文单词和自然语音认识常见车辆。
- 50 个车标：浏览常见汽车品牌标志，支持分页学习与语音播放。
- 颜色与数字：完成颜色汽车听辨、数车等低龄互动任务。
- 交通动作：通过红绿灯和车辆动作学习简单指令。
- 汽车绘本：提供车辆主题绘本、逐页朗读、中文辅助和点读互动。
- 跟读练习：支持原声对照、最长 10 秒录音、本地回放以及录音备份导入导出。
- 车车看世界：包含 50 个国家及地图主题词汇。
- 星星与车库：完成任务获得星星和车辆奖励。
- 家长中心：查看阅读、词汇、练习和连续学习记录。
- 英语主题进度：首次完成每个主题获得一颗星星和探索印章；点读词汇单独记录为“已点读”，进度显示在乐园及家长中心，保存在当前设备。
- 分享转发：各页面支持微信好友分享和朋友圈分享。

## 技术栈

- Vue 3 + TypeScript
- uni-app / `@dcloudio/uni-app`
- Pinia
- Vite
- Sass
- 微信云开发存储
- `uni.getStorageSync` / `uni.setStorageSync` 本地进度持久化

## 快速开始

### 环境要求

- Node.js `^20.19.0` 或 `>=22.12.0`
- npm
- 微信开发者工具（运行小程序时需要）

### 安装依赖

```bash
git clone https://github.com/StringsLi/cartown-english.git
cd cartown-english
npm install
```

### 构建微信小程序

```bash
npm run build:mp-weixin
```

构建完成后，可在微信开发者工具中导入项目根目录。`project.config.json` 已将小程序目录配置为：

```text
dist/build/mp-weixin/
```

也可以直接导入该构建目录进行预览。

## 小程序配置

### AppID

在以下两个文件中配置自己的小程序 AppID：

- `src/manifest.json` 的 `mp-weixin.appid`
- `project.config.json` 的 `appid`

> `AppSecret` 只能保存在服务端或安全的 CI/CD 密钥中，绝不能写入前端代码、配置文件或提交到 GitHub。

### 云存储

云环境配置位于 `src/config/cloud.ts`：

```ts
export const CLOUD_ENV_ID = "your-cloud-env-id";
export const CLOUD_STORAGE_BUCKET = "your-cloud-storage-bucket";
```

高清资源应按原目录结构上传到：

```text
apps/cartown-english/source-assets/
```

对应的本地高清源文件位于 `docs/source-assets/`。当前版本只依赖云存储分发媒体，不要求云数据库或云函数。

小程序首次访问云端图片或音频时会下载并保存到本地文件系统。媒体缓存上限为 80MB，达到上限后按最近使用时间自动清理旧文件，避免用户每次打开都重复下载。

## 常用命令

| 命令 | 用途 |
| --- | --- |
| `npm run dev:mp-weixin` | 启动微信小程序开发编译 |
| `npm run build:mp-weixin` | 构建微信小程序生产包 |
| `npm run type-check` | 执行 TypeScript 类型检查 |
| `npm run validate:content` | 校验课程、图片和音频资源 |
| `npm run check:release` | 执行发布前严格内容检查 |
| `npm run test:adventures` | 校验货物判断、旧进度迁移、首次奖励与持久化 |
| `npm run test` | 执行类型检查、内容校验与冒险进度检查 |

## 项目结构

```text
cartown-english/
├─ docs/
│  ├─ source-assets/       # 高清图片、车标与音频源文件
│  └─ ui-audit/            # 页面视觉检查截图
├─ scripts/                # 内容校验、音频生成与构建辅助脚本
├─ src/
│  ├─ components/          # 通用 UI 与媒体组件
│  ├─ composables/         # 页面分享等组合式逻辑
│  ├─ config/              # 云环境配置
│  ├─ mock/                # 绘本、车辆、国家与主题课程数据
│  ├─ pages/               # 小程序页面
│  ├─ services/            # 音频、云资源、缓存与学习进度服务
│  ├─ stores/              # Pinia 状态管理
│  ├─ styles/              # 全局样式与设计变量
│  └─ types/               # TypeScript 类型定义
├─ project.config.json     # 微信开发者工具项目配置
├─ src/manifest.json       # uni-app 应用与平台配置
└─ src/pages.json          # 页面路由和导航配置
```

## 内容与隐私

- 课程数据与媒体引用集中维护，新增内容时请同步执行 `npm run validate:content`。
- 英语乐园的 40 段单词发音、40 段提示、8 段故事和 8 首原创短儿歌随 `pkg-learning` 分包离线提供。歌词与伴奏为本项目原创，人声用 [Piper](https://github.com/OHF-Voice/piper1-gpl) 和 [en_US-ljspeech-high 声线](https://huggingface.co/rhasspy/piper-voices/blob/main/en/en_US/ljspeech/high/MODEL_CARD) 在开发阶段合成。该声线从公开领域的 LJ Speech 数据集独立训练，模型库标注 MIT 许可；模型和生成工具未打包进小程序。要重新生成，安装 `piper-tts numpy imageio-ffmpeg`，下载声线 `.onnx` 和 `.onnx.json`，运行 `PIPER_MODEL=/path/to/en_US-ljspeech-high.onnx python3 scripts/generate-playground-audio.py`。音频不包含原先链接的商业儿歌录音。
- 车标素材来源说明见 `docs/source-assets/CAR_LOGO_SOURCES.md`。
- 应用仅在用户主动开始跟读录音时申请麦克风权限，不包含儿童社交和排行榜。
- 跟读录音默认只保存在当前设备，不会自动上传到云端，可由家长手动导入或导出备份。
- 学习记录默认保存在本地；清除小程序数据后，本地学习记录会一并清除。
- 小冒险的 17 段对话复用上述 Piper 声线，由 `scripts/generate-adventure-audio.py` 在开发阶段生成，随 `pkg-adventure` 独立分包离线提供。运行 `PIPER_MODEL=/path/to/en_US-ljspeech-high.onnx python3 scripts/generate-adventure-audio.py --force` 可重新生成。插画复用本项目原创绘图，在新分包内另存小尺寸 PNG，避免跨分包读取资源。
- 亲子小剧场由家长和孩子点击确认完成，不使用麦克风或语音评分；“演过”表示陪玩记录。每个送货故事和剧场场景仅首次完成获得一颗星星，旧版车辆、主题和星星进度保留。

## 发布检查

```bash
npm run test
npm run check:release
npm run build:mp-weixin
```

随后在微信开发者工具中检查真机图片、音频、分享入口、学习进度和包体积，再上传体验版或提交审核。

### 乐园插画与页面预览

- 40 张词汇插画、8 张主题场景为本项目原创矢量绘图，PNG 随学习分包提供。矢量源文件位于 `docs/source-assets/playground-vectors`，生成脚本为 `scripts/generate-playground-art.cjs`；安装 `sharp` 后运行 `node scripts/generate-playground-art.cjs` 可重新导出。
- 页面分成主题地图、儿歌电台和亲子任务，支持探索印章、中文故事提示及停止播放。

![乐园地图、点读卡片和找图游戏](docs/ui-audit/playground-expansion/preview.jpg)

页面检查结果见 [乐园预览与检查记录](docs/ui-audit/playground-expansion/README.md)。

## 车车英语小冒险

首页和英语乐园都有新入口，全部使用 uni-app 的 `view`、`image`、`button`、页面生命周期和分享接口实现，可构建为微信小程序。

| 玩法 | 场景 | 交互 |
| --- | --- | --- |
| 送货小司机 | 小狗的野餐篮、猴子的午餐快递、小狮子的花园派对 | 听颜色选车 → 按订单装水果 → 找目的地；可取出水果、清空重装和重玩 |
| 亲子小剧场 | 车车去动物园、开一家水果小店、坐上快乐小巴士 | 选择孩子角色 → 6 句轮流表演 → 交换角色；支持完整台词点读、中文提示和上一句 |

装货和对话阶段收起场景插画，突出可点选内容。完成后展示印章与离屏游戏建议，家长报告同步显示送达及表演数量。页面切后台、返回或切换任务时停止播放。

![小冒险地图、装水果和亲子对话](docs/ui-audit/adventure/preview.jpg)

检查记录见 [小冒险预览与检查](docs/ui-audit/adventure/README.md)。
