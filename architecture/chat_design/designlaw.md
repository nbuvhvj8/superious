## What Claude, GPT, and Gemini all share — the 6 laws

**1. The input is a card, not a bare textarea.** All three wrap their textarea in a container element with a border, rounded corners (`border-radius: 16–28px`), and a subtle shadow or border that lights up on focus. You never click into a raw input field — you click into a surface. That's what makes it feel premium. Your `input-card` with the `focused` border-color change replicates this exactly.

**2. The send button lives inside the card, bottom-right, and it's contextual.** Empty → disabled/grey. Has text → active/colored. Generating → stop button (square icon). This state machine is the single most important micro-interaction. When generating, GPT and Claude swap the arrow-up for a stop square. Your implementation does this with `ready / empty / stop` classes.

**3. The toolbar row sits below the textarea, not above it.** Attach, Search/web toggle, voice, deep think — all live in a second row at the bottom of the input card. Claude has this. GPT has this. Gemini has this. They differ only in which tools they expose. For Superious, `Attach / Search / Screenshot / Deep` maps perfectly to your actual features.

**4. Auto-growing textarea, never a fixed-height input.** The textarea expands line by line up to a cap (~4–6 lines) then gets a scrollbar. This is achieved with `height: auto` → `scrollHeight` measurement on every `oninput` event, with a `max-height` clamp.

**5. The empty state is a product moment.** All three show the logo, a greeting, and 4 suggestion cards when there are no messages. This isn't filler — it's the first UX impression. Keep the suggestions tied to your actual product (research topics, not generic things).

**6. Message actions appear on hover, not always.** Copy, Regenerate, thumbs up/down — these float in below each AI bubble only on `:hover`. Showing them always creates noise. This is identical across all three products.

---

## Colors mapped to your palette

| Element | Value |
|---|---|
| Input card bg | `#FFFFFF` (card) |
| Input card border default | `#E0E0E0` |
| Input card border focused | `#C5D0A8` (olive-light) + `rgba(138,154,107,0.12)` ring |
| Send button active | `#8A9A6B` (primary) |
| User bubble | `#8A9A6B` (primary) with white text |
| AI bubble | `#FFFFFF` with `1px solid #E0E0E0` |
| Tool button active state | `rgba(138,154,107,0.12)` + `#6B7A52` text |
| Thinking dots | `#9A9A9A` |
| Page background | `#F7F3EA` (your existing `--background`) |

The full production-ready component code is in the widget above — you can drop `handleInput`, `handleSend`, the textarea styles, and the toolbar HTML directly into your `src/app/chat/page.tsx` as a `'use client'` component.