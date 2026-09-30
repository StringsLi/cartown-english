"""Build compact, natural sounding offline audio for the English playground.

Development dependencies: piper-tts, numpy, imageio-ffmpeg.
Set PIPER_MODEL to the en_US-ljspeech-high.onnx voice model. The model and
generator dependencies are not distributed with the mini program.
"""

import os
import re
import subprocess
import tempfile
import wave
from pathlib import Path

import imageio_ffmpeg
import numpy as np
from piper.voice import PiperVoice, SynthesisConfig


ROOT = Path(__file__).resolve().parent.parent
MODEL = Path(os.environ["PIPER_MODEL"])
OUTPUT = ROOT / "src/pkg-learning/static/playground-audio"
SOURCE = (ROOT / "src/mock/playground.ts").read_text(encoding="utf-8")
VOICE = PiperVoice.load(MODEL)
RATE = VOICE.config.sample_rate
FFMPEG = imageio_ffmpeg.get_ffmpeg_exe()


def synthesize(text: str, length_scale: float = 1.1) -> np.ndarray:
    config = SynthesisConfig(length_scale=length_scale, noise_scale=0.55)
    parts = [chunk.audio_float_array for chunk in VOICE.synthesize(text, config)]
    if not parts:
        raise ValueError(f"Piper generated no sound for {text!r}")
    pause = np.zeros(int(RATE * 0.14), dtype=np.float32)
    return np.concatenate([part for item in parts for part in (item, pause)])


def write_mp3(name: str, samples: np.ndarray) -> None:
    peak = float(np.max(np.abs(samples)))
    if peak < 0.01:
        raise ValueError(f"Audio is silent: {name}")
    samples = np.clip(samples * min(0.93 / peak, 1.4), -0.95, 0.95)
    with tempfile.TemporaryDirectory() as temporary:
        wav_path = Path(temporary) / "source.wav"
        with wave.open(str(wav_path), "wb") as wav_file:
            wav_file.setnchannels(1)
            wav_file.setsampwidth(2)
            wav_file.setframerate(RATE)
            wav_file.writeframes((samples * 32767).astype("<i2").tobytes())
        target = OUTPUT / f"{name}.mp3"
        subprocess.run(
            [FFMPEG, "-hide_banner", "-loglevel", "error", "-y", "-i", str(wav_path),
             "-ac", "1", "-ar", str(RATE), "-b:a", "56k", str(target)],
            check=True,
        )
    print(f"{name}.mp3 {target.stat().st_size} bytes")


def make_chant(first: str, second: str) -> np.ndarray:
    first_voice = synthesize(first, 1.03)
    second_voice = synthesize(second, 1.03)
    first_start = 0.7
    second_start = max(4.5, first_start + len(first_voice) / RATE + 0.5)
    duration = max(10.2, second_start + len(second_voice) / RATE + 0.7)
    samples = np.zeros(int(duration * RATE), dtype=np.float32)

    # Original simple plucked melody; keep it behind the words.
    notes = [392, 440, 523, 440, 392, 330, 349, 392,
             440, 523, 587, 523, 440, 392, 349, 330]
    for index, frequency in enumerate(notes):
        start = int((0.2 + index * 0.57) * RATE)
        if start >= len(samples):
            break
        count = min(int(0.42 * RATE), len(samples) - start)
        time = np.arange(count, dtype=np.float32) / RATE
        note = 0.065 * np.exp(-5 * time) * (
            np.sin(2 * np.pi * frequency * time)
            + 0.2 * np.sin(4 * np.pi * frequency * time)
        )
        samples[start:start + count] += note

    for start_seconds, voice in ((first_start, first_voice), (second_start, second_voice)):
        start = int(start_seconds * RATE)
        samples[start:start + len(voice)] += voice * 0.8
    return samples


prompts = re.findall(r'prompt: "([^"]+)", audio: `\$\{audioRoot\}/([a-z-]+)\.mp3', SOURCE)
stories = re.findall(r'story: "([^"]+)",\s+storyAudio: `\$\{audioRoot\}/([a-z-]+)\.mp3', SOURCE)
chants = re.findall(
    r'chantLyrics: \["([^"]+)", "([^"]+)"\],\s+chantAudio: `\$\{audioRoot\}/([a-z-]+)\.mp3',
    SOURCE,
)
if (len(prompts), len(stories), len(chants)) != (16, 4, 4):
    raise ValueError("Expected 16 prompts, four stories, and four chants")

OUTPUT.mkdir(parents=True, exist_ok=True)
for text, name in prompts + stories:
    write_mp3(name, synthesize(text))
for first, second, name in chants:
    write_mp3(name, make_chant(first, second))
