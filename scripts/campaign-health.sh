#!/bin/sh
# Opens "Visit summary is failing" once the daily GoatCounter read has failed three runs
# in a row, and closes it on the first clean run. The count comes from the previous runs'
# logs, so no state file is committed and no extra deploy is triggered.
#
#   VISIT_STATUS=ok|failed sh scripts/campaign-health.sh
set -eu
status="${VISIT_STATUS:-unknown}"
title="Visit summary is failing"
closing="The daily job is reading GoatCounter again."

if [ "$status" != failed ]; then
  sh scripts/sync-issue.sh "$title" "" "" "$closing"
  exit 0
fi

# This run failed; count back through the previous runs until one didn't.
fails=1
for id in $(gh run list --workflow refresh-activity.yml --status completed --limit 4 --json databaseId --jq '.[].databaseId'); do
  if gh run view "$id" --log 2>/dev/null | grep -q "Could not read GoatCounter"; then
    fails=$((fails + 1))
  else
    break
  fi
done
echo "consecutive failed visit summaries: $fails"

# One bad day is noise — three in a row is a broken token or a changed API.
if [ "$fails" -ge 3 ]; then
  sh scripts/sync-issue.sh "$title" \
    "The daily job could not read GoatCounter on the last $fails runs, so /now and the run summary have no visit data. The notice from the latest run:" \
    "$(cat visit-summary.md 2>/dev/null || echo '- no notice captured')" \
    "$closing"
fi
