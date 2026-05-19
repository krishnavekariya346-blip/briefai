# Free AI setup (no paid OpenAI)

BriefAI supports **free** AI providers only. You do **not** need OpenAI or a credit card.

---

## Option 1 — No API key (fastest)

In `server/.env`:

```env
AI_PROVIDER=mock
```

Restart server. **Generate proposal** uses a smart template (good for UI testing).

---

## Option 2 — Google Gemini (free key, better AI)

1. Open **[https://aistudio.google.com/apikey](https://aistudio.google.com/apikey)**
2. Sign in with Google → **Create API key** (free tier, no card required for most users)
3. In `server/.env`:

```env
AI_PROVIDER=gemini
GEMINI_API_KEY=your_key_here
```

4. Restart: `npm run dev`

---

## Option 3 — Groq (free key, fast)

1. Open **[https://console.groq.com](https://console.groq.com)** → sign up
2. **API Keys** → Create key (free tier)
3. In `server/.env`:

```env
AI_PROVIDER=groq
GROQ_API_KEY=your_key_here
```

4. Restart server

---

## Stripe (optional)

Leave Stripe empty in `.env` if you don't want billing:

- Register, briefs, proposals, public links, PDF — **still work**
- **Upgrade to Pro** and payment links — disabled until you add Stripe **test** keys (test mode = no real money)

---

## What NOT to use

| Service | Why |
|---------|-----|
| OpenAI API | Paid after trial |
| ChatGPT Plus | Does not power this app |
