"use client"

import {
  AnnotationHandler,
  CustomPreProps,
  InnerPre,
  getPreRef,
} from "ch-test-infra/code"
import { forwardRef } from "react"
import React from "react"
import {
  TokenTransitionsSnapshot,
  calculateTransitions,
  getStartingSnapshot,
} from "ch-test-infra/utils/token-transitions"

const MAX_TRANSITION_DURATION = 900 // milliseconds
export class SmoothPre extends React.Component<CustomPreProps> {
  ref: React.RefObject<HTMLPreElement>
  constructor(props: CustomPreProps) {
    super(props)
    this.ref = getPreRef(this.props)
  }

  render() {
    return <InnerPre merge={this.props} style={{ position: "relative" }} />
  }

  getSnapshotBeforeUpdate() {
    return getStartingSnapshot(this.ref.current!)
  }

  componentDidUpdate(
    prevProps: never,
    prevState: never,
    snapshot: TokenTransitionsSnapshot,
  ) {
    const transitions = calculateTransitions(this.ref.current!, snapshot)
    transitions.forEach(({ element, keyframes, options }) => {
      const { translateX, translateY, ...kf } = keyframes as any
      if (translateX && translateY) {
        kf.translate = [
          `${translateX[0]}px ${translateY[0]}px`,
          `${translateX[1]}px ${translateY[1]}px`,
        ]
      }
      element.animate(kf, {
        duration: options.duration * MAX_TRANSITION_DURATION,
        delay: options.delay * MAX_TRANSITION_DURATION,
        easing: options.easing,
        fill: "both",
      })
    })
  }
}