import { AnnotationHandler } from "ch-test-infra/code"
import { InlineFold } from "./fold.client"

export const fold: AnnotationHandler = {
  name: "fold",
  Inline: InlineFold,
}
