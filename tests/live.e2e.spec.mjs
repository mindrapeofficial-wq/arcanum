import { test, expect } from "@playwright/test";

const username=process.env.ARCANUM_E2E_USERNAME;
const password=process.env.ARCANUM_E2E_PASSWORD;
const liveURL=process.env.ARCANUM_E2E_BASE_URL || "https://arcanum-las-cinco-escuelas.onrender.com";

test.describe("ARCANUM live backend",()=>{
  test.skip(!username || !password,"Configura ARCANUM_E2E_USERNAME y ARCANUM_E2E_PASSWORD como secretos para activar la prueba live.");

  test("login y navegación de lectura contra producción",async({page})=>{
    await page.goto(liveURL);
    await page.locator("#username").fill(username);
    await page.locator("#password").fill(password);
    await page.locator("#submit-button").click();

    await expect(page.getByRole("heading",{name:"Tu Reino"})).toBeVisible();
    await page.locator('#main-nav button[data-view="war"]').click();
    await expect(page.getByRole("heading",{name:"Guerra"})).toBeVisible();
    await page.locator('#main-nav button[data-view="community"]').click();
    await expect(page.getByRole("heading",{name:"Comunidad"})).toBeVisible();
  });
});
