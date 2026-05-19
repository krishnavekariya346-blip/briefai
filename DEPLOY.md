# Deploy BriefAI (Vercel + Render + Atlas)

## Prerequisites

- [MongoDB Atlas](https://www.mongodb.com/atlas) cluster
- [OpenAI API key](https://platform.openai.com/api-keys)
- [Stripe](https://dashboard.stripe.com) test or live keys
- GitHub repo pushed from `D:\briefai`

---

## 1. MongoDB Atlas

1. Create cluster → **Connect** → Drivers → copy URI
2. Replace `<password>` and set database name `briefai`

---

## 2. Deploy API (Render)

1. [render.com](https://render.com) → **New +** → **Blueprint**
2. Connect GitHub repo → use `render.yaml` in repo root  
   **Or** manual Web Service:
   - Root directory: `server`
   - Build: `npm install && npm run build`
   - Start: `npm start`
3. Environment variables:

| Key | Value |
|-----|--------|
| `NODE_ENV` | `production` |
| `MONGODB_URI` | Atlas connection string |
| `JWT_SECRET` | long random string |
| `CLIENT_URL` | `https://YOUR-APP.vercel.app` (add after Vercel) |
| `OPENAI_API_KEY` | `sk-...` |
| `STRIPE_SECRET_KEY` | `sk_test_...` or live |
| `STRIPE_PRICE_ID_PRO` | `price_...` |
| `STRIPE_WEBHOOK_SECRET` | from step 4 |
| `FREE_PROPOSAL_LIMIT` | `3` |

4. Note API URL: `https://briefai-api.onrender.com`

---

## 3. Deploy frontend (Vercel)

1. [vercel.com](https://vercel.com) → **Add New Project** → import GitHub repo
2. Settings:
   - **Root Directory:** `client`
   - **Framework:** Vite
   - **Build:** `npm run build`
   - **Output:** `dist`
3. Environment variable:

| Key | Value |
|-----|--------|
| `VITE_API_URL` | `https://YOUR-API.onrender.com/api` |

4. Deploy → copy URL → update Render `CLIENT_URL` to this URL

---

## 4. Stripe webhook (production)

1. Stripe Dashboard → **Developers → Webhooks → Add endpoint**
2. URL: `https://YOUR-API.onrender.com/api/webhooks/stripe`
3. Events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. Copy signing secret → Render `STRIPE_WEBHOOK_SECRET`

---

## 5. Verify live app

1. Open Vercel URL → register
2. Create brief → generate proposal
3. Settings → Upgrade (Stripe test card `4242 4242 4242 4242`)
4. Publish with payment link

---

## 6. GitHub (first push)

```powershell
cd D:\briefai
git init
git add .
git commit -m "BriefAI TypeScript MERN SaaS"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/briefai.git
git push -u origin main
```

Do not commit `.env` files.
