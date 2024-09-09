import { Octokit } from "@octokit/action"

const [owner, repo] = process.env.GITHUB_REPOSITORY.split("/")
const prNumber = process.argv[2]
const octokit = new Octokit({})
const packageName = "ch-test-infra"

const query = `query ($repoOwner: String!, $repoName: String!, $prNumber: Int!) {
  repository(owner: $repoOwner, name: $repoName) {
    pullRequest(number: $prNumber) {
      title
      state
      closingIssuesReferences(first: 10) {
        nodes {
          number
        }
      }
    }
  }
}`
const pr = await octokit.graphql(query, {
  repoOwner: owner,
  repoName: repo,
  prNumber: Number(prNumber),
})
console.log(JSON.stringify(pr, null, 2))

const IDENTIFIER = "<!-- CH_ACTION -->"
const body = `${IDENTIFIER}
This issue has been fixed but not yet released.

Try it in your project before the release with:

${"```"}
npm i https://pkg.pr.new/${packageName}@${prNumber}
${"```"}

Or wait for the next [release](https://github.com/${owner}/${repo}/pulls?q=is%3Aopen+is%3Apr+label%3Arelease).
`
await Promise.all(
  pr.repository.pullRequest.closingIssuesReferences.nodes.map(
    async ({ number }) => {
      await octokit.issues.createComment({
        owner,
        repo,
        issue_number: number,
        body,
      })
    },
  ),
)
