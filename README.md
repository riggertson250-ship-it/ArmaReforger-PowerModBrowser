# Reforger Workshop Power Browser

A free add-on that makes the **Arma Reforger Workshop website** much easier to browse.

The official Workshop only shows 16 mods per page with very few filters. Power Browser adds a full-screen browser on top of it so you can filter by tags, sort however you like, see hundreds of mods at once, and build mod lists ("collections") you can paste straight into a server.

> Works on: https://reforger.armaplatform.com/workshop
> Current version: **1.10**

---

## What it can do

**Browse faster**
- Load 80 to 1,600 mods at once (**Batch** mode), or flip through pages of 25, 50, 100 or 500 (**Pages** mode)
- Grid view with pictures, or a compact Table view
- Hover a mod to read its summary. In Table view, hovering shows the mod's pictures as a slideshow

**Filter and sort**
- Click tags to require them (green) or exclude them (red)
- Sort by subscribers, rating, votes, size, update date, name and more
- Hide mods below a minimum subscriber count or rating
- Hide mods you already added to your collection

**Build collections (mod lists)**
- Click the green **+** on any mod to add it to a collection, and **−** to remove it
- Keep as many named collections as you want
- Get warned when a mod needs other mods (dependencies), and add them in one click
- See which dependencies are missing in the **Deps** column (Table view, collection view)
- Undo mistakes

**Use it on a server**
- Copy a ready-to-paste `"mods"` block for your server's `config.json`
- Or download a full `config.json` template, or a readable mod list for your Discord or server rules
- Share a collection with a link, or export and import it as a file

---

## Download

Download the Power Browser Javascript: [reforger-workshop-power-browser.user.js](https://github.com/user-attachments/files/33991272/reforger-workshop-power-browser.user.js)


Install Tampermonkey first (step 1 below), then click the link. Tampermonkey will open and show an **Install** button.

---

## Install

You need a free browser extension called **Tampermonkey**. It runs small scripts like this one on websites.

1. **Install Tampermonkey** for your browser:
   - Chrome / Edge / Brave / Opera: https://www.tampermonkey.net
   - Firefox: https://addons.mozilla.org/firefox/addon/tampermonkey/
2. **Install Power Browser.** Pick one:
   - **Easy way:** click the [Download link](#download) above (or open the script file in this repo and click **Raw**). Tampermonkey will show an **Install** button. Click it.
   - **Manual way:** open the Tampermonkey dashboard, click the **+** tab to create a new script, delete everything in it, paste in the full contents of `reforger-workshop-power-browser.user.js`, and press **Ctrl + S** to save.
3. **Open the Workshop:** https://reforger.armaplatform.com/workshop
4. Click the green **Power Browse** button in the bottom right corner.

> **Chrome users:** if nothing happens, Chrome may be blocking user scripts. Open your extensions page, click **Details** on Tampermonkey, and turn on **Allow User Scripts**. Then reload the Workshop page.

### Updating
If you installed with the Easy way, Tampermonkey checks for updates automatically. If you used the Manual way, repeat step 2 with the new file.

---

## Quick start

1. Click **Power Browse**. It loads the most popular mods.
2. Click a tag (for example **WEAPONS**) to only see those mods.
3. Change the sort to **Rating %** to see the best rated first.
4. Click **+** on mods you want. They appear in the **Collection** panel on the right.
5. When a mod needs other mods, a popup lists them. Click **Add selected**.
6. In the Collection panel, under **Server Mod Enforcement**, click **Copy**. Paste it into your server's `config.json`.

Tip: hover over any button in the top bar to see what it does.

---

## The screen, explained

### Top bar

| Part | What it does |
|---|---|
| **⏻ power button** | Closes Power Browser (or press **Esc**) |
| **Fetch** | What to download from the Workshop: search, server sort, Batch or Pages mode, how many |
| **Refine** | Filters and sorting for what is already loaded. Does not download anything new |
| **View** | Grid or Table, card size, and Collection view |
| **☕** | Coming soon. Click it anyway |

Click the words **Fetch**, **Refine** or **View** to shrink that group and save space. Green words mean the group is open.

### Tags bar
- Click a tag once: **required** (green)
- Click twice: **excluded** (red)
- Click three times: back to normal
- Click **Tags** to collapse the bar. Active tags stay visible.

### Collection panel (right side)
- **Top (always visible):** pick a collection, create, rename, duplicate or delete it, and see its size
- **Manage:** view the whole collection, add or remove dependencies, undo, remove all
- **Server Mod Enforcement:** copy or download the list for your server
- **Export / Import:** copy IDs, save to a file, share a link, or import a list
- **Mods:** every mod in the collection, with a **×** to remove it

Click **»** to collapse the panel to a thin strip.

---

## How do players get the mods?

**On a server:** they don't have to do anything. When a player joins, Reforger reads the server's mod list and downloads every mod automatically. That's why the server output is the important one.

**For single player:** Reforger can't import a list. Players download each mod in the in-game Workshop (dependencies come along automatically) and can save the set as a **mod preset** in the game's mod manager. Give them the **Readable mod list** output, which has a link for every mod.

> **About `.bikey` files:** those are from Arma 3. Reforger doesn't use them. The server's `"mods"` list is what forces players to have the right mods.

---

## FAQ

**Is this official?**
No. It's a fan-made tool. It isn't made or supported by Bohemia Interactive.

**Is it safe? Does it send my data anywhere?**
It only talks to the Workshop website you are already on, using the same data the site itself loads. Your settings and collections are saved in your own browser and are not uploaded anywhere.

**Where are my collections saved?**
In your browser, on that computer. Use **Export file** to back them up or move them to another computer.

**Can I share a collection with a friend?**
Yes. **Share link** works if they also have Power Browser installed. Otherwise, send them the **Export file** or the **Readable mod list**.

**What does "Pin versions" do?**
It locks each mod to its current version in the server list. Players must then have that exact version. The downside: when a mod author updates, your server breaks until you export again. Leave it off unless you need it.

---

## Troubleshooting

| Problem | Fix |
|---|---|
| No **Power Browse** button | Make sure Tampermonkey is on and the script is enabled. Chrome users: see the note in Install. Reload the page. |
| Mods won't load / "page failed" | The Workshop site may have just updated. Reload the page and try again. |
| A mod says "not found" | It was deleted or made private by its author. Remove it from your collection. |
| Hover pictures are slow | Pictures load from the Workshop on first hover. They are faster after that. |

---

## Future improvements

Power Browser starts as a Tampermonkey script because it's the quickest way to get it in people's hands. The plan is to grow it in two steps.

### Step 1: A real browser extension
Install it from the Chrome Web Store or Firefox Add-ons with one click. No Tampermonkey needed.
- Simpler install and automatic updates
- Collections that sync between your computers through your browser account
- A settings page for things like default view and page size

### Step 2: A hosted website with API access
A standalone site that keeps its own up-to-date copy of the Workshop, so it isn't limited to what you've loaded.
- Sort and filter the **entire** Workshop at once (all 50,000+ mods), not just the loaded ones
- Search inside mod descriptions, and see which mods depend on a given mod
- Save and share collections with a normal link that anyone can open, no install needed
- Get alerts when a mod in your collection updates
- An **API**, so server panels, Discord bots and other tools can read collections and mod data directly

**Note:** a public website that copies Workshop data would need Bohemia Interactive's approval. We'll ask them before building it, and use an official API if they offer one.

Ideas and feedback for the roadmap are welcome in the Issues tab.

---

## For developers

- Everything is in one file: `reforger-workshop-power-browser.user.js`
- Plain JavaScript and CSS, no build step and no libraries
- It reads the Workshop's own page data (the `/_next/data/...` URLs the site uses). If Bohemia changes their site, those calls may need updating.
- Settings live in `localStorage` under `pb_settings_v1`, collections under `pb_collections_v1`

To change the coffee button into a real link, set `COFFEE_URL` near the top of the script.

Bug reports and ideas are welcome in the Issues tab.

---

## Disclaimers

**Not affiliated with Bohemia Interactive.** Power Browser is an unofficial, fan-made tool. It is not made, endorsed or supported by Bohemia Interactive. Arma, Arma Reforger and related names and logos are trademarks of Bohemia Interactive a.s. All other trademarks belong to their owners.

**Mods belong to their authors.** Power Browser doesn't host, copy or redistribute any mods. Mod names, descriptions and pictures are shown straight from the official Workshop, and all downloads happen through Bohemia's own Workshop and game.

**Unofficial data source.** The tool reads the same data the Workshop website loads for itself. This isn't a public API, so a change to the website can break the tool without warning.

**Please use it responsibly.** Large loads (like 1,600 mods or 500 per page) send many requests to the Workshop. Don't run it in automated loops or use it in ways that put heavy load on Bohemia's servers. Follow Bohemia's terms of service.

**Your data stays with you.** Settings and collections are stored only in your browser. Nothing is sent to the author or any third party. Clearing your browser data deletes them, so use **Export file** for backups.

**Server use.** The config output is a starting point. Check it before using it on a live server. The author isn't responsible for server downtime, broken mod lists or player issues.

**Generative AI use.** This project's code and documentation were written with help from a generative AI coding assistant (Claude, by Anthropic). The author directed the design and features and reviewed the results. The code was checked with automated tests and on the live Workshop site. AI-assisted code can still contain mistakes, so please report anything that looks wrong in the Issues tab.

**No warranty.** This software is provided "as is", without warranty of any kind. Use it at your own risk.

---

Made by **Tytan** ★
