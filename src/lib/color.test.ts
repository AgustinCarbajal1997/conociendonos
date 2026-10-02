import { describe, it, expect } from 'vitest';
import { LISTA_MAZOS } from '../content';
import { contraste, textoSobre } from './color';

describe('contraste AA sobre los fondos de mazo', () => {
  for (const mazo of LISTA_MAZOS) {
    it(`${mazo.nombre} (${mazo.color}) ≥ 4.5:1`, () => {
      expect(contraste(mazo.color, textoSobre(mazo.color))).toBeGreaterThanOrEqual(4.5);
    });
  }
  it('especiales (#2B2B2B) con texto claro ≥ 4.5:1', () => {
    expect(contraste('#2B2B2B', textoSobre('#2B2B2B'))).toBeGreaterThanOrEqual(4.5);
  });
});
