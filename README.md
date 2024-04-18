### The current status of the codebase is nowhere near prod levels. It's dirty & messy, lacks tests, relies on LLMs to generate responses according to a particular format, etc. This is because my current prioirity is moving as fast as possible. I'll eventually clean everything up.

```
git clone https://github.com/Szplugz/feynman.git
```

Create a `.env` in root dir and add your `ANTHROPIC_API_KEY` there. To get your api key visit the [anthropic console](https://console.anthropic.com). Unfortunately you'll have to test this on your own dime 🫡

Once you've `cd`'d into `feynman`,

```
npm i
npm run dev
```

Upload file at `localhost:3000` and revel at the beauty of trillions of electrons running around on your machine and around the world to produce beautifully streamed text on your screen!

_I know this is a terrible README and I'm probably missing a bunch of instructions, so pls lmk what._
