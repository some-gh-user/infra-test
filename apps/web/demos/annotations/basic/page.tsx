import Content from "./content.md"
import { RawCode, Pre, highlight } from "ch-test-infra/code"
import { AnnotationHandler } from "ch-test-infra/code"

export default function Page() {
  return <Content components={{ Code }} />
}

export async function Code({ codeblock }: { codeblock: RawCode }) {
  const highlighted = await highlight(codeblock, "github-dark")
  return (
    <Pre
      className="m-0 bg-zinc-950"
      code={highlighted}
      handlers={[borderHandler, bgHandler]}
    />
  )
}
const borderHandler: AnnotationHandler = {
  name: "border",
  Block: ({ annotation, children }) => (
    <div style={{ border: "1px solid red" }}>{children}</div>
  ),
}

const bgHandler: AnnotationHandler = {
  name: "bg",
  Inline: ({ annotation, children }) => (
    <span style={{ background: "#2d26" }}>{children}</span>
  ),
}
