# Sale a la Luz

Juego de cartas de conversación (estilo *En Palabras*) para una noche con amigos, parejas y familia alrededor de un solo celular que pasa de mano. No hay puntos ni ganadores: la web muestra una pregunta por pantalla y dice a quién le toca responder.

- 160 cartas propias en 4 mazos (Desconocidos, Amigos, Pareja, Familia) × 4 categorías, más 4 cartas especiales.
- Modo **Noche**: arma sola la secuencia rompehielo → amigos → parejas → familia → profundidad.
- Mazo suelto en modo progresivo, mezclado o por categoría.
- PWA: funciona sin señal después de la primera carga. Sin cuenta, sin backend.

## Correr

```bash
pnpm install
pnpm dev        # http://localhost:5173 (también accesible desde el celular en la misma red)
```

## Testear

```bash
pnpm test       # valida las cartas y corre los tests del engine (Vitest)
pnpm typecheck  # tsc
```

## Cartas

La fuente de verdad es [`docs/cartas.md`](docs/cartas.md): cinco tablas Markdown con columnas `Categoría | Pregunta` (la de Especiales usa `Carta | Texto en pantalla`). Para cambiar una carta, editá ese archivo y corré:

```bash
pnpm importar   # genera src/content/{desconocidos,amigos,pareja,familia,especiales}.json
pnpm validar    # ids únicos, categorías válidas, máximo 140 caracteres
```

Los ids se asignan por orden dentro de cada mazo (`am-001`, `pa-031`, etc.). Si reordenás filas, cambian los ids y el historial "sin repetir" de los celulares deja de coincidir con esas cartas; no es grave, solo se vuelven a mostrar.

## Desplegar

Es una SPA estática: la salida de `pnpm build` (carpeta `dist/`) se sirve desde cualquier hosting.

- **Vercel**: importar el repo; detecta Vite solo. Build `pnpm build`, output `dist`.
- **GitHub Pages**: `BASE_PATH=/nombre-del-repo/ pnpm build` y publicar `dist/`. El `base` de Vite y el `start_url` del manifest salen de esa variable.

Probar el build localmente (incluye el service worker):

```bash
pnpm build && pnpm preview
```

Para probar offline: abrir la web una vez, activar modo avión y recargar.

## Arquitectura

```
docs/cartas.md          fuente de las cartas
scripts/                importar-cartas.ts, validar-cartas.ts
src/content/            JSON de los mazos + index.ts que los expone tipados
src/engine/             funciones puras, sin React, testeadas con Vitest
  armar.ts              armarNoche, armarCola, intercalarEspeciales, limpiarHistorialAgotado
  partida.ts            crearPartida, siguiente, pasar, quienResponde, toggleFavorita, progresoBloque
  jugadores.ts          parejas, familiares, vincularPareja, nombreQuien
src/store/              Zustand con persist parcial en localStorage
src/screens/            Inicio, Jugadores, Configuracion, PantallaCarta, Resumen, ComoSeJuega
src/components/         Carta, Transicion, SelectorCategoria, SelectorModo, ListaReordenable, Switch, Boton
src/hooks/              useWakeLock, useMantenerApretado
```

## Decisiones que no estaban en el brief

- **La partida también se persiste** (no solo jugadores, historial y favoritas): si el celular recarga la página a mitad de la noche, se vuelve a la misma carta. "Seguir la noche en curso" aparece en Inicio cuando hay una partida abierta.
- **Reparto dentro de un bloque**: cuando un bloque mezcla niveles (Amigos 1 y 2, Pareja y Familia 1-2-3) se eligen cartas de cada nivel en partes iguales (round-robin) y después se ordenan por nivel ascendente, al azar dentro de cada nivel. Con 10 cartas y 3 niveles salen 4/3/3.
- **Sin repetir** prefiere cartas no vistas pero completa con vistas si no alcanzan; cuando un mazo se agota, su historial se borra solo al armar la próxima partida. El botón "Reiniciar historial" está en Configuración.
- **Pasar** cuenta por jugador o por pareja (máximo 2). Si no hay jugadores cargados ("Quien tenga el celular") o la carta es para todos, no hay límite. Las cartas especiales no se pueden pasar. Con el toggle apagado, no se puede pasar.
- **Cartas de pareja o familia sin parejas/familia cargadas** (solo posible en mazo suelto) rotan entre todos los jugadores.
- **Especiales**: no se intercalan en modo "por categoría" (la cola no es una secuencia). "Elegí vos" abre un selector de categorías del mazo que viene; si la categoría elegida no está en la cola, trae una carta nueva de esa categoría no vista en la noche. Nunca salen dos especiales iguales seguidas ni una especial como última carta.
- **"Todos responden"** no consume turno: la rotación sigue donde estaba en la carta siguiente.
- **Contador** "Bloque 2 · 4/10" cuenta solo cartas regulares; las especiales no suman.
- **Colores de mazo** ajustados para contraste AA (≥ 4.5:1) con el texto que se elige automáticamente por luminancia (`src/lib/color.ts`, con test). Amigos usa fondo claro con texto oscuro; los demás, fondo oscuro con texto claro.
- **Transición de nivel** en modo progresivo: "Para empezar" → "Vamos un poco más profundo" → "Lo que no se dice".
- **Reordenar bloques**: drag con pointer events (funciona en touch) y botones ↑↓ como alternativa accesible.
- **Tamaño de letra**: la pregunta va en 28 / 32 / 36 px según el paso elegido.
- Sin librería de routing: las pantallas se manejan con un campo `pantalla` en el store.
- Íconos PWA generados desde `public/icono.svg` con `qlmanage` (macOS); si cambiás el SVG, regenerá los PNG de 192, 512 y 180 px.

## Antes de la noche

- [ ] Leer `docs/cartas.md` y sacar o cambiar las que no van con esta mesa.
- [ ] Jugar una partida de prueba en el celular con jugadores ficticios.
- [ ] Probar sin señal: modo avión y abrir la web.
- [ ] Cargar los jugadores reales antes de que llegue la gente (quedan guardados en el celular).
- [ ] Celular cargado y un soporte para dejarlo parado en el centro de la mesa.
