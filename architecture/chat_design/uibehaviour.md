# Chat UI — Behaviour, Alignment & State Specification
## PR · Design System Document

> **Scope**: Defines every visual state, alignment rule, interaction behaviour,
> and transition for the Superious chat interface. This document is the single
> source of truth for implementing `src/app/chat/page.tsx` and its child
> components. Any deviation from this spec requires a PR comment to this document.

---

## 1. Layout Architecture

The chat page is a full-height flex column split into three fixed zones. Nothing
scrolls except the messages area. The input zone is always anchored at the bottom.

```
┌─────────────────────────────────────────────┐  ← h-screen, flex col
│                  TOP BAR                    │  ← flex-shrink-0, 56px
├─────────────────────────────────────────────┤
│                                             │
│             MESSAGES AREA                   │  ← flex-1, overflow-y-auto
│                                             │
├─────────────────────────────────────────────┤
│              INPUT ZONE                     │  ← flex-shrink-0, auto height
└─────────────────────────────────────────────┘
```

The three zones never overlap. The messages area fills all remaining vertical
space between them. On mobile (< 640px), top bar padding reduces to 12px
horizontal and the input card border-radius reduces from 24px to 16px.

---

## 2. Top Bar

### 2.1 Structure & Alignment

```
┌──────────────────────────────────────────────────┐
│ [edit icon + "New research"]  [model pill ▾]      │  LEFT group
│                                    [⤴] [⏱] [···] │  RIGHT group
└──────────────────────────────────────────────────┘
```

The top bar is a single flex row with `justify-content: space-between`. Left
group and right group are both inner flex rows with `align-items: center`.

**Left group** contains two elements in a row:
- A ghost label — edit icon + "New research" text — functions as the new chat
  trigger. Icon is 15px, text is 12px semibold in `--primary` colour. Gap: 4px.
- The model pill — a bordered chip showing a coloured dot + model name +
  chevron-down. Clicking it cycles through available models. Height: 30px,
  border-radius: 999px (fully rounded). Left padding: 8px, right: 12px,
  internal gap: 6px between dot and text.

**Right group** contains three icon-only buttons (32×32px, border-radius: 8px).
Icons: share, history, dots (more options). No labels. All same size and spacing.

### 2.2 Model Pill Colour States

| Model | Dot Colour |
|-------|-----------|
| claude-sonnet | `#8A9A6B` (olive) |
| claude-haiku | `#7BAFC7` (sky blue) |
| gemini-flash | `#9B8EC4` (soft purple) |
| gpt-4o | `#74B07A` (mint green) |

The dot never changes size — only its `background` colour changes. The pill text updates to reflect the selected model name. Transition: `background 0.15s`.

---

## 3. Messages Area

### 3.1 The Two Primary States

The messages area has exactly two visual states: **Empty** and **Active**. These
are mutually exclusive — the empty state is removed from the DOM the moment
the first message is added, and it never returns in the same session.

---

### State A — Empty

Rendered when no messages exist in the current session. The entire messages area
becomes a centred flex column.

```
        ┌───────────────────────────────────┐
        │                                   │
        │            ┌──────┐               │
        │            │  o   │  ← logo box   │
        │            └──────┘               │
        │                                   │
        │    What are you researching       │
        │           today?                  │  ← 20px bold title
        │                                   │
        │  I'll search the web, capture     │
        │  sources and write a structured   │
        │  video script.                    │  ← 13px muted subtitle
        │                                   │
        │  ┌──────────────┐ ┌────────────┐  │
        │  │ ⚡ Energy     │ │ 🧬 Science  │  │
        │  │ The history… │ │ How CRISPR… │  │
        │  └──────────────┘ └────────────┘  │
        │  ┌──────────────┐ ┌────────────┐  │
        │  │ 🏪 Business  │ │ ⚛ Physics  │  │
        │  │ Rise & fall… │ │ Nuclear fu… │  │
        │  └──────────────┘ └────────────┘  │
        │                                   │
        └───────────────────────────────────┘
```

**Logo box**: 52×52px, border-radius: 14px, background: `--primary` (`#8A9A6B`),
white italic "o" character at 22px bold. This is not an `<img>` — it is a
styled `<div>`. It sits centred above the title.

**Title**: 20px, font-weight 700, `--foreground` colour, letter-spacing: -0.4px,
text-align: center. Max-width: none.

**Subtitle**: 13px, `--muted-foreground`, text-align: center, max-width: 360px,
line-height: 1.6. Centred with `margin: 0 auto`.

**Suggestion grid**: 2×2 grid, `gap: 8px`, total width: 100%, max-width: 500px,
centred. Each card: white background, 1px solid `--border`, border-radius: 10px,
padding: 12px 14px. On hover: border-color shifts to `#C5D0A8` (olive-light) and
background shifts to `#FDFCF8`.

Each card has two children:
- **Category label**: 12px semibold, `--primary-dark` (`#6B7A52`), flex row with
  a Tabler icon at 13px and a short category word. Margin-bottom: 3px.
- **Topic text**: 12.5px, `--muted-foreground`, line-height: 1.5. This is the
  actual suggestion the user can click.

Clicking a suggestion card populates the textarea with the topic text, focuses
the textarea, and updates the send button to its ready state. The empty state
remains visible until the user actually sends the message.

---

### State B — Active (Messages Present)

Once the first message is sent, the empty state element is removed from the DOM
and the messages area begins rendering message rows. Layout is a flex column with
`gap: 20px` and `padding: 24px 20px`.

#### 3.2 Message Row Alignment

Every message row is a flex row of `align-items: flex-start` with a 10px gap
between the avatar and the bubble. User messages reverse this row direction.

```
AI message row:
[avatar]  [bubble content      ]
          [hover actions below  ]

User message row:
          [bubble content      ]  [avatar]
```

**Avatar**: 30×30px circle. `margin-top: 2px` to optically align the top of
the avatar with the first line of text in the bubble (not the top of the bubble
padding). AI avatar: `--primary` background, white "o" character at 12px bold.
User avatar: `--secondary` (`#BFD7E2`) background, `--foreground` text, "U"
at 12px bold.

**Bubble**: `max-width: 78%` of the row width (not the page width). Padding:
11px top/bottom, 15px left/right. Font-size: 13.5px, line-height: 1.65.

- AI bubble: white background, 1px solid `--border`, border-radius: 16px on
  all corners except bottom-left which is 4px. This creates the speech-tail
  effect pointing toward the AI avatar on the left.
- User bubble: `--primary` (`#8A9A6B`) background, white text, border-radius:
  16px on all corners except bottom-right which is 4px. Speech-tail points
  toward the user avatar on the right.

```
AI bubble corner radii:
  TL: 16px  TR: 16px
  BL:  4px  BR: 16px   ← 4px = speech tail side

User bubble corner radii:
  TL: 16px  TR: 16px
  BL: 16px  BR:  4px   ← 4px = speech tail side
```

#### 3.3 Message Action Row (Hover State)

AI messages have an action row that sits below the bubble, left-aligned with
the bubble (offset by the avatar width + gap = 40px padding-left on the wrapper).
The action row is `opacity: 0` by default and transitions to `opacity: 1` on
`.msg-row:hover`. Transition: `opacity 0.15s`.

Action buttons are ghost-style: no border, transparent background, 12px icon +
11.5px label text, `--muted-foreground` colour. On hover: background becomes
`--input` (`#F0EBE0`), colour becomes `--muted-foreground` darker. Border-radius:
6px. Padding: 3px 7px. Gap between icon and label: 4px.

Standard action set (left to right):
1. **Copy** — `ti-copy` icon, "Copy" label. On click: calls
   `navigator.clipboard.writeText()`, replaces content with `ti-check` + "Copied!"
   in `--primary` colour for 1500ms, then reverts.
2. **Regenerate** — `ti-refresh` icon, "Regenerate" label.
3. **Thumbs up** — `ti-thumb-up` icon, no label.
4. **Thumbs down** — `ti-thumb-down` icon, no label.

User messages never show an action row.

---

## 4. Thinking / Generating Indicator

While the AI is generating, a thinking row is appended to the messages area
immediately after the user's bubble. It sits in an AI-style row (avatar left,
bubble right).

```
[avatar]  ○  ○  ○   Researching sources…
          ↑ dot pulse  ↑ italic label
```

**Bubble**: Same border-radius and background as an AI message bubble
(white, 1px border, bottom-left 4px). Padding: 13px 16px. Contains two elements
in a horizontal row with 6px gap:

- **Dot pulse**: three 6×6px circles, `--muted-foreground` background, with a
  staggered scale animation (`dp` keyframe: scale 0.7 + opacity 0.4 at 0%/80%/100%,
  scale 1 + opacity 1 at 40%). Delays: 0ms / 200ms / 400ms. Duration: 1.4s infinite.
- **Label**: 12px, italic, `--muted-foreground`. Text updates as the job
  progresses — "Researching sources…" → "Capturing screenshots…" → "Writing script…"

The thinking row is a React component mounted on send and unmounted when the
first token of the AI response arrives. It uses `fade-in` animation on mount
(opacity 0 → 1, translateY 8px → 0, 250ms ease).

---

## 5. Input Zone

The input zone is the most stateful part of the UI. It has its own visual
states that are independent of the messages area state.

### 5.1 Structure

```
┌── input-zone (padding: 10px 16px 14px) ──────────────────┐
│  ┌── input-card (border, border-radius: 24px) ──────────┐ │
│  │  ┌── textarea-row (padding: 12px 14px 4px) ─────┐   │ │
│  │  │  <textarea> auto-grow, min 44px, max 180px   │   │ │
│  │  └──────────────────────────────────────────────┘   │ │
│  │  ┌── toolbar (padding: 6px 10px 10px) ─────────────┐ │ │
│  │  │  [Attach][|][Search][Screenshot][Deep]  [N/1000][→]│ │
│  │  └─────────────────────────────────────────────────┘ │ │
│  └───────────────────────────────────────────────────────┘ │
│  "outlier can make mistakes…"  ← 11px centered disclaimer  │
└────────────────────────────────────────────────────────────┘
```

### 5.2 The Input Card — Visual States

The input card (`input-card`) has three visual states driven by focus and content:

#### State 1 — Resting (no focus, no content)

```
border: 1.5px solid #E0E0E0
box-shadow: none
background: #FFFFFF
```

The card sits quietly in the layout. No elevation, no colour. This is the
default render on every page load.

#### State 2 — Focused (user has clicked into or tabbed to the textarea)

```
border: 1.5px solid #C5D0A8      ← olive-light
box-shadow: 0 0 0 3px rgba(138, 154, 107, 0.12)
```

The card grows a soft olive halo. This is triggered by the textarea's `onfocus`
event adding `.focused` to the input card and removed on `onblur`. Transition on
both `border-color` and `box-shadow`: `0.2s ease`.

#### State 3 — Generating (AI is responding)

```
border: 1.5px solid #E0E0E0      ← back to default border
opacity on textarea: 0.6         ← input feels disabled
pointer-events: none             ← textarea is non-interactive
```

The textarea is visually dimmed and non-interactive while the AI generates.
The input card itself does not show the focused halo. The send button becomes
the stop button (see §5.4). The tool buttons remain interactive — the user can
still toggle Search or Deep mode.

---

### 5.3 The Textarea — Behaviour

The textarea is a standard `<textarea>` with all default browser chrome removed:

```css
background: transparent;
border: none;
outline: none;
resize: none;
```

**Auto-grow**: On every `oninput` event, the textarea's height is recalculated:

```javascript
textarea.style.height = 'auto';
textarea.style.height = Math.min(textarea.scrollHeight, 180) + 'px';
```

This creates smooth expansion as the user types. At 180px (approximately 6 lines),
a thin scrollbar appears inside the textarea. The input card grows with it — the
card has no fixed height.

**Enter key behaviour**: `Enter` alone sends the message (calls `handleSend()`).
`Shift + Enter` inserts a newline. This is enforced in `onkeydown`:

```javascript
if (e.key === 'Enter' && !e.shiftKey) {
  e.preventDefault();
  if (!isGenerating && textarea.value.trim()) handleSend();
}
```

**Max length**: 1000 characters enforced via the `maxlength` attribute. A
character counter appears in the toolbar when the user exceeds 800 characters.

---

### 5.4 The Send Button — State Machine

The send button has three states and one size: 34×34px, border-radius: 10px.

```
State         Class       Background    Icon              Cursor
──────────────────────────────────────────────────────────────────
Empty input   .empty      #E0E0E0      ti-arrow-up (grey)  default
Has input     .ready      #8A9A6B      ti-arrow-up (white) pointer
Generating    .stop       #1A1A1A      ti-square (white)   pointer
```

**Transitions between states:**

```
[user types first character]  →  empty  →  ready
[user clears textarea]        →  ready  →  empty
[user hits send]              →  ready  →  stop
[AI response completes]       →  stop   →  empty
```

The `.ready` state adds a hover effect: `opacity: 0.9` and `transform: scale(1.05)`.
Active press: `transform: scale(0.95)`. These micro-interactions make the button
feel physical and responsive.

The `.stop` state clicking triggers `handleStop()` which cancels the in-flight
request (aborts the `fetch` or LangGraph stream), removes the thinking indicator,
and resets to `.empty`.

---

### 5.5 The Toolbar — Alignment & Button Behaviour

The toolbar is a single flex row: left group fills available space (`flex: 1`),
right group is fixed. They never overlap because the left group uses `flex: 1`
and the right group uses fixed `display: flex`.

```
LEFT ────────────────────────────────── RIGHT
[Attach][|][Search][Screenshot][Deep]    [800/1000] [send]
```

The vertical divider `[|]` is a 1px wide, 18px tall `<div>` with
`background: --border`. It separates the file attachment action (universal) from
the research-specific toggles.

**Tool buttons** (`tool-btn`) are 30px tall, padding 0 10px, border-radius 8px.
They contain a 15px Tabler icon and a text label. No border by default.

Toggle buttons (Search, Deep) have an active state:

```css
/* inactive */
background: transparent;
color: var(--muted-foreground);

/* active (.active class added) */
background: rgba(138, 154, 107, 0.12);
color: #6B7A52;
```

Toggle state is boolean and persists for the session. Web Search is active by
default (most users will want web research). Deep mode is inactive by default
(it's slower and more expensive).

**Attach button**: not a toggle. On click, it flashes — background briefly
becomes `rgba(138,154,107,0.15)` for 400ms — to acknowledge the interaction,
then opens the file picker.

**Character counter**: Visible only when `input.length > 800`. Format: `"843/1000"`.
At > 800: `--muted-foreground` colour. At > 950: amber (`#d97706`). Transitions
to visible with a 150ms fade.

---

## 6. Message Send Flow — Full State Sequence

This section describes the complete UI state timeline from the moment the user
presses send to the moment the AI response is fully rendered.

```
T+0ms    User presses Enter or clicks send button
         ├── textarea value copied to local variable
         ├── textarea cleared and height reset to 'auto'
         ├── char counter hidden
         ├── send button → .stop state (black background, square icon)
         ├── isGenerating flag set to true
         └── textarea set to non-interactive

T+0ms    User message bubble appended to messages area
         ├── fade-in animation (opacity 0→1, translateY 8→0, 250ms)
         ├── scroll-to-bottom triggered (50ms delay to allow DOM paint)
         └── empty state removed from DOM if this is the first message

T+400ms  Thinking indicator appended to messages area
         ├── fade-in animation
         ├── dot-pulse animation begins
         └── scroll-to-bottom triggered

T+400ms  API request / LangGraph job dispatched (POST to Hono.js)
         └── SSE stream opened

T+???ms  (variable — research phase, 5–120 seconds in real usage)
         During this time the thinking indicator label text updates:
         "Researching sources…" → "Capturing screenshots…" → "Writing script…"

T+???ms  First SSE token received / response ready
         ├── thinking indicator removed from DOM
         ├── AI message bubble appended with fade-in animation
         ├── message action row rendered at opacity 0 below bubble
         ├── scroll-to-bottom triggered
         ├── send button → .empty state (border disabled)
         ├── textarea restored to interactive
         └── isGenerating flag set to false

T+???ms  User hovers over AI bubble
         └── message action row transitions to opacity 1 (0.15s)
```

---

## 7. Scroll Behaviour

The messages area scrolls independently. The top bar and input zone never scroll.

**Auto-scroll**: After every message append (user, thinking indicator, AI
response), `messagesArea.scrollTop = messagesArea.scrollHeight` is called with
a 50ms `setTimeout` to allow the DOM to paint the new element before measuring.

**Manual scroll interrupt**: If the user manually scrolls upward while the AI
is generating, auto-scroll is paused. It resumes when the user scrolls back to
within 100px of the bottom. This prevents the jarring experience of the page
forcibly scrolling down while the user is reading earlier messages.

**Scroll-to-bottom button**: A floating button (`ti-arrow-down` icon, 32px circle,
`--primary` background) appears fixed over the messages area when the user is
scrolled more than 200px from the bottom. Clicking it smooth-scrolls to the
bottom and hides the button.

---

## 8. Animation & Transition Reference

| Element | Animation | Duration | Easing |
|---------|-----------|----------|--------|
| New message append | `fadeUp` (opacity + translateY) | 250ms | ease |
| Input card focus halo | border-color + box-shadow | 200ms | ease |
| Send button state change | background + transform | 150ms | ease |
| Tool button hover | background + color | 150ms | ease |
| Thinking dot pulse | scale + opacity loop | 1400ms | ease-in-out |
| Message action row | opacity | 150ms | ease |
| Suggestion card hover | border-color + background | 150ms | ease |
| Model pill hover | background | 150ms | ease |
| Copy → Copied feedback | color | 0ms (instant) | — |
| Copied → revert | — | 1500ms delay | — |
| Char counter appear | opacity | 150ms | ease |

No animation uses `transform: scale` on layout-affecting elements.
No animation exceeds 300ms for interactions the user initiates directly.

---

## 9. Disclaimer Line

Below the input card, centred in the input zone:

```
outlier can make mistakes. Review important sources before publishing.
```

Style: 11px, `--muted-foreground`, `text-align: center`. Always visible,
regardless of input state. `margin-top: 7px`. This line mirrors the convention
used by all major AI chat products to set accuracy expectations.

---

## 10. Responsive Behaviour

| Breakpoint | Change |
|---|---|
| < 640px | Top bar padding → 12px horizontal. Logo hidden from model pill (icon only). Suggestion grid → 1 column. Input card border-radius → 16px. |
| < 480px | Toolbar labels hidden — icon only for Attach, Search, Screenshot, Deep. Suggestion cards → show only 2 (top row). |
| > 1280px | Messages area max-width: 760px, centred within the area. Input zone max-width: 760px. |

On mobile, `Shift+Enter` still works. The virtual keyboard pushing up the
viewport must not break the fixed input zone — use `100dvh` instead of
`100vh` for the root container height to account for iOS Safari's dynamic
toolbar.

---

## 11. Accessibility

- All icon-only buttons have `aria-label` attributes.
- Decorative icons have `aria-hidden="true"`.
- The textarea has a visible `placeholder` and is keyboard-navigable.
- Focus ring on send button: `box-shadow: 0 0 0 3px rgba(138,154,107,0.4)` on `:focus-visible`.
- Colour contrast: AI bubble text (`#1A1A1A` on `#FFFFFF`) passes AA at all sizes. User bubble text (`#FFFFFF` on `#8A9A6B`) passes AA for text ≥ 14px.
- The thinking indicator label is read by screen readers ("Researching sources…").
- The `role="log"` attribute is set on the messages area so screen readers announce new messages automatically.
- The send button's `aria-label` updates dynamically: "Send message" → "Stop generation".

---

## 12. Component Breakdown for Implementation

```
src/app/chat/
├── page.tsx                  ← root layout, state flags, JobContext consumer
├── components/
│   ├── ChatTopBar.tsx         ← model pill, new-chat label, action buttons
│   ├── MessagesArea.tsx       ← scroll container, empty/active state switch
│   ├── EmptyState.tsx         ← logo, title, subtitle, suggestion grid
│   ├── MessageRow.tsx         ← avatar + bubble + action row, user/ai variant
│   ├── ThinkingIndicator.tsx  ← dot pulse + label, phase-aware text
│   ├── ChatInput/
│   │   ├── index.tsx          ← input card, focus state management
│   │   ├── Textarea.tsx       ← auto-grow logic, enter-key handler
│   │   ├── Toolbar.tsx        ← tool buttons, char counter, send button
│   │   └── SendButton.tsx     ← empty/ready/stop state machine
│   └── ScrollToBottom.tsx     ← floating scroll button, appears on scroll-up
```

---