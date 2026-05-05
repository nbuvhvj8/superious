- this will be the new objectives of teh entire app design and purpose

# color 
color pallete to be use in the app rehaul
* **Background** — #F7F3EA (light cream)
* **Primary action** — #8A9A6B
* **Secondary / info** — #BFD7E2
* **Structure / borders** — #E0E0E0 (light gray)
* **Text / contrast** — #1A1A1A (soft black)


# pages
remove all pages from the entire app, we are doing rehauled from the app design and purpose approach

# Features Implemented

## 1. Multi-Provider AI Selection (Settings)
**Location:** `/settings` → API Configuration Section

### Features:
- **Provider Selection Toggles** for both script generation and research tasks
  - Claude (Anthropic) - Known for quality reasoning
  - Gemini (Google) - Fast, cost-effective for scale
  - GPT (OpenAI) - Advanced capabilities
  
- **Flexible API Key Management**
  - Support for Anthropic, Gemini, and OpenAI keys
  - Encrypted storage at rest
  - Individual provider activation
  - Fallback support

### Use Cases:
- **Performance-based:** Switch to Gemini for faster processing
- **Cost-based:** Choose OpenAI for budget-conscious operations
- **Quality-based:** Stick with Claude for complex analysis
- **Hybrid:** Use different providers for different tasks

---

## 2. Motion Design Studio (Animation Feature)
**Location:** `/motion-design` - New dedicated page accessible from sidebar

### Core Animation Styles:

1. **Newspaper Animation**
   - Progressive text reveal with classic newspaper effect
   - Duration: 2.5s default
   - Ideal for: Document reveals, content rollouts

2. **Filmstrip**
   - Vintage film reel effect with frame progression
   - 3D rotation and perspective
   - Duration: 3s default
   - Ideal for: Sequential content, timeline presentations

3. **Parallax**
   - Multi-layer depth effect with moving backgrounds
   - 3D depth separation
   - Duration: 2.8s default
   - Ideal for: Landscape images, hero sections

4. **Kinetic**
   - Dynamic motion graphics with easing curves
   - Precise trajectory control
   - Duration: 2.2s default
   - Ideal for: UI elements, interactive demos

5. **Organic**
   - Fluid, natural motion inspired by physics
   - Smooth easing and rotation
   - Duration: 3.2s default
   - Ideal for: Brand presentations, emotional content

### Animation Configuration:

- **Speed Control:** 0.25x - 3.0x multiplier
- **Auto-Transition:** Sequential asset progression
- **Transition Duration:** 1-10 seconds per asset
- **Sound Design:** Optional foley, cinematic, or modern effects
- **Export Formats:**
  - MP4 (H.264) - Universal compatibility
  - WebM (VP9) - Web-optimized
  - Animated GIF - Legacy support
  - APNG - Modern format

### UI Components:

1. **MotionDesignGallery.tsx** - Main interface
   - Asset preview pane
   - Real-time animation preview
   - Animation style selector
   - Speed/format controls

2. **AnimationSection.tsx** - Settings configuration
   - Toggle to enable/disable motion design
   - Style selection with descriptions
   - Granular control over animation parameters

### Utility Library:
**Location:** `src/lib/motion-design.ts`

Provides:
- Animation preset definitions with keyframes
- CSS animation generation
- Config validation
- Payload formatting for API calls
- Duration calculations

### Integration Points:
- Settings page for global preferences
- Dedicated studio page for manual animation application
- Sidebar navigation integration
- Export functionality for downloads

---

## 3. Implementation Details

### Backend API Endpoints (TODO):
- `PATCH /api/v1/settings/api-keys` - Save provider configuration
- `PATCH /api/v1/settings/animation` - Save animation preferences
- `POST /api/v1/animation/process` - Process assets with animations
- `GET /api/v1/assets` - List captured assets
- `POST /api/v1/animation/export` - Export animated assets

### File Structure:
```
src/
├── app/
│   ├── settings/
│   │   ├── page.tsx (updated)
│   │   └── components/
│   │       ├── ApiConfigSection.tsx (updated)
│   │       └── AnimationSection.tsx (new)
│   └── motion-design/
│       ├── page.tsx (new)
│       └── components/
│           └── MotionDesignGallery.tsx (new)
├── lib/
│   └── motion-design.ts (new)
└── components/
    └── Sidebar.tsx (updated)
```

### Future Expansion Ideas:

1. **Advanced Effects Library**
   - Glitch effects
   - Morphing transitions
   - 3D object manipulation
   - Custom easing curves

2. **Asset Batch Processing**
   - Queue multiple assets
   - Preset template application
   - Scheduled processing

3. **Collaboration Features**
   - Animation preset sharing
   - Team library management
   - Version control for animations

4. **Analytics**
   - Animation performance tracking
   - Viewer engagement metrics
   - Export history

5. **AI-Powered Suggestions**
   - Auto-select animation based on content type
   - Optimal timing recommendations
   - Sound design pairing suggestions

6. **Advanced Sound Design**
   - Music track synchronization
   - Custom audio layering
   - Procedural sound generation

7. **Template System**
   - Pre-built animation sequences
   - Brand-specific templates
   - Industry presets (news, marketing, education)