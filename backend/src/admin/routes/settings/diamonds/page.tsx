import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Container, Heading, Text } from "@medusajs/ui"

const DiamondsSettingsPage = () => {
  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <Heading level="h2">Diamond Settings</Heading>
      </div>
      <div className="p-6">
        <Text className="text-ui-fg-subtle">
          Configure diamond-related admin behaviors and defaults here.
        </Text>
      </div>
    </Container>
  )
}

export const config = defineRouteConfig({
  label: "Diamonds",
})

export default DiamondsSettingsPage


