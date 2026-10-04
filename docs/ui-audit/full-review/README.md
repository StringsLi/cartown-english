# 全页审查与行星图片修复（2026-10-04）

## 已修复的问题

1. 上一轮分包服务误用了小游戏专用 `wx.loadSubpackage`。微信小程序没有该接口，导致 `CachedImage` 等待失败，太阳系图片与本地音频不可用。当前页面所属分包直接使用媒体；跨包车型图片、儿歌及共享短句使用小程序原生 `require.async`，配合静态就绪模块。
2. 网页旧音频使用 CloudBase 文件 ID，浏览器无法直接播放。H5 现在输出既有 377 个 MP3/WAV 原始文件，并返回对应同域地址；微信云音频路径保持。
3. 320px 视口中轨道星球仅约38px。点击区扩大为44px，轨道收拢以容纳小屏；图鉴及完成按钮至少44px。

## 实际检查范围

- 微信开发者工具 Stable 2.02.2608070、基础库3.17.3：34条注册路由均打开到实际页面；6条旧车车链接验证自动跳转到规范页面。太阳系滚动后十个天体全部显示，地球点读、独立/跨包儿歌及交通灯反馈播放实测。
- 网页：34条路由在320、390、430px检查，无页面级横向溢出；没有发现图片失败占位。缓存图片异步加载过程中和屏幕外可存在正常占位，未把初始0图片样本当作资源完整性证据。
- 实际交互：绘本五页完成、热点点读、绘本三题游戏；交通灯错误重试；颜色主题五题完成；国家播放后记录及地图切换；配送三步与六句剧场完成；太阳系三题完成两次，奖励去重。地球冷启动链接与句子播放验证。
- 昵称/音量、旧链接和恶意/无效参数、全部车型/车标题目、奖励去重、录音捕获/导出/导入、媒体失败恢复由源代码审查和自动回归覆盖。

## 逐页清单

“通过”指页面打开、主要视觉及本行列出的检查通过。详细操作与测试范围以本页上下文为准，不代表实体设备或微信审核验收。

| 路由 | 页面/功能审查 | 网页显示 | 微信打开 |
| --- | --- | --- | --- |
| `pages/index/index` | 今日旅程、六世界和底部导航 | 通过 | 通过 |
| `pages/books/index` | 绘本列表、封面、阅读入口 | 通过 | 通过 |
| `pages/vehicles/index` | 真车/交通工具列表与图片 | 通过 | 通过 |
| `pkg-learning/car-logos/index` | 旧车车链接自动替换跳转，参数编码与失败重试回归 | 通过 | 通过 |
| `pkg-learning/car-colors/index` | 旧车车链接自动替换跳转，参数编码与失败重试回归 | 通过 | 通过 |
| `pkg-learning/car-count/index` | 旧车车链接自动替换跳转，参数编码与失败重试回归 | 通过 | 通过 |
| `pkg-learning/car-traffic/index` | 旧车车链接自动替换跳转，参数编码与失败重试回归 | 通过 | 通过 |
| `pkg-learning/car-stories/index` | 旧车车链接自动替换跳转，参数编码与失败重试回归 | 通过 | 通过 |
| `pkg-learning/car-garage/index` | 旧车车链接自动替换跳转，参数编码与失败重试回归 | 通过 | 通过 |
| `pkg-learning/playground/index` | 八主题、印章、亲子任务入口 | 通过 | 通过 |
| `pkg-learning/playground-game/index` | 点读、模式切换、答错重试、五题完成 | 通过 | 通过 |
| `pkg-cars/car-learn/index` | 车型图片、名称点读、上下辆 | 通过 | 通过 |
| `pkg-cars/car-logos/index` | 50车标学习与找图；每轮去重回归 | 通过 | 通过 |
| `pkg-cars/car-colors/index` | 颜色车图片、答题与每轮去重 | 通过 | 通过 |
| `pkg-cars/car-count/index` | 数量匹配、每辆一次、完成才能下一题 | 通过 | 通过 |
| `pkg-cars/car-traffic/index` | 动作图、播放、答错重试与下一题 | 通过 | 通过 |
| `pkg-cars/car-stories/index` | 车车绘本封面与详情入口 | 通过 | 通过 |
| `pkg-cars/car-garage/index` | 奖励车型、锁定提示与进度读取 | 通过 | 通过 |
| `pkg-world/world/index` | 50国旗/地图、区域筛选、听后记录 | 通过 | 通过 |
| `pkg-reading/recordings/index` | 空态、备份/导入入口；文件流程回归 | 通过 | 通过 |
| `pkg-reading/book-detail/index` | 封面、单词与阅读入口 | 通过 | 通过 |
| `pkg-reading/reader/index` | 五页图片、句子点读、完成阅读 | 通过 | 通过 |
| `pkg-reading/point-read/index` | 热点点读、翻页与回阅读页 | 通过 | 通过 |
| `pkg-reading/repeat/index` | 原声、无录音态；捕获状态机回归 | 通过 | 通过 |
| `pkg-reading/game/index` | 三题图片、单词声音、3/3完成 | 通过 | 通过 |
| `pkg-user/parent/index` | 成长报告、日历、复习和录音入口 | 通过 | 通过 |
| `pkg-user/profile/index` | 昵称、音量与录音/隐私入口 | 通过 | 通过 |
| `pkg-adventure/index/index` | 章节、配送/剧场卡片与完成进度 | 通过 | 通过 |
| `pkg-adventure/delivery/index` | 选车、装货、目的地及完成奖励 | 通过 | 通过 |
| `pkg-adventure/roleplay/index` | 角色、逐句、六句完成及奖励 | 通过 | 通过 |
| `pkg-space/index/index` | 轨道、暂停、十个天体、三站入口 | 通过 | 通过 |
| `pkg-space/body/index` | 天体图、名字/句子点读、前后边界 | 通过 | 通过 |
| `pkg-space/quiz/index` | 找图重试、三题完成、奖励去重 | 通过 | 通过 |
| `pkg-music/index/index` | 八首儿歌、播放/停止、关联主题入口 | 通过 | 通过 |

## 构建与回归门槛

- `npm test`、`npm run check:release`、`npm run build:h5`、`npm run build:mp-weixin`全部通过。
- 网页构建588个原始图像/音频逐字节一致性；微信构建拒绝小游戏加载接口，检查原生异步模块实际相对路径和跨分包同步依赖。
- 总包8.657MiB，主包1.479MiB；learning1.362、cars1.647、world0.389、reading1.972、user0.021、adventure0.658、space0.514、music0.614MiB。阅读包余量很少，后续加资源需拆分。

## 证据

- [行星修复前](planet-before.jpg) / [微信修复后](planet-fixed.jpg)
- [页面总览1](pages-1.jpg) / [页面总览2](pages-2.jpg)
- `native-audit.json`：34条已完成跳转的微信页面；`web-audit.json`：390px首轮采样；`responsive-audit.json`：320/430px采样；`function-audit.json`：实际功能操作。

## 尚需实体设备验收

未新增真实麦克风权限、未采集儿童录音、未发送文件，录音文件字节及异常处理由已有自动回归验证。实体iPhone/Android的麦克风、分享保存落盘、静音开关、弱网首次跨包下载与切后台行为仍需体验版验证。未上传体验版或提交审核。最后阶段Mac自动锁屏，中断了额外微信复查；34条路由与行星恢复的原生检查在锁屏前已完成。临时编译入口和项目路径改动已恢复原配置。

本地交付：`车车英语乐园-全页审查修复版-微信小程序运行包.zip`。导入修复版包后重新编译。
