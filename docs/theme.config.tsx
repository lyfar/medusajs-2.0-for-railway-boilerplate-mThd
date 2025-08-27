import React from 'react'
import { DocsThemeConfig } from 'nextra-theme-docs'

const Logo = () => (
  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
    <svg
      width="22"
      height="22"
      viewBox="0 0 43.31 21.3"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Lyfar Studio"
    >
      <g>
        <path fill="currentColor" d="M43.17,21.3L22.14,0l-.14,21.16,21.16,.14Z" />
        <path fill="currentColor" d="M0,0H21.06V6.44H0V0Z" />
        <path fill="currentColor" d="M0,7.28H21.06v6.45H0V7.28Z" />
        <path fill="currentColor" d="M0,14.41H21.06v6.89H0v-6.89Z" />
      </g>
    </svg>
    <span>Lyfar Studio</span>
  </span>
)

const config: DocsThemeConfig = {
  logo: <Logo />,
  project: {
    link: 'https://github.com'
  },
  // Hide Nextra default feedback and edit links
  feedback: {
    content: null
  },
  editLink: {
    component: null
  },
  footer: {
    text: 'Lab Grown Diamonds Documentation'
  }
}

export default config

