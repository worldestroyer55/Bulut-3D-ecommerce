# PrintShop — E-Commerce Web Site

<p align="center">
  <a href="https://bulut3dbaski.com/">
    <img src="https://img.shields.io/badge/%F0%9F%9B%92%20Visit%20the%20live%20store-bulut3dbaski.com-8b5cf6?style=for-the-badge" alt="Visit the live store">
  </a>
</p>

<h3 align="center">🌐 Live: <a href="https://bulut3dbaski.com/">https://bulut3dbaski.com/</a></h3>

An online e-commerce web site for custom 3D-printed products (figures, home decor, lithophane lamps, accessories and seasonal gifts). Visitors browse products with material / size / color variants, place orders, and can upload their own 3D model to request a custom quote. Admins manage products, orders, customers and custom requests from a single panel.

## Features

**Storefront**
- Featured products, category-based catalog and search
- Product detail page: multiple images/video, variant selection (material, size, color), price-delta calculation, reviews
- Cart and wishlist (as slide-in sidebars)
- Multi-step checkout: address, shipping, coupon/discount code, credit card / bank transfer / cash on delivery
- Checkout as guest or signed-in user; members get an automatic 10% discount coupon
- Order tracking (look up status by order number)
- Custom order form: file upload + description to request a quote
- Seasonal showcases (Christmas, coffee-themed sliders) and a WhatsApp contact button

**User account**
- Supabase Auth with email/password and Google sign-in
- Profile page: order history, addresses, coupons, notification preferences

**Admin panel** (`/admin`)
- Add/edit/delete products, stock and cost tracking, profit calculation
- Order management (status updates, shipping/tracking info)
- Customer list and custom request (quote) management

## Tech stack

| Area | Used |
|------|------|
| UI | React 18, TypeScript |
| Build | Vite 5 |
| Styling | Tailwind CSS |
| Icons | lucide-react |
| Routing | react-router-dom |
| Backend / Database / Auth | Supabase |

## Getting started

**Requirements:** Node.js 18+ and a Supabase project.

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env.local` file in the project root with your Supabase credentials:
   ```bash
   VITE_SUPABASE_URL=https://xxxxxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
   ```
   > `.env.local` is listed in `.gitignore`, so it is never committed.

3. Start the dev server:
   ```bash
   npm run dev
   ```
   The site opens at `http://localhost:5173`. (On Windows, `run_app.bat` does the same.)

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server (with HMR) |
| `npm run build` | TypeScript type-check + production build (`dist/`) |
| `npm run preview` | Preview the production build locally |

## Supabase schema

The app reads from / writes to the following tables:

- `products` — product catalog (`base_price`, `images`, `available_materials`, `available_colors`, `video_url`, `stock`, `created_at`, etc.)
- `orders` — orders and their status
- `custom_requests` — custom print quote requests
- `profiles` — user profile data

The `products` table flexibly maps both `camelCase` and `snake_case` column names (see `fetchData` in `App.tsx`).

## Admin access

Admin access is granted when the signed-in user's email matches the `adminEmail` constant in `contexts/AuthContext.tsx`. Update this value for your own admin account.

## Project structure

```
├── App.tsx              # Main app, view state and Supabase data flow
├── index.tsx            # React entry point
├── types.ts             # Domain models (Product, Order, CartItem, ...)
├── data.ts              # Sample / seed product data
├── lib/
│   └── supabase.ts      # Supabase client
├── contexts/
│   └── AuthContext.tsx  # Authentication and admin check
├── components/          # Navbar, cart/wishlist sidebars, product card, sliders, modals
└── pages/               # Home, Catalog, ProductDetail, Checkout, OrderTracking,
                         # CustomOrder, Profile, AdminPanel
```

## License

Not specified. Contact the project owner for usage terms.
