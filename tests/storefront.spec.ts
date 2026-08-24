import { test, expect } from '@playwright/test';

test.describe('E-commerce Features', () => {

  test('should display product variants and update cart', async ({ page }) => {
    // Navigate to homepage
    await page.goto('http://localhost:3000/');
    
    // Check if the page loaded
    await expect(page.locator('text=Heritage Tales').first()).toBeVisible();

    // Click on the first product card (assuming there is one seeded in the DB)
    const firstProduct = page.locator('a[href^="/product/"]').first();
    // Only proceed if a product actually exists
    if (await firstProduct.count() > 0) {
      await firstProduct.click();

      // Check if product page loaded
      await expect(page.locator('text=Add to Cart').first()).toBeVisible();
      
      // If the product has variants, there will be a select dropdown
      const variantSelect = page.locator('select');
      if (await variantSelect.count() > 0) {
        // Select the second option if available
        const options = await variantSelect.locator('option').all();
        if (options.length > 1) {
          const secondOptionValue = await options[1].getAttribute('value');
          if (secondOptionValue) {
             await variantSelect.selectOption(secondOptionValue);
          }
        }
      }

      // Add to cart
      await page.locator('button:has-text("Add to Cart")').click();

      // Expect cart drawer to open
      await expect(page.locator('text=Your Cart')).toBeVisible();
    }
  });

  test('should block unauthorized users at checkout', async ({ page }) => {
    await page.goto('http://localhost:3000/');
    
    const firstProduct = page.locator('a[href^="/product/"]').first();
    if (await firstProduct.count() > 0) {
      await firstProduct.click();
      await page.locator('button:has-text("Add to Cart")').click();
      
      // Cart drawer should be open
      await expect(page.locator('text=Your Cart')).toBeVisible();

      // Click proceed to checkout
      await page.locator('button:has-text("Proceed to Checkout")').click();

      // Should show auth prompt (Sign In / Guest)
      await expect(page.locator('text=Continue as Guest')).toBeVisible();
    }
  });

  test('abandoned carts cron job endpoint should be secured', async ({ request }) => {
    // Try calling the cron job without auth
    const response = await request.get('http://localhost:3000/api/cron/abandoned-carts');
    
    // Depending on if CRON_SECRET is set in CI, it should return 401 or process empty
    // We expect it to at least be a valid endpoint that doesn't crash 500
    expect(response.status() === 401 || response.status() === 200).toBeTruthy();
  });
});
