Deploy this React/Vite project to GitHub Pages and return the live URL.

Follow these steps in order:

## Step 1 — Check prerequisites

Run these checks first:
- `gh auth status` — confirm GitHub CLI is authenticated. If not, tell the user to run `! gh auth login` and stop.
- `git --version` — confirm git is available.

## Step 2 — Determine repo name

Use the project folder name as the repo name. Get it with:
```
Split-Path -Leaf (Get-Location)
```
Sanitize it: lowercase, replace spaces with hyphens. Store as `$REPO_NAME`.

## Step 3 — Get GitHub username

```
gh api user --jq .login
```
Store as `$GH_USER`.

## Step 4 — Initialize git and make first commit (if not already a repo)

Check if `.git` exists. If not:
```
git init
git add .gitignore README.md CLAUDE.md package.json vite.config.ts src public
git commit -m "Initial commit"
```
> Do NOT add node_modules or build/

If `.git` already exists, check for uncommitted changes and commit them:
```
git add -A
git status
```
If there are staged changes, commit with message `"Deploy: update project files"`.

## Step 5 — Create GitHub repo and push (if remote doesn't exist)

Check if a remote named `origin` exists: `git remote -v`

If no remote:
```
gh repo create $REPO_NAME --public --source=. --remote=origin --push
```

If remote already exists:
```
git push origin main --force
```
(or use the current branch name if not `main`)

## Step 6 — Configure Vite base path for GitHub Pages

Read `vite.config.ts`. Add `base: '/$REPO_NAME/'` inside `defineConfig({...})` at the top level (alongside `plugins`, `build`, etc.).

Example result:
```ts
export default defineConfig({
  base: '/my-repo-name/',
  plugins: [react()],
  ...
})
```

If a `base:` key already exists, update its value.

Commit this change:
```
git add vite.config.ts
git commit -m "chore: set Vite base path for GitHub Pages"
git push origin main
```

## Step 7 — Install gh-pages and add deploy script

Check if `gh-pages` is already in devDependencies. If not:
```
npm install --save-dev gh-pages
```

Check `package.json` scripts. If `"predeploy"` and `"deploy"` are missing, add them:
```json
"predeploy": "npm run build",
"deploy": "npx gh-pages -d build"
```

Commit:
```
git add package.json package-lock.json
git commit -m "chore: add GitHub Pages deploy script"
git push origin main
```

## Step 8 — Build and deploy

```
npm run deploy
```

This runs `npm run build` then publishes the `build/` folder to the `gh-pages` branch.

## Step 9 — Enable GitHub Pages (if needed)

GitHub Pages is usually auto-enabled when a `gh-pages` branch is pushed. Verify with:
```
gh api repos/$GH_USER/$REPO_NAME/pages
```

If it returns a 404, enable it:
```
gh api --method POST repos/$GH_USER/$REPO_NAME/pages --field source[branch]=gh-pages --field source[path]=/
```

## Step 10 — Report the URL

The live URL will be:
```
https://$GH_USER.github.io/$REPO_NAME/
```

Tell the user:
- The deployment is complete.
- The live URL (as a clickable link).
- GitHub Pages may take 1–2 minutes to go live on the first deploy.
- Future deploys: just run `/deploy_github` again or `npm run deploy`.
