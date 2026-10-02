/**
 * Falla (exit 1) si hay ids duplicados, categorías inválidas, niveles fuera de 1..3,
 * preguntas vacías o de más de 140 caracteres. Se corre en `pnpm test`.
 */
import { readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';

const DIR = resolve(import.meta.dirname, '../src/content');
const MAX = 140;
const AUDIENCIAS = new Set(['todos', 'pareja', 'familia']);

const errores: string[] = [];
const idsGlobales = new Set<string>();

function registrarId(id: string, origen: string) {
  if (idsGlobales.has(id)) errores.push(`${origen}: id duplicado "${id}"`);
  idsGlobales.add(id);
}

const archivos = readdirSync(DIR).filter((f) => f.endsWith('.json'));
if (archivos.length === 0) errores.push('No hay JSON en src/content. Corré `pnpm importar`.');

let totalCartas = 0;
for (const archivo of archivos) {
  const json = JSON.parse(readFileSync(resolve(DIR, archivo), 'utf8'));
  if (archivo === 'especiales.json') {
    if (!Array.isArray(json)) { errores.push('especiales.json debe ser un array'); continue; }
    for (const c of json) {
      registrarId(c.id, archivo);
      if (!c.nombre) errores.push(`${archivo}: ${c.id} sin nombre`);
      if (!c.texto?.trim()) errores.push(`${archivo}: ${c.id} sin texto`);
      if (c.texto?.length > MAX) errores.push(`${archivo}: ${c.id} supera ${MAX} caracteres (${c.texto.length})`);
    }
    continue;
  }
  if (!json.id || json.id !== archivo.replace('.json', '')) errores.push(`${archivo}: id del mazo no coincide con el nombre del archivo`);
  if (!AUDIENCIAS.has(json.audiencia)) errores.push(`${archivo}: audiencia inválida "${json.audiencia}"`);
  if (!/^#[0-9a-fA-F]{6}$/.test(json.color ?? '')) errores.push(`${archivo}: color inválido "${json.color}"`);
  const cats = new Map<string, number>();
  for (const cat of json.categorias ?? []) {
    if (cats.has(cat.id)) errores.push(`${archivo}: categoría duplicada "${cat.id}"`);
    if (![1, 2, 3].includes(cat.nivel)) errores.push(`${archivo}: nivel inválido en "${cat.id}" (${cat.nivel})`);
    cats.set(cat.id, 0);
  }
  for (const c of json.cartas ?? []) {
    registrarId(c.id, archivo);
    if (!cats.has(c.cat)) errores.push(`${archivo}: ${c.id} usa categoría inválida "${c.cat}"`);
    else cats.set(c.cat, cats.get(c.cat)! + 1);
    if (!c.texto?.trim()) errores.push(`${archivo}: ${c.id} sin texto`);
    if (c.texto?.length > MAX) errores.push(`${archivo}: ${c.id} supera ${MAX} caracteres (${c.texto.length}): "${c.texto}"`);
    totalCartas++;
  }
  for (const [cat, n] of cats) if (n === 0) errores.push(`${archivo}: la categoría "${cat}" no tiene cartas`);
}

if (errores.length) {
  console.error(`✗ ${errores.length} problema(s) en las cartas:`);
  for (const e of errores) console.error('  - ' + e);
  process.exit(1);
}
console.log(`✓ Cartas válidas: ${totalCartas} cartas en ${archivos.length - 1} mazos, ${idsGlobales.size - totalCartas} especiales`);
