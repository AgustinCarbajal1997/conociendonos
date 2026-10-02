# Prompt para Claude Design: Sale a la Luz

Pegá todo lo que sigue en Claude Design. Si tiene un campo de "contexto" o adjuntos, sumá `public/icono.svg` (el logo actual, como punto de partida) y capturas de la app actual si querés que vea qué NO te gusta.

---

Diseñá la interfaz completa de **Sale a la Luz**, una web app móvil de cartas de conversación. Quiero un diseño moderno y estético, con identidad propia, que se sienta como un objeto lindo sobre la mesa y no como un formulario.

## Qué es la app

Un juego de cartas de conversación (estilo En Palabras / Cartas Salvajes) para una noche con amigos, parejas y familia alrededor de **un solo celular que pasa de mano**. No hay puntos ni ganadores: la pantalla muestra una pregunta y dice a quién le toca responder. Esa persona la lee en voz alta, responde o pasa, y toca "Siguiente". El resto escucha.

Contexto de uso real, que condiciona todo:
- Se juega **de noche, con poca luz**, en una mesa. El celular queda parado en el centro o pasa de mano.
- La pregunta se lee **desde medio metro, de pie o inclinado**: tipografía grande, contraste alto.
- **Cero fricción**: de abrir la web a la primera pregunta, dos toques.
- **El celular no es el protagonista**: nada de timers, puntajes, confetti ni notificaciones. La interfaz tiene que ser calma y dejar que la charla sea lo importante.
- Es una PWA en vertical. Modo oscuro por defecto (el único que hace falta diseñar).

## Nombre, concepto y logo

El nombre es **Sale a la Luz**: lo que no se dice, sale a la luz cuando alguien hace la pregunta correcta. La metáfora visual es **algo que se ilumina o asoma**: un sol que sale detrás de una carta, un haz de luz en la oscuridad, una ventana que se abre.

Necesito:
1. **Logo / ícono de app** (cuadrado, con versión maskable para PWA: contenido importante dentro del 80% central). Hoy tengo un boceto: un sol con degradé ámbar-coral que asoma detrás de una carta oscura con dos líneas de texto. Podés mejorarlo o proponer otra cosa, pero que siga la idea de "luz que sale".
2. **Wordmark** "Sale a la Luz" para la pantalla de inicio, que combine con el ícono.
3. Una versión monocroma del ícono para usar chica (favicon, encabezados).

## Dirección estética

Moderno, cálido y nocturno. Pensá en una revista editorial de noche más que en una app de productividad. Referencias de tono: la paleta de una vela encendida en un cuarto oscuro; carteles tipográficos; las cartas físicas de buen papel.

- **Fondo**: casi negro con un tinte (no gris neutro). Puede tener textura o grano muy sutil, o un degradé radial apenas perceptible que sugiera una luz.
- **Acento principal**: ámbar / dorado cálido (luz). Un secundario coral para lo emocional. Evitá azules fríos y el violeta genérico de "app de IA".
- **Tipografía**: una display con carácter para las preguntas y los títulos (serif moderna o sans geométrica con personalidad; elegí una y justificala) y una sans limpia para la UI. La pregunta en la carta va en **28 a 36 px**, máximo 20 palabras, hasta 4 líneas. Tiene que verse espectacular en ese tamaño.
- **Cartas**: son el elemento central. Cada mazo tiene un color propio y la carta ocupa casi toda la pantalla. Quiero que se sientan como cartas físicas: bordes, proporción, quizás un relieve o un borde interior fino, pero sin skeumorfismo pesado. Nada de sombras exageradas.
- **Movimiento**: la carta "se da vuelta" en 250 ms al pasar a la siguiente. Describí la transición y, si podés, la micro-interacción de "mantener apretado para favorita" (un corazón o una luz que crece).
- Botones mínimos de 48 px de alto, radio generoso, sin bordes de 1 px grises de formulario.

Si querés proponer **dos variantes** de dirección (por ejemplo, una más editorial-serif y otra más gráfica-geométrica), hacelo en la pantalla de la carta y elegimos una antes de hacer el resto.

## Mazos y colores

Cuatro mazos. Cada uno necesita un color de fondo de carta sobre el que el texto (claro u oscuro, elegí) pase contraste **AA 4.5:1**, más una versión del color para usar como chip o acento sobre el fondo oscuro de la app.

| Mazo | Para qué | Tono sugerido |
|---|---|---|
| Desconocidos | romper el hielo con gente que recién se conoce | fresco pero cálido, verde azulado profundo |
| Amigos | reírse, debatir, decir lo que no se dice en el grupo | ámbar / mostaza |
| Pareja | cada pareja se escucha frente a la mesa | coral / terracota |
| Familia | entre generaciones, lo que se vive en casa | ciruela / vino |

Más un quinto estilo para las **cartas especiales** (Profundizá, Devolvé, Elegí vos, Todos responden), que tienen que verse claramente distintas: por ejemplo fondo oscuro con borde de luz, o degradé.

Cada mazo tiene 4 categorías con nivel de profundidad 1, 2 o 3 (de liviano a profundo). En la carta se muestra "Mazo · Categoría" como etiqueta chica arriba. Si se te ocurre una forma sutil de mostrar el nivel (tres puntos, una barra, intensidad del color), bienvenida.

## Pantallas a diseñar (390 × 844, iPhone 15 como referencia, con safe areas)

1. **Inicio**: logo + wordmark, una línea de qué es ("Cartas de conversación para una noche con amigos, parejas y familia. Un celular en el centro, una pregunta por pantalla."), botón principal "Armar la noche", secundario "Jugar un mazo suelto", link "Cómo se juega". Si hay una partida abierta, aparece "Seguir la noche en curso". Puede mostrar "6 jugadores cargados".

2. **Jugadores**: título "¿Quiénes están en la mesa?", campo para agregar nombre con botón +, lista de jugadores donde cada uno tiene: nombre editable, selector "Pareja de…" (los otros nombres) y un switch "Familia", y una × para quitarlo. Pie: "6 en la mesa · 2 parejas · 2 de la familia" y botón "Continuar". Diseñá el estado vacío (sin jugadores: el botón dice "Jugar sin cargar jugadores").

3. **Configuración**: hoja inferior (bottom sheet) sobre Jugadores. Dos variantes:
   - *Noche*: lista de 5 bloques reordenables por drag (Rompehielo para todos · Amigos · Parejas · Familia · Profundidad para todos), con subtítulo en cada uno y un estado "Se salta: no hay parejas cargadas" atenuado; stepper "Cartas por bloque" (−  10  +).
   - *Mazo suelto*: selector de mazo (4 opciones con su color), chips de categoría con "nivel 1/2/3" que se activan y desactivan, selector de modo (Progresivo / Mezclado / Por categoría, cada uno con una línea de explicación).
   - Comunes a ambas: switches "Cartas especiales", "Pasar", "Sin repetir entre noches" (con subtítulo "37 cartas ya vistas en este celular" y link "Reiniciar historial"), selector de tamaño de letra (3 pasos), botón "Empezar · 50 cartas".

4. **Carta** (la pantalla más importante; diseñala primero):
   - Arriba: "Terminar" a la izquierda, contador "Bloque 2 · 4/10" a la derecha, discretos.
   - La carta ocupa el centro: etiqueta "Amigos · Perspectiva", nombre de quien responde ("Ana", "Ana y Juan", "Todos" o "Quien tenga el celular"), opcional una nota chica ("Se lee de uno al otro; la mesa escucha"), y la pregunta grande. Ejemplo: "¿Qué te gustaría que este grupo supiera de vos y nunca contaste?"
   - Abajo: "Pasar · 1/2", botón de favorita (corazón) y "Siguiente" como acción principal.
   - Estados: carta normal; carta marcada como favorita; carta especial (ej. "Profundizá: Quien respondió la última carta cuenta un poco más. El resto puede hacerle una pregunta."); carta de Pareja (dos nombres); carta sin pases disponibles; toast breve "Favorita ♥".
   - Gestos que hay que insinuar sin tutorial: deslizar a la izquierda = siguiente, a la derecha = pasar, mantener apretado = favorita.

5. **Transición de bloque**: pantalla completa a color que aparece entre bloques. "Bloque 3 de 5 · Ahora, las parejas · Cada pareja responde frente a la mesa" y un botón "Dale". Tiene que sentirse como un respiro, no como un modal.

6. **Selector de categoría**: pantalla a color del mazo con "¿Qué categoría va ahora?", quién elige, y 4 botones grandes con nombre y nivel. Se usa en el modo "por categoría" y después de la carta especial "Elegí vos".

7. **Resumen**: "Así estuvo la noche", dos cifras grandes (21 cartas jugadas · 2 h 10 min de charla), lista de favoritas con el color del mazo y botón "Copiar", "Quedan 30 cartas sin salir", botones "Seguir jugando" y "Nueva noche". Estado sin favoritas.

8. **Cómo se juega**: texto corto en secciones, con los 4 mazos como tarjetas de color.

## Entregables

- Logo: ícono (512 px, con y sin fondo, versión maskable), wordmark, versión monocroma. Preferentemente en SVG.
- **Tokens de diseño** en formato listo para CSS variables: colores (fondo, superficies, texto, acento, 4 mazos con su color de carta y color de chip, especial), tipografías (familias, tamaños, pesos, interlineado), radios, espaciado, sombras. Lo voy a implementar en React + Tailwind v4, así que los valores concretos en hex y px me sirven más que descripciones.
- Las 8 pantallas con sus estados, en vertical 390 × 844.
- Especificación de componentes: botón primario/secundario/fantasma, switch, chip de categoría, fila de jugador, carta, bottom sheet, toast.
- Una nota corta de motion: transición de carta (250 ms), aparición de la hoja inferior, feedback de mantener apretado.

## Restricciones no negociables

- Solo modo oscuro.
- Contraste AA en todo texto sobre todos los fondos (incluidos los 4 colores de mazo).
- La pantalla de la carta no tiene scroll; todo entra en 390 × 844 con la pregunta más larga (20 palabras) en el tamaño de letra grande (36 px).
- Áreas táctiles de 48 px mínimo.
- Español rioplatense en todos los textos (voseo: "Elegí", "Tocá", "Dale").
- Nada de ilustraciones de personas ni emojis como elemento de diseño. Íconos lineales simples si hacen falta.
