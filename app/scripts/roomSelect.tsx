import React from "react"
import ReactDOM from "react-dom"
import { sendMessage } from "./core/protocol"
import "./modules/auth"
import "./modules/events"
import "./modules/ready"
import "./modules/settings"
import "./modules/time"
import "./modules/zoom"
import { readyState } from "./modules/ready"
import { parse } from "query-string"
import { eventsState, parseTime } from "./modules/events"
import { timeState } from "./modules/time"
import { settingsState } from "./modules/settings"
import { DateTime } from "luxon"
import { getZoomLinks } from "./modules/zoom"
import styled, { css } from "styled-components"
import { observer } from "mobx-react"
import { injectGlobal } from "styled-components"
import { ClockIcon } from "./icons/ClockIcon"
import { HumanReadableTimeFromEventStart } from "./pages/Meetings"
import { DoorIcon } from "./icons/DoorIcon"
import { ExternalLinkIcon } from "./icons/ExternalLinkIcon"

injectGlobal`
  body, html, #main {
    height: 100%;
  }
`

sendMessage("Sync")

const Page = styled.div`
  height: 100%;
  background-color: #546a7d;
  display: flex;
  justify-content: center;
  align-items: center;
`

const Box = styled.div`
  border-radius: 4px;
  box-shadow: 0px 4px 15px rgba(0, 0, 0, 0.2);
  max-width: 370px;
  width: 370px;
  background-color: white;
  padding: 30px 40px;
`

const Title = styled.h2`
  padding: 0;
  margin: 0 0 15px;
  font-size: 20px;
  font-family: "EB Garamond", Garamond, serif;
  font-weight: 100;
  text-align: center;
`

const Row = styled.div`
  display: flex;
  margin-bottom: 16px;
  align-items: baseline;
  width: 100;
  ${({ active }: { active?: boolean }) =>
    active &&
    css`
      cursor: pointer;
    `};
`

const IconWrapper = styled.div`
  flex: 0 0 18px;
  display: flex;
  margin-right: 10px;
  position: relative;
  svg {
    position: absolute;
    left: 50%;
    /* this wrapper is 0px high, and aligned to base line of text */
    /* so offset icon a bit below base line and let individual icons */
    /* tweak exact offset according to their height */
    bottom: -2px;
    transform: translateX(-50%);
  }
`

const DetailText = styled.div`
  flex: 1;
  font-size: 14px;
  font-weight: 100;
  color: #212121;
  strong {
    color: #000;
  }
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  ${({ active }: { active?: boolean }) =>
    active &&
    css`
      color: black;
      font-weight: 400;
    `};
`

const Subtitle = styled.div`
  font-size: 12px;
  text-transform: uppercase;
  color: #222;
  font-weight: 100;
`

const ZoomLink = styled.a`
  margin-left: 4px;
  display: block;
  color: #3b76ea;
  font-size: 12px;
  text-decoration: none;
  :hover {
    text-decoration: underline;
  }
  font-weight: 600;
  flex: 0 0 auto;
`

const RoomSelect = observer(({ id }: { id: string }) => {
  const event = eventsState.allEvents[id]
  if (!event) {
    return <>Can't find event with id {id}</>
  }

  const start = parseTime(event.start!)
  const end = parseTime(event.end!)
  const isHappeningNow = start < timeState.now && end > timeState.now
  const dateFormat: Intl.DateTimeFormatOptions = settingsState.use24hrClock
    ? DateTime.TIME_24_SIMPLE
    : { hour12: true, hour: "numeric", minute: "2-digit" }

  const zoomLinks = getZoomLinks(event)

  return (
    <Page>
      <Box>
        <Title>{event.summary || "Untitled event"}</Title>
        <Row>
          <IconWrapper>
            <ClockIcon width={14} height={14} />
          </IconWrapper>
          <DetailText>
            <strong>
              {start.toLocaleString(dateFormat).replace(/ |am|pm/g, "")}
            </strong>
            –{end.toLocaleString(dateFormat).replace(/ |am|pm/g, "")}
            {isHappeningNow && (
              <HumanReadableTimeFromEventStart
                start={start}
                now={timeState.now}
                past
              />
            )}
          </DetailText>
        </Row>
        <Row>
          <Subtitle>{zoomLinks.length} rooms listed</Subtitle>
        </Row>
        <div>
          {zoomLinks.map(zoomLink => (
            <Row
              active={isHappeningNow}
              onClick={
                isHappeningNow
                  ? () => {
                      chrome.tabs.create({
                        url: zoomLink.href,
                      })
                    }
                  : undefined
              }
            >
              <IconWrapper>
                <DoorIcon style={{ bottom: "-5px" }} width={17} height={19} />
              </IconWrapper>
              <DetailText active={isHappeningNow}>
                {zoomLink.location || zoomLink.href.replace(/https?:\/\//, "")}
              </DetailText>
              {isHappeningNow && (
                <ZoomLink>
                  Join now
                  <ExternalLinkIcon
                    style={{
                      position: "relative",
                      marginLeft: "4px",
                      top: "1px",
                    }}
                    fill="#3b76ea"
                  />
                </ZoomLink>
              )}
            </Row>
          ))}
        </div>
      </Box>
    </Page>
  )
})

const App = observer(() => {
  return readyState.ready ? (
    <RoomSelect id={parse(window.location.search).id || "blah"} />
  ) : null
})

console.log(document.getElementById("main"))
ReactDOM.render(<App />, document.getElementById("main"))
