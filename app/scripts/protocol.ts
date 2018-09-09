import { EventsMessages } from "./modules/events"
import { ZoomMessages } from "./modules/zoom"
import { SettingsMessages } from "./modules/settings"
import { AuthMessages } from "./modules/auth"
import { ReadyMessages } from "./modules/ready"

const listeners: Array<(msg: Message) => void> = []

type Message =
  | { type: "Sync" }
  | EventsMessages
  | ZoomMessages
  | SettingsMessages
  | AuthMessages
  | ReadyMessages

chrome.runtime.onMessage.addListener((msg: Message) =>
  listeners.forEach((fn: any) => fn(msg)),
)

type OnlyType<T> = T extends any ? (keyof T extends "type" ? T : never) : never
type SimpleMessage = OnlyType<Message>

type ComplexMessage = Exclude<Message, SimpleMessage>

export function sendMessage<T extends SimpleMessage["type"]>(type: T): void
export function sendMessage<
  T extends ComplexMessage["type"],
  V = Extract<ComplexMessage, { type: T }>
>(type: T, args: { [K in Exclude<keyof V, "type">]: V[K] }): void
export function sendMessage() {
  const msg = { type: arguments[0], ...arguments[1] }
  chrome.runtime.sendMessage(msg)
  listeners.forEach((fn: any) => fn(msg))
}

export const receiveMessages = <T extends Message["type"] & string>(
  map: { [type in T]: (args: Extract<Message, { type: type }>) => void },
) => {
  listeners.push(msg => {
    const { type, ...others } = msg
    if (map.hasOwnProperty(type)) {
      const f = map[type] as any
      f(others)
    }
  })
}

listeners.push(({ type, ...args }) => {
  console.log(type, args)
})
