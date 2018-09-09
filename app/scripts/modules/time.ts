import { observable } from "mobx"
import { DateTime } from "luxon"

export const timeState = observable({
  now: DateTime.local(),
})

setInterval(() => {
  timeState.now = DateTime.local()
}, 500)
