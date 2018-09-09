import React from "react"
import styled, { css, keyframes } from "styled-components"

interface ButtonProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  isLoading: boolean
}

const rotate360 = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`

const Wrapper = styled.span`
  transform: scale(${({ isLoading }: ButtonProps) => (isLoading ? 0.1 : 1)});
  width: 100%;
`

const Link = styled.a`
  width: 100%;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: black;
  color: white;
  font-size: 14px;
  letter-spacing: 0.9px;
  transition: background-color 0.1s ease-in-out, color 0.1s ease-in-out,
    transform 0.2s ease-out;
  cursor: pointer;
  :hover {
    transform: translateY(-1px);
  }
  font-weight: 600;
  animation-fill-mode: forwards;
  ${({ isLoading }: ButtonProps) =>
    isLoading &&
    css`
      animation: ${rotate360} 1s linear infinite;
      background-color: black;
      color: black;
      pointer-events: none;
      :hover {
        background-color: black;
        color: black;
      }
    `};
`

export const Button = (props: ButtonProps) => {
  return (
    <Wrapper isLoading={props.isLoading}>
      <Link {...props} />
    </Wrapper>
  )
}
