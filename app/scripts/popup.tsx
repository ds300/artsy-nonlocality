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
