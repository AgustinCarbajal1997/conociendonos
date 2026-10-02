/**
 * Convierte docs/cartas.md (cinco tablas Markdown) a JSON en src/content/.
 * No inventa ni modifica texto: solo parsea y asigna ids estables por orden.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

const RAIZ = resolve(import.meta.dirname, '..');
const ORIGEN = resolve(RAIZ, 'docs/cartas.md');
const DESTINO = resolve(RAIZ, 'src/content');

type Nivel = 1 | 2 | 3;
type Audiencia = 'todos' | 'pareja' | 'familia';

interface DefCategoria { id: string; nombre: string; nivel: Nivel }
interface DefMazo {
  id: string;
  nombre: string;
  descripcion: string;
  color: string;
  audiencia: Audiencia;
  prefijo: string;
  categorias: DefCategoria[];
}

// Orden de categorías = orden de nivel ascendente dentro de cada mazo.
const MAZOS: DefMazo[] = [
  {
    id: 'desconocidos', nombre: 'Desconocidos', prefijo: 'de',
    descripcion: 'Para romper el hielo cuando no todos se conocen',
    color: '#1D6F65', audiencia: 'todos',
    categorias: [
      { id: 'rompehielo', nombre: 'Rompehielo', nivel: 1 },
      { id: 'primeras-impresiones', nombre: 'Primeras impresiones', nivel: 1 },
      { id: 'perspectiva', nombre: 'Perspectiva', nivel: 2 },
      { id: 'un-poco-mas', nombre: 'Un poco más', nivel: 3 },
    ],
  },
  {
    id: 'amigos', nombre: 'Amigos', prefijo: 'am',
    descripcion: 'Para reírse, debatir y decir lo que no se dice en el grupo',
    color: '#E9C46A', audiencia: 'todos',
    categorias: [
      { id: 'rompehielo', nombre: 'Rompehielo', nivel: 1 },
      { id: 'descomprimir', nombre: 'Descomprimir', nivel: 1 },
      { id: 'perspectiva', nombre: 'Perspectiva', nivel: 2 },
      { id: 'profundidad', nombre: 'Profundidad', nivel: 3 },
    ],
  },
  {
    id: 'pareja', nombre: 'Pareja', prefijo: 'pa',
    descripcion: 'Para que cada pareja se escuche frente a la mesa',
    color: '#B9432A', audiencia: 'pareja',
    categorias: [
      { id: 'rompehielo', nombre: 'Rompehielo', nivel: 1 },
      { id: 'historia', nombre: 'Nuestra historia', nivel: 2 },
      { id: 'perspectiva', nombre: 'Perspectiva', nivel: 2 },
      { id: 'profundidad', nombre: 'Profundidad', nivel: 3 },
    ],
  },
  {
    id: 'familia', nombre: 'Familia', prefijo: 'fa',
    descripcion: 'Para hablar entre generaciones de lo que se vive en casa',
    color: '#6B4FA0', audiencia: 'familia',
    categorias: [
      { id: 'rompehielo', nombre: 'Rompehielo', nivel: 1 },
      { id: 'raices', nombre: 'Raíces', nivel: 2 },
      { id: 'sobre-mi', nombre: 'Sobre mí', nivel: 2 },
      { id: 'profundidad', nombre: 'Profundidad', nivel: 3 },
    ],
  },
];

const ESPECIALES_IDS: Record<string, string> = {
  'Profundizá': 'profundiza',
  'Devolvé': 'devolve',
  'Elegí vos': 'elegi-vos',
  'Todos responden': 'todos-responden',
};

/** Devuelve { "Amigos": [[col1, col2], ...], ... } a partir de los títulos en negrita. */
function parsearTablas(md: string): Map<string, string[][]> {
  const tablas = new Map<string, string[][]>();
  let actual: string | null = null;
  for (const linea of md.split('\n')) {
    const titulo = linea.match(/^\*\*(.+?)\*\*\s*$/);
    if (titulo) {
      actual = titulo[1].trim();
      tablas.set(actual, []);
      continue;
    }
    if (!actual || !linea.startsWith('|')) continue;
    const celdas = linea.split('|').slice(1, -1).map((c) => c.trim());
    if (celdas.every((c) => /^-+$/.test(c))) continue; // separador
    if (tablas.get(actual)!.length === 0 && /^(categor[ií]a|carta)$/i.test(celdas[0])) continue; // cabecera
    tablas.get(actual)!.push(celdas);
  }
  return tablas;
}

function normalizar(s: string) {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
}

function main() {
  const md = readFileSync(ORIGEN, 'utf8');
  const tablas = parsearTablas(md);
  mkdirSync(DESTINO, { recursive: true });

  let total = 0;
  for (const def of MAZOS) {
    const filas = tablas.get(def.nombre);
    if (!filas) throw new Error(`No encontré la tabla **${def.nombre}** en docs/cartas.md`);
    const porNombre = new Map(def.categorias.map((c) => [normalizar(c.nombre), c.id]));
    const cartas = filas.map(([categoria, texto], i) => {
      const cat = porNombre.get(normalizar(categoria));
      if (!cat) throw new Error(`Categoría desconocida "${categoria}" en mazo ${def.nombre} (fila ${i + 1})`);
      if (!texto) throw new Error(`Pregunta vacía en mazo ${def.nombre} (fila ${i + 1})`);
      return { id: `${def.prefijo}-${String(i + 1).padStart(3, '0')}`, cat, texto };
    });
    const { prefijo: _p, ...resto } = def;
    const mazo = { ...resto, cartas };
    writeFileSync(resolve(DESTINO, `${def.id}.json`), JSON.stringify(mazo, null, 2) + '\n');
    total += cartas.length;
    console.log(`${def.id}.json: ${cartas.length} cartas`);
  }

  const filasEsp = tablas.get('Especiales');
  if (!filasEsp) throw new Error('No encontré la tabla **Especiales** en docs/cartas.md');
  const especiales = filasEsp.map(([nombre, texto]) => {
    const id = ESPECIALES_IDS[nombre];
    if (!id) throw new Error(`Carta especial desconocida "${nombre}"`);
    return { id, nombre, texto };
  });
  writeFileSync(resolve(DESTINO, 'especiales.json'), JSON.stringify(especiales, null, 2) + '\n');
  console.log(`especiales.json: ${especiales.length} cartas`);
  console.log(`Total: ${total} cartas + ${especiales.length} especiales`);
}

main();
