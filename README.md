# AstroChat · Daily Reward (mobile web app)

Static site, no build step.

## Deploy on Vercel
1. vercel.com → Add New → Project → drag this folder in (or `npx vercel` inside it).
2. Framework preset: **Other**. Build command: none. Output directory: `./`.
3. Open the URL on a phone. Chrome: ⋮ → *Add to Home screen*. Safari: Share → *Add to Home Screen*.

## Using it
- Tap the **☰ hamburger** (top left) to switch flows, see the steps, restart, or show tomorrow's notification.
- Deep links: `/#j1` Day 1 · `/#j2` Day 2 · `/#j3` Not answering · `/#missed` Missed day.
- The grey missed-day sheet shows only the first time per visit; open the flow again to see a later miss.
