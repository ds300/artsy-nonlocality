import { observable } from "mobx"
import { receiveMessages, sendMessage } from "../core/protocol"
import { inBackgroundPage } from "../utils/inBackgroundPage"

export type AuthMessages =
  | {
      type: "SyncAuthState"
      state: typeof authState
    }
  | {
      type: "SignIn"
    }
  | {
      type: "SetUserEmail"
      userEmail: string | null
    }
  | {
      type: "SetIsAuthorized"
      isAuthorized: boolean
    }
  | {
      type: "EndSignInProcess"
    }

export const authState = observable({
  isSigningIn: false,
  userEmail: null as string | null,
  isAuthorized: false,
  get isSignedIn(this: typeof authState): boolean {
    return this.userEmail !== null
  },
  get isUserAnArtsyEmployee(this: typeof authState): boolean {
    return Boolean(this.userEmail && this.userEmail.endsWith("@artsymail.com"))
  },
  get goodToGo(this: typeof authState): boolean {
    return this.isAuthorized && this.isSignedIn && this.isUserAnArtsyEmployee
  },
})

receiveMessages({
  Sync() {
    inBackgroundPage(() =>
      sendMessage("SyncAuthState", {
        state: authState,
      }),
    )
  },
  SyncAuthState({ state: { userEmail, isAuthorized } }) {
    Object.assign(authState, { userEmail, isAuthorized })
  },
  SignIn() {
    authState.isSigningIn = true
    inBackgroundPage(() =>
      chrome.identity.getAuthToken({ interactive: true }, token => {
        if (!token && chrome.runtime.lastError) {
          console.error(chrome.runtime.lastError.message)
        }
        sendMessage("SetIsAuthorized", { isAuthorized: Boolean(token) })
        chrome.identity.getProfileUserInfo(info => {
          sendMessage("SetUserEmail", { userEmail: info.email || null })
          sendMessage("EndSignInProcess")
        })
      }),
    )
  },
  SetUserEmail({ userEmail }) {
    authState.userEmail = userEmail
  },
  SetIsAuthorized({ isAuthorized }) {
    authState.isAuthorized = isAuthorized
  },
  EndSignInProcess() {
    authState.isSigningIn = false
  },
})

// to be called only from the background page
export function init() {
  chrome.identity.getProfileUserInfo(info => {
    sendMessage("SetUserEmail", { userEmail: info.email || null })
    if (authState.isUserAnArtsyEmployee) {
      chrome.identity.getAuthToken({ interactive: false }, token => {
        if (!token && chrome.runtime.lastError) {
          console.error(chrome.runtime.lastError.message)
        }

        if (token) {
          chrome.identity.removeCachedAuthToken({ token })
        }
        sendMessage("SetIsAuthorized", { isAuthorized: Boolean(token) })
      })
    }
  })
}
