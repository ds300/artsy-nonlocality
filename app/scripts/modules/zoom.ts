import getUrls from "get-urls"
import * as url from "url"
import { CalendarEvent } from "../domain"
import { sendMessage, receiveMessages } from "../protocol"
import { authFetch } from "../utils/authFetch"
import { observable } from "mobx"
import { inBackgroundPage } from "../utils/inBackgroundPage"

type Rooms = { [location: string]: string }

export type ZoomMessages =
  | {
      type: "ReceivedKnownRooms"
      rooms: Rooms
    }
  | {
      type: "SyncZoomState"
      state: typeof zoomState
    }

export const zoomState = observable({
  knownRooms: {} as Rooms,
})

receiveMessages({
  Sync() {
    inBackgroundPage(() =>
      sendMessage("SyncZoomState", {
        state: zoomState,
      }),
    )
  },
  SyncZoomState({ state }) {
    Object.assign(zoomState, state)
  },
  ReceivedKnownRooms({ rooms }) {
    zoomState.knownRooms = rooms
  },
})

export const init = () =>
  authFetch(
    "https://www.googleapis.com/drive/v2/files/1Lbn-2EEMkxg5xp2P6eCl7gEYkhWoNUtA",
  )
    .then((res: any) => authFetch(res.downloadUrl) as any)
    .then((rooms: Rooms) => {
      sendMessage("ReceivedKnownRooms", { rooms })
    })

export const getZoomLink = (event: CalendarEvent): string | undefined => {
  const explicitLinks = Array.from(
    getUrls([event.location, event.description].join("\n"), {
      extractFromQueryString: true,
    }),
  )
    .map(url.parse)
    .filter(url => url.hostname === "zoom.us")
    .filter(url => url.pathname && url.pathname.match(/^\/(j|my)\/\w+$/))

  if (
    explicitLinks.length === 1 ||
    new Set(explicitLinks.map(url => url.pathname)).size === 1
  ) {
    return explicitLinks[0].href
  }

  const link = event.location && zoomState.knownRooms[event.location.trim()]
  if (link) {
    return link
  }

  return
}

export const isZoomable = (event: CalendarEvent) => Boolean(getZoomLink(event))
