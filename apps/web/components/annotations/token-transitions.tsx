import { AnnotationHandler, InnerToken } from "ch-test-infra/code"
import { PreWithRef } from "./token-transitions.client"

export const tokenTransitions: AnnotationHandler = {
  name: "token-transitions",
  PreWithRef,
  Token: (props) => (
    <InnerToken merge={props} style={{ display: "inline-block" }} />
  ),
}
