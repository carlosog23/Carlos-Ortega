/* © 2026 Mtro. Carlos Gabriel Ortega Gutiérrez · Tlamatini Aula Preescolar.
   Banco de juegos, cantos y actividades para PREESCOLAR (Fase 2, Plan de Estudio 2022).
   Escala de grados de la app: 11 = 1.° de preescolar, 12 = 2.°, 13 = 3.°
   campos: L Lenguajes · S Saberes y pensamiento científico · E Ética, naturaleza y sociedades · H De lo humano y lo comunitario */
"use strict";
DINAMICAS.push(
  /* ---------- inicio y saberes previos ---------- */
  { id: "pre-caja-sorpresa", n: "La caja sorpresa", cat: "inicio", campos: ["L", "S", "E", "H"], g: [11, 13], min: 10, esp: "aula", mat: "Una caja o bolsa con un objeto relacionado con el tema",
    prop: "Despertar la curiosidad y recuperar lo que ya saben antes de iniciar el proyecto.", pasos: ["Siente al grupo en semicírculo y muestre la caja cerrada.", "Dé pistas: «es suave», «vive en el agua», «lo usamos para comer».", "Cada niña o niño dice qué cree que es; anote o dibuje sus ideas en un pliego.", "Abra la caja, muestren el objeto y pregunte: ¿qué sabemos de esto?, ¿qué nos gustaría saber?"],
    var: "Que lo toquen con los ojos cerrados antes de adivinar.", multi: "Los de 3.° dan las pistas a los más pequeños." },
  { id: "pre-asamblea", n: "Asamblea de la mañana", cat: "inicio", campos: ["L", "E", "H"], g: [11, 13], min: 15, esp: "aula", mat: "Tapete o sillas en círculo, calendario ilustrado",
    prop: "Iniciar el día con un espacio para conversar, escuchar y acordar lo que se hará.", pasos: ["Saluden con una canción conocida.", "Revisen juntos el día, el clima y quién vino (cuenten a las niñas y a los niños).", "Cada quien que lo desee comparte algo que le pasó; los demás escuchan y esperan su turno.", "Platique lo que harán hoy con imágenes del plan del día."],
    var: "Use un objeto para hablar: solo habla quien lo tiene.", multi: "" },
  { id: "pre-que-veo", n: "¿Qué ves en la imagen?", cat: "inicio", campos: ["L", "S", "E"], g: [11, 13], min: 10, esp: "aula", mat: "Una lámina o imagen grande (Láminas de diálogo del libro de texto)",
    prop: "Observar, describir y hacer preguntas a partir de una imagen.", pasos: ["Muestre la lámina en silencio unos segundos.", "Pregunte: ¿qué ves?, ¿qué está pasando?, ¿qué crees que pase después?", "Repita y amplíe lo que dicen con palabras nuevas.", "Termine preguntando qué les gustaría descubrir del tema."],
    var: "Tape una parte de la imagen y que imaginen qué hay.", multi: "" },
  { id: "pre-cancion-tema", n: "Canción del tema", cat: "inicio", campos: ["L", "H"], g: [11, 13], min: 8, esp: "ambos", mat: "Ninguno (o grabadora)",
    prop: "Abrir el tema con una canción con movimientos que se repetirá en todo el proyecto.", pasos: ["Elija o invente una canción corta sobre el tema (los animales, el agua, la familia).", "Cántela con movimientos y pida que la imiten.", "Repítanla dos o tres veces subiendo y bajando la velocidad.", "Pregunte qué palabras de la canción conocen y cuáles no."],
    var: "Que las niñas y los niños inventen un nuevo verso.", multi: "" },

  /* ---------- integración y confianza ---------- */
  { id: "pre-telarana-nombres", n: "La telaraña de los nombres", cat: "integracion", campos: ["H", "L"], g: [11, 13], min: 12, esp: "aula", mat: "Bola de estambre",
    prop: "Aprender los nombres del grupo y sentirse parte de él.", pasos: ["Sentados en círculo, la docente dice su nombre y algo que le gusta, y lanza el estambre sin soltar la punta.", "Quien lo recibe dice su nombre y lo que le gusta, y lo lanza a otra persona.", "Al final observan la telaraña que formaron juntos.", "Para deshacerla, cada quien dice el nombre de quien le lanzó el estambre."],
    var: "En 3.° pueden decir también el nombre de un familiar.", multi: "Los más grandes ayudan a lanzar a los pequeños." },
  { id: "pre-espejo", n: "El espejo", cat: "integracion", campos: ["H"], g: [11, 13], min: 8, esp: "ambos", mat: "Ninguno",
    prop: "Fortalecer la atención, la confianza y el trabajo en pareja.", pasos: ["En parejas, de frente.", "Uno hace movimientos lentos y el otro los imita como si fuera un espejo.", "Cambian de papel.", "Al final comentan si fue fácil o difícil seguir al compañero."],
    var: "Agreguen gestos de emociones: feliz, triste, sorprendido.", multi: "" },
  { id: "pre-tren-amigos", n: "El tren de los amigos", cat: "integracion", campos: ["H", "E"], g: [11, 13], min: 10, esp: "patio", mat: "Música",
    prop: "Convivir y moverse juntos siguiendo acuerdos.", pasos: ["La docente es la locomotora y avanza por el patio con la música.", "Cuando la música para, invita a un niño a subir al tren, quien se toma de su cintura.", "Quien sube se presenta y se vuelve la nueva locomotora.", "Sigan hasta que todos formen el tren."],
    var: "El tren hace paradas en estaciones: saltar, aplaudir, agacharse.", multi: "" },

  /* ---------- pausas activas ---------- */
  { id: "pre-estatuas", n: "Las estatuas de marfil", cat: "pausa", campos: ["H"], g: [11, 13], min: 5, esp: "ambos", mat: "Ninguno",
    prop: "Mover el cuerpo y practicar el control del movimiento.", pasos: ["Canten «A las estatuas de marfil, uno, dos y tres así».", "Al terminar, todos se quedan quietos como estatuas.", "La docente busca quién se mueve, con humor y sin eliminar a nadie.", "Repitan pidiendo estatuas de animales o de emociones."],
    var: "Estatuas en un pie o con los ojos cerrados (3.°).", multi: "" },
  { id: "pre-semaforo", n: "El semáforo", cat: "pausa", campos: ["H", "E"], g: [11, 13], min: 6, esp: "patio", mat: "Tres círculos de papel: verde, amarillo y rojo",
    prop: "Desplazarse con control y aprender una medida de seguridad vial.", pasos: ["Verde: caminan o corren por el espacio.", "Amarillo: caminan muy despacio.", "Rojo: se detienen.", "Platiquen para qué sirve el semáforo en la calle."],
    var: "Agreguen un color nuevo con una acción inventada por el grupo.", multi: "" },
  { id: "pre-respira-globo", n: "Respiro como globo", cat: "pausa", campos: ["H"], g: [11, 13], min: 3, esp: "aula", mat: "Ninguno",
    prop: "Regresar a la calma después de jugar o de una situación de enojo.", pasos: ["Pongan las manos en la panza.", "Inhalen despacio por la nariz mientras la panza se infla como globo.", "Suelten el aire despacio por la boca, como globo que se desinfla.", "Repitan cinco veces y pregunte cómo se sienten."],
    var: "Soplen una pluma o un papelito sin que se caiga.", multi: "" },
  { id: "pre-congelados", n: "Bailar y congelarse", cat: "pausa", campos: ["H", "L"], g: [11, 13], min: 5, esp: "ambos", mat: "Música",
    prop: "Expresarse con el cuerpo al ritmo de la música y atender una señal.", pasos: ["Con música, bailan libremente.", "Al pausar la música, se congelan en una postura.", "Pida posturas: grande, pequeña, alta, baja, de un animal.", "Cambien el ritmo de la música: lento y rápido."],
    var: "Usen pañuelos o listones al bailar.", multi: "" },

  /* ---------- números, formas y medida ---------- */
  { id: "pre-tienda", n: "La tiendita", cat: "mate", campos: ["S", "E"], g: [11, 13], min: 25, esp: "aula", mat: "Empaques vacíos, monedas de juguete o fichas, etiquetas de precio",
    prop: "Contar, comparar cantidades y usar los números en una situación de la vida diaria.", pasos: ["Monten la tiendita con productos y precios sencillos (1 a 5 fichas; hasta 10 en 3.°).", "Unos son vendedores y otros compradores, con una lista dibujada.", "Pagan contando las fichas; el vendedor revisa si alcanza.", "Al final cuenten cuántos productos vendió cada puesto."],
    var: "En 3.°: den cambio con fichas.", multi: "Los de 1.° compran un producto; los de 3.° hacen la cuenta." },
  { id: "pre-cuantos-hay", n: "¿Cuántos hay?", cat: "mate", campos: ["S"], g: [11, 13], min: 10, esp: "aula", mat: "Tapas, semillas o piedritas; vasos",
    prop: "Contar colecciones y comparar dónde hay más, menos o igual.", pasos: ["Ponga en dos vasos distinta cantidad de tapas.", "Pregunte: ¿dónde hay más? Primero lo estiman a ojo.", "Saquen las tapas y cuéntenlas juntos señalando cada una.", "Comparen formando dos filas una frente a otra."],
    var: "Lancen un dado y tomen esa cantidad de tapas.", multi: "" },
  { id: "pre-figuras-cuerpo", n: "Figuras con el cuerpo y la cuerda", cat: "mate", campos: ["S", "H"], g: [11, 13], min: 15, esp: "patio", mat: "Cuerda larga o gis",
    prop: "Reconocer y formar figuras geométricas en el espacio.", pasos: ["Con la cuerda o el gis, entre todos forman un círculo, un cuadrado y un triángulo.", "Caminan sobre el contorno de cada figura.", "Cuenten los lados y las esquinas.", "Busquen esas figuras en objetos del patio."],
    var: "Formen figuras acostados en el piso, en equipos.", multi: "" },
  { id: "pre-largo-corto", n: "¿Más largo o más corto?", cat: "mate", campos: ["S"], g: [11, 13], min: 15, esp: "aula", mat: "Listones, tiras de papel, objetos del salón",
    prop: "Comparar longitudes de manera directa y con un intermediario.", pasos: ["Reparta una tira a cada quien.", "Busquen en el salón objetos más largos y más cortos que su tira.", "Agrúpenlos en dos cajas: más largos y más cortos.", "En 3.°: midan la mesa con su tira y cuenten cuántas tiras mide."],
    var: "Comparen su estatura poniéndose espalda con espalda.", multi: "" },
  { id: "pre-patrones", n: "Collares de patrones", cat: "mate", campos: ["S", "L"], g: [12, 13], min: 20, esp: "aula", mat: "Popotes de colores cortados, sopa de pasta o cuentas; estambre",
    prop: "Reconocer y continuar secuencias (patrones) de color o forma.", pasos: ["Muestre un collar con patrón: rojo, azul, rojo, azul.", "Pregunte qué sigue y por qué.", "Cada quien hace su collar siguiendo un patrón que elija.", "Un compañero dice cuál es el patrón del collar del otro."],
    var: "Patrones con sonidos: palmada, palmada, pisotón.", multi: "" },

  /* ---------- lenguaje y lectura ---------- */
  { id: "pre-cuento-dramatizado", n: "Cuento actuado", cat: "lengua", campos: ["L", "H"], g: [11, 13], min: 20, esp: "aula", mat: "Un cuento, accesorios sencillos (paliacates, sombreros)",
    prop: "Escuchar con atención, comprender una historia y narrarla con el cuerpo.", pasos: ["Lea el cuento con voces distintas para cada personaje.", "Pregunte quiénes aparecen, qué pasó primero, después y al final.", "Reparta personajes y actúenlo mientras usted narra.", "Comenten qué otro final podría tener."],
    var: "Inventen el cuento con títeres de calcetín.", multi: "Los de 3.° narran y los de 1.° actúan." },
  { id: "pre-rimas", n: "Juego de rimas", cat: "lengua", campos: ["L"], g: [12, 13], min: 10, esp: "aula", mat: "Tarjetas con imágenes (gato-pato, ratón-botón)",
    prop: "Jugar con los sonidos de las palabras y descubrir cuáles terminan igual.", pasos: ["Diga una palabra y pregunte qué otra suena igual al final.", "Muestre tarjetas y formen parejas que riman.", "Inventen juntos una rima corta con sus nombres.", "Repítanla con palmadas."],
    var: "Usen trabalenguas y adivinanzas de la comunidad.", multi: "" },
  { id: "pre-mi-nombre", n: "Mi nombre es especial", cat: "lengua", campos: ["L", "H"], g: [11, 13], min: 15, esp: "aula", mat: "Tarjetas con el nombre de cada niña y niño",
    prop: "Reconocer su nombre escrito y compararlo con otros.", pasos: ["Coloque las tarjetas de nombres en el piso.", "Cada quien busca la suya y la muestra al grupo.", "Comparen: ¿qué nombre es más largo?, ¿cuáles empiezan igual que el tuyo?", "Usen la tarjeta para marcar su asistencia o sus trabajos."],
    var: "En 3.°: copian su nombre en sus producciones.", multi: "" },
  { id: "pre-cartas-familia", n: "Una carta para mi familia", cat: "lengua", campos: ["L", "E", "H"], g: [12, 13], min: 25, esp: "aula", mat: "Hojas, crayones, sobres",
    prop: "Producir un mensaje con un destinatario real, a su manera.", pasos: ["Platiquen qué es una carta y para qué sirve.", "Cada quien decide qué le quiere decir a alguien de su familia.", "Lo dibujan y escriben como pueden; la docente transcribe abajo lo que dicen.", "Lo meten en un sobre con el nombre del destinatario y lo llevan a casa."],
    var: "Una carta del grupo a otro salón.", multi: "" },
  { id: "pre-biblioteca", n: "Visita a la biblioteca del aula", cat: "lengua", campos: ["L"], g: [11, 13], min: 20, esp: "aula", mat: "Libros del rincón, tapete",
    prop: "Explorar libros con libertad y compartir lo que encuentran.", pasos: ["Cada quien elige un libro y lo explora a su ritmo.", "Luego, en parejas, se cuentan qué vieron.", "Algunos lo presentan al grupo: título, de qué trata, qué les gustó.", "Registren en un cartel los libros que más les gustaron."],
    var: "Préstamo a domicilio del libro favorito.", multi: "" },

  /* ---------- explorar y descubrir ---------- */
  { id: "pre-flota-hunde", n: "¿Flota o se hunde?", cat: "ciencia", campos: ["S"], g: [11, 13], min: 20, esp: "aula", mat: "Tina con agua, objetos variados (piedra, corcho, tapa, llave, hoja)",
    prop: "Predecir, experimentar y comparar lo que pensaban con lo que pasó.", pasos: ["Muestre cada objeto y pregunte si creen que flotará o se hundirá; registren con dibujos.", "Pruébenlo uno por uno.", "Clasifiquen en dos charolas: flotan y se hunden.", "Comparen con sus predicciones: ¿en qué nos equivocamos?"],
    var: "Intenten que algo que se hunde flote (por ejemplo, plastilina en forma de barco).", multi: "" },
  { id: "pre-germinador", n: "Nuestro germinador", cat: "ciencia", campos: ["S", "E"], g: [11, 13], min: 20, esp: "aula", mat: "Frascos, algodón, frijoles, agua",
    prop: "Observar el crecimiento de una planta y registrar cambios a lo largo de los días.", pasos: ["Coloquen algodón húmedo y frijoles en un frasco.", "Platiquen qué necesita la planta para crecer.", "Cada día observen y dibujen en su registro lo que cambió.", "Al final ordenen sus dibujos del primero al último."],
    var: "Pongan un frasco sin luz y comparen.", multi: "" },
  { id: "pre-detectives-sentidos", n: "Detectives de los sentidos", cat: "ciencia", campos: ["S", "H"], g: [11, 13], min: 15, esp: "aula", mat: "Bolsas con objetos, frascos con olores (canela, limón, café), sonidos",
    prop: "Usar los sentidos para explorar y describir objetos.", pasos: ["Sin ver, toquen un objeto dentro de la bolsa y describan cómo es.", "Huelan los frascos y adivinen qué es.", "Escuchen sonidos y digan qué los produce.", "Platiquen qué sentido usaron en cada caso."],
    var: "Prueben sabores (con cuidado de alergias).", multi: "" },
  { id: "pre-bichos", n: "Exploradores del jardín", cat: "ciencia", campos: ["S", "E"], g: [11, 13], min: 25, esp: "patio", mat: "Lupas, frascos con tapa perforada, hojas para registrar",
    prop: "Observar seres vivos de su entorno y aprender a cuidarlos.", pasos: ["Acuerden reglas: observar sin lastimar y regresar a los animalitos a su lugar.", "Recorran el patio buscando plantas e insectos.", "Observen con lupa y dibujen lo que encontraron.", "Compartan: ¿dónde vive?, ¿qué come?, ¿cómo lo cuidamos?"],
    var: "Hagan un mapa del patio con lo que encontraron.", multi: "" },

  /* ---------- convivencia y emociones ---------- */
  { id: "pre-caras-emociones", n: "Las caras de las emociones", cat: "convive", campos: ["H"], g: [11, 13], min: 15, esp: "aula", mat: "Tarjetas con caras (alegría, tristeza, enojo, miedo, sorpresa), espejo",
    prop: "Reconocer y nombrar emociones en sí mismos y en otras personas.", pasos: ["Muestre una tarjeta y pregunte qué siente esa cara.", "Frente al espejo, hagan esa cara.", "Pregunte: ¿cuándo te has sentido así?", "Acuerden qué podemos hacer cuando alguien se siente así."],
    var: "Creen el «termómetro de emociones» del salón.", multi: "" },
  { id: "pre-rincon-calma", n: "El rincón de la calma", cat: "convive", campos: ["H", "E"], g: [11, 13], min: 20, esp: "aula", mat: "Cojines, botella de la calma (agua con diamantina), cuentos",
    prop: "Construir con el grupo un lugar para tranquilizarse cuando hay emociones intensas.", pasos: ["Platiquen qué hacemos cuando estamos muy enojados o tristes.", "Entre todos arreglen un rincón con cojines y objetos que calman.", "Enseñe a usar la botella de la calma: agitar y respirar mientras baja la diamantina.", "Acuerden cuándo y cómo se usa el rincón."],
    var: "Que cada quien dibuje algo que le ayuda a sentirse mejor.", multi: "" },
  { id: "pre-acuerdos", n: "Nuestros acuerdos con dibujos", cat: "convive", campos: ["E", "H"], g: [11, 13], min: 20, esp: "aula", mat: "Pliego de papel, crayones",
    prop: "Construir acuerdos de convivencia entre todos.", pasos: ["Pregunte: ¿qué necesitamos para jugar y aprender a gusto?", "Cada propuesta se dibuja en el pliego; la docente escribe la frase abajo.", "Escojan juntos los más importantes.", "Péguenlo a la vista y revísenlo cada semana."],
    var: "Que lo presenten a sus familias.", multi: "" },
  { id: "pre-turnos", n: "El objeto que da la palabra", cat: "convive", campos: ["L", "E", "H"], g: [11, 13], min: 10, esp: "aula", mat: "Un peluche o una pelota pequeña",
    prop: "Aprender a esperar el turno, escuchar y hablar frente al grupo.", pasos: ["En círculo, explique que solo habla quien tiene el peluche.", "Haga una pregunta sencilla (¿qué te gusta comer?).", "El peluche pasa de mano en mano; quien no quiera hablar lo pasa.", "Al final, recuerden lo que dijeron algunos compañeros."],
    var: "Úselo en todas las asambleas del día.", multi: "" },

  /* ---------- cierre ---------- */
  { id: "pre-que-aprendi", n: "¿Qué aprendí hoy?", cat: "cierre", campos: ["L", "S", "E", "H"], g: [11, 13], min: 8, esp: "aula", mat: "Ninguno",
    prop: "Recordar lo que se hizo y expresar lo que aprendieron.", pasos: ["Siéntense en círculo.", "Pregunte qué hicieron hoy y qué fue lo que más les gustó.", "Pida a algunos que muestren o expliquen lo que hicieron.", "Platique lo que harán mañana."],
    var: "Usen caritas para decir cómo les fue (feliz, más o menos, triste).", multi: "" },
  { id: "pre-galeria", n: "La galería", cat: "cierre", campos: ["L", "H"], g: [11, 13], min: 15, esp: "aula", mat: "Trabajos del día, cinta",
    prop: "Mostrar sus producciones y valorar el trabajo propio y el de los demás.", pasos: ["Peguen sus trabajos en la pared como en un museo.", "Recorran la galería en silencio observando.", "Cada quien dice qué le gustó del trabajo de un compañero.", "La autora o el autor cuenta cómo lo hizo."],
    var: "Inviten a las familias a la galería al final del proyecto.", multi: "" },
  { id: "pre-pulgar", n: "Pulgar arriba, en medio o abajo", cat: "cierre", campos: ["L", "S", "E", "H"], g: [11, 13], min: 5, esp: "aula", mat: "Ninguno",
    prop: "Autoevaluar de forma sencilla cómo se sintieron y si lo lograron.", pasos: ["Diga frases: «pude contar los frijoles», «escuché a mis compañeros».", "Responden con el pulgar: arriba (sí), en medio (a veces), abajo (todavía no).", "Pregunte a algunos por qué.", "Anote lo que observa para su lista de cotejo."],
    var: "Con caritas de colores en lugar del pulgar.", multi: "" }
);
