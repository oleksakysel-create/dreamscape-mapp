import { expect, test, type Page } from '@playwright/test'
import { fileURLToPath } from 'node:url'

const PHOTO = fileURLToPath(new URL('../public/demo/beach.jpg', import.meta.url))

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

test('words on the card → plan → photo of the fulfilled dream → share → pause', async ({ page }) => {
  const errors = watch(page)
  await page.goto('/')

  await expect(page.getByText('Your age is no reason to forget your dreams.')).toBeVisible()
  for (let i = 0; i < 3; i++) await page.getByTestId('onb-next').click()
  await page.getByLabel('Name').fill('Maria')
  await page.getByTestId('onb-next').click()
  await page.getByRole('radio', { name: /^5/ }).click()
  await page.getByTestId('onb-next').click()
  await page.getByRole('checkbox', { name: /Weekday evenings/ }).click()
  await page.getByTestId('onb-next').click()
  await page.getByTestId('onb-next').click()

  // Today: a clean card waiting for the person's words
  await expect(page.getByRole('heading', { name: 'Today' })).toBeVisible()
  await expect(page.getByTestId('dream-card')).toHaveAttribute('data-state', 'words')
  await page.getByTestId('primary-action').click()

  // Thoughts
  await page.getByTestId('finish-thoughts').click()
  await expect(page.getByText('Answer at least two questions')).toBeVisible()
  await page.getByTestId('answer-m1q1').fill('Work, commute, home. Almost no time of my own.')
  await page.getByTestId('answer-m1q2').fill('A bright house by the sea with a terrace')
  await page.getByTestId('scale-m1q3-4').click()
  await page.getByTestId('answer-m1q4').fill('Look at three houses this weekend')
  await page.getByTestId('finish-thoughts').click()

  // Plan: the step comes from their own answer and lands in a free window
  await page.getByTestId('add-own-step').click()
  await expect(page.getByTestId('step-title')).toHaveValue('Look at three houses this weekend')
  await page.getByTestId('save-step').click()
  await expect(page.getByRole('status').filter({ hasText: /Added to your week|This week is full/ })).toBeVisible()

  // Create: log the step
  await page.getByRole('tab', { name: /Create/ }).click()
  await expect(page.getByText('What did this month change for you?')).toBeVisible()
  const row = page.getByRole('button', { name: /Look at three houses/ }).last()
  await row.evaluate((el) => el.scrollIntoView({ block: 'center' }))
  await row.click()
  await page.getByTestId('step-result').fill('Found two areas I love')
  await page.getByTestId('mark-done').click()
  await expect(page.getByText('“Found two areas I love”')).toBeVisible()

  // The card shows their words
  await page.getByTestId('nav-back').click()
  await expect(page.getByTestId('dream-phrase')).toHaveCount(1)
  await expect(page.getByTestId('dream-phrase')).toHaveText('A bright house by the sea with a terrace')

  // Share renders an image
  await page.getByTestId('share').click()
  await expect(page.getByTestId('share-preview')).toBeVisible()
  await page.getByRole('radio', { name: 'Square' }).click()
  await expect(page.getByTestId('share-preview')).toBeVisible()
  await page.mouse.click(10, 60)

  // It came true: attach a real photo
  await page.getByTestId('attach').click()
  await page.getByTestId('photo-input').setInputFiles(PHOTO)
  await expect(page.getByAltText('Selected photo')).toBeVisible()
  await page.getByTestId('mark-fulfilled').click()
  await expect(page.getByTestId('dream-card')).toHaveAttribute('data-state', 'fulfilled')
  await expect(page.getByTestId('dream-card').getByRole('img')).toBeVisible()

  await page.getByRole('button', { name: 'Board' }).click()
  await expect(page.getByTestId('board-1')).toHaveAttribute('data-fulfilled', 'true')

  // Persists across reload (photo comes back from IndexedDB)
  await page.reload()
  await expect(page.getByTestId('dream-card')).toHaveAttribute('data-state', 'fulfilled')
  await expect(page.getByTestId('dream-card').getByRole('img')).toBeVisible()

  // Pause: coloring as a separate, calm activity
  await page.getByRole('button', { name: 'Pause', exact: true }).click()
  await page.getByTestId('open-studio').click()
  await expect(page.getByTestId('canvas')).toBeVisible()
  await page.waitForTimeout(800) // let the sheet finish sliding up
  const total = await page.locator('[data-region]').count()
  await tapRegion(page, 'v1')
  await expect(page.getByTestId('progress')).toHaveText(`1/${total}`)
  await page.getByRole('button', { name: 'Undo' }).click()
  await expect(page.getByTestId('progress')).toHaveText(`0/${total}`)

  expect(errors).toEqual([])
})

test('example journey opens every screen without errors', async ({ page }) => {
  const errors = watch(page)
  await page.goto('/')
  await page.getByTestId('onb-demo').click()
  await expect(page.getByRole('heading', { name: 'Today' })).toBeVisible()
  await page.getByRole('button', { name: 'Journey' }).click()
  await page.getByTestId('chapter-6').click()
  await expect(page.getByTestId('dream-card')).toHaveAttribute('data-state', 'fulfilled')
  await page.getByTestId('chapter-share').click()
  await expect(page.getByTestId('share-preview')).toBeVisible()
  await page.mouse.click(10, 60)
  await page.getByTestId('nav-back').click()
  await page.getByRole('button', { name: 'Board' }).click()
  for (const m of [4, 6, 9]) await expect(page.getByTestId(`board-${m}`)).toHaveAttribute('data-fulfilled', 'true')
  await page.getByRole('button', { name: 'Today' }).click()
  await page.getByRole('button', { name: 'Profile' }).click()
  await page.getByTestId('reset').click()
  await page.getByTestId('confirm-reset').click()
  await expect(page.getByTestId('onb-next')).toBeVisible()
  expect(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth)).toBe(false)
  expect(errors).toEqual([])
})

test('desktop shows the app inside an iPhone frame with a status bar @desktop', async ({ page }) => {
  await page.goto('/')
  await page.getByTestId('onb-demo').click()
  const box = await page.getByRole('heading', { name: 'Today' }).boundingBox()
  expect(box!.x).toBeGreaterThan(400)
  await expect(page.getByText('9:41')).toBeVisible()
})
