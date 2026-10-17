import { GiftCard } from './gift-card.model';

export interface CardColor {
  value: string;
  label: string;
}

// Darker variants of the original palette: white card text keeps a WCAG AA
// contrast ratio (>= 4.5:1) on every option, even under the card's 12% white
// glass overlay.
export const CARD_COLORS: readonly CardColor[] = [
  { value: '#0040DD', label: 'Azul' },
  { value: '#3634A3', label: 'Índigo' },
  { value: '#8944AB', label: 'Morado' },
  { value: '#D30F45', label: 'Rosa' },
  { value: '#B33000', label: 'Naranja' },
  { value: '#1A6E2E', label: 'Verde' },
];

// Cards saved (locally or in Supabase) before the AA palette keep their old
// value; it is mapped to its accessible variant when displayed.
const LEGACY_COLORS: Readonly<Record<string, string>> = {
  '#007AFF': '#0040DD',
  '#5856D6': '#3634A3',
  '#AF52DE': '#8944AB',
  '#FF2D55': '#D30F45',
  '#FF9500': '#B33000',
  '#34C759': '#1A6E2E',
};

export function resolveCardColor(card: Pick<GiftCard, 'name' | 'color'> | null | undefined): string {
  if (card?.color) {
    return LEGACY_COLORS[card.color.toUpperCase()] ?? card.color;
  }

  const name = card?.name ?? '';
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return CARD_COLORS[Math.abs(hash) % CARD_COLORS.length].value;
}
