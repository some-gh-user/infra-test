import { Octokit } from "@octokit/action"

// Get the required environment variables (PR number and GitHub token)
const prNumber = process.argv[2]
const [repoOwner, repoName] = process.env.GITHUB_REPOSITORY.split("/")
// const token = process.env.GITHUB_TOKEN

const octokit = new Octokit({
  // auth: token,
})

async function createComment() {
  try {
    const comment = {
      owner: repoOwner,
      repo: repoName,
      issue_number: prNumber,
      body: "Hello, this is an automated comment from a GitHub Action!",
    }

    // Create a comment on the pull request
    await octokit.issues.createComment(comment)
    console.log(`Comment created on PR #${prNumber}`)
  } catch (error) {
    console.error(`Failed to create comment: ${error.message}`)
  }
}

// Run the function
await createComment()
