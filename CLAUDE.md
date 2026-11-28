# Proyectos de la Zona Escolar 050 · Contexto para Claude

Este repositorio reúne las apps y páginas que desarrollan el **Mtro. Carlos Gabriel Ortega Gutiérrez** (Supervisor Escolar de la Zona 050, Primaria Federalizada, ISEP Baja California, con sede en Camalú, San Quintín) y su colaborador de la Supervisión, que firma como **«Tlamatini»** (cuenta tlamatini023@gmail.com). Las ideas y los proyectos son de los dos: cualquiera de ellos puede pedir cambios y publicar.

> El repositorio es **público**. Aquí nunca van contraseñas, claves de API, datos de alumnos ni información personal.

## Cómo trabajar con ellos

- **Siempre en español.** No son programadores: explica paso a paso, sin tecnicismos, y di qué cambió y dónde se ve.
- **Publica tú directamente** en la rama `main` (se sirve con GitHub Pages en `https://carlosog23.github.io/Carlos-Ortega/`). No les pidas descargar y subir archivos.
- Al cambiar una app instalable (PWA), sube la constante `VERSION` de su `sw.js` para que los dispositivos se actualicen.
- Cada app nueva o actualizada debe aparecer también en el **Centro de Apps** (`centro-apps/`), incluidos sus enlaces de demostración.
- Si quien escribe dice ser «Tlamatini», es el colaborador, no el Mtro. Carlos.
- Juntar varias mejoras del servidor de Tequio (`tequio/servidor`, Google Apps Script) y actualizarlo una sola vez.

## Reglas de identidad y de documentos

- Documentos institucionales: **logo de ISEP + logo de la Zona 050** (lema «Responsabilidad y superación»). Nunca los logos del Gobierno del Estado ni de la SE («Con el corazón por delante»). Excepción: los formatos de Recursos Financieros (ingresos propios) del Gobierno del Estado se dejan tal cual, con sus logos y textos originales.
- Los formatos oficiales del PPIE no se modifican: deben quedar idénticos al oficial.
- Títulos: «Mtro. Carlos Gabriel Ortega Gutiérrez» (nunca «Dr.»). Todos los directores y encargados de despacho van como **Mtro./Mtra.**
- Logos, firma («Firma sin fondo.png») y sello de la supervisión («Sello_Supervision_ZE050_alta.png») están en el Google Drive de carlosog23@gmail.com; los logos de cada escuela, en `formatos-ppie/img/escuelas/` (por CCT) y en el Drive. No dejar documentos sin logo.
- Oficios de la Supervisión: tomar el número consecutivo que sigue en Tequio y guardar el oficio en el Drive.
- Firma de autor («Camino de la costa», leyenda «Maestro») en las apps: archivos `firma-autor.svg` / `firma-autor-blanca.svg`. No va en Misioneros del Inglés, Control de Poker ni Red de apoyo.
- Diseño: claro, profesional, cuidado en los detalles.

## Reglas de privacidad y de tono

- En informes de zona: cantidades, no nombres de alumnos. Los nombres solo por escuela (director, ATP, maestro).
- Las planeaciones y fotos de guía que suben los docentes en Tlamatini Aula son solo del docente: «lo que hagas en tu cel se queda en tu cel».
- En fotos públicas, **pixelear los rostros de niñas y niños**. No usar personajes con derechos de autor (Disney, Pixar, etc.).
- En las noticias de la página: el crédito es de las escuelas y sus directores. El Mtro. Carlos aparece como parte de la jornada, nunca como protagonista.
- En Tequio se usa «Requiere acompañamiento» en lugar de «No cumple».

## Mapa del repositorio

**Institucionales (Zona 050)**

| Carpeta | Qué es |
|---|---|
| `tequio/` | **Tequio** · «Lo que acordamos juntos, lo caminamos juntos». Asesoría y seguimiento de la zona para supervisor, ATP y directores: agenda, acuerdos con evidencias, CTE, visitas, SisAT y EIA, oficios, personal, recursos financieros, consultas, videollamadas. Servidor en Apps Script (cuenta supervision050sep@gmail.com); registro central multizona en tequio023@gmail.com. |
| `formatos-ppie/` | **Tlamatini** · «Un camino para la labor docente». Gestión docente: formatos PPIE, laborales, pedagógicos, comunicación con familias, planeación, reconocimientos, libros de firmas. Enlaces personales por trabajador. |
| `tlamatini-aula/` | **Tlamatini Aula** (primaria): planeación con PDA, pase de lista, evaluación, exámenes, estudio USICAMM, expediente, bitácora, protocolos PPIE. Logo: el lápiz que traza la espiral. |
| `aula-preescolar/`, `aula-especial/` | Versiones de Tlamatini Aula para preescolar y educación especial (usuarios de otras zonas: ahí no debe decir «Zona Escolar 050»). |
| `ppie/` | App **Protocolos PPIE · ¿Qué está pasando?** para quien no tiene las demás apps. Aviso automático a dirección y supervisión solo para la Zona 050. |
| `educacion-fisica/` | **Ulama**, app para maestros de Educación Física; `educacion-fisica/supervision/` es Ulama · Supervisión (Zona 041). Proyecto de Google Cloud en carlosog23@gmail.com. |
| `evaluacion-preescolar/` | Evaluación cualitativa de preescolar (Gemini por Apps Script). |
| `zona050/` | Página pública de la zona: calendario, escuelas, herramientas y **Noticias** (`zona050/noticias/`, una carpeta de fotos por nota en `noticias/img/`). |
| `red-de-apoyo/` | Directorio de instituciones para situaciones con alumnos y familias. |
| `centro-apps/` | **Centro de Apps**: lanzador de todas las apps, modo normal o administrador, demos. |
| `mesa-tecnica/` | App de las tabletas de la Mesa Técnica (supervisor y ATP), con PIN por persona. |
| `aula/`, `imac/`, `z.sh` | **Compu-Tini**: software para rescatar computadoras antiguas (Core 2 Duo, iMac, i5) con Linux Mint; cuentas Maestro y Alumno, biblioteca sin internet, ajedrez en red. `z.sh` es el instalador único. Logo: monitor y ratón, fondo azul. |
| `tablet-tini/` | **Tablet-Tini**: app para tablets Android 4.4 viejas de las escuelas (todo en `index.html`, JavaScript ES5); el APK se compila solo con GitHub Actions (`.github/workflows/tablet-tini.yml`). Incluye ajedrez: contra la tablet, dos jugadores, en la red de la escuela (servidor de Compu-Tini, puerto 8050) y en la zona por internet (`tablet-tini/servidor-ajedrez/Codigo.gs`, Apps Script; sin chat, solo primer nombre, grado y escuela). |
| `tlamatini-juego/` | Videojuego educativo de Tlamatini (en pausa). |
| `windows/` | Personalización de Windows 11 con la imagen de la zona. |

**Personales del Mtro. Carlos** (no tocar salvo que él lo pida): `cherry-nails/`, `poker/`, `fuerza/`, `tarjeta/`, `tarjeta-gasolina/`.

## La Zona 050

14 escuelas primarias federalizadas: 7 en San Quintín y 7 en Ensenada (6 multigrado). Las multigrado sesionan juntas el CTE, salvo la Luis Donaldo Colosio Murrieta (vespertina), que sesiona en su escuela.

| Escuela | CCT | Director(a) / encargado | ATP de zona |
|---|---|---|---|
| Belisario Domínguez | 02DPR0210Z | Mtro. Luis Ángel Bandala Guerrero | Mtra. Isidra Analy Arce Aviña |
| Josefa Ortiz de Domínguez | 02DPR0150B | Mtro. Carlos Gustavo Domínguez Figueroa | Mtra. Paola Espinoza Araujo |
| Niños Héroes | 02DPR0862Z | Mtro. José Feliciano Gutiérrez Valdez | Mtra. Isidra Analy Arce Aviña |
| 13 de Septiembre | 02DPR0077J | Mtra. Cecilia Gómez Martínez | Mtra. Paola Espinoza Araujo |
| Pte. Adolfo López Mateos | 02DPR0379E | Mtro. Gilberto Medina Araujo (ED) | Mtra. Isidra Analy Arce Aviña |
| Emiliano Zapata | 02DPR0425Z | Mtro. Juan Carlos Chávez Bermúdez | Mtro. José Cupertino Oros Reyes |
| Margarita Maza de Juárez | 02DPR0378F | Mtra. Adriana Valentina Zavala Cruz (ED) | Mtra. Paola Espinoza Araujo |
| Maximino Virgen Flores | 02DPR0684N | Mtra. Citlali Shugey Nepita Anaya | Mtra. Isidra Analy Arce Aviña |
| José Vasconcelos | 02DPR0014Y | Mtro. Jesús González Urdiano | Mtro. José Cupertino Oros Reyes |
| James S. Yglesias | 02DPR0593W | Mtra. Lorena Valdez Rivera | Mtro. Efraín López Alvarado |
| Luis Donaldo Colosio Murrieta | 02DPR0882N | Mtro. Efraín López Alvarado (ED) | Mtra. Paola Espinoza Araujo |
| Narciso Mendoza | 02DPR0012Z | Mtro. Armando Calderón Hernández (ED) | Mtro. Efraín López Alvarado |
| Ignacio Allende | 02DPR0556S | Mtro. Jesús Aarón Montero Meléndrez (ED) | Mtro. Efraín López Alvarado |
| José Ma. Pino Suárez | 02DPR0382S | Mtro. Armando Urzúa Osuna (ED) | Mtro. Efraín López Alvarado |

ED = encargado de despacho. Supervisión: CCT 02FIZ0094X, Camalú, C.P. 22910. Los asuntos de escuelas de San Quintín y de Ensenada se dirigen a su Jefatura de Primaria correspondiente; no se mezclan. El calendario que rige es el de la Secretaría de Educación de Baja California.

## Criterios de Tequio que no se deben cambiar sin preguntar

- Avance general por escuela: acuerdos 70 %, evidencias 20 %, SisAT 5 %, EIA 5 %. Es «a la fecha»: sin nada vencido es 100 %.
- Lo que no le aplica a una escuela cuenta como cumplido (para no perjudicar a las multigrado).
- En evidencias cuenta el cumplimiento de cada rubro, no la cantidad de archivos. Las carpetas «Contingencia…» y «Oficio…» no cuentan; «Logotipo» sí.
- SisAT: en el primer momento, 1.° grado queda fuera del análisis.
- Informe semanal a las escuelas los lunes a las 7:00 (no en vacaciones).
