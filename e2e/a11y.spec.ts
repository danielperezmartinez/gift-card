import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const CARD_ID = '11111111-1111-4111-8111-111111111111';

const LOCAL_CARD = {
  id: CARD_ID,
  name: 'Tarjeta de prueba',
  description: 'Regalo de cumpleaños',
  initialAmount: 100,
  balance: 75,
  expenses: [{ id: '22222222-2222-4222-8222-222222222222', amount: 25, date: 1_760_000_000_000 }],
  createdAt: 1_760_000_000_000,
  color: '#FF9500',
};

// Respuesta simulada de la RPC: el test no depende del proyecto remoto compartido.
const SHARED_CARD = {
  id: CARD_ID,
  name: LOCAL_CARD.name,
  description: LOCAL_CARD.description,
  initial_amount: 100,
  balance: 75,
  created_at: LOCAL_CARD.createdAt,
  color: '#34C759',
  expenses: [{ id: LOCAL_CARD.expenses[0].id, amount: 25, date: LOCAL_CARD.expenses[0].date }],
};

const ROUTES = [
  { name: 'listado vacío', path: '/', cards: [], heading: 'Mis Tarjetas' },
  { name: 'listado con tarjetas', path: '/', cards: [LOCAL_CARD], heading: 'Mis Tarjetas' },
  { name: 'detalle', path: `/card/${CARD_ID}`, cards: [LOCAL_CARD], heading: LOCAL_CARD.name },
  { name: 'vista compartida', path: `/shared/${CARD_ID}`, cards: [], heading: SHARED_CARD.name },
  { name: 'aviso legal', path: '/aviso-legal', cards: [], heading: 'Aviso legal' },
  { name: 'política de privacidad', path: '/privacidad', cards: [], heading: 'Política de privacidad' },
];

async function prepare(page: Page, cards: unknown[], dark: boolean) {
  await page.addInitScript(
    ([data, isDark]) => {
      localStorage.setItem('gift_cards_data', data as string);
      localStorage.setItem('gift_card_theme', JSON.stringify(isDark));
    },
    [JSON.stringify(cards), dark] as const,
  );
  await page.route('**/rest/v1/rpc/get_shared_card', (route) =>
    route.fulfill({ json: SHARED_CARD }),
  );
  await page.route('**/realtime/v1/**', (route) => route.abort());
}

async function analyze(page: Page) {
  const { violations } = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
    .analyze();
  return violations;
}

for (const dark of [false, true]) {
  test(`WCAG AA sin infracciones: formulario de nueva tarjeta (${dark ? 'oscuro' : 'claro'})`, async ({
    page,
  }) => {
    await prepare(page, [], dark);
    await page.goto('/');
    await page.getByRole('button', { name: 'Añadir tarjeta' }).click();
    await expect(page.getByRole('dialog', { name: 'Nueva tarjeta' })).toBeVisible();
    // Wait for the entry animation so colors are measured at full opacity.
    await page.waitForTimeout(500);
    expect(await analyze(page)).toEqual([]);
  });

  for (const route of ROUTES) {
    test(`WCAG AA sin infracciones: ${route.name} (${dark ? 'oscuro' : 'claro'})`, async ({
      page,
    }) => {
      await prepare(page, route.cards, dark);
      await page.goto(route.path);
      await page.waitForLoadState('networkidle');
      await expect(page.getByRole('heading', { level: 1, name: route.heading })).toBeVisible();
      expect(await analyze(page)).toEqual([]);
    });
  }
}
