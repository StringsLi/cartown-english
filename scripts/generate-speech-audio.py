"""Build natural, child-friendly offline speech demonstrations.

Development dependencies: edge-tts and imageio-ffmpeg. Only project-original
scripts are sent for synthesis. The app itself plays packaged MP3s offline.
Example: python3 scripts/generate-speech-audio.py
"""
import argparse
import asyncio
import hashlib
import json
import os
from pathlib import Path
import re
import subprocess
import sys
import tempfile

PARSER = argparse.ArgumentParser(description=__doc__)
PARSER.add_argument('--python-libs', help='Optional installed Python dependency directory')
PARSER.add_argument('--ffmpeg', help='Optional ffmpeg binary')
PARSER.add_argument('--only', nargs='*', help='Generate selected IDs, e.g. zh-hello en-hello')
PARSER.add_argument('--force', action='store_true')
ARGS = PARSER.parse_args()
sys.dont_write_bytecode = True
if ARGS.python_libs:
    sys.path.insert(0, ARGS.python_libs)
import edge_tts
if ARGS.ffmpeg:
    FFMPEG = ARGS.ffmpeg
else:
    import imageio_ffmpeg
    FFMPEG = imageio_ffmpeg.get_ffmpeg_exe()

ROOT = Path(__file__).resolve().parent.parent
TOPICS = json.loads((ROOT / 'src/pkg-speech/content.json').read_text())
MANIFEST = ROOT / 'src/pkg-speech/audio-manifest.json'
VOICES = {'zh': 'zh-CN-XiaoyiNeural', 'en': 'en-US-AnaNeural'}
PROFILES = {'zh': '活泼亲切的故事女声', 'en': '清晰童趣的英语女童声'}

def inspect_audio(file):
    result = subprocess.run([FFMPEG, '-hide_banner', '-i', str(file), '-af', 'volumedetect', '-f', 'null', '-'], capture_output=True, text=True, check=True)
    hours, minutes, seconds = re.search(r'Duration: (\d+):(\d+):([\d.]+)', result.stderr).groups()
    peak = float(re.search(r'max_volume: ([\d.\-]+) dB', result.stderr)[1])
    if peak < -20:
        raise ValueError('Silent demonstration: ' + str(file))
    return int(hours) * 3600 + int(minutes) * 60 + float(seconds)

async def synthesize(text, voice, rate, output):
    for attempt in range(3):
        try:
            speech = edge_tts.Communicate(text, voice=voice, rate=f'{rate:+d}%', pitch='+0Hz', connect_timeout=15, receive_timeout=45)
            await speech.save(str(output))
            return
        except Exception:
            if attempt == 2:
                raise
            await asyncio.sleep(1 + attempt)

async def main():
    previous = json.loads(MANIFEST.read_text()) if MANIFEST.exists() else []
    entries = {entry['id']: entry for entry in previous}
    staged = []
    with tempfile.TemporaryDirectory(prefix='cartown-neural-speech-') as temporary:
        temporary = Path(temporary)
        for topic in TOPICS:
            for language in ['zh', 'en']:
                identity = language + '-' + topic['key']
                if ARGS.only and identity not in ARGS.only:
                    continue
                text = '\n\n'.join(topic[language])
                source_hash = hashlib.sha256(text.encode()).hexdigest()
                pack = 'pkg-speech' if language == 'zh' else 'pkg-voice'
                relative = f'/{pack}/static/audio/{topic["key"]}.mp3'
                target = ROOT / 'src' / relative.lstrip('/')
                old = entries.get(identity, {})
                if not ARGS.force and old.get('voice') == VOICES[language] and old.get('sourceHash') == source_hash and target.exists() and old.get('audioHash') == hashlib.sha256(target.read_bytes()).hexdigest():
                    print(identity + ': using verified natural voice', flush=True)
                    continue
                original = temporary / (identity + '-natural.mp3')
                rate = -5 if language == 'zh' else -20
                for attempt in range(4):
                    await synthesize(text, VOICES[language], rate, original)
                    seconds = inspect_audio(original)
                    print(f'{identity}: natural rate {rate:+d}%, {seconds:.1f}s', flush=True)
                    if 55 <= seconds <= 65:
                        break
                    adjusted = max(-35, min(15, round((100 + rate) * seconds / 60 - 100)))
                    if adjusted == rate:
                        break
                    rate = adjusted
                # Natural prosody takes priority. Never stretch audio or pad it
                # with silence to hit an exact minute.
                if not 50 <= seconds <= 66:
                    raise ValueError(f'Review text or pace for {identity}: {seconds:.1f}s')
                output = temporary / (identity + '.mp3')
                subprocess.run([FFMPEG, '-hide_banner', '-loglevel', 'error', '-y', '-i', str(original), '-ac', '1', '-ar', '24000', '-b:a', '24k', str(output)], check=True)
                measured = inspect_audio(output)
                size = output.stat().st_size
                if size > 200 * 1024:
                    raise ValueError('Oversized demonstration: ' + identity)
                entries[identity] = {'id': identity, 'voice': VOICES[language], 'profile': PROFILES[language], 'provider': 'Microsoft Edge neural TTS', 'rate': f'{rate:+d}%', 'pitch': '+0Hz', 'tempo': 1, 'seconds': measured, 'bytes': size, 'audio': relative, 'sourceHash': source_hash, 'audioHash': hashlib.sha256(output.read_bytes()).hexdigest()}
                staged.append((output, target))
                print(f'{identity}: ready, {measured:.1f}s, {size} bytes', flush=True)
        for output, target in staged:
            target.parent.mkdir(parents=True, exist_ok=True)
            os.replace(output, target)
        ordered = [entries[f'{language}-{topic["key"]}'] for language in ['zh', 'en'] for topic in TOPICS if f'{language}-{topic["key"]}' in entries]
        MANIFEST.write_text(json.dumps(ordered, ensure_ascii=False, indent=2) + '\n')
        print(f'Published {len(staged)} natural demonstrations.', flush=True)

asyncio.run(main())
