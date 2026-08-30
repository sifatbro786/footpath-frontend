# Footpath frontend — working context

Elmate Stationery storefront + admin dashboard. React 19, Vite, Tailwind v4,
React Router 7, TanStack Query. API lives in the sibling repo
`footpath-backend`, which has its own CLAUDE.md worth reading alongside this.

This file loads automatically at the start of a session, so the next session does
not have to rediscover what took a long time to find.

---

## Run it

```bash
npm install
npm run dev
npm test         # vitest, 32 tests
npm run build
npm run lint     # 0 errors expected; ~9 pre-existing warnings
```

`VITE_API_URL` in `.env` points at the backend. Vitest is configured with
`pool: "forks"` + `singleFork: true` because Windows worker spawning otherwise
trips the 60s startup timeout.

---

## Two surfaces, two visual languages. Do not mix them.

**Storefront** (`components/store/`, `pages/store/`, `pages/account/`) is a
warm, tactile, editorial stationery aesthetic. Rules, agreed with the owner and
enforced consistently:

- Warm paper backgrounds (`bg-paper`), crisp 1px borders, minimal radius
  (`rounded-[2px]` or none). No blurred drop shadows, no glassmorphism.
- No centred pill eyebrows. Use `<Eyebrow>`: a short marigold rule then small
  letter-spaced caps, left aligned.
- **No dashes in UI copy.** Not in headings, labels or body text. Write around
  them. (Code comments are exempt.)
- Design tokens are in `src/index.css` under `@theme`: `paper`, `paper-dim`,
  `ink`, `ink-soft`, `muted`, `line`, `brand`, `marigold`, `coral`, `grass`.
  Fonts: `font-display`, `font-sans`, `font-label`.

**Admin** (`components/admin/`, `pages/admin/`) is a conventional grey dashboard:
`rounded-lg border border-gray-200 bg-white`, Tailwind greys. It predates the
storefront work and uses `useState`/`useEffect` with direct axios rather than
TanStack Query. Match whichever surface you are editing.

---

## Layout of the source

```
api/            one module per backend area; response shapes documented inline
components/
  common/       ErrorBoundary, ScrollToTop, Seo, Skeleton
  store/        storefront: layout, home, catalog, product, cart, checkout, order, ui
  admin/        admin widgets and modals
hooks/store/    useStorefront, useCatalog, useProductDetail, useCheckout, useAccount
lib/store/      productMapper, productDetail, variants, categoryTree, orderAccess
lib/admin/      exportCsv
context/        AuthContext, CartContext
layouts/        StoreLayout, AuthLayout, AccountLayout, admin/AdminLayout
pages/          store/, account/, admin/, client/ (auth pages)
tests/          variants.test.js, cartMerge.test.js, home.test.jsx
```

---

## Traps. Read before touching these areas.

### 1. Variant identity is the options array

Backend variants are `{ _id: false }`, so a variant is identified only by its
`options: [{name, value}]`. `lib/store/variants.js` turns that into a stable key
(sorted by name, trimmed, lowercased). Cart lines use
`variantCartKey(productId, options)`.

This is the same rule the backend uses to decrement stock, and a mismatch there
fails **silently**. `tests/variants.test.js` pins the behaviour; run it after any
change in that file.

### 2. The cart is genuinely dual-mode

- **Guest**: localStorage (`elmate.cart.v1`), sent as `guestItems` at checkout.
- **Signed in**: server `/api/cart`; `createOrder` reads the server cart and
  ignores body items.

On login, `POST /api/cart/merge` merges the local basket server side and only
then clears localStorage. `CartContext` handles the handoff. Do not "simplify"
this to one mode; the backend forces it (`Cart.user` is required + unique).

### 3. Never compute money on the client

Every figure at checkout comes from `POST /api/checkout/calculate`, which runs
the same `pricingService` the order will run. The cart page and drawer show
**subtotal only** and say delivery is calculated at checkout, because shipping,
COD fee and tax all depend on a destination that does not exist yet.

There is deliberately no shipping selector on `/cart`: a simplified
"Inside/Outside Dhaka" toggle would be a second, wrong pricing model whose number
changes at checkout.

### 4. URL is the source of truth for catalogue state

`useCatalogParams` reads and writes filters, sort and page through the query
string. Facets serialise as `attr.Colour=Blue,Black`. Any filter change resets to
page 1; paging does not. Do not mirror this into component state.

### 5. Guest order tokens

`lib/store/orderAccess.js`. The capability token arrives twice and never again:
in the `createOrder` response, and appended to the gateway's `/order/success`
redirect. It is persisted by order number so a refresh does not lose the order.
Store it **before** redirecting to the gateway.

### 6. React 19 hoists metadata

`<title>`, `<meta>`, `<link rel="canonical">` and `<script type="application/ld+json">`
hoist to `<head>` from anywhere in the tree. That is why there is no helmet
dependency. See `components/common/Seo.jsx`.

### 7. A+ content is sanitised HTML

`AplusContent.sections[].content` is admin-authored raw HTML rendered to every
shopper. It goes through DOMPurify in
`components/store/product/AplusContent.jsx`. That is the only place in the app
that renders server-supplied HTML; keep it that way.

### 8. Backend response envelopes are inconsistent

`/api/hero` returns a bare object, `/api/admin/hero-content` a bare array, and
the rest vary between `data`, `products` and `sections`. The unwrapping lives in
the hooks so it does not leak into JSX. `tests/home.test.jsx` pins the shapes; if
someone "tidies" an unwrapping, that test fails instead of the homepage silently
rendering nothing.

### 9. Admin nav drives admin routing

`layouts/admin/adminNavConfig.js` generates placeholder routes for any entry
without `built: true`. Every entry is currently built, so the placeholder matches
nothing. Adding a nav item without a route brings the placeholder back.

---

## Known open issues

- Main bundle is ~626 kB (205 kB gzip). Admin and auth are already lazy; the
  remaining weight is react-dom, router, framer-motion, swiper, axios and
  react-query. Splitting swiper and framer-motion is Phase 10 work.
- Static, no backend source: `PopularBrands` (no Brand model),
  `AnnouncementBar` (no endpoint), `TrustStrip` (copy, correctly static).
- `PromoBanner` gets imagery from `/api/hero` but its copy is hardcoded, because
  that endpoint discards title/subtitle/buttonLink server side.
- Hero slide CTAs always link to `/shop`: `HeroItem` has no `buttonLink` field.
- Saved addresses cannot prefill checkout. `User.shippingAddress` uses
  city/state/zipCode; `Order.shippingAddress` uses district/upazila. Different
  schemas, designed separately. Unifying them is a backend change.
- ~9 ESLint warnings, all "unused eslint-disable directive" in files that predate
  this work. `--fix` clears them.
- No bulk order status change in admin: `updateOrderStatus` moves inventory, so
  N non-transactional writes across mixed statuses is unsafe without a
  transactional bulk endpoint. CSV export is done.

---

## Status

Phases 0 through 9 are done: security patches, storefront foundation, homepage
wiring, catalogue, product detail, cart, checkout and payment, post-purchase and
account, admin gaps.

Remaining is **Phase 10 (hardening)** and **Phase 11 (launch)**. Full per-phase
task lists are in the roadmap artifact on claude.ai and in
`FOOTPATH_PROJECT_AUDIT.html` in the backend repo.
