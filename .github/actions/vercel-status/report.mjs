// Sets one commit status: node report.mjs, with SHA, STATE, STATUS_CONTEXT, GH_TOKEN
// and the standard GITHUB_* variables in the environment. DRY_RUN=1 prints the request.
const { SHA = '', STATE = '', STATUS_CONTEXT = '', GH_TOKEN = '', GITHUB_REPOSITORY = '', GITHUB_SERVER_URL = 'https://github.com', GITHUB_RUN_ID = '', DRY_RUN } = process.env;

if (!/^[0-9a-f]{40}$/.test(SHA)) throw new Error(`not a commit sha: "${SHA}"`);
if (!['pending', 'success', 'failure'].includes(STATE)) throw new Error(`unknown state: "${STATE}"`);
if (!STATUS_CONTEXT.startsWith('Vercel - ')) throw new Error(`unexpected status name: "${STATUS_CONTEXT}"`);
if (!/^[\w.-]+\/[\w.-]+$/.test(GITHUB_REPOSITORY)) throw new Error(`unexpected repository: "${GITHUB_REPOSITORY}"`);

const url = `https://api.github.com/repos/${GITHUB_REPOSITORY}/statuses/${SHA}`;
const body = { state: STATE, context: STATUS_CONTEXT, target_url: GITHUB_RUN_ID ? `${GITHUB_SERVER_URL}/${GITHUB_REPOSITORY}/actions/runs/${GITHUB_RUN_ID}` : undefined };

if (DRY_RUN) {
  console.log(JSON.stringify({ url, body }));
} else {
  const res = await fetch(url, {
    method: 'POST',
    headers: { authorization: `Bearer ${GH_TOKEN}`, accept: 'application/vnd.github+json', 'x-github-api-version': '2022-11-28' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`status not set (${res.status}): ${await res.text()}`);
  console.log(`${STATUS_CONTEXT}: ${STATE} on ${SHA.slice(0, 7)}`);
}
