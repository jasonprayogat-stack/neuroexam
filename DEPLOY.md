# Publishing NeuroExam to GitHub Pages

Your code is already committed to a local git repo. Follow these steps to get
a live URL like `https://YOURNAME.github.io/neuroexam/`.

## Step 1 — Get a GitHub account (skip if you have one)
Go to https://github.com and sign up (free). Remember your **username**.

## Step 2 — Create an empty repository
1. Click the **+** (top-right) → **New repository**.
2. **Repository name:** `neuroexam`
3. Set it to **Public**.
4. **Do NOT** tick "Add a README" / .gitignore / license (we already have them).
5. Click **Create repository**.
6. Copy the URL shown at the top, e.g. `https://github.com/YOURNAME/neuroexam.git`

## Step 3 — Push the code (Claude can run this for you)
Give Claude that repository URL and it will run the push. The very first time,
a browser window pops up asking you to **sign in to GitHub** — that's normal,
just approve it. (Or run it yourself in a terminal inside the `neuroexam`
folder:)

```
git remote add origin https://github.com/YOURNAME/neuroexam.git
git push -u origin main
```

## Step 4 — Turn on GitHub Pages
1. In your repo, click **Settings** → **Pages** (left sidebar).
2. Under **Build and deployment → Source**, choose **Deploy from a branch**.
3. Branch: **main**, folder: **/ (root)**. Click **Save**.
4. Wait ~1 minute, refresh. The link appears at the top of the Pages screen:
   **https://YOURNAME.github.io/neuroexam/**

That link is your live portfolio app — it works on phones, installs to the
home screen, and works offline after the first visit.

## Updating later
After you change files, from the `neuroexam` folder run:
```
git add -A
git commit -m "describe your change"
git push
```
Pages redeploys automatically in about a minute.
