# CarTown English

CarTown English is a playful car-themed English learning web app for 4-5 year old children.

The app focuses on listening, tapping, watching, and repeating. Children can learn vehicle words, colors, counting, traffic light actions, short picture-book stories, and common car brand badges.

## Features

- Car town home map with large child-friendly station buttons
- Vehicle word cards with English speech playback
- Color car listening game
- Counting car game
- Traffic light action game
- Two short car-themed story books
- 50 common car brand badge learning cards
- Sticker garage rewards
- Parent progress page
- Local progress and stars saved with `localStorage`
- Browser Web Speech API for English audio

## Tech Stack

- React
- TypeScript
- Vite
- Tailwind CSS

## Local Development

```bash
npm install
npm run dev
```

Open:

```text
http://localhost:5173/
```

## Build

```bash
npm run build
```

The production files will be generated in `dist/`.

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for Linux + Nginx deployment steps.

## Notes

- Speech playback depends on browser Web Speech API support.
- Stars and progress are stored locally in the browser.
- Brand logos are loaded from public icon/favicons sources with local fallback badges.