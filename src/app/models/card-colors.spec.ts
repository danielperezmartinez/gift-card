import { describe, expect, it } from 'vitest';
import { CARD_COLORS, resolveCardColor } from './card-colors';

function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

describe('card colors', () => {
  it('keeps AA contrast for white text on every palette color, also under the 12% glass', () => {
    for (const { value } of CARD_COLORS) {
      const glass = '#' + [1, 3, 5]
        .map((i) => Math.round(parseInt(value.slice(i, i + 2), 16) * 0.88 + 255 * 0.12))
        .map((c) => c.toString(16).padStart(2, '0'))
        .join('');
      expect(1.05 / (luminance(value) + 0.05)).toBeGreaterThanOrEqual(4.5);
      expect(1.05 / (luminance(glass) + 0.05)).toBeGreaterThanOrEqual(4.5);
    }
  });

  it('maps legacy colors to their accessible variant', () => {
    expect(resolveCardColor({ name: 'x', color: '#FF9500' })).toBe('#B33000');
    expect(resolveCardColor({ name: 'x', color: '#34c759' })).toBe('#1A6E2E');
  });

  it('keeps a palette color and derives one from the name when unset', () => {
    expect(resolveCardColor({ name: 'x', color: '#3634A3' })).toBe('#3634A3');
    const derived = resolveCardColor({ name: 'Amazon' });
    expect(CARD_COLORS.map((c) => c.value)).toContain(derived);
  });
});
