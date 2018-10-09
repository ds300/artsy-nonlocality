import React from "react"
import ReactDOM from "react-dom"
import { SignIn } from "./pages/SignIn"
import { Meetings } from "./pages/Meetings"
import { observer } from "mobx-react"
import { sendMessage } from "./core/protocol"
import { Settings } from "./pages/Settings"
import "./modules/auth"
import "./modules/events"
import "./modules/ready"
import "./modules/settings"
import "./modules/time"
import "./modules/zoom"
import { observable } from "mobx"
import { readyState } from "./modules/ready"

import * as Sentry from "@sentry/browser"

Sentry.init({
  dsn: "https://c9a3e3d70c4b414088af3aee6e66d81b@sentry.io/1277918",
})

sendMessage("Sync")

@observer
class App extends React.Component {
  @observable
  isEditingSettings = false
  render() {
    if (this.isEditingSettings) {
      return (
        <Settings
          onNavigateBack={() => {
            this.isEditingSettings = false
          }}
        />
      )
    }
    if (readyState.ready) {
      return (
        <Meetings
          onNavigateToSettings={() => {
            this.isEditingSettings = true
          }}
        />
      )
    }
    return <SignIn />
  }
}

console.log(document.getElementById("main"))
ReactDOM.render(<App />, document.getElementById("main"))
