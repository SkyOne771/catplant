# Testing

## Full check

Use Node.js 22 or later:

```sh
npm ci
npx playwright install --with-deps chromium firefox
npm run check
```

The first browser installation downloads test browsers and may need permission to install operating-system dependencies. CI performs the same steps on Ubuntu.

`npm run check` runs formatting checks, builds with the `/catplant/` asset base, and executes Playwright. The tests launch a local Vite preview of the built site. They never connect to the public VPS or modify real players’ progress.

## Individual commands

```sh
npm run format
npm run format:check
npm run build -- --base=/catplant/
npm test
npx playwright test --project=firefox
```

After changing application source, rebuild before running browser tests. Each test uses an isolated browser context. External font requests are blocked in tests so they do not depend on Google Fonts availability.

## Coverage

The suite runs five journeys on desktop Chromium, desktop Firefox, and a mobile Chromium viewport:

- Complete all ten crop cycles, check required-tool icons, and reload saved collection progress.
- Try care actions out of order and verify that unready crops cannot be harvested.
- Cancel and confirm progress reset, then check the persisted result after reload.
- Expand the garden, walk the cat, and check that the toolbar fits the viewport.
- Verify reduced motion and, on mobile, crop details below the scene rather than over the character.

CI checks formatting and the production build before browser tests. Failure traces are uploaded as short-lived workflow artifacts. Tests and their assertions are defined in `tests/garden.spec.js`.

## Manual checks

Before releasing visible changes, inspect the game at desktop and phone sizes, check scenery and crop illustrations, test keyboard focus, exercise click redirection while walking, and enable sound with a player gesture. Validate the deployed page and generated asset paths after a release.

Automated tests do not prove visual animation quality, screen-reader accessibility, sound output, container behavior, VPS availability, or browser compatibility beyond the configured environments. A mobile Chromium viewport is not a physical iPhone or an iOS Safari test.
