# GLP-1 prototype

A clickable before-and-after prototype of the Teladoc Health GLP-1 medication experience, with a mini case study below it.

- **Before:** the original screens, as screenshots in `before/`. Each one has invisible hotspots: the main one moves to the next screen, and the others are shortcuts (like "Return to Condition Management Home"). Click anywhere else on a screen to see where to tap. The tab bar stays pinned to the bottom of the phone.
- **After:** the redesign, built live with the [Anvil design system](https://mendowski.github.io/anvil-design-system/). Its components, tokens, fonts and illustrations all load from the Anvil site, so updates to Anvil show up here automatically.

## Files

| File | What it is |
| --- | --- |
| `index.html` | The page. Loads Anvil, React and the two files below |
| `prototype.js` | Both flows (hotspots for the old screens, Anvil-built new screens) and the mini case study (`STATS`, `DECISIONS` and `CaseStudy`) |
| `prototype.css` | Page layout, the phone frame and the new screens, using Anvil tokens |
| `before/` | Screenshots of the original screens |
| `after/` | Figma exports of the redesign, for reference only. The live prototype doesn't use them |

## Linking to a screen

Add `#before/5` or `#after/13` to the address to open a specific screen.

## Changing the before flow

Screens are listed in the `BEFORE` array near the top of `prototype.js`, grouped as "Finding GLP-1 info" and "Tracking requirements". `foot` is where a screenshot's tab bar starts, so it can stay pinned. Each hotspot's `box` is its area in image pixels: left, top, right, bottom. The first hotspot on a screen goes to the next screen. Add `to` with another screen's `id` (or `"back"`) to send a hotspot somewhere else.

## Changing the after flow

Screens are listed in the `AFTER` array, in the same order as the Figma files.

- **GLP-1 page:** the flow opens it on day 1, 7, 29 or 30 (`DAYS`). Slide the tracker or tap a day to see any day of the cycle; `dayInfo` sets each day's text, focus card and kind (default, shot, warning or complete). The page color slides in sideways as you move between kinds of days (`PAGE_BG`). What's been logged is in `LOGGED`, and shot days are in `SHOTS`.
- **Track sheet:** Figma 100. Every "Track" button opens it. Its rows open the weigh-in, food log and lessons screens.
- **Logging:** submitting a weight, saving a food log or completing a lesson goes back to the day you came from and shows a toast for a few seconds.
- **Symptom checker:** Figma 400 to 402 are one live screen. Picking "Severe" shows the alert and care team actions.

`images/` holds the photos cropped from the Figma exports.

## Editing the case study

The case study under the prototype lives in `prototype.js`. Change the numbers in `STATS`, the decisions in `DECISIONS`, and the intro, problem and callout text in `CaseStudy`. Each decision's `screen` is the redesigned screen its "See it in the prototype" link opens.

## Publishing with GitHub Desktop

1. In GitHub Desktop, choose **File > Add Local Repository** and pick this folder. It isn't a Git repository yet, so choose **create a repository** when it asks.
2. Make the first commit, then click **Publish repository**. Turn off "Keep this code private" so GitHub Pages can serve it for free.
3. On github.com, open the repository's **Settings > Pages**, set the source to **Deploy from a branch**, and pick `main` and `/ (root)`.
4. After a minute or two, it's live at `https://mendowski.github.io/glp1-prototype/`.

This is a static site with no build step, so GitHub Pages serves it as is.
