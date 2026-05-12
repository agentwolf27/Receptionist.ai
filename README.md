# Receptionist.ai — AI Receptionist for Local Businesses

A production-shaped MVP of an AI back-office / AI receptionist SaaS for small businesses.
Owners create an account, set up their business profile (services, FAQs, hours), and
get a working AI receptionist that answers questions, books appointments, sends mock
confirmations, and surfaces analytics — all without a single paid API.

Real Twilio / Vapi / OpenAI / Google Calendar integrations are designed in as clean
adapters so you can swap them in with one file change.

## Highlights

- Next.js 15 (App Router) + TypeScript + Tailwind v4 + custom shadcn-style UI primitives
- Prisma + SQLite for local dev, schema-ready for Postgres / Supabase
- Server actions for all CRUD, route handlers for the AI chat API
- Session-based auth with a Supabase-shaped `auth` object (same method names, easy swap)
- Mock provider adapters for LLM, SMS, Email, Voice, and Calendar — each is a single file you
  replace when you bring real APIs
- Full AI receptionist flow: intent detection, slot filling, availability check,
  booking creation, transcript persistence, escalation handling
- Booking management: per-row complete / cancel / reschedule (validated against
  business hours), with upcoming / past / cancelled filter tabs
- Conversation inbox: filter by status (open / resolved / escalated / has booking)
  plus a search box over caller name and message content; the AI auto-fills
  caller name / phone / email on the conversation row as it collects them
- Confirmations auto-route to SMS / Email / both based on what the caller provided,
  and the channel used is shown on the bookings page
- Dashboard 7/30/90-day filter with a hand-rolled SVG bookings chart
- Mobile-polished simulator with a collapsible system-prompt preview
- Onboarding wizard ends with a `/app/welcome` "you're ready" screen; the dashboard
  shows a finish-setup banner until that screen has been seen once
- Live system-prompt preview + reset-to-auto on the AI settings page
- Sample seed data (demo dental practice) — log in and click through everything in 30 seconds

---

## Quick start

```bash
# 1) install
npm install

# 2) generate Prisma client + create the SQLite DB
npm run db:generate
npm run db:migrate         # creates dev.db

# 3) load demo data (recommended)
npm run db:seed

# 4) run the app
npm run dev
```

Open <http://localhost:3000>.

**Demo login** (from the seed):

- email: `demo@receptionist.ai`
- password: `demo1234`

> No paid API keys are required. Everything runs locally with the bundled mock providers.

---

## Project layout

```
src/
  app/
    page.tsx                      # marketing landing page
    (auth)/
      login/                      # /login
      signup/                     # /signup
      actions.ts                  # signup / login / logout server actions
    app/
      layout.tsx                  # dashboard shell (sidebar + auth guard)
      page.tsx                    # dashboard metrics
      business/                   # business profile setup
      services/                   # services + appointment types
      faqs/                       # FAQ CRUD
      hours/                      # weekly hours editor
      conversations/              # transcript list + detail
      bookings/                   # bookings list
      simulator/                  # AI chat simulator
      settings/                   # AI prompt / model / escalation rules
      actions.ts                  # all dashboard server actions
    api/
      simulate/route.ts           # POST endpoint the simulator calls
  components/ui/                  # Button, Card, Input, Tabs, etc.
  lib/
    auth/                         # session + Supabase-shaped auth client
    ai/
      system-prompt.ts            # builds the receptionist system prompt
      receptionist.ts             # chat loop, booking flow orchestration
    data/business.ts              # tenant-scoped DB helpers
    providers/                    # swap these out for real APIs
      llm/
        mockLLMProvider.ts        # intent detection + slot filling
        index.ts                  # factory (swap point)
      sms/
        mockSMSProvider.ts        # logs to console
        index.ts
      voice/
        mockVoiceProvider.ts      # in-memory transcripts
        index.ts
      calendar/
        mockCalendarProvider.ts   # honors business hours, dedupes overlaps
        index.ts
      types.ts                    # shared contracts
prisma/
  schema.prisma                   # User, Business, BusinessHour, Service,
                                  # AppointmentType, FAQ, Conversation, Message,
                                  # Booking, AIConfig
  seed.ts                         # demo dataset
```

---

## The AI receptionist flow

1. User sends a message in `/app/simulator` (or via `POST /api/simulate`).
2. `chatTurn()` in `src/lib/ai/receptionist.ts` loads the business and its full context
   (services, FAQs, hours, AI config) and the conversation history.
3. `buildSystemPrompt()` produces a deterministic, parseable system prompt from the
   business data. (Operators can override it in **AI settings**.)
4. The LLM provider responds with `{ reply, intent, bookingDraft? }`.
5. If `intent === "book_appointment"` and all required slots are filled, the calendar
   provider is asked for availability, a `Booking` row is created, the calendar adapter
   creates an event, and the SMS adapter sends a confirmation.
6. The full transcript and any booking are persisted under the conversation.
7. If `intent === "escalate"` (or the AI is unsure), the conversation is flagged for
   the operator.

The mock LLM is deliberately small: it parses the system prompt for `Services:` / `FAQs:`
/ `Hours:` sections, runs simple keyword + similarity routing for intent, and tracks a
booking draft via slot filling. That keeps the demo realistic without an API key, and
lets you watch real bookings appear in `/app/bookings` and `/app/conversations`.

---

## Replacing the mocks with real APIs

Every adapter lives behind a `getXProvider()` factory. Drop a real implementation next
to the mock and edit the factory.

### LLM (OpenAI / Anthropic / Vertex)

`src/lib/providers/llm/index.ts`:

```ts
import { OpenAIProvider } from "./openaiProvider";
import { mockLLMProvider } from "./mockLLMProvider";

export function getLLMProvider(): LLMProvider {
  if (process.env.OPENAI_API_KEY) return new OpenAIProvider();
  return mockLLMProvider;
}
```

Your real `OpenAIProvider` should implement the `LLMProvider` interface from
`src/lib/providers/types.ts`. Use the `systemPrompt` and `messages` as-is, and return
`{ reply, intent, bookingDraft }`. The cleanest approach is to ask the model to emit
JSON with those fields (Responses API / structured outputs / tool calling all work).

### SMS (Twilio)

`src/lib/providers/sms/index.ts`:

```ts
if (process.env.TWILIO_ACCOUNT_SID) return new TwilioSMSProvider();
```

Implement `send({ to, from, body })` against
`https://api.twilio.com/2010-04-01/Accounts/{sid}/Messages.json`.

### Voice (Vapi / Twilio Voice / Bland)

`src/lib/providers/voice/index.ts`:

```ts
if (process.env.VAPI_API_KEY) return new VapiVoiceProvider();
```

Wire the Vapi webhook to the `/api/simulate` route or a dedicated `/api/voice` handler;
the chat-turn loop in `receptionist.ts` is provider-agnostic.

### Calendar (Google / Microsoft Graph)

`src/lib/providers/calendar/index.ts`:

```ts
if (process.env.GOOGLE_CALENDAR_CLIENT_ID) return new GoogleCalendarProvider();
```

`findAvailability()` and `createEvent()` are the only methods the rest of the app uses.

### Database (Supabase / Postgres)

1. Update `prisma/schema.prisma`:

   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

2. Set `DATABASE_URL` to your Supabase connection string.
3. `npx prisma migrate deploy`.

### Auth (Supabase Auth)

The `auth` client in `src/lib/auth/auth.ts` has the same shape as `supabase.auth`
(`signUp`, `signInWithPassword`, `signOut`, `getUser`). To switch:

```ts
import { createServerClient } from "@supabase/ssr";

export const auth = {
  async signUp({ email, password, name }) {
    const supabase = createServerClient(/* ... */);
    const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { name } } });
    return { user: data.user, error: error?.message ?? null };
  },
  // ...
};
```

The rest of the app (server actions, layouts) calls only `auth.getUser()` and the four
sign-in/up/out methods, so no UI changes are needed.

---

## Environment variables

See `.env.example`. Required for local dev:

- `DATABASE_URL` — defaults to `file:./dev.db`
- `SESSION_SECRET` — any long random string

Everything else is optional and only consumed when the corresponding real provider is
swapped in.

---

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Next.js dev server |
| `npm run build` | Production build (typecheck + lint) |
| `npm run start` | Run the production build |
| `npm run lint` | ESLint |
| `npm run db:generate` | Regenerate Prisma client |
| `npm run db:migrate` | Run pending migrations against `DATABASE_URL` |
| `npm run db:reset` | Drop, re-create, and re-seed the DB |
| `npm run db:seed` | Insert demo dataset |
| `npm run db:studio` | Open Prisma Studio |

---

## Roadmap from MVP

- Real provider integrations (OpenAI Responses, Twilio Messaging, Vapi, Google Calendar)
- Multi-tenant team members & role-based access
- Conversation tagging + automated summaries
- Webhook ingress for inbound voice (Vapi → `/api/voice`)
- Billing surface (Stripe) + per-conversation cost reporting
- Production deploy guides (Vercel + Supabase, Fly + Postgres)

---

## License

MIT — do whatever you want with this. PRs welcome.
