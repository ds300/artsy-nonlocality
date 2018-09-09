import { observable, autorun } from "mobx"
import { receiveMessages, sendMessage } from "../protocol"
import { inBackgroundPage } from "../utils/inBackgroundPage"

export type SettingsMessages =
  | { type: "SetUse24hrClock"; use24hrClock: boolean }
  | {
      type: "SetSendDesktopNotifications"
      sendDesktopNotifications: boolean
    }
  | {
      type: "SyncSettingsState"
      state: typeof state
    }

const state = observable({
  use24hrClock: true,
  sendDesktopNotifications: true,
})

export const settingsState = state as Readonly<typeof state>

receiveMessages({
  Sync() {
    inBackgroundPage(() =>
      sendMessage("SyncSettingsState", {
        state: state,
      }),
    )
  },
  SyncSettingsState(args) {
    Object.assign(state, args.state)
  },
  SetSendDesktopNotifications({ sendDesktopNotifications }) {
    state.sendDesktopNotifications = sendDesktopNotifications
  },
  SetUse24hrClock({ use24hrClock }) {
    state.use24hrClock = use24hrClock
  },
})

inBackgroundPage(() => {
  const savedState = localStorage.getItem("settings")
  if (savedState) {
    Object.assign(state, JSON.parse(savedState))
  }
  autorun(() => {
    localStorage.setItem("settings", JSON.stringify(state))
  })
})
