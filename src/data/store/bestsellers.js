// src/data/store/bestsellers.js
//
// STATIC placeholder — authored in the EXACT shape the public getProducts
// endpoint returns (imageGroups nesting + computed finalPrice/isOnSale/
// discountAmount). Swap for `GET /products?sortBy=purchaseCount&order=desc`
// later; normalizeProduct() already understands this shape.
//
// Unsplash images are placeholders — replace with real product photography.

const img = (url, alt) => ({
    name: "Default",
    images: [{ url, alt }],
});

export const bestsellers = [
    {
        _id: "bs_01",
        name: "Rotring 600 Mechanical Pencil — 0.5mm",
        slug: "rotring-600-mechanical-pencil-05mm",
        basePrice: 2400,
        price: 1920,
        finalPrice: 1920,
        discountType: "percentage",
        discountValue: 20,
        discountAmount: 480,
        isOnSale: true,
        isUnderValidCampaign: false,
        imageGroups: [
            img(
                "https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=600&q=80",
                "Rotring 600 mechanical pencil on a desk",
            ),
        ],
        averageRating: 4.9,
        numReviews: 214,
        stock: 38,
        hasVariants: false,
    },
    {
        _id: "bs_02",
        name: "Leuchtturm1917 Dotted Notebook — A5",
        slug: "leuchtturm1917-dotted-notebook-a5",
        basePrice: 1850,
        price: 1850,
        finalPrice: 1850,
        discountType: "none",
        discountValue: 0,
        discountAmount: 0,
        isOnSale: false,
        isUnderValidCampaign: false,
        imageGroups: [
            img(
                "https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=600&q=80",
                "Dotted A5 hardcover notebook",
            ),
        ],
        averageRating: 4.8,
        numReviews: 512,
        stock: 120,
        hasVariants: true, // multiple cover colours -> "from ৳X"
    },
    {
        _id: "bs_03",
        name: "Pilot Iroshizuku Ink — 50ml",
        slug: "pilot-iroshizuku-ink-50ml",
        basePrice: 2200,
        price: 2200,
        finalPrice: 2200,
        discountType: "none",
        discountValue: 0,
        discountAmount: 0,
        isOnSale: false,
        isUnderValidCampaign: false,
        imageGroups: [
            img(
                "https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?w=600&q=80",
                "Bottle of fountain pen ink",
            ),
        ],
        averageRating: 4.7,
        numReviews: 98,
        stock: 26,
        hasVariants: true,
    },
    {
        _id: "bs_04",
        name: "Midori MD Cotton Letter Pad",
        slug: "midori-md-cotton-letter-pad",
        basePrice: 1200,
        price: 990,
        finalPrice: 990,
        discountType: "fixed",
        discountValue: 210,
        discountAmount: 210,
        isOnSale: true,
        isUnderValidCampaign: false,
        imageGroups: [
            img(
                "https://images.unsplash.com/photo-1519337265831-281ec6cc8514?w=600&q=80",
                "Cotton letter writing pad",
            ),
        ],
        averageRating: 4.6,
        numReviews: 63,
        stock: 0, // sold-out state showcase
        hasVariants: false,
    },
    {
        _id: "bs_05",
        name: "Faber-Castell Polychromos — 24 Set",
        slug: "faber-castell-polychromos-24-set",
        basePrice: 6800,
        price: 5440,
        finalPrice: 5440,
        // campaign-driven discount: base discount is "none", sale comes from campaign
        discountType: "none",
        discountValue: 0,
        discountAmount: 1360,
        isOnSale: true,
        isUnderValidCampaign: true,
        campaignInfo: {
            campaignName: "Back to Class",
            discountType: "percentage",
            discountValue: 20,
            campaignPrice: 5440,
        },
        imageGroups: [
            img(
                "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=600&q=80",
                "Set of coloured pencils",
            ),
        ],
        averageRating: 4.9,
        numReviews: 187,
        stock: 14,
        hasVariants: false,
    },
    {
        _id: "bs_06",
        name: "Kaweco Sport Fountain Pen",
        slug: "kaweco-sport-fountain-pen",
        basePrice: 3200,
        price: 3200,
        finalPrice: 3200,
        discountType: "none",
        discountValue: 0,
        discountAmount: 0,
        isOnSale: false,
        isUnderValidCampaign: false,
        imageGroups: [
            img(
                "https://images.unsplash.com/photo-1546695259-ad30ff3fd643?w=600&q=80",
                "Compact fountain pen",
            ),
        ],
        averageRating: 4.8,
        numReviews: 141,
        stock: 45,
        hasVariants: true,
    },
];

export default bestsellers;
