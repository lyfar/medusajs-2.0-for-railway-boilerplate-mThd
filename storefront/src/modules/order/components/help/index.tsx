import { Heading } from "@medusajs/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import React from "react"

const Help = () => {
  return (
    <div className="mt-6">
      <Heading className="text-base-semi">Need help?</Heading>
      <div className="text-base-regular my-2">
        <ul className="gap-y-2 flex flex-col">
          <li>
            <a href="mailto:info@diamonds.com">Contact</a>
          </li>
          <li>
            <span className="text-ui-fg-muted cursor-not-allowed">
              Returns & Exchanges
            </span>
          </li>
        </ul>
      </div>
    </div>
  )
}

export default Help
