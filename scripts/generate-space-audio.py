"""Generate compact offline solar-system phrases with the existing Piper voice.

Dev dependencies: piper-tts, numpy, imageio-ffmpeg.
PIPER_MODEL points to en_US-ljspeech-high.onnx; dependencies stay out of the app.
"""
from pathlib import Path
import argparse, os, re, subprocess, tempfile, wave
import numpy as np
import imageio_ffmpeg
from piper.voice import PiperVoice, SynthesisConfig

ROOT = Path(__file__).resolve().parent.parent
import json
SOURCE = (ROOT / "src/mock/solarSystem.ts").read_text()
OUTPUT = ROOT / "src/pkg-space/static/audio"
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument("--force", action="store_true")
args = parser.parse_args()
bodies = json.loads(SOURCE.split("export const spaceBodies: SpaceBody[] = ")[1].split(";",1)[0])
phrases = [("Try again!", "try-again"), ("Great job!", "great-job")]
for body in bodies:
    phrases.extend([(body["name"], body["id"]), (body["sentence"], body["id"] + "-sentence"), ("Find " + body["name"] + ".", body["id"] + "-find")])
voice = PiperVoice.load(Path(os.environ["PIPER_MODEL"]))
rate = voice.config.sample_rate
OUTPUT.mkdir(parents=True, exist_ok=True)
for text, name in phrases:
    target = OUTPUT / (name + ".mp3")
    if target.exists() and target.stat().st_size > 1024 and not args.force:
        continue
    chunks = [chunk.audio_float_array for chunk in voice.synthesize(text, SynthesisConfig(length_scale=1.08, noise_scale=0.55))]
    audio = np.concatenate(chunks + [np.zeros(int(rate*.14), dtype=np.float32)])
    peak = np.max(np.abs(audio))
    if peak < .01:
        raise ValueError("Silent audio: " + name)
    audio = np.clip(audio * min(.93/peak,1.4), -.95,.95)
    with tempfile.TemporaryDirectory() as temporary:
        wav = Path(temporary) / "voice.wav"
        with wave.open(str(wav), "wb") as output:
            output.setnchannels(1);output.setsampwidth(2);output.setframerate(rate)
            output.writeframes((audio*32767).astype("<i2").tobytes())
        subprocess.run([imageio_ffmpeg.get_ffmpeg_exe(),"-loglevel","error","-y","-i",str(wav),"-ac","1","-ar",str(rate),"-b:a","56k",str(target)],check=True)
    print(name + ".mp3 " + str(target.stat().st_size) + " bytes")
