import { observable } from "mobx"
import { receiveMessages, sendMessage } from "../protocol"
import { inBackgroundPage } from "../utils/inBackgroundPage"

export type ReadyMessages =
  | {
      type: "SetReadyState"
      ready: boolean
    }
  | {
      type: "SyncReadyState"
      state: typeof readyState
    }

export const readyState = observable({
  ready: false,
})

receiveMessages({
  Sync() {
    inBackgroundPage(() => sendMessage("SyncReadyState", { state: readyState }))
  },
  SyncReadyState({ state }) {
    Object.assign(readyState, state)
  },
  SetReadyState({ ready }) {
    readyState.ready = ready
  },
})
