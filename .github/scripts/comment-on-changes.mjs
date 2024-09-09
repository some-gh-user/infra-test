import { Octokit } from "@octokit/action"
import { humanId } from "human-id"

// Get the required environment variables (PR number and GitHub token)
const prNumber = process.argv[2]
const [owner, repo] = process.env.GITHUB_REPOSITORY.split("/")
// const token = process.env.GITHUB_TOKEN

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
"${repo}": patch
---

${pr.data.title}
`)
    const addChangesetURL = `https://github.com/${owner}/${repo}/new/${pr.data.head.ref}?filename=.changeset/${filename}.md&value=${value}`
    return `${IDENTIFIER}
No changesets found. [Add a changeset](${addChangesetURL})
`
  }

  return `${IDENTIFIER}
Changesets found. 

${"```json"}
${JSON.stringify(changeset, null, 2)}
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
