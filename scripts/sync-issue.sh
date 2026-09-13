#!/bin/sh
# Keeps one GitHub issue in step with a report: opens it when the report has
# content, updates it while it still does, and closes it once the report is empty.
#   sh scripts/sync-issue.sh "<issue title>" "<intro>" "<report markdown>" "<closing comment>"
set -eu
title="$1"; intro="$2"; report="$3"; closing="$4"
open="$(gh issue list --state open --limit 50 --json number,title --jq ".[] | select(.title == \"$title\") | .number" | head -n 1)"
if [ -n "$report" ]; then
  printf '%s\n\n%s\n' "$intro" "$report" > issue-body.md
  if [ -n "$open" ]; then gh issue edit "$open" --body-file issue-body.md; else gh issue create --title "$title" --body-file issue-body.md; fi
elif [ -n "$open" ]; then
  gh issue close "$open" --comment "$closing"
fi
