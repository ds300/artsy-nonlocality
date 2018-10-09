// // Enable chromereload by uncommenting this line:
import "chromereload/devonly"

import * as zoom from "./modules/zoom"
import * as events from "./modules/events"
import * as auth from "./modules/auth"
import { sendMessage } from "./core/protocol"

import { authState } from "./modules/auth"
import "./modules/events"
import "./modules/ready"
import "./modules/settings"
import "./modules/time"
import "./modules/zoom"
import { autorun } from "mobx"

import * as Sentry from "@sentry/browser"

Sentry.init({
  dsn: "https://c9a3e3d70c4b414088af3aee6e66d81b@sentry.io/1277918",
})

function init() {
  zoom
    .init()
    .then(events.init)
    .then(() => {
      sendMessage("SetReadyState", { ready: true })
    })
    .catch(e => {
      // todo: replace with view on popup
      console.error(e)
    })
}

auth.init()

autorun(() => {
  if (authState.goodToGo) {
    init()
  } else {
    sendMessage("SetReadyState", { ready: false })
  }
})
