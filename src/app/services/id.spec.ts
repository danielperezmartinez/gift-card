import { afterEach, describe, expect, it, vi } from 'vitest';
import { generateId } from './id';

const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

describe('generateId', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('returns a v4 UUID', () => {
    expect(generateId()).toMatch(UUID_V4);
  });

  it('falls back to getRandomValues without randomUUID and never uses Math.random', () => {
    const realCrypto = globalThis.crypto;
    vi.stubGlobal('crypto', {
      getRandomValues: <T extends ArrayBufferView>(array: T) => realCrypto.getRandomValues(array),
    });
    const mathRandom = vi.spyOn(Math, 'random');

    const ids = new Set(Array.from({ length: 50 }, () => generateId()));

    expect([...ids].every((id) => UUID_V4.test(id))).toBe(true);
    expect(ids.size).toBe(50);
    expect(mathRandom).not.toHaveBeenCalled();
  });
});
