import { Time, CalendarEvent, EventsPayload } from "../domain"
import { DateTime } from "luxon"
import { stringify } from "querystring"
import { isZoomable, getZoomLinks } from "./zoom"
import { receiveMessages, sendMessage } from "../protocol"
import { authFetch } from "../utils/authFetch"
import { observable, autorun } from "mobx"
import { inBackgroundPage } from "../utils/inBackgroundPage"

export type EventsMessages =
  | {
      type: "SyncEventsState"
      state: typeof eventsState
    }
  | {
      type: "ReceivedEvents"
      events: { [id: string]: CalendarEvent }
    }

interface Events {
  [k: string]: CalendarEvent
}

export const eventsState = observable.object({
  allEvents: {} as Events,
  notifiedEventIds: {} as { [k: string]: boolean },
  get zoomableEvents(): Events {
    return Object.entries(this.allEvents)
      .filter(([_id, ev]) => isZoomable(ev))
      .reduce(
        (acc, [id, ev]) => {
          acc[id] = ev
          return acc
        },
        {} as Events,
      )
  },
  get relevantEvents(): Events {
    return Object.entries(this.zoomableEvents)
      .filter(([_id, ev]) => isUserAttending(ev))
      .reduce(
        (acc, [id, ev]) => {
          acc[id] = ev
          return acc
        },
        {} as Events,
      )
  },
})

autorun(() => {
  const {
    allEvents,
    notifiedEventIds,
    zoomableEvents,
    relevantEvents,
  } = eventsState
  console.log({ allEvents, notifiedEventIds, zoomableEvents, relevantEvents })
})

const isUserAttending = (ev: CalendarEvent) => {
  return (
    ev.status === "confirmed" &&
    ev.visibility !== "confidential" &&
    (!ev.attendees ||
      ev.attendees.some(a =>
        Boolean(a.self && a.responseStatus !== "declined"),
      ))
  )
}

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
  ReceivedEvents({ events }) {
    eventsState.allEvents = events
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
    sendMessage("ReceivedEvents", {
      events: result.items.reduce(
        (acc, ev) => {
          acc[ev.id] = ev
          return acc
        },
        {} as Events,
      ),
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
      const zoomLinks = getZoomLinks(ev)
      if (zoomLinks.length === 1) {
        chrome.tabs.create({
          url: zoomLinks[0].href,
        })
      } else {
        chrome.tabs.create({
          url: "pages/popup.html",
        })
      }
    }
  })
}
