set -euo pipefail
if ! command -v gh >/dev/null 2>&1; then
  echo "Install GitHub CLI and authenticate with GH_TOKEN before protecting main"
  exit 1
fi
if ! gh auth status >/dev/null 2>&1; then
  echo "Run: GH_TOKEN=your_token gh auth login --with-token"
  exit 1
fi
repo="$(gh repo view --json nameWithOwner -q .nameWithOwner)"
gh api -X PUT "repos/$repo/branches/main/protection" --input - <<JSON
{
  "required_status_checks": {
    "strict": true,
    "contexts": [
      "frontend quality",
      "rust quality",
      "tauri build smoke"
    ]
  },
  "enforce_admins": false,
  "required_pull_request_reviews": {
    "required_approving_review_count": 1
  },
  "restrictions": null,
  "allow_force_pushes": false,
  "allow_deletions": false,
  "required_linear_history": false,
  "required_conversation_resolution": true
}
JSON
gh api -X PUT "repos/$repo/vulnerability-alerts" >/dev/null
echo "main protection updated for $repo"
