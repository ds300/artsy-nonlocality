import getUrls from "get-urls"
import * as url from "url"
import { CalendarEvent } from "../core/domain"
import { sendMessage, receiveMessages } from "../core/protocol"
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

type ZoomLinks = Array<{ location?: string; href: string }>

export const getZoomLinks = (
  event: CalendarEvent,
): ZoomLinks => {
  const location = event.location
  let locationMatches: ZoomLinks = []
  if (location) {
    locationMatches = (Object.keys(zoomState.knownRooms)
      .map(key => {
        const index = location.indexOf(key)
        if (index > -1) {
          return {
            index,
            key,
          }
        }
        return null
      })
      .filter(Boolean) as Array<{ index: number; key: string }>)
      .sort((a, b) => Number(a && b && a.index - b.index))
      .map(({ key }) => ({
        location: key,
        href: zoomState.knownRooms[key],
      }))
  }

  const descriptionMatches: ZoomLinks = Array.from(
    getUrls([event.location, event.description].join("\n"), {
      extractFromQueryString: true,
    }),
  )
    .map(url.parse)
    .filter(url => url.hostname === "zoom.us")
    .filter(url => url.pathname && url.pathname.match(/^\/(j|my)\/\w+$/))
    .map(url => url.href as string)
    .filter(href => !locationMatches.some(loc => loc.href === href))
    .map(href => ({ href }))

  return locationMatches.concat(descriptionMatches)
}

export const isZoomable = (event: CalendarEvent) =>
  Boolean(getZoomLinks(event).length)
