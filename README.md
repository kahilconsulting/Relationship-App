# Connect Better

A simple conversation-starter app. Choose who you're with, choose how deep you want to go, and get a question worth asking.

It is a plain website (HTML, CSS and JavaScript) with no accounts, no database and nothing to install.

## What's in this folder

| File | What it does |
| --- | --- |
| `index.html` | The page itself |
| `style.css` | Colours, fonts and layout |
| `app.js` | The app's behaviour, plus the list of categories and levels |
| `data/questions.json` | **All the questions** — this is the file you'll edit most |
| `manifest.webmanifest`, `service-worker.js`, `icons/` | Let people add the app to their phone's home screen and use it offline |

## 1. Preview the app on your computer

Double-clicking `index.html` will **not** work, because browsers block a page opened that way from reading the questions file. Use one of these instead:

**Option A — VS Code (easiest)**

1. Install the **Live Server** extension in VS Code.
2. Right-click `index.html` and choose **Open with Live Server**.

**Option B — Python**

1. Open a terminal in this folder.
2. Run `python -m http.server 8000`
3. Open <http://localhost:8000> in your browser.
4. Press `Ctrl + C` in the terminal when you're finished.

To see how it looks on a phone, press `F12` in Chrome or Edge and click the phone/tablet icon.

## 2. Add or edit questions

Open `data/questions.json`. Each question is one line:

```json
{ "id": "friends-2-4", "category": "friends", "level": 2, "text": "Your question here?" },
```

- **id** — any unique name. Following the pattern `category-level-number` keeps things tidy.
- **category** — one of `colleagues`, `gym`, `partner`, `kids`, `friends`, `holiday`, `party`, `business`.
- **level** — `1` (Light), `2` (Curious), `3` (Deep) or `4` (Personal).
- **text** — the question.

To add a question, copy a line, paste it below, and change the four values. To remove one, delete its line. You can have as many questions per category and level as you like.

Things to watch for:

- Every line ends with a comma **except the very last one** before the closing `]`.
- Keep the double quotation marks around each value.
- Try not to change the `id` of an existing question. Favourites are remembered by id, so changing it removes that question from people's favourites.

If the app shows "The questions couldn't be loaded" after an edit, there is almost always a missing comma or quotation mark. Pasting the file into <https://jsonlint.com> will point to the exact line.

**Adding a new category** means adding one line to the `CATEGORIES` list at the top of `app.js` (copy an existing line and change the id, label and colours), then adding questions that use the new id.

## 3. Publish with GitHub Pages

You only do this once.

1. Sign in at <https://github.com> and create a **new repository** (for example `connect-better`). Set it to **Public**.
2. On the new repository's page, click **uploading an existing file**.
3. Drag in **everything inside this folder** (including the `data` and `icons` folders), then click **Commit changes**.
4. Go to **Settings → Pages**.
5. Under **Build and deployment**, set **Source** to **Deploy from a branch**, choose the **main** branch and the **/ (root)** folder, then click **Save**.
6. Wait a minute or two. Your app will be live at `https://YOUR-USERNAME.github.io/connect-better/`

Share that link with friends. On a phone they can add it to their home screen:

- **iPhone (Safari):** Share button → **Add to Home Screen**
- **Android (Chrome):** menu (⋮) → **Add to Home screen** or **Install app**

## 4. Update the app later

**To change questions:** open `data/questions.json` on GitHub, click the pencil icon, make your edits, and click **Commit changes**.

**To change anything else:** edit the files on your computer, preview them (step 1), then in your GitHub repository choose **Add file → Upload files**, drag in the changed files, and commit.

Either way, the live site updates by itself within a few minutes. If you still see the old version, refresh the page once or twice.

## Good to know

- Favourites are stored in each person's own browser. They are private to that device and are not shared or backed up.
- The app avoids repeating a question until you have seen every question for that category and level.
