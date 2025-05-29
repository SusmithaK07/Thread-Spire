import { HeroSection } from "@/components/ui/hero-section-dark"

function HeroSectionDemo() {
  return (
    <HeroSection
      title="Welcome to ThreadSpire"
      subtitle={{
        regular: "A calm, thoughtful platform for ",
        gradient: "sharing wisdom and connecting ideas",
      }}
      description={`ThreadSpire is your space for slow, meaningful conversation.\n- Create long-form "wisdom threads" made of linked, focused segments.\n- Add titles and tags for easy discovery.\n- Save drafts or publish when ready—public threads are visible to all, private drafts are just for you.\n- React to each segment with expressive emojis, and bookmark your favorite threads for later.\n- Organize threads into personal collections, like "Career Wisdom" or "Leadership Hacks."\n- Remix (fork) any public thread into your own, building on the ideas of others.\n- Enjoy robust privacy: your bookmarks and collections are private by default, but you can share public collections too.\n- Discover trending, most-bookmarked, and newest threads, and filter by tags to find what matters to you.`}
      ctaText="Get Started"
      ctaHref="/register"
      bottomImage={{
        light: "https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=1200&q=80",
        dark: "https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=1200&q=80",
      }}
      gridOptions={{
        angle: 65,
        opacity: 0.4,
        cellSize: 50,
        lightLineColor: "#4a4a4a",
        darkLineColor: "#2a2a2a",
      }}
    />
  )
}
export { HeroSectionDemo }
