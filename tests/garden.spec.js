import { test, expect } from "@playwright/test";

async function useTool(page, tool, patch = 0) {
  await page.locator(`[data-tool="${tool}"]`).click();
  await page.locator(`[data-plot="${patch}"]`).click();
}

test.beforeEach(async ({ page }) => {
  // External fonts are decorative; tests must run without Google Fonts access.
  await page.route("https://fonts.googleapis.com/**", (route) => route.abort());
  await page.goto("./");
  await expect(page.locator(".plot")).toHaveCount(10);
});

test("all ten crops complete the care cycle and persist after reloading", async ({
  page,
}) => {
  for (let i = 0; i < 10; i++) {
    await page.locator(`[data-seed="${i}"]`).click();
    await useTool(page, "plant", i);
    await expect(page.locator(`[data-plot="${i}"] .need svg`)).toHaveAttribute(
      "data-action-icon",
      "water",
    );
    await useTool(page, "water", i);
    await expect(page.locator(`[data-plot="${i}"] .need svg`)).toHaveAttribute(
      "data-action-icon",
      "tend",
    );
    await useTool(page, "tend", i);
    await expect(page.locator(`[data-plot="${i}"] .need svg`)).toHaveAttribute(
      "data-action-icon",
      "harvest",
    );
    await useTool(page, "harvest", i);
  }
  await expect(page.locator("#harvest-count")).toHaveText("10");
  await expect(page.locator("#collection-count")).toHaveText("10/10");
  await page.reload();
  await expect(page.locator("#harvest-count")).toHaveText("10");
  await expect(page.locator("#collection-count")).toHaveText("10/10");
  await expect(page.locator(".plot.empty")).toHaveCount(10);
});

test("out-of-order care does not harvest an unready crop", async ({ page }) => {
  await useTool(page, "plant");
  await useTool(page, "harvest");
  await expect(page.locator("#harvest-count")).toHaveText("0");
  await useTool(page, "tend");
  await expect(page.locator('[data-plot="0"] .need svg')).toHaveAttribute(
    "data-action-icon",
    "water",
  );
});

test("reset can be canceled and confirmed progress stays reset after reload", async ({
  page,
}) => {
  await useTool(page, "plant");
  await page.locator("#reset-progress").click();
  await page.locator("#cancel-reset").click();
  await expect(page.locator(".plot.planted")).toHaveCount(1);
  await page.locator("#reset-progress").click();
  await page.locator("#confirm-reset").click();
  await page.reload();
  await expect(page.locator(".plot.empty")).toHaveCount(10);
  await expect(page.locator("#harvest-count")).toHaveText("0");
  await expect(page.locator("#collection-count")).toHaveText("0/10");
  await expect(page.locator("#day")).toHaveText("1");
});

test("expanded view keeps tools visible and supports click-to-walk", async ({
  page,
}) => {
  await page.locator("#focus-garden").click();
  await expect(page.locator("body")).toHaveClass(/garden-expanded/);
  const scene = page.locator("#scene");
  const box = await scene.boundingBox();
  await scene.click({ position: { x: box.width - 30, y: box.height - 30 } });
  await expect(page.locator("#cat")).toHaveClass(/walking/);
  await expect(page.locator("#cat .leg")).toHaveCount(4);
  await expect(page.locator("#cat")).not.toHaveClass(/walking/, {
    timeout: 5000,
  });
  const toolBox = await page.locator("#tools").boundingBox();
  const viewport = page.viewportSize();
  expect(toolBox.y + toolBox.height).toBeLessThanOrEqual(viewport.height);
  expect(toolBox.x + toolBox.width).toBeLessThanOrEqual(viewport.width);
  await page.keyboard.press("Escape");
  await expect(page.locator("body")).not.toHaveClass(/garden-expanded/);
});

test("phone crop details stay below the scene and reduced motion is respected", async ({
  page,
}, testInfo) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await useTool(page, "plant");
  if (testInfo.project.name === "mobile") {
    await expect(page.locator("#plot-tooltip")).toBeHidden();
    await expect(page.locator(".plot-tag")).toBeHidden();
    await expect(page.locator(".mobile-plot-info")).toContainText("Water next");
    const scene = await page.locator("#scene").boundingBox();
    const info = await page.locator(".mobile-plot-info").boundingBox();
    expect(info.y).toBeGreaterThanOrEqual(scene.y + scene.height);
  }
  const animation = await page
    .locator("#cat > svg")
    .first()
    .evaluate((el) => getComputedStyle(el).animationName);
  expect(animation).toBe("none");
});
