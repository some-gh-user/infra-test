import { Octokit } from "@octokit/action"
import { humanId } from "human-id"
import fs from "fs"

// Get the required environment variables (PR number and GitHub token)
const prNumber = process.argv[2]
const [owner, repo] = process.env.GITHUB_REPOSITORY.split("/")
// const token = process.env.GITHUB_TOKEN

const packageName = repo

const octokit = new Octokit({
  // auth: token,
})

const IDENTIFIER = "<!-- CH_ACTION -->"

// find all comments
console.log("listing comments")
const { data: comments } = await octokit.issues.listComments({
  owner,
  repo,
  issue_number: prNumber,
})

const prevComment = comments.find((comment) =>
  comment.body.startsWith(IDENTIFIER),
)

async function getBody() {
  // find changed files
  console.log("listing files")
  let changedFiles = await octokit.pulls.listFiles({
    owner,
    repo,
    pull_number: prNumber,
  })
  const changeset = changedFiles.data.find(
    (file) =>
      file.status === "added" &&
      /^\.changeset\/.+\.md$/.test(file.filename) &&
      file.filename !== ".changeset/README.md",
  )

  const hasChangesets = !!changeset
  console.log({ hasChangesets })

  if (!hasChangesets) {
    console.log("getting PR")
    const pr = await octokit.pulls.get({
      owner,
      repo,
      pull_number: prNumber,
    })

    const filename = humanId({
      separator: "-",
      capitalize: false,
    })
    const value = encodeURIComponent(`---
"${packageName}": patch
---

${pr.data.title}
`)
    const repoURL = pr.data.head.repo.html_url
    const addChangesetURL = `${repoURL}/new/${pr.data.head.ref}?filename=.changeset/${filename}.md&value=${value}`
    return `${IDENTIFIER}
No changeset detected. If you are changing ${
      "`" + packageName + "`"
    } [click here to add a changeset](${addChangesetURL}).
`
  }

  // if has changesets

  // add label if doesn't exist

  await octokit.issues.addLabels({
    owner,
    repo,
    issue_number: prNumber,
    labels: ["changeset"],
  })

  const canary = await fs.promises.readFile("canary.json", "utf8")
  console.log("canary", canary)

  const { packages } = JSON.parse(canary)
  const { name, url } = packages[0]

  return `${IDENTIFIER}
Try ${"`" + name + "`"} from this pull request in your project with: 

${"```"}
npm i https://pkg.pr.new/${name}@${prNumber}
${"```"}
`
}

async function createComment() {
  try {
    const body = await getBody()

    if (prevComment) {
      // Update the comment if it already exists
      console.log("updating comment")
      await octokit.issues.updateComment({
        owner,
        repo,
        comment_id: prevComment.id,
        body,
      })
      console.log(`Comment updated on PR #${prNumber}`)
      return
    }

    // Create a comment on the pull request
    console.log("creating comment", owner, repo, prNumber)
    console.log({ body })
    await octokit.issues.createComment({
      owner,
      repo,
      issue_number: prNumber,
      body,
    })
    console.log(`Comment created on PR #${prNumber}`)
  } catch (error) {
    console.error(`Failed: ${error.message}`)
    process.exit(1)
  }
}

// Run the function
await createComment()

// test pr graphql

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
const result = await octokit.graphql(query, {
  repoOwner: owner,
  repoName: repo,
  prNumber: Number(prNumber),
})
console.log(JSON.stringify(result, null, 2))
