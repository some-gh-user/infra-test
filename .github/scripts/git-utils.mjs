import { exec, getExecOutput } from "@actions/exec"
import github from "@actions/github"

export async function checkout(branch) {
  let { stderr } = await getExecOutput("git", ["checkout", branch], {
    ignoreReturnCode: true,
  })
  let isCreatingBranch = !stderr
    .toString()
    .includes(`Switched to a new branch '${branch}'`)
  if (isCreatingBranch) {
    await exec("git", ["checkout", "-b", branch])
  }
}

export async function resetBranch() {
  // reset current branch to the commit that triggered the workflow
  await exec("git", ["reset", `--hard`, github.context.sha])
}

export async function commitAll(message) {
  await exec("git", ["add", "."])
  await exec("git", ["commit", "-m", message])
}

export async function forcePush(branch) {
  await exec("git", ["push", "origin", `HEAD:${branch}`, "--force"])
}
