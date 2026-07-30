import asyncio
import json
import os
import sys

import edge_tts


VOICE = os.environ.get("EDGE_TTS_VOICE", "en-US-AvaNeural")
RATE = os.environ.get("EDGE_TTS_RATE", "-8%")
MAX_CONCURRENCY = 4


async def synthesize(job: dict[str, str], semaphore: asyncio.Semaphore) -> None:
    output = job["output"]
    if os.path.exists(output) and os.path.getsize(output) > 1024:
        return

    async with semaphore:
        for attempt in range(3):
            try:
                communicate = edge_tts.Communicate(job["text"], VOICE, rate=RATE)
                await communicate.save(output)
                print(f"audio {job['text']}")
                return
            except Exception:
                if attempt == 2:
                    raise
                await asyncio.sleep(1.5 * (attempt + 1))


async def main() -> None:
    with open(sys.argv[1], "r", encoding="utf-8") as jobs_file:
        jobs = json.load(jobs_file)
    semaphore = asyncio.Semaphore(MAX_CONCURRENCY)
    await asyncio.gather(*(synthesize(job, semaphore) for job in jobs))


if __name__ == "__main__":
    asyncio.run(main())
