import { expect, test, type Page } from '@playwright/test'

function watch(page: Page) {
  const errors: string[] = []
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
  page.on('pageerror', (e) => errors.push(e.message))
  return errors
}

/** Real pointer tap at a visible point inside a coloring region. */
async function tapRegion(page: Page, id: string) {
  const pt = await page.evaluate((rid) => {
    const path = document.querySelector<SVGPathElement>(`[data-region="${rid}"]`)!
    const svg = path.ownerSVGElement!
    const box = path.getBBox()
    const ctm = path.getScreenCTM()!
    for (let i = 0; i < 6000; i++) {
      const p = svg.createSVGPoint()
      p.x = box.x + box.width * ((i * 0.618034) % 1)
      p.y = box.y + box.height * ((i * 0.754877) % 1)
      const s = p.matrixTransform(ctm)
      if (document.elementFromPoint(s.x, s.y) === path) return { x: s.x, y: s.y }
    }
    return null
  }, id)
  expect(pt, `region ${id} not tappable`).not.toBeNull()
  await page.mouse.click(pt!.x, pt!.y)
}

test('onboarding → reflection → balanced plan → results → coloring → dream board', async ({ page }) => {
  const errors = watch(page)
  await page.goto('/')

  // Positioning + setup
  await expect(page.getByText('Ваш возраст — не причина забыть о мечтах.')).toBeVisible()
  for (let i = 0; i < 3; i++) await page.getByTestId('onb-next').click()
  await page.getByLabel('Имя').fill('Мария')
  await page.getByTestId('onb-next').click()
  await page.getByRole('radio', { name: /^5/ }).click()
  await page.getByTestId('onb-next').click()
  await page.getByRole('checkbox', { name: /Вечер в будни/ }).click()
  await page.getByTestId('onb-next').click()
  await page.getByTestId('onb-next').click()

  // Today
  await expect(page.getByRole('heading', { name: 'Мария' })).toBeVisible()
  await expect(page.getByText('Неделя пока свободна')).toBeVisible()
  await page.getByTestId('continue-chapter').click()

  // Reflection (validation, then answers)
  await expect(page.getByRole('heading', { name: 'Точка отсчёта' })).toBeVisible()
  await page.getByTestId('finish-reflection').click()
  await expect(page.getByText('Ответьте хотя бы на два вопроса')).toBeVisible()
  await page.getByTestId('answer-m1q1').fill('Работа, дорога, дом. Своего времени почти нет.')
  await page.getByTestId('answer-m1q2').fill('Светлый дом у моря с террасой и бассейном.')
  await page.getByTestId('scale-m1q3-4').click()
  await page.getByTestId('answer-m1q4').fill('Посмотреть три дома на выходных')
  await page.getByTestId('finish-reflection').click()

  // Plan: the step comes from the user's own answer and is placed into a free window
  await expect(page.getByText('«Посмотреть три дома на выходных»')).toBeVisible()
  await page.getByTestId('add-own-step').click()
  await expect(page.getByTestId('step-title')).toHaveValue('Посмотреть три дома на выходных')
  await expect(page.getByText('Свободное окно, которое мы нашли:')).toBeVisible()
  await page.getByTestId('save-step').click()
  await expect(page.getByRole('status').filter({ hasText: /Вписано в неделю|Эта неделя заполнена/ })).toBeVisible()
  await page.getByRole('button', { name: /Собрать подборку референсов/ }).click()
  await page.getByRole('radio', { name: 'Без даты' }).click()
  await page.getByTestId('save-step').click()

  // Results: log one step as done with a note
  const row = page.getByRole('button', { name: /Посмотреть три дома/ }).first()
  await row.evaluate((el) => el.scrollIntoView({ block: 'center' }))
  await row.click()
  await page.getByTestId('step-result').fill('Нашла два района, которые нравятся')
  await page.getByTestId('mark-done').click()
  await page.getByRole('radio', { name: 'Итоги' }).click()
  await expect(page.getByText('«Нашла два района, которые нравятся»')).toBeVisible()

  // Coloring: manual fill + undo, then realistic brush to completion
  await page.getByRole('radio', { name: 'Мечта' }).click()
  await page.getByTestId('open-studio').click()
  const total = await page.locator('[data-region]').count()
  await tapRegion(page, 'v1')
  await expect(page.getByTestId('progress')).toHaveText(`1/${total}`)
  await page.getByRole('button', { name: 'Отменить' }).click()
  await expect(page.getByTestId('progress')).toHaveText(`0/${total}`)
  await page.getByTestId('realistic').click()
  const ids = await page.locator('[data-region]').evaluateAll((els) => els.map((e) => e.getAttribute('data-region')!))
  for (const id of ids) await tapRegion(page, id)
  await expect(page.getByTestId('progress')).toHaveText(`${total}/${total}`)
  await expect(page.locator('[data-region="v1"]')).toHaveAttribute('fill', '#2E3A64')
  await expect(page.getByText('теперь на вашей доске')).toBeVisible()
  await page.getByTestId('to-board').click()
  await expect(page.getByTestId('board-1')).toHaveAttribute('data-done', 'true')

  // Persists across reload
  await page.reload()
  await page.getByRole('button', { name: 'Доска' }).click()
  await expect(page.getByTestId('board-1')).toHaveAttribute('data-done', 'true')
  await page.getByRole('button', { name: 'Путь' }).click()
  await expect(page.getByTestId('chapter-1')).toBeVisible()

  expect(errors).toEqual([])
})

test('demo journey opens every screen without errors', async ({ page }) => {
  const errors = watch(page)
  await page.goto('/')
  await page.getByTestId('onb-demo').click()
  await expect(page.getByRole('heading', { name: 'Анна' })).toBeVisible()
  await page.getByRole('button', { name: 'Доска' }).click()
  await expect(page.getByTestId('board-2')).toHaveAttribute('data-done', 'true')
  await page.getByTestId('board-1').click()
  await expect(page.getByRole('dialog')).toContainText('Светлый дом у моря')
  await page.mouse.click(5, 100)
  await page.getByRole('button', { name: 'Сегодня' }).click()
  await page.getByRole('button', { name: 'Профиль' }).click()
  await page.getByTestId('reset').click()
  await page.getByTestId('confirm-reset').click()
  await expect(page.getByTestId('onb-next')).toBeVisible()
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth)
  expect(overflow).toBe(false)
  expect(errors).toEqual([])
})

test('desktop shows the app inside a phone frame @desktop', async ({ page }) => {
  await page.goto('/')
  await page.getByTestId('onb-demo').click()
  const box = await page.getByRole('heading', { name: 'Анна' }).boundingBox()
  expect(box!.x).toBeGreaterThan(400)
  await expect(page.getByText('9:41')).toBeVisible()
})
