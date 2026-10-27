# 🎂 Birthday Surprise (video-style version)

Flow: **cake builds itself → Make a Wish → envelope (tap to open) → "For you" menu → Letter · Flower · Song**, plus a final "One Last Hug?" under the menu.

```
index.html   page structure (rarely needs touching)
style.css    colours, fonts, layout, animations
script.js    cake, envelope, page switching, hug
config.js    ✏️ ALL your words, photos and the song link  ← edit this one
images/      memory-1.svg, memory-2.svg, memory-3.svg  (placeholders)
```

## Personalise (config.js)

| What | Where |
|---|---|
| Letter text + your name | `letter.paragraphs`, `letter.signature` |
| **3 photos beside the letter** | `letter.photos` (slot 1, 2, 3) |
| **8 short notes on the Flower page** | `flower.messages` (4 left, 4 right) |
| Song link (YouTube) | `song.youtube` |
| Song message | `song.paragraphs` |
| Two photo strips | `song.stripA`, `song.stripB` |
| Final hug text | `finale` |

**Photos:** copy your pictures into `images/` (about 800 px wide), then change each `src`, e.g. `src: "images/us-3.jpg"`.

**Song:** paste any YouTube link or the 11-character video ID into `song.youtube`. The song embed needs internet.

**Skip the cake while testing:** open `index.html?skip` or set `intro.cake: false`.

## Run it
Double-click `index.html` (or `python3 -m http.server 8000` in this folder and visit http://localhost:8000).

## Publish it (free)
- **Netlify Drop:** drag the whole folder onto https://app.netlify.com/drop, then send him the link.
- **GitHub Pages / Cloudflare Pages / Vercel:** upload the files, no build step.

Test on your phone first. The fonts load from Google Fonts, so he needs internet for the full look.
