import React from "react"
import { observer } from "mobx-react"
import { Container } from "../components/Container"
import styled from "styled-components"
import { BackArrowIcon } from "../icons/BackArrowIcon"
import { Title } from "../components/Title"
import Toggle from "react-toggle"
import "react-toggle/style.css"
import { sendMessage } from "../core/protocol"
import { settingsState } from "../modules/settings"

const BackButtonWrapper = styled.div`
  position: fixed;
  top: 0px;
  left: 0px;
  padding: 18px 30px 20px;
  :hover {
    cursor: pointer;
    svg * {
      fill: #000;
    }
  }
`

const ToggleWrapper = styled.div`
  opacity: 0.8;
  position: relative;
  top: 2px;
`

const Row = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 10px;
`

const Label = styled.div`
  font-weight: 100;
  font-size: 14px;
`
export const Settings = observer(
  ({ onNavigateBack }: { onNavigateBack(): void }) => {
    return (
      <Container>
        <BackButtonWrapper onClick={onNavigateBack}>
          <BackArrowIcon />
        </BackButtonWrapper>
        <Title>Settings</Title>
        <Row>
          <Label>Desktop notifications</Label>
          <ToggleWrapper>
            <Toggle
              checked={settingsState.sendDesktopNotifications}
              onChange={e => {
                sendMessage("SetSendDesktopNotifications", {
                  sendDesktopNotifications: e.currentTarget.checked,
                })
              }}
            />
          </ToggleWrapper>
        </Row>
        <Row>
          <Label>24 hour clock</Label>
          <ToggleWrapper>
            <Toggle
              checked={settingsState.use24hrClock}
              onChange={e => {
                sendMessage("SetUse24hrClock", {
                  use24hrClock: e.currentTarget.checked,
                })
              }}
            />
          </ToggleWrapper>
        </Row>
      </Container>
    )
  },
)
