import { observer } from "mobx-react"
import { Container } from "../components/Container"
import React from "react"
import { sendMessage } from "../core/protocol"
import { Button } from "../components/Button"
import { authState } from "../modules/auth"
import styled from "styled-components"

const Title = styled.div`
  font-family: "EB Garamond", Garamond, serif;
  font-size: 20px;
  margin-bottom: 20px;
`

const Message = styled.div`
  font-size: 14px;
  font-weight: 100;
  text-align: center;
  line-height: 1.4;
  :not(:last-child) {
    margin-bottom: 20px;
  }
  strong {
    font-weight: 500;
  }
`

function getBody() {
  if (!authState.isSignedIn) {
    return (
      <>
        <Title>Hi! 👋</Title>
        <Message>
          Sign in with your <strong>artsymail.com</strong> account to use this
          extension.
        </Message>
        <Button
          isLoading={authState.isSigningIn}
          onClick={() => {
            sendMessage("SignIn")
          }}
          style={{ width: "100%" }}
        >
          Sign in
        </Button>
      </>
    )
  }

  if (!authState.isUserAnArtsyEmployee) {
    return (
      <>
        <Title>Whoops! 🙈</Title>
        <Message>
          You need to sign in to Chrome with your <strong>artsymail.com</strong>{" "}
          account to use this extension.
        </Message>
      </>
    )
  }

  if (!authState.isAuthorized) {
    return (
      <>
        <Title>Hey Artsy homie! 👋</Title>
        <Message>
          We just need a couple of permissions from you to get started 👇
        </Message>
        <Button
          isLoading={authState.isSigningIn}
          onClick={() => {
            sendMessage("SignIn")
          }}
        >
          Go
        </Button>
      </>
    )
  }

  return (
    <>
      <Title>Oh no! 🙈</Title>
      <Message>
        Something went wrong. Try restarting chrome and signing in again?
      </Message>
      <Button
        isLoading={authState.isSigningIn}
        onClick={() => {
          sendMessage("SignIn")
        }}
      >
        Sign in
      </Button>
    </>
  )
}

export const SignIn = observer(() => (
  <Container
    style={{
      alignItems: "center",
      justifyContent: "center",
      padding: "30px",
    }}
  >
    {getBody()}
  </Container>
))
