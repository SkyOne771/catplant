# Contributing

Use Node.js 22 or later, run `npm ci`, and start the local game with `npm run dev`.

Keep the game simple and forgiving. Preserve existing saves when possible, keep mobile crop details outside the play area, and honor reduced-motion preferences when adding effects.

Before opening a pull request:

1. Update the README or relevant document if behavior, commands, hosting, or limitations change.
2. Run `npm run format`.
3. Install test browsers with `npx playwright install --with-deps chromium firefox` if needed.
4. Run `npm run check`.
5. Check the changed interaction manually at desktop and mobile sizes.

Explain the user-visible behavior, relevant tradeoffs, and validation in the pull request. Do not include private keys, browser storage exports, personal data, environment files, generated release archives, or deployment credentials.

For reports, include the browser, viewport or device, steps to reproduce, and expected versus actual behavior. Share console errors without tokens, cookies, or other private information. Report a suspected security issue privately to the maintainer through their GitHub profile rather than posting credentials in a public issue.

Contributions are provided under the repository’s MIT license.
