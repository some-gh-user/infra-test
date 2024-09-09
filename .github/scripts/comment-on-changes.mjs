import { Octokit } from "@octokit/action"

// Get the required environment variables (PR number and GitHub token)
const prNumber = process.argv[2]
const [owner, repo] = process.env.GITHUB_REPOSITORY.split("/")
// const token = process.env.GITHUB_TOKEN

const octokit = new Octokit({
  // auth: token,
})

const IDENTIFIER = "<!-- POMBOT_IDENTIFIER -->"

// find all comments
const { data: comments } = await octokit.issues.listComments({
  owner,
  repo,
  issue_number: prNumber,
})

const prevComment = comments.find((comment) =>
  comment.body.startsWith(IDENTIFIER),
)

async function createComment() {
  try {
    const body = `${IDENTIFIER}
TODO find changesets ${Date.now()}
`

    if (prevComment) {
      // Update the comment if it already exists
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
    await octokit.issues.createComment({
      owner,
      repo,
      issue_number: prNumber,
      body,
    })
    console.log(`Comment created on PR #${prNumber}`)
  } catch (error) {
    console.error(`Failed to create comment: ${error.message}`)
  }
}

// Run the function
await createComment()
