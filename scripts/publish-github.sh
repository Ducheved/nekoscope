set -euo pipefail
repo="${GITHUB_REPOSITORY:-nekoscope}"
visibility="${GITHUB_VISIBILITY:-private}"
gh_bin="${GH_BIN:-gh}"
if ! command -v "$gh_bin" >/dev/null 2>&1; then
  if command -v gh.exe >/dev/null 2>&1; then
    gh_bin="gh.exe"
  elif [ -x "/c/Program Files/GitHub CLI/gh.exe" ]; then
    gh_bin="/c/Program Files/GitHub CLI/gh.exe"
  else
    echo "Install GitHub CLI, then run: GH_TOKEN=your_token gh auth login --with-token"
    echo "After authentication run: bash scripts/publish-github.sh"
    exit 1
  fi
fi
if ! "$gh_bin" auth status >/dev/null 2>&1; then
  echo "Run: GH_TOKEN=your_token gh auth login --with-token"
  echo "Then run: bash scripts/publish-github.sh"
  exit 1
fi
if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  git init
fi
git branch -M main
if ! "$gh_bin" repo view "$repo" >/dev/null 2>&1; then
  "$gh_bin" repo create "$repo" "--$visibility" --source=. --remote=origin
else
  if ! git remote get-url origin >/dev/null 2>&1; then
    url="$("$gh_bin" repo view "$repo" --json url -q '.url + ".git"')"
    git remote add origin "$url"
  fi
fi
git push -u origin main
if ! git rev-parse nekoscope-v0.1.0 >/dev/null 2>&1; then
  git tag nekoscope-v0.1.0
fi
git push origin nekoscope-v0.1.0
"$gh_bin" repo view "$repo" --web
