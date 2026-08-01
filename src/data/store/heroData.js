// Hero slides — image-led. Later: swap this array for GET /hero-items (or /hero).
//
// `image` uses free Unsplash photos (Unsplash License) so the demo looks real.
// Replace each with your own product/lifestyle photography in /public/hero/*.jpg
// for production — that's what makes a stationery hero feel truly yours.
//
// Per slide:
//   image            full-bleed background (landscape, high-res)
//   eyebrow          small mono label above the headline
//   lead / accent / trail   headline parts — `accent` gets the marigold underline
//   blurb            one supporting line
//   primary / secondary     the two CTAs ({ label, to })
const img = (id) => `https://images.unsplash.com/photo-${id}?q=80&w=2400&auto=format&fit=crop`;

export const heroSlides = [
    {
        id: "desk",
        image: img("1764818958908-d5efcec563d1"), // stationery flat lay
        lead: "The good stuff for your",
        accent: "desk",
        trail: ".",
        blurb: "Pens that glide, notebooks worth filling, and the little things that make work feel lighter.",
        primary: { label: "Shop stationery", to: "/shop" },
    },
    {
        id: "art",
        image: img("1570283626328-53f8bfd59a0b"), // assorted paint tubes
        lead: "Colour outside the",
        accent: "lines",
        trail: ".",
        blurb: "Acrylics, brushes, crayons and everything a good mess needs — all in one place.",
        primary: { label: "Shop art & craft", to: "/category/art-craft" },
    },
    {
        id: "school",
        image: img("1731147391367-e5dd329d9b44"), // colored pencils row
        lead: "Everything",
        accent: "on the list",
        trail: ".",
        blurb: "Geometry sets, exam pads and school supplies — delivered across Bangladesh.",
        primary: { label: "Shop school supplies", to: "/shop" },
    },
];
