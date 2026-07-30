# 微信小程序发布检查

## 首次配置

1. 在微信公众平台注册小程序并取得 AppID。
2. 将 AppID 填入 `src/manifest.json` 的 `mp-weixin.appid`。
3. 在微信公众平台的《用户隐私保护指引》中声明麦克风用途：仅用于孩子跟读练习，录音默认保存在本地设备。
4. 在微信开发者工具中确认项目使用正式 AppID，而不是测试号。

## 每次发布

```bash
npm run test
npm run check:release
npm run build:mp-weixin
```

构建完成后，在微信开发者工具中导入 `dist/build/mp-weixin`，重点检查录音授权、音频播放、续读页码和清除数据。

`check:release` 会在 AppID 为空、静态资源缺失、故事音频不完整或统一短句音频损坏时失败。
