import { test, expect } from '@playwright/test'

const loginAsAdmin = async (page) => {
  await page.goto('/login')
  await page.fill('input[name="email"]', 'playwright@test.com')
  await page.fill('input[name="password"]', 'test123')
  await page.click('button[type="submit"]')
  await expect(page).toHaveURL('/', { timeout: 15000 })
}

test.describe('Admin CRUD', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page)
    await page.goto('/admin')
  })

  test('muestra el panel de administración', async ({ page }) => {
    await expect(page.getByText('DramaQuiz Admin')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Preguntas', exact: true })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Usuarios', exact: true })).toBeVisible()
  })

test('puede crear una pregunta manualmente', async ({ page }) => {
  await page.getByRole('button', { name: '+ Nueva pregunta' }).click()
  await page.waitForSelector('textarea', { timeout: 5000 })

  // Llenar todos los campos del formulario de nueva pregunta
  const textarea = page.locator('textarea')
  await textarea.fill('¿Pregunta de prueba E2E?')

  // El formulario de nueva pregunta está dentro de un card — usamos el segundo input de drama_title
  const tituloInputs = page.locator('input[placeholder="Título del drama"]')
  await tituloInputs.nth(1).fill('Test Drama E2E')

  await page.locator('input[placeholder="Opción 1"]').fill('Respuesta correcta')
  await page.locator('input[placeholder="Opción 2"]').fill('Respuesta 2')
  await page.locator('input[placeholder="Opción 3"]').fill('Respuesta 3')
  await page.locator('input[placeholder="Opción 4"]').fill('Respuesta 4')

  // Interceptar la respuesta del API para ver el error
  const [response] = await Promise.all([
    page.waitForResponse('**/api/questions'),
    page.getByRole('button', { name: 'Crear pregunta' }).click()
  ])
  console.log('Status:', response.status())
  console.log('Body:', await response.text())

  await expect(page.getByText('Pregunta creada')).toBeVisible({ timeout: 8000 })
})
  test('puede ver la lista de usuarios', async ({ page }) => {
    await page.getByRole('button', { name: 'Usuarios', exact: true }).click()
    await expect(page.getByText('playwright', { exact: true })).toBeVisible({ timeout: 8000 })
  })
})