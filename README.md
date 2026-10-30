# BRUHE // Identity terminal

A fictional, mobile-first personnel dossier built with React, TypeScript and Vite. No accounts, backend, NFC permissions, tracking, sound, or runtime third-party requests. A simulated beer-reboot alert interrupts startup; the retained memory game (currently hidden) unlocks a configurable secret; this is entertainment, not security. All public assets and secrets can be inspected by visitors.

## Run and preview

Use Node 22.18+ and npm:

```sh
npm install
npm run dev
```

Open the printed local URL. The dev server binds to your local network, so a phone on the same Wi-Fi can open `http://YOUR_COMPUTER_IP:5173`. Allow your OS firewall if needed.

```sh
npm run check
npm test
npm run build
npm run preview
```

`dist/` is the finished static site. Preview serves the production build, usually on port 4173.

## Change the story

Edit `src/data/character.ts`. It holds the sample name, alias, dossier fields, biography, notes, hidden objective and passphrase. All sample values are fictional. Set `settings.storageKey` to a new version when changing the secret to reset the unlock for returning guests. A completed breach is saved locally; if storage is unavailable, it still works during the current page session. Clear site storage to replay.

The four-stage retro BIOS boot lasts 3.8 seconds and can be skipped by tapping anywhere, using the skip button, or pressing Escape. Reduced motion uses a static 450 ms readiness screen and disables scan animations and automatic rotation. The breach shows a four-code sequence for 6.5 seconds; guests can also choose “signal memorized” earlier. Correctly repeating it unlocks the record. A mismatch allows another attempt without penalty. This is a local simulation.

## Capture a real 360-degree bust

1. Keep the person still, looking straight ahead, in even lighting. Include the entire head and upper shoulders throughout. Avoid motion blur and auto-exposure changes; lock exposure/focus where possible.
2. Move the phone smoothly around the stationary person at a constant distance and height for exactly one full turn, starting from the intended front pose. A plain background makes segmentation easier. Capture 1080p or higher. Leave room around hair and shoulders.
3. Trim the clip to one turn with no walking-in footage. Do not include a pause at either end. Frame sampling assumes roughly constant camera speed; manually adjust frames if needed.
4. Install FFmpeg (including ffprobe) locally, then run:

```sh
node scripts/extract-frames.mjs capture.mp4 prepared-frames 36 900
```

Arguments are video, output folder, frame count (24/36/48), and output width (320–2000 pixels). The script samples evenly across the full clip, avoids duplicate endpoints, and outputs numbered PNGs. It overwrites matching files in the chosen output directory. It does **not** remove backgrounds.

5. Remove backgrounds with a trusted local segmentation tool or an editor such as Photoshop/affinity-compatible masking software. Review hair, earrings, chrome surfaces and every outline by hand. FFmpeg alone cannot reliably segment a complex background. Preserve the actual face and body proportions: do not use generative face replacement or beautification.
6. Align all frames to the same transparent canvas and a stable head center/eye height. Keep the same scale and bottom shoulder crop. Do not independently auto-trim each image: that creates bouncing during rotation.
7. Export alpha WebP frames, typically 700–900 px wide and 900–1100 px high, quality around 80–88. Target 80–180 KB per frame and ideally under 6 MB total for 36 images. Check hair edges against a dark background. A tall 9:10 canvas fits the viewer well. For a prepared transparent PNG, FFmpeg can convert it, e.g.:

```sh
ffmpeg -i prepared-frames/frame-001.png -c:v libwebp -quality 85 public/assets/bust/frame-001.webp
```

Repeat conversion for all frames using your image export tool or batch workflow. PNG is supported by changing the configured extension, but usually costs more bandwidth.

8. Place the resulting files in `public/assets/bust/`:

```text
frame-001.webp
frame-002.webp
...
frame-036.webp
```

Never add capture videos to the public directory. Confirm you have the wearer's permission to publish their images.

## Viewer configuration

`settings.bust` in `src/data/character.ts` controls:

- `frameCount`: 24, 36 or 48; match the assets.
- `path` and `extension`: asset folder and format.
- `secondsPerTurn`: automatic rotation speed (default 18 seconds).
- `resumeAfterMs`: pause after manual interaction (default 4000).
- `pixelsPerTurn`: horizontal gesture distance for a full turn (default 380).

`BustViewer` is reusable and accepts a `config` prop with these settings. It preloads four images concurrently, draws available frames immediately, and uses the nearest loaded frame when some are missing. Frames render on a canvas without React rerenders for each image. Drag in either direction, or focus the viewer and use left/right arrow keys (Home returns to the first frame). Vertical swipes can scroll the page; horizontal swipes rotate the viewer. Automatic rotation stops during dragging, respects reduced motion, and pauses while the document is hidden. A missing sequence displays a deliberately anonymous temporary profile. The capture retry control has been replaced with a cosmetic ALL SYSTEMS STABLE readout; reload to retry loading assets. Missing image requests may appear as expected 404s in developer tools until assets are supplied.

## Deploy to Netlify and NFC

1. Push this project to your Git host and import it in Netlify, or run `npm run build` and drag `dist/` into Netlify's manual deploy UI.
2. The supplied `netlify.toml` sets build command `npm run build` and publish directory `dist`. No environment variables are needed.
3. Open the deployed HTTPS URL on a phone and verify assets and the breach before writing tags.
4. Use an NFC writer app on a compatible phone to write a standard **URL / URI (NDEF)** record containing the HTTPS address. Read it back before attaching the tag. The tag simply opens the URL; the site never uses Web NFC or requests hardware permissions. Leave the tag rewritable until the URL is final.
5. Test a scan on both iPhone and Android. Browser and NFC notification behavior varies by phone; unlock the device and tap the notification if prompted.

## Real-phone acceptance checklist

- Test Safari on iPhone and Chrome on Android at 320, 375, 390 and 430 px widths, plus landscape and desktop.
- Skip the boot, scroll the page, verify text is readable in dim lighting and controls are comfortably tappable.
- First test missing assets, then use the real full set. Test a partial set and slow network conditions. Drag both directions, cross the last/first frame, release and confirm idle rotation resumes.
- Background the browser and return; confirm there is no large rotation jump. Enable reduced motion and verify automatic animation stops.
- Play a successful breach and a failed breach, retry, close with the button and Escape, and reopen. Reload after success to confirm persistence. Test private browsing as well.
- Navigate with keyboard and VoiceOver/TalkBack; the modal traps keyboard focus and restores it on exit. Rotation also supports arrow keys.
- After deployment, test directly from the NFC URL notification, with no development server running.

Build and type checks do not replace real device testing. The real capture is intentionally not included: the default silhouette is a clearly labeled temporary asset.

## Verification in this workspace

- `npm ci`: passed using the available offline package cache.
- `npm run build` and `npm run check`: passed.
- `npm test`: two extraction-planning tests passed.
- FFmpeg integration: extracted 24 numbered PNGs from a generated two-second test video successfully.
- Live browser verification could not run here: the sandbox blocks the local server listening port, and the installed headless Chrome process could not launch successfully. Mobile layout, touch behavior, and the breach flow still need the real-phone checks above.


## BRUHE error simulation and temporarily hidden sections

The beer alert appears 1.2 seconds after boot completes (or is skipped), on every page load. It requests no permissions and stores no completion flag. “BEER DELIVERED” runs a 1.8-second recovery, closes the alert, restores terminal focus, and announces “SYSTEM RESTORED. HYDRATION PROTOCOL COMPLETE” for five seconds. Reduced motion shortens recovery and disables warning/glitch animations. The alert has no dismissal control: Escape and backdrop taps do not close it. BEER DELIVERED is the only resolution. The modal locks background scrolling, makes the terminal inert, traps keyboard focus, and scrolls internally on shorter phones.

`src/components/SystemError.tsx` owns the alert and recovery; `src/App.tsx` schedules it. Set `settings.showUnfinishedSections` in `src/data/character.ts` to `true` to restore Field Intelligence, Black Archive and Ghost Protocol. Their code, story data and saved unlock key are preserved. The alias data also remains, but the subtitle no longer renders. BustViewer is unchanged.

Refinement validation: production build, TypeScript and both extraction tests pass. Server-render checks confirmed the BRUHE branding and alert copy, hidden sections/alias, single text-node IDENTIFICATION heading and retained viewer. Mobile H1 styling uses nowrap and viewport-scaled sizing; the dialog supports narrow and short screens. Interactive browser/device testing remains unverified because this sandbox rejects local listening ports and headless Chrome exits at launch.


## Retro BIOS startup

The existing startup is now implemented in `src/components/BootSequence.tsx`, with isolated styles in `BootSequence.css` and a deterministic timeline in `bootTimeline.ts`. It runs cold start → organic hardware diagnostics → neural synchronization (including one deliberate rollback) → IDENTITY ACQUIRED → identification page. CRT activation, phosphor text, local SVG reticle/waveform, segmented progress, interference and a stepped exit use CSS and lightweight JavaScript; there are no new assets, requests or libraries. The capture viewer continues loading underneath.

Configure `settings.boot` in `src/data/character.ts`:

- `durationMs`: total normal boot including the exit (3800 by default).
- `reducedMotionMs`: static reduced-motion alternative (450 by default).
- `errorDelayMs`: normal identification time before the existing beer fault (1200 by default).

Completion uses a timer independent of optional assets and CSS events. Skipping takes the same handoff path as completion. During boot the dossier is inert and body scrolling is locked; focus stays on the skip control, then transfers to the terminal on exit. A dedicated scrolling diagnostic viewport keeps the skip control visible on short screens. The beer fault is scheduled only after boot unmounts, with no boot/error overlap. Every fresh load plays again. No voice input or microphone access is involved.

Timeline tests cover duration scaling, stage ordering, full diagnostic completion, the deliberate sync rollback and final 100% recovery. Real-device visual verification remains necessary under the environment limits described above.


## Minimal identification card

`settings.showDossierDetails` is now `false`: the identification page renders the BRUHE framing, rotating portrait, name and footer. The full dossier markup, data and breach component remain available. Set it to `true` to restore the dossier fields; the intelligence and breach sections additionally require `showUnfinishedSections`. Character fields beyond the name may be omitted while hidden.

The critical fault now reads “CRITICAL MALFUNCTION / Add beer to reboot.” It gives no explanation for the failure. The dialog has exactly one button, BEER DELIVERED, and cannot close through Escape or backdrop taps. Tab focus remains within the dialog even while the reboot button is disabled. The existing recovery animation and restored confirmation are retained. Decorative diagonal arrows, the redundant brand link and the RESTRICTED badge are removed; rotation indicators and the functional startup skip indicator remain. Boot and BustViewer implementations are unchanged by this cleanup.


Typography polish increases selected error-terminal text by roughly 10–15% and small identification readouts by roughly 5–10%, with separate compact mobile sizes. Body text, buttons, the single-line IDENTIFICATION heading and the BIOS design are unchanged. ALL SYSTEMS STABLE is a non-interactive fictional readout shown regardless of asset availability; it is not a connection check. Its illuminated dot respects reduced motion. The redundant ordinary malfunction sentence is removed, leaving the stylized warning and prominent beer instruction.
