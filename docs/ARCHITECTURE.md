# Architecture

Catplant is a static, client-side game. Vite bundles the source, and a web server delivers the generated HTML, JavaScript, CSS, and SVG assets. There is no backend game simulation.

## Files and responsibilities

| File                                       | Responsibility                                                                   |
| ------------------------------------------ | -------------------------------------------------------------------------------- |
| `index.html`                               | Page structure, garden, character’s resting SVG, tool controls, dialogs          |
| `app.js`                                   | Crop illustrations, state, rendering, interactions, movement, sound, saving      |
| `style.css`                                | Responsive layouts, tooltips, expanded view, animation and reduced-motion styles |
| `assets/garden.svg`                        | Scenery: hills, trees, cottage, flowers, and paths                               |
| `assets/icon.svg`                          | Browser icon                                                                     |
| `tests/garden.spec.js`                     | Browser journeys against the production build                                    |
| `playwright.config.js`                     | Desktop Chromium, Firefox, and mobile test projects                              |
| `deploy/install-static.sh`                 | Optional release installer for a shared Caddy server                             |
| `Dockerfile`, `compose.yaml`, `nginx.conf` | Container-based static hosting                                                   |

## Crop lifecycle

Each of the ten patches is either empty (`null`) or holds a crop index and a stage.

| Current state | Accepted action | Result                                                |
| ------------- | --------------- | ----------------------------------------------------- |
| Empty         | Plant           | Stage 1: needs water                                  |
| Stage 1       | Water           | Stage 2: needs tending                                |
| Stage 2       | Tend            | Stage 3: ready to harvest                             |
| Stage 3       | Harvest         | Empty patch; harvest and collection counters increase |

An out-of-order action produces guidance instead of advancing the plant. Crops never wither. Happiness increases with valid care and is capped at 100. The day number advances after each ten harvests; it is a progress label, not a real-time clock.

The selected seed and tool are transient UI state. The version 1 save stores patches, crop collection counts, total harvests, happiness, and day. `render()` rebuilds the patch and seed controls and saves the updated state under `catplant-garden` in `localStorage`. Delegated event listeners on the containers continue to work after rendering.

## Movement and visual feedback

The resting cat and walking cat are separate SVG poses. The walking pose uses independently animated leg, head, tail, body, and shadow groups. A click translates pointer coordinates into scene coordinates. The destination is clamped to the scene bounds, direction follows horizontal travel, and duration depends on distance. A new movement cancels the previous arrival and footstep timers.

CSS interpolates the character position and animates its gait. Temporary paw prints are created during walking and removed after fading. Gardening actions trigger patch effects and an action pose when Miso arrives. The crop state changes immediately; the animation is feedback rather than a delay that locks input.

Reduced-motion preferences suppress decorative animations and make movement immediate. No automatic crop-care loop runs in the background.

## Responsive interaction

Desktop users get floating tooltips and crop-name tags. Below 761 CSS pixels, names and care instructions move into a strip below the garden, leaving the cat unobstructed. Required-tool badges remain on each crop. Expand mode hides surrounding panels and uses the available viewport for the garden; Back and Escape restore the regular view.

## Persistence and failure boundaries

Storage reads and writes are wrapped in `try/catch`; the game can still run if the browser refuses storage. Only the save version is checked on load. The application does not deeply validate manually edited save structures, migrate older versions, synchronize across tabs, or recover a deleted save. Those are possible future improvements, not implemented guarantees.

Sound uses an `AudioContext` created in response to player interaction, with short oscillator envelopes. Fonts load from Google Fonts, with local fallbacks. There are no game-data network requests.

## Tradeoffs

A framework-free implementation keeps the runtime small and easy to host, but `app.js` and `style.css` currently combine several responsibilities. As the game grows, separating state transitions, rendering, character animation, and persistence into modules would improve maintainability. Rendering every patch is reasonable for a fixed ten-patch garden; a larger simulation would benefit from updating only changed elements.

The project favors an immediate, forgiving interaction loop over timed farming simulation. There is no inventory economy, multiplayer, pathfinding around obstacles, or server authority. Browser tests validate user journeys and layout bounds rather than claiming pixel-perfect animation or full accessibility compliance.
