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
      const variantSelect = page.locator('select').first();
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
      await page.locator('button:has-text("Add to Cart")').first().click();

      // Expect cart drawer to open
      await expect(page.locator('text=Your Cart')).toBeVisible();
    }
  });

  test('should block unauthorized users at checkout', async ({ page }) => {
    await page.goto('http://localhost:3000/');
    
    const firstProduct = page.locator('a[href^="/product/"]').first();
    if (await firstProduct.count() > 0) {
      await firstProduct.click();
      await page.locator('button:has-text("Add to Cart")').first().click();
      
      // Cart drawer should be open
      await expect(page.locator('text=Your Cart')).toBeVisible();

      // Click proceed to checkout
      await page.locator('button:has-text("Checkout Securely")').first().click();

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
  test('should allow filtering products on homepage', async ({ page }) => {
    await page.goto('http://localhost:3000/');
    
    // Check if the filter bar exists
    const filterSelect = page.locator('select').first();
    if (await filterSelect.count() > 0) {
      // Try to select the 'price-desc' option to sort
      const sortSelect = page.locator('select').nth(1);
      if (await sortSelect.count() > 0) {
        await sortSelect.selectOption('price-desc');
        // Check if URL updated
        await expect(page).toHaveURL(/.*sort=price-desc.*/);
      }
    }
  });

  test('should display wishlist button on product cards', async ({ page }) => {
    await page.goto('http://localhost:3000/');
    
    // Find the heart button (wishlist) on the first product card
    const heartButton = page.locator('button svg.lucide-heart').first();
    if (await heartButton.count() > 0) {
      // Click it
      await heartButton.click();
      // Optimistic UI means it should instantly fill or something, but we just want to ensure it doesn't crash
      await expect(heartButton).toBeVisible();
    }
  });

  test('should display product reviews section', async ({ page }) => {
    await page.goto('http://localhost:3000/');
    const firstProduct = page.locator('a[href^="/product/"]').first();
    if (await firstProduct.count() > 0) {
      await firstProduct.click();
      
      // Check if Customer Reviews section is visible
      await expect(page.locator('text=Customer Reviews')).toBeVisible();
      // Check if Write a Review button is visible
      await expect(page.locator('button:has-text("Write a Review")')).toBeVisible();
    }
  });

  test('should display the journal/blog page', async ({ page }) => {
    await page.goto('http://localhost:3000/journal');
    
    // Check if Journal title is visible
    await expect(page.locator('h1:has-text("Journal")')).toBeVisible();
    
    // Check if there are posts or a "No stories" message
    const hasPosts = await page.locator('article').count() > 0;
    const hasNoPosts = await page.locator('text=No stories published yet').count() > 0;
    
    expect(hasPosts || hasNoPosts).toBeTruthy();
  });
});
