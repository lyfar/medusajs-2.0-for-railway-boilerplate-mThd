import { Button, Heading } from "@medusajs/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

const Hero = () => {
  return (
    <div 
      className="h-[75vh] w-full border-b border-ui-border-base relative bg-gradient-to-br from-gray-50 to-white"
    >
      <div className="absolute inset-0 z-10 flex flex-col justify-center items-center text-center small:p-32 gap-8">
        <div className="max-w-4xl">
          <Heading
            level="h1"
            className="text-5xl md:text-6xl leading-tight text-ui-fg-base font-light mb-4"
          >
            Discover Exquisite
            <br />
            <span className="text-rose-400">Lab Grown Diamonds</span>
          </Heading>
          <Heading
            level="h2"
            className="text-xl md:text-2xl leading-relaxed text-ui-fg-subtle font-light mb-8 max-w-2xl mx-auto"
          >
            Premium quality lab diamonds in every shape, color, and clarity. 
            Sustainable luxury for life's most precious moments.
          </Heading>
          <div className="flex justify-center items-center">
            <LocalizedClientLink href="/store">
              <Button className="bg-ui-fg-base text-white px-8 py-3 text-lg hover:bg-ui-fg-subtle transition-colors">
                Explore Collection
              </Button>
            </LocalizedClientLink>
          </div>
        </div>

      </div>
    </div>
  )
}

export default Hero
