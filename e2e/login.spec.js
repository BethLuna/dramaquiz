import { test, expect } from '@playwright/test'

test.describe('Login', () => {
  test('muestra el formulario de login', async ({ page }) => {
    await page.goto('/login')
    await expect(page.locator('input[name="email"]')).toBeVisible()
    await expect(page.locator('input[name="password"]')).toBeVisible()
    await expect(page.getByRole('button', { name: /iniciar sesión/i })).toBeVisible()
  })

  test('muestra error con credenciales incorrectas', async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[name="email"]', 'noexiste@test.com')
    await page.fill('input[name="password"]', 'wrong')
    await page.click('button[type="submit"]')
    await expect(page.getByText(/credenciales incorrectas|error/i)).toBeVisible({ timeout: 8000 })
    await expect(page).toHaveURL('/login')
  })

  test('redirige a / con credenciales correctas', async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[name="email"]', 'playwright@test.com')
    await page.fill('input[name="password"]', 'test123')
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL('/', { timeout: 15000 })
  })

  test('redirige a /login si no hay token', async ({ page }) => {
    await page.goto('/')
    await page.evaluate(() => localStorage.clear())
    await page.goto('/quiz')
    await expect(page).toHaveURL('/login')
  })
})