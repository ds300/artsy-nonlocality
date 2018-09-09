import { Time, CalendarEvent, EventsPayload } from "../domain"
import { DateTime } from "luxon"
import { stringify } from "querystring"
import { isZoomable, getZoomLink } from "./zoom"
import { receiveMessages, sendMessage } from "../protocol"
import { authFetch } from "../utils/authFetch"
import { observable } from "mobx"
import { inBackgroundPage } from "../utils/inBackgroundPage"

export type EventsMessages =
  | {
      type: "SyncEventsState"
      state: typeof eventsState
    }
  | {
      type: "ReceivedRelevantEvents"
      events: { [id: string]: CalendarEvent }
    }

export const eventsState = observable.object({
  relevantEvents: {} as { [k: string]: CalendarEvent },
  notifiedEventIds: {} as { [k: string]: boolean },
})

receiveMessages({
  Sync() {
    inBackgroundPage(() =>
      sendMessage("SyncEventsState", {
        state: eventsState,
      }),
    )
  },
  SyncEventsState({ state }) {
    Object.assign(eventsState, state)
  },
  ReceivedRelevantEvents({ events }) {
    eventsState.relevantEvents = events
    Object.keys(eventsState.notifiedEventIds).forEach(id => {
      if (!(id in events)) {
        delete eventsState.notifiedEventIds[id]
      }
    })
  },
})

export const parseTime = (start: Time) => {
  if (start.date) {
    return DateTime.fromFormat(start.date, "YYYY-MM-dd")
  } else {
    const dateTime = DateTime.fromISO(start.dateTime!)
    if (start.timeZone) {
      return dateTime.setZone(start.timeZone).toLocal()
    }
    return dateTime.toLocal()
  }
}

const fetchEvents = () =>
  authFetch<EventsPayload>(
    "https://www.googleapis.com/calendar/v3/calendars/primary/events?" +
      stringify({
        timeMin: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
        timeMax: new Date(Date.now() + 1000 * 60 * 60 * 10).toISOString(),
        singleEvents: true,
      }),
  ).then(result => {
    const events = result.items
      .filter(
        ev =>
          ev.status === "confirmed" &&
          ev.summary &&
          ev.visibility !== "confidential" &&
          (!ev.attendees ||
            ev.attendees.some(a =>
              Boolean(a.self && a.responseStatus !== "declined"),
            )) &&
          isZoomable(ev),
      )
      .reduce(
        (relevantEvents, ev) => {
          relevantEvents[ev.id] = ev
          return relevantEvents
        },
        {} as typeof eventsState.relevantEvents,
      )
    sendMessage("ReceivedRelevantEvents", {
      events,
    })
  })

function processEvents() {
  Object.keys(eventsState.relevantEvents).forEach(id => {
    if (!eventsState.notifiedEventIds[id]) {
      const ev = eventsState.relevantEvents[id]
      const startTime = parseTime(ev.start!)
      const inTenSeconds = DateTime.local().plus({ seconds: 10 })
      const tenSecondsAgo = DateTime.local().minus({ seconds: 10 })
      if (startTime > tenSecondsAgo && startTime <= inTenSeconds) {
        chrome.notifications.create(ev.id, {
          type: "basic",
          iconUrl: "images/artsy-logo.128x128.png",
          requireInteraction: true,
          title: ev.summary || "Untitled event",
          contextMessage: `Starts now in ${ev.location}`,
          message: `Click 👈🏽 to join via zoom`,
        })
        eventsState.notifiedEventIds[id] = true
      }
    }
  })
}

export async function init() {
  await fetchEvents()
  setInterval(fetchEvents, 1000 * 60)
  setInterval(processEvents, 1000 * 1)

  chrome.notifications.onClicked.addListener(id => {
    chrome.notifications.clear(id)
    const ev = eventsState.relevantEvents[id]
    if (ev) {
      chrome.tabs.create({
        url: getZoomLink(ev),
      })
    }
  })
}
