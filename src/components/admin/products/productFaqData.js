// src/components/admin/products/productFaqData.js
// One FAQ set per form section. Rendered at the bottom of each tab via <ProductFaq />.
// Content is tailored to THIS backend's actual behavior (auto price, variant
// matching by options, JSON image workflow, signed-delta stock, etc.).

const productFaqData = {
    basic: {
        title: "Basic Information Help",
        items: [
            {
                q: "How should I format my Product Name?",
                a: "Keep it under 200 characters. The URL slug is auto-generated from the name on create — special characters are stripped. Renaming later does not change an existing slug.",
            },
            {
                q: "Why do Bullet Points matter?",
                a: "Bullet points are the scannable key features shown on the product page. Each one can be up to 1700 characters, but short, benefit-led lines convert best.",
            },
            {
                q: "What is a SKU and is it required?",
                a: "A SKU is your internal stock-keeping code. It is optional but must be unique across products when set. Leave it blank and you simply have no SKU.",
            },
            {
                q: "Category vs Subcategory?",
                a: "Category is required and is the primary placement. Subcategory is an optional second Category (usually a child of the first) for finer grouping. Leave Subcategory empty if not needed.",
            },
        ],
    },
    pricing: {
        title: "Pricing Help",
        items: [
            {
                q: "Why can't I edit the Final Price directly?",
                a: "Final Price is always computed by the server from Base Price + Discount. It is read-only here so what you see matches exactly what gets saved.",
            },
            {
                q: "How does the discount work?",
                a: "Choose Percentage (0–100) or Fixed amount. The Discount Value field only appears once a discount type is selected. 'No Discount' means Final Price equals Base Price.",
            },
            {
                q: "Does the product discount apply to variants?",
                a: "Yes — if a variant has no discount of its own, the product-level discount is applied to that variant's base price. A variant's own discount always takes priority.",
            },
        ],
    },
    inventory: {
        title: "Inventory Help",
        items: [
            {
                q: "Is this stock the total or per-variant?",
                a: "This is the product-level stock. Variant stock is managed per-variant in the Variants tab. For variant products, keep product stock consistent with your fulfilment logic.",
            },
            {
                q: "What does Low Stock Alert do?",
                a: "It is the threshold (default 5) at which the product is flagged as low stock in the admin. It does not block orders.",
            },
            {
                q: "How do I adjust stock after launch?",
                a: "Use the Adjust Stock action on the product list. That sends a signed delta (+/-) to the server, applied atomically — it is not an absolute overwrite.",
            },
        ],
    },
    media: {
        title: "Media Help",
        items: [
            {
                q: "How are images uploaded?",
                a: "Files upload first and return URLs, which are stored inside image groups and saved with the product as JSON. You are never posting raw files on the product save itself.",
            },
            {
                q: "What is an Image Group?",
                a: "A named set of images (e.g. 'Main', 'Red'). Variants reference a group by name so the storefront can swap the gallery when a shopper picks that variant.",
            },
        ],
    },
    variants: {
        title: "Variants & Options Help",
        items: [
            {
                q: "How does Smart Update / Generate work?",
                a: "It builds a card for every combination of your options (the cartesian product). With 'Preserve existing data' on, any combination that still exists keeps its price, stock and SKU.",
            },
            {
                q: "How are variants matched on the backend?",
                a: "Variants have no separate ID — they are matched by their options array (name + value). That is why editing an option value effectively defines a different variant.",
            },
            {
                q: "What does a 'color' option do?",
                a: "Name an option 'color' and each value becomes a colour swatch storing a hex code. The storefront can render the swatch directly from that value.",
            },
            {
                q: "Why link an Image Group to a variant?",
                a: "So the gallery can switch to that variant's photos on selection. Create the groups in the Media tab first, then pick one per variant.",
            },
        ],
    },
    attributes: {
        title: "Attributes Help",
        items: [
            {
                q: "What are attributes for?",
                a: "Free-form key/value specs (e.g. Material: Cotton) shown on the product page and usable for attribute-based filtering on the storefront.",
            },
            {
                q: "Attributes vs Variant Options?",
                a: "Attributes are descriptive and do not create purchasable combinations. Variant Options (Size, Color) generate variants a customer actually selects and buys.",
            },
        ],
    },
    shipping: {
        title: "Shipping Help",
        items: [
            {
                q: "What units are used?",
                a: "Dimensions (length, width, height) are in centimetres and weight is in kilograms. The server stores plain numbers, so keep your units consistent across all products.",
            },
            {
                q: "What is Shipping Class?",
                a: "One of Standard, Express, Overnight or Free. It lets shipping/rate logic treat products differently at checkout.",
            },
        ],
    },
    seo: {
        title: "SEO Help",
        items: [
            {
                q: "What are Meta Title / Description?",
                a: "The title and summary search engines show for this product. Keep the title concise; the description should read as a compelling one-line pitch.",
            },
            {
                q: "How do I enter keywords?",
                a: "Comma-separated. They are stored as a list of individual keywords.",
            },
        ],
    },
    status: {
        title: "Status Help",
        items: [
            {
                q: "What does Active control?",
                a: "Inactive products are hidden from the storefront but remain in the admin and in past orders.",
            },
            {
                q: "What does Featured do?",
                a: "Featured products can be surfaced in curated storefront sections. It does not change pricing or availability.",
            },
        ],
    },
};

export default productFaqData;
