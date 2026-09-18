# Hyperframes Composition Brief: Bukhari ERP

## Objective
Create a short launch-style brag video for Bukhari ERP.

## Output
- Composition directory: `brag-output-2026-09-17-010900/composition/`
- Rendered video: `brag-output-2026-09-17-010900/brag.mp4`
- Format: landscape — 1920x1080
- Duration: 22 seconds

## Source Material
- Project root: `c:\Users\nazee\Desktop\bukharierp`
- Primary files read: `src/app/page.tsx`, `src/app/inventory/page.tsx`, `src/app/tender-calculator/calculator-form.tsx`, `src/app/globals.css`
- Product name: Bukhari Stationery ERP
- Tagline / strongest claim: "Never accidentally lose money again. (PPRA VIOLATION & LOSS-MAKING BID ALERT!)"
- Key UI or visual moment to recreate: The live Tender Calculator breakdown with WHT and GST percentages.
- Copy that must appear verbatim:
  - "Stop guessing your margins."
  - "⚠️ PPRA VIOLATION & LOSS-MAKING BID ALERT!"
  - "FBR integration. Out of the box."

## Creative Direction
- Tone preset: app-store
- Creative direction: Clean, corporate, fast-paced feature-card style that makes ERP look incredibly modern and necessary.
- Interpretation: Professional but energetic pacing. Type is highly readable, motion is smooth but snappy, avoiding chaotic or overly dramatic effects.
- Angle: Emphasize that this ERP actually prevents bankruptcy by physically stopping you from making illegal, loss-making bids.
- Hook: "Running a stationery empire?"
- Outro / punchline: "Bukhari ERP. Ready to bid."
- Avoid:
  - Generic SaaS language
  - Abstract filler visuals
  - Unrelated visual redesign

## Visual Identity
- Background: `#f9fafb`
- Text: `#111827`
- Accent: `#2563eb` (Blue)
- Display font: sans-serif (system defaults or Inter)
- Body font: sans-serif (system defaults or Inter)
- Visual references from the project: Blue buttons, green success text, red warning boxes.

## Storyboard
Use the storyboard in `brag-output-2026-09-17-010900/brag-plan.md` as the creative contract.

Scene summary:
1. The Hook — 3.0s — Big blue card with "Running a stationery empire?"
2. The Core App — 3.0s — Dashboard UI cards cascading in. "Stop guessing your margins."
3. The Tender Calculator — 6.0s — Mockup of Tender Calculator with the Live Financial Breakdown lighting up green.
4. The PPRA Alert — 4.0s — Red "PPRA VIOLATION" box flashing. "Never accidentally lose money again."
5. FBR Sync & Delivery — 4.0s — Green "Push to FBR" button clicking, generating a success badge.
6. Outro — 2.0s — Dark background. "Bukhari ERP. Ready to bid."

## Audio
- Audio role: warm bed with subtle UI accents
- Audio arc: Starts energetic, drops slightly for the UI walkthrough, builds back up for the final FBR sync payoff, ends on a clean hit.
- Music: corporate_tech.mp3
- Music treatment: Fade under final logo.
- Music cue guidance: detect at composition via analyze_music_cues.py / hyperframes beats
- Audio-reactive treatment: subtle glow on the background behind the UI cards
- Audio-coupled moments:
  - Scene 2 — card sequence (beats)
  - Scene 4 — PPRA warning flash (strong cue)
  - Scene 6 — final logo (strong cue)
- Exact SFX choice: Hyperframes should choose filenames, timestamps, density, and volume based on the implemented animation.
- Audio files: copy the chosen music and any Hyperframes-selected SFX into `brag-output-2026-09-17-010900/composition/assets/`

## Hyperframes Instructions
Load the composition-building Hyperframes domain skills. 
Requirements:
- Show at least one real UI, copy, or visual element from the source project (Tender calculator breakdown).
- Keep all text readable in the final render.
- Keep the video within 15-25 seconds.
- Run `hyperframes check` before render.
