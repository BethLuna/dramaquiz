import { test, expect } from '@playwright/test'

test.describe('Quiz', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[name="email"]', 'playwright@test.com')
    await page.fill('input[name="password"]', 'test123')
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL('/', { timeout: 15000 })
  })

  test('muestra el home después del login', async ({ page }) => {
    await expect(page.getByText('¿Listo para el quiz?')).toBeVisible()
    await expect(page.getByRole('button', { name: /empezar quiz/i })).toBeVisible()
  })

  test('carga preguntas al entrar al quiz', async ({ page }) => {
    await page.goto('/quiz')
    await expect(page.getByText(/pregunta 1 de/i)).toBeVisible({ timeout: 8000 })
  })

  test('muestra feedback al responder', async ({ page }) => {
    await page.goto('/quiz')
    await page.waitForSelector('button', { timeout: 8000 })
    const options = page.locator('button').filter({ hasNotText: /siguiente|resultado/i })
    await options.first().click()
    await expect(page.getByText(/correcto|incorrecto/i)).toBeVisible({ timeout: 5000 })
  })
})