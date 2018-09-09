import { observer } from "mobx-react"
import { Container } from "../components/Container"
import React from "react"
import styled, { css } from "styled-components"
import { OctopusGraphic } from "../components/OctopusGraphic"
import { CalendarEvent } from "../domain"
import { parseTime, eventsState } from "../modules/events"
import { DateTime } from "luxon"
import { getZoomLink } from "../modules/zoom"
import { CalendarIcon } from "../icons/CalendarIcon"
import { ClockIcon } from "../icons/ClockIcon"
import { DoorIcon } from "../icons/DoorIcon"
import { ExternalLinkIcon } from "../icons/ExternalLinkIcon"
import { ThreeDotsIcon } from "../icons/ThreeDotsIcon"
import { Title } from "../components/Title"
import { computed } from "mobx"
import { timeState } from "../modules/time"
import { settingsState } from "../modules/settings"

const EmptyStateWrapper = styled.div`
  flex: 1;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  padding-top: 35px;
`

const EmptyStateText = styled.span`
  font-family: "EB Garamond", Garamond, serif;
  font-size: 18px;
  margin-bottom: 20px;
`

const EmptyState = () => (
  <EmptyStateWrapper>
    <OctopusGraphic width={100} height={100} style={{ marginBottom: "20px" }} />
    <EmptyStateText>Woop! No upcoming meetings!</EmptyStateText>
  </EmptyStateWrapper>
)

const EventItemWrapper = styled.div`
  margin-bottom: 15px;
`

const singleLine = css`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`

const EventTitle = styled.div`
  ${singleLine};
  font-family: "EB Garamond", Garamond, serif;
  font-size: 16px;
  padding: 2px 0px;
  margin-bottom: 3px;
`

const ZoomLink = styled.a`
  margin-top: 5px;
  display: block;
  color: #3b76ea;
  font-size: 12px;
  text-decoration: none;
  :hover {
    text-decoration: underline;
  }
  font-weight: 600;
`

const Row = styled.div`
  display: flex;
  padding-bottom: 6px;
  margin-bottom: 1px;
`

const EventTitleRow = styled(Row)`
  padding: 0;
  cursor: pointer;
  svg {
    opacity: 0.79;
  }
  :hover {
    ${EventTitle} {
      text-decoration: underline;
    }
    svg {
      opacity: 1;
    }
  }
`

const IconWrapper = styled.div`
  flex: 0 0 18px;
  display: flex;
  justify-content: center;
  margin-right: 10px;
`

const Pill = styled.span`
  display: inline-block;
  padding: 4px 7px;
  border-radius: 3px;
  color: white;
  background-color: #249e28;
  font-size: 10px;
  text-transform: uppercase;
  font-weight: 700;
`

const HumanReadableTimeFromEventStart = ({
  start,
  now,
  future,
  past,
}:
  | { start: DateTime; now: DateTime; future: true; past?: undefined }
  | { start: DateTime; now: DateTime; past: true; future?: undefined }) => {
  const diff = Math.floor(now.diff(start, "minutes").minutes)
  if (past && diff < 3) {
    return <em>(just started)</em>
  }
  if (future) {
    return <em> (starts in {diff} mins)</em>
  }
  return <em> (started {diff} mins ago)</em>
}

const Subtitle = styled.div`
  font-size: 10px;
  text-transform: uppercase;
  color: #222;
  font-weight: 100;
  letter-spacing: 0.8px;
  margin-bottom: 10px;
`

const DetailText = styled.div`
  font-weight: 100;
  color: #212121;
  strong {
    color: #000;
  }
`

const eventIsHappeningNow = (event: CalendarEvent, now: DateTime) =>
  parseTime(event.start!) < now && parseTime(event.end!) > now

const EventItem = observer(({ event }: { event: CalendarEvent }) => {
  const start = parseTime(event.start!)
  const end = parseTime(event.end!)
  const isHappeningNow = start < timeState.now && end > timeState.now
  const zoomLink = getZoomLink(event)
  const dateFormat: Intl.DateTimeFormatOptions = settingsState.use24hrClock
    ? DateTime.TIME_24_SIMPLE
    : { hour12: true, hour: "numeric", minute: "2-digit" }
  return (
    <EventItemWrapper>
      {isHappeningNow && (
        <Row
          style={{
            justifyContent: "space-between",
            alignItems: "baseline",
          }}
        >
          <Pill>in progress</Pill>
          <ZoomLink
            href={getZoomLink(event)}
            onClick={() => {
              chrome.tabs.create({
                url: zoomLink,
              })
            }}
          >
            Join now
            <ExternalLinkIcon
              style={{ position: "relative", left: "4px", top: "1px" }}
              fill="#3b76ea"
            />
          </ZoomLink>
        </Row>
      )}
      <EventTitleRow
        onClick={() => chrome.tabs.create({ url: event.htmlLink })}
      >
        <IconWrapper>
          <CalendarIcon style={{ position: "relative", top: "3px" }} />
        </IconWrapper>
        <EventTitle>{event.summary || "Untitled event"}</EventTitle>
      </EventTitleRow>
      <Row>
        <IconWrapper>
          <ClockIcon />
        </IconWrapper>
        <DetailText>
          <strong>{start.toLocaleString(dateFormat).replace(" ", "")}</strong>–
          {end.toLocaleString(dateFormat).replace(" ", "")}
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
        <IconWrapper>
          <DoorIcon />
        </IconWrapper>
        <DetailText>{event.location || getZoomLink(event)}</DetailText>
      </Row>
    </EventItemWrapper>
  )
})

const SettingsButtonWrapper = styled.div`
  position: fixed;
  top: 13px;
  right: 26px;
  transform: rotate(90deg);
  padding: 4px;
  :hover {
    cursor: pointer;
    svg * {
      fill: #333;
    }
  }
`

const SettingsButton = ({ onClick }: { onClick(): void }) => (
  <SettingsButtonWrapper onClick={onClick}>
    <ThreeDotsIcon />
  </SettingsButtonWrapper>
)

const eventComparator = (evA: CalendarEvent, evB: CalendarEvent) =>
  parseTime(evA.start!).valueOf() - parseTime(evB.start!).valueOf()

const hasNotEnded = (event: CalendarEvent) => {
  return event.end && parseTime(event.end) > timeState.now
}

@observer
export class Meetings extends React.Component<{
  onNavigateToSettings(): void
}> {
  @computed
  get eventsThatHaveNotEnded(): CalendarEvent[] {
    return Object.keys(eventsState.relevantEvents)
      .map(key => eventsState.relevantEvents[key])
      .sort(eventComparator)
      .filter(hasNotEnded)
  }

  render() {
    const eventsHappeningNow = this.eventsThatHaveNotEnded.filter(ev =>
      eventIsHappeningNow(ev, timeState.now),
    )
    const upcomingEvents = this.eventsThatHaveNotEnded.filter(
      ev => !eventIsHappeningNow(ev, timeState.now),
    )
    const thereAreEvents = this.eventsThatHaveNotEnded.length > 0
    return (
      <Container>
        {!thereAreEvents ? (
          <EmptyState />
        ) : (
          <>
            <Title>Zoom meetings</Title>
            {eventsHappeningNow.map(event => (
              <EventItem event={event} key={event.id} />
            ))}
            {upcomingEvents.length && (
              <>
                <Subtitle>Upcoming</Subtitle>
                {upcomingEvents.map(event => (
                  <EventItem event={event} key={event.id} />
                ))}
              </>
            )}
          </>
        )}
        <SettingsButton onClick={this.props.onNavigateToSettings} />
      </Container>
    )
  }
}
