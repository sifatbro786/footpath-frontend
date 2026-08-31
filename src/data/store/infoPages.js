// src/data/store/infoPages.js
//
// Content for the policy and help pages, rendered by InfoPage.jsx.
//
// Written against how this shop ACTUALLY works, not from a template:
//   • COD takes delivery plus the COD fee online up front and collects the rest
//     on delivery (see pricingService)
//   • Courier is unavailable inside Dhaka; the zone decides the options
//   • Reviews need admin approval before they appear
//   • Guest orders are readable with an order number plus the phone on the order
//
// If any of those change on the backend, change them here too. A policy page
// that contradicts the checkout is worse than no policy page.

export const FAQ_PAGE = {
    slug: "faq",
    eyebrow: "Common questions",
    title: "Questions we get asked",
    intro: "Delivery, payment, returns and the small print, answered plainly.",
    sections: [
        {
            heading: "How long will delivery take?",
            body: [
                "Inside Dhaka, one to two days. Dhaka suburbs, one to three. Elsewhere in Bangladesh, two to four days by courier or three to five for home delivery.",
                "The exact estimate for your address appears at checkout once you pick your district and area.",
            ],
        },
        {
            heading: "What does cash on delivery actually cost?",
            body: [
                "Choosing cash on delivery does not mean paying nothing now. You pay the delivery charge and the cash on delivery fee online when you order, and the rider collects the item total when it arrives.",
                "Checkout shows both figures separately before you confirm, so there is no surprise at the door.",
            ],
        },
        {
            heading: "Can I order without an account?",
            body: [
                "Yes. Guest checkout needs only a name, phone number, email and address.",
                "You can look your order up any time with the order number and the phone number you used. An account simply saves you retyping the address.",
            ],
        },
        {
            heading: "Which payment methods work?",
            body: [
                "Cash on delivery, or pay in full online. Paying online opens our payment partner, where bKash, Nagad, cards and bank transfer are all available.",
            ],
        },
        {
            heading: "Do you deliver outside Bangladesh?",
            body: ["Not yet. Delivery is nationwide within Bangladesh only."],
        },
        {
            heading: "Why has my review not appeared?",
            body: [
                "Reviews are read by a person before they go live, which usually takes a day or two. Yours is saved either way, and you can see it under Reviews in your account with its current status.",
            ],
        },
    ],
    footnote: "Prices include VAT where it applies. Delivery charges are shown separately at checkout.",
};

export const SHIPPING_PAGE = {
    slug: "shipping",
    eyebrow: "Getting it to you",
    title: "Shipping and delivery",
    intro: "How we get your order to your door, what it costs, and how long it takes.",
    sections: [
        {
            heading: "Delivery areas and methods",
            body: [
                "Where your order is going decides how it can travel. Inside Dhaka and the Dhaka suburbs we deliver to your door. Outside Dhaka you can choose home delivery or collection from a courier branch.",
                "Courier collection is not offered inside Dhaka, because home delivery is faster there.",
            ],
        },
        {
            heading: "What delivery costs",
            body: [
                "One flat charge per order, set by your delivery zone and method. It does not multiply with the number of items, so a heavier basket does not cost more to send.",
                "Spend above the free delivery threshold and it is waived. The bar in your bag shows how close you are.",
            ],
        },
        {
            heading: "How long it takes",
            list: [
                "Inside Dhaka: one to two working days",
                "Dhaka suburbs: one to three working days",
                "Outside Dhaka by courier: two to four working days",
                "Outside Dhaka, home delivery: three to five working days",
            ],
            body: [
                "Orders placed after 5pm are picked the next working day. Fridays and public holidays are not counted.",
            ],
        },
        {
            heading: "Following your order",
            body: [
                "Every order gets a number beginning ORD. Enter it with the phone number you ordered with to see exactly where it has reached, without signing in.",
            ],
        },
        {
            heading: "If nobody is home",
            body: [
                "The rider calls the number on the order before arriving. If they cannot reach you they try again the next working day. After two failed attempts the order comes back to us and we contact you to rearrange.",
            ],
        },
    ],
};

export const RETURNS_PAGE = {
    slug: "returns",
    eyebrow: "If it is not right",
    title: "Returns and refunds",
    intro: "What can come back, how long you have, and how the money reaches you.",
    sections: [
        {
            heading: "Your return window",
            body: [
                "Seven days from delivery to tell us something is wrong. Get in touch with your order number and a photograph, and we will arrange collection or a replacement.",
            ],
        },
        {
            heading: "What we take back",
            list: [
                "Anything that arrived damaged, faulty or leaking",
                "The wrong item, or the wrong variant of the right item",
                "Unopened stationery still in its original packaging",
            ],
        },
        {
            heading: "What we cannot take back",
            body: [
                "Some things cannot be resold once opened, and taking them back would mean selling used goods to somebody else.",
            ],
            list: [
                "Opened ink bottles and cartridges",
                "Pens and nibs that have been inked or written with, unless faulty",
                "Notebooks that have been written in",
                "Anything personalised or engraved to order",
            ],
        },
        {
            heading: "How a refund reaches you",
            body: [
                "Paid online: back to the same account, usually within five to seven working days once we have the item.",
                "Cash on delivery: we refund the amount you paid online, and arrange the cash portion with you directly.",
            ],
        },
        {
            heading: "Who pays return delivery",
            body: [
                "If the fault is ours, we do. If you simply changed your mind, return delivery is yours to cover.",
            ],
        },
    ],
    footnote: "Nothing here affects your rights under Bangladeshi consumer law.",
};

export const PRIVACY_PAGE = {
    slug: "privacy",
    eyebrow: "Your information",
    title: "Privacy policy",
    intro: "What we collect, why we need it, and what we never do with it.",
    sections: [
        {
            heading: "What we collect",
            list: [
                "Your name, phone number, email and delivery address, so an order can reach you",
                "What you ordered and when, so we can answer questions about it later",
                "Your account email and a hashed password, if you create an account",
                "Basic technical information your browser sends with every request",
            ],
            body: [
                "We never see or store your card details. Payments are handled entirely by our payment partner on their own pages.",
            ],
        },
        {
            heading: "Why we hold it",
            body: [
                "To deliver what you bought, to let you look an order up afterwards, and to answer you when you get in touch. Nothing else.",
            ],
        },
        {
            heading: "Who else sees it",
            list: [
                "The courier, who needs your name, address and phone to deliver",
                "Our payment partner, who needs enough to process a payment",
                "Nobody else. We do not sell or rent your information, ever.",
            ],
        },
        {
            heading: "Marketing",
            body: [
                "We only email you about offers if you asked us to. You can change that at any time under Profile in your account, and every marketing email has an unsubscribe link.",
                "Order confirmations and delivery updates are not marketing and are always sent.",
            ],
        },
        {
            heading: "Your choices",
            list: [
                "Ask for a copy of what we hold about you",
                "Correct anything that is wrong, from your account",
                "Ask us to delete your account and its data",
            ],
            body: [
                "Order records are kept for as long as accounting rules require, even after an account is closed.",
            ],
        },
    ],
    footnote: "Questions about your data can go to hello@elmate.com.bd and a person will answer.",
};

export const TERMS_PAGE = {
    slug: "terms",
    eyebrow: "The agreement",
    title: "Terms of service",
    intro: "The rules that apply when you buy from us.",
    sections: [
        {
            heading: "Ordering",
            body: [
                "Placing an order is an offer to buy. The order is confirmed once payment is verified and we have the stock, and we will tell you if anything is unavailable.",
                "We may cancel an order and refund you in full if an item is out of stock or the price shown was clearly wrong.",
            ],
        },
        {
            heading: "Prices",
            body: [
                "All prices are in Bangladeshi taka. The price charged is the one calculated at checkout for your address and payment method, and it is worked out on our servers, not in your browser.",
                "Delivery charges and any cash on delivery fee are shown separately before you confirm.",
            ],
        },
        {
            heading: "Your account",
            body: [
                "Keep your password to yourself. You are responsible for what happens under your account, so tell us straight away if you think somebody else has access.",
                "We may suspend an account used for fraud or abuse.",
            ],
        },
        {
            heading: "Reviews you write",
            body: [
                "Reviews are checked before publication. We will not publish anything abusive, off topic, or written about a product you did not buy, and we may remove a review later for the same reasons.",
            ],
        },
        {
            heading: "Product information",
            body: [
                "We describe and photograph everything as accurately as we can. Colours vary between screens, and manufacturers occasionally change packaging without telling us.",
            ],
        },
        {
            heading: "Liability",
            body: [
                "Our responsibility for any order is limited to what you paid for it. Nothing here limits liability that cannot be limited by law.",
            ],
        },
    ],
    footnote: "These terms are governed by the laws of Bangladesh.",
};

export const INFO_PAGES = {
    faq: FAQ_PAGE,
    shipping: SHIPPING_PAGE,
    returns: RETURNS_PAGE,
    privacy: PRIVACY_PAGE,
    terms: TERMS_PAGE,
};
