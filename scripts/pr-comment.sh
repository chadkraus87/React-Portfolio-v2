#!/bin/sh
# Creates or updates one comment on a pull request, found by a hidden marker, so a
# re-run replaces its earlier report instead of stacking a new one.
#
#   sh scripts/pr-comment.sh <pr-number> <marker> <body-file>
#
# Does nothing without a pull request number. Needs GH_TOKEN with pull-requests: write.
set -eu
pr="$1"; marker="$2"; file="$3"
[ -n "$pr" ] || { echo "no pull request for this commit; nothing to comment on"; exit 0; }
{ printf '<!-- %s -->\n' "$marker"; cat "$file"; } > pr-comment.md
id="$(gh api "repos/$GITHUB_REPOSITORY/issues/$pr/comments" --paginate --jq ".[] | select(.body | startswith(\"<!-- $marker -->\")) | .id" | head -n 1)"
if [ -n "$id" ]; then
  gh api -X PATCH "repos/$GITHUB_REPOSITORY/issues/comments/$id" -F body=@pr-comment.md > /dev/null
else
  gh api "repos/$GITHUB_REPOSITORY/issues/$pr/comments" -F body=@pr-comment.md > /dev/null
fi
