# 真车短句离线读音

50 句 `This is the ...` 、8 条亲子示范句与绘本陪读问题，对应 `src/pkg-cars/bestSellingCars.ts`。音频打包在 `pkg-speaking/static/audio/car-sentences/` 、`parent-phrases/` 与 `parent-questions/`，不依赖在线 TTS 或浏览器朗读。

生成脚本：`scripts/generate-car-sentence-audio.py`。Piper 1.8.0，`en_US-ljspeech-high`，美国英语女声，22050 Hz 单声道 MP3，56 kbit/s。模型来源：https://huggingface.co/rhasspy/piper-voices/tree/main/en/en_US/ljspeech/high 。训练语料 LJ Speech 为公有领域，模型卡随本文记录；工具和模型不包含在小程序中。

不以自动生成读音替代真人发音教学；车型名称里的拼音保留原有写法。
