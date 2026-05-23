# facebook-profile-cli

CLI to scrape Facebook profiles using a signed-in Chrome session (Playwright). Extracts profile header, tabs, timeline posts, and photos into structured JSON.

Repository: [calumba-holding/facebook-profile-cli](https://github.com/calumba-holding/facebook-profile-cli)

## Requirements

- macOS with Google Chrome at `/Applications/Google Chrome.app` (or set `FACEBOOK_CLI_CHROME_EXECUTABLE`)
- Node.js 20+

## Install

```bash
git clone https://github.com/calumba-holding/facebook-profile-cli.git
cd facebook-profile-cli
npm install
npm run build
```

## First-time login

Uses a persistent Chrome profile at `~/.scrape/profiles/facebook` (same layout as `chrome-scraper`).

```bash
npm run dev -- profile login
```

Log into Facebook in the opened browser, then press Enter in the terminal.

## Scrape a profile

```bash
npm run dev -- scrape "https://www.facebook.com/veit.dengler.public"
# or
node dist/cli.js scrape "https://www.facebook.com/veit.dengler.public" --output ./out/veit.json --max-posts 20
```

The scraper:

1. Opens the profile with your saved session
2. Visits each profile tab (All, About, Reels, Photos, Followers, …)
3. On **All**: scrolls the feed, expands “See more”, extracts up to `--max-posts` posts (default 20)
4. On **Photos**: scrolls each photo sub-tab and collects image URLs
5. Records the browser session as `./out/<username>-<timestamp>.webm` (same basename as JSON)
6. Writes JSON to `./out/<username>-<timestamp>.json` with `sessionVideoPath` and `outputJsonPath`

Add `--json` to also print the result to stdout. Use `--no-video` to skip recording.

Link and overview extraction is scoped to `[role="main"]` and filters notification/group noise from your logged-in sidebar.

## Commands

| Command | Description |
|---------|-------------|
| `profile login` | Open Facebook for one-time manual login |
| `profile path` | Print resolved Chrome profile directory |
| `scrape <profile-url>` | Scrape profile → JSON file |

### Scrape options

| Flag | Default | Description |
|------|---------|-------------|
| `--output <path>` | `./out/...` | JSON output path |
| `--max-posts <n>` | `20` | Timeline posts on the All tab |
| `--no-video` | off | Skip session screen recording |
| `--json` | off | Print JSON to stdout |
| `--navigation-timeout-ms` | `60000` | Page load timeout |
| `--wait-after-navigation-ms` | `2000` | Pause after navigation |

## Environment

- `FACEBOOK_CLI_CHROME_EXECUTABLE` — override Chrome binary path
- `FACEBOOK_CLI_PROFILE_ROOT` — override profile root (default: `~/.scrape/profiles`)

## JSON output shape

- `outputJsonPath` / `sessionVideoPath` — paths to the written JSON and session video
- `header` — display name, follower counts, profile/cover image URLs
- `overview` — links and section previews from the main page
- `tabs.all.posts[]` — structured timeline posts (`text`, `permalink`, `images`, `engagement`, …)
- `tabs.photos` — scrolled photo URLs per sub-section
- `tabs` / `moreSections` — other tab content (links, headings, visible text)
- `errors` — sections that could not be scraped

## Development

```bash
npm run typecheck
npm run build
npm run dev -- scrape "<profile-url>" --output ./out/test.json
```

Browser extraction scripts live in `src/scrape/browser/` (plain JS, evaluated in-page to avoid tsx `__name` issues).

## License

ISC
