/* © 2026 Mtro. Carlos Gabriel Ortega Gutiérrez · Supervisión Escolar Zona 050 (ISEP), Baja California.
   Tlamatini Aula · Protocolos del Programa de Protección Integral Escolar (PPIE 2026, SE / ISEP Baja California).
   Los pasos se transcriben del programa oficial («Actuación»), con redacción breve para leerse en el momento.
   q: quién lo hace → "doc" docente o persona que detecta · "dir" titular de la Dirección o responsable · "sup" Supervisión · "todos"
   a: acciones del paso → "tel:<contacto>", "wa:dir" (avisar a la Dirección por WhatsApp), "anexo:<letra>" (formato de Tlamatini) */
"use strict";

/* ---------- contactos (directorio de instituciones coadyuvantes del PPIE y Red de apoyo de la Zona 050) ---------- */
const PPIE_TEL = {
  "911": { t: "911 · Emergencias", n: "911" },
  "075": { t: "075 · Apoyo psicológico 24 h", n: "075" },
  "089": { t: "089 · Denuncia anónima", n: "089" },
  "079": { t: "079 · Escuadrón Violeta (opción 1)", n: "079" },
  vida: { t: "Línea de la Vida · 24 h", n: "800 911 2000" },
  seguro: { t: "Seguro escolar · reportar accidente", n: "686 554 1113", n2: "800 824 4432" },
  segesc: { t: "Seguridad Escolar (SE)", n: "686 551 8500", ext: "8414", n2: "800 732 1976" },
  fiscalia: { t: "Fiscalía General del Estado", n: "800 343 2220" },
  cyber: { t: "Policía Cibernética Preventiva", n: "686 578 1502", wa: "686 946 7026", mail: "inteligencia_tecnica@seguridadbc.gob.mx" },
  dannard: { t: "DANNARD (Fiscalía)", mail: "dannard@fgebc.gob.mx", m: { "San Quintín": "646 152 2700", "Ensenada": "646 152 2700", "Tijuana": "664 104 7601", "Playas de Rosarito": "664 104 7601", "Mexicali": "686 567 1972", "Tecate": "686 567 1972", "San Felipe": "686 567 1972" } },
  subpro: { t: "Subprocuraduría de la Defensa del Menor y la Familia", m: { "San Quintín": ["616 165 2464", "3622"], "Ensenada": ["646 172 3041"], "Playas de Rosarito": ["661 154 0788"], "Tijuana": ["664 701 7496", "109"], "Tecate": ["665 654 0757"], "Mexicali": ["686 554 6766"], "San Felipe": ["686 577 0895"] } },
  cecosama: { t: "CECOSAMA · salud mental (IPEBC)", mail: "trabajosocialipebc@gmail.com", m: { "San Quintín": ["616 166 2747", "", "CECOSAMA Vicente Guerrero"], "Ensenada": ["646 154 9572", "", "CECOSAMA Maneadero"], "Playas de Rosarito": ["661 612 6225", "", "CECOSAMA Chula Vista"], "Tijuana": ["664 684 2664", "", "IPEBC Tijuana"], "Mexicali": ["686 842 7050", "", "IPEBC Mexicali"] } },
  dif: { t: "DIF Baja California", m: { "San Quintín": ["616 166 5560", "108"], "Ensenada": ["646 978 3136"], "Tijuana": ["664 904 7404", "117"], "Mexicali": ["686 567 1339", "106"] } },
  bomberos: { t: "Bomberos", m: { "Ensenada": ["646 120 5435"], "San Quintín": ["646 108 5737", "", "Base de Bomberos San Vicente"], "Playas de Rosarito": ["661 612 7654"], "Tijuana": ["664 688 5705"], "Tecate": ["665 654 1711"], "Mexicali": ["686 561 8232"], "San Felipe": ["686 577 1182"] } },
  dir: { t: "Dirección de la escuela" },
  sup: { t: "Supervisión Escolar" },
  padres: { t: "Madre, padre o persona responsable", nota: "Use los teléfonos de emergencia del alumno (Mi grupo › ficha del alumno)." }
};

/* ---------- criterios de alarma para activar el 911 (SIPIR-HT) ---------- */
const PPIE_SIPIR = [["Sangrado activo", "Hemorragia abundante o persistente que no cede."], ["Intenso dolor", "Dolor incapacitante o sospecha de fractura."],
  ["Pérdida de conciencia", "Desmayo, desorientación, convulsión o ausencia de respuesta."], ["Incontrolable vómito", "Vómito repetitivo, riesgo de deshidratación o posible lesión craneal."],
  ["Dificultad para respirar", "Respiración agitada, silbidos o incapacidad para hablar."], ["Heridas o fracturas", "Deformidad visible o incapacidad para mover una extremidad."],
  ["Trauma craneoencefálico", "Golpe severo en la cabeza."]];
const PPIE_ATICE = [["A", "Alarma", "Active la alerta para avisar del agresor armado."], ["T", "Trinchera", "Resguárdese en el aula: bloquee la puerta, ocúltense y hagan barreras."],
  ["I", "Informar", "Comunique ubicación, movimientos y características del agresor a las autoridades."], ["C", "Contraataque", "Solo como último recurso, si la vida está en peligro inminente: distraer o desorientar al agresor."],
  ["E", "Evacuación", "Salga rápido y en orden hacia una zona segura cuando la ruta esté libre de riesgo."]];

/* Paso final que se repite: la Supervisión remite el expediente a la Jefatura de Nivel */
const P_SUP = (extra) => ({ q: "sup", t: "La Supervisión remite el expediente mediante oficio a la Jefatura de Nivel Educativo" + (extra || ", que lo hace del conocimiento de las áreas competentes.") });
const P_EXP = (anexos) => ({ q: "dir", t: "La Dirección elabora " + anexos + " y remite mediante oficio copia del expediente a la Supervisión Escolar.", a: (anexos.match(/Anexo [A-I]/g) || []).map(x => "anexo:" + x.slice(-1)).concat(["tel:sup"]) });
const ESCUCHAR = { q: "doc", t: "Escuche con atención y respeto a la niña, niño, adolescente o a la persona que se acerca a decirlo. Salvaguarde su integridad física y emocional.", nota: "No juzgue, no culpe y no prometa guardar el secreto." };
const SOLO3 = { q: "doc", t: "Pregunte únicamente: ¿Cuándo? ¿Dónde? ¿Quién lo hizo?", nota: "No investigue ni pida detalles: eso lo hacen las autoridades. Evite que tenga que contarlo varias veces." };
const AVISO_E = { q: "doc", t: "Informe de inmediato a la Dirección y entréguele por escrito el Informe de incidencia (Anexo E).", a: ["wa:dir", "tel:dir", "anexo:E"] };
const AVISO_D = { q: "doc", t: "Avise de inmediato a la Dirección, de forma verbal y por escrito, con el Registro de incidencias (Anexo D): lo que narra quien recibió la agresión y quien la generó.", a: ["wa:dir", "tel:dir", "anexo:D"], nota: "Su responsabilidad como docente termina cuando entrega a la Dirección el Registro de incidencias (Anexo D)." };
const CITAR = (extra) => ({ q: "dir", t: "La Dirección cita a la madre, padre o persona responsable del cuidado familiar para informar la situación" + (extra || ".") , a: ["tel:padres"] });
const DUDA = "En caso de duda, pida orientación a Seguridad Escolar o a la Supervisión.";
const DANNARD = (cuando) => ({ q: "dir", t: (cuando || "") + "Las personas involucradas se derivan a DANNARD con la Ficha de canalización (Anexo G), que se entrega a la familia; copia a dannard@fgebc.gob.mx.", a: ["anexo:G", "tel:dannard"] });
const DENUNCIA = (ante) => ({ q: "dir", t: "La Dirección acuerda por escrito con la familia que acuda a " + ante + " a presentar la denuncia, con 1 día de tolerancia para entregar la evidencia.", sub: ["Si no presentan la evidencia, la Dirección remite por escrito a " + ante.replace(/^la /, "la ") + " la relatoría de los hechos, el nombre del alumno (si asiste a clases), el de la madre, padre o responsable y su domicilio."], a: ["anexo:C"] });

const PPIE = [
  { id: "accidente", t: "Accidente escolar", e: "🩹", c: "#C2603A", d: "Lesión, caída, golpe o cualquier accidente de un alumno.", alarma: true,
    casos: [{ id: "a", t: "Accidente", pasos: [
      { q: "todos", t: "Brinde auxilio a la alumna o alumno (art. 157 del Código Penal de BC), considerando si tiene alguna discapacidad o condición del neurodesarrollo.", fase: "Brindar auxilio" },
      { q: "todos", t: "Despeje el área donde está el riesgo." },
      { q: "todos", t: "Si hay uno o más datos de alarma (SIPIR-HT), el responsable en turno llama al 911 y sigue las indicaciones del operador. Avise si el alumno tiene alguna discapacidad o condición del neurodesarrollo.", a: ["tel:911"], sipir: true },
      { q: "todos", t: "Ante cualquier lesión, contacte a la madre, padre o persona responsable del cuidado familiar.", a: ["tel:padres", "wa:dir"], fase: "Notificación inmediata" },
      { q: "dir", t: "La Dirección genera y entrega el aviso de accidente del seguro escolar.", a: ["anexo:S", "tel:seguro"] },
      { q: "todos", t: "La madre, padre o responsable traslada al alumno a la atención médica. En caso de emergencia, llame al 911.", a: ["tel:911"] },
      { q: "doc", t: "Levante el Registro de incidencias (Anexo D) con datos completos, firmado por la madre, padre o responsable.", a: ["anexo:D"], fase: "Registro" },
      { q: "dir", t: "Si se activó el 911, la Dirección levanta el Acta de hechos (Anexo B).", a: ["anexo:B"] },
      { q: "dir", t: "La Dirección avisa a la Supervisión e integra el expediente con oficio y acta de hechos.", a: ["tel:sup"] },
      P_SUP(" en los accidentes en que se aplicaron los criterios SIPIR-HT.") ] }] },

  { id: "sexual", t: "Riesgo de tipo sexual", e: "🛡️", c: "#8E2F4F", d: "Abuso sexual, violación u hostigamiento sexual.",
    pregunta: "¿Qué edad tiene la persona presuntamente agresora?",
    casos: [
      { id: "m12", t: "Entre menores de 12 años", pasos: [ESCUCHAR, SOLO3, AVISO_E,
        Object.assign(CITAR(), { nota: DUDA }), DANNARD(),
        { q: "dir", t: "La Dirección elabora el Acta de hechos (Anexo B) y la Bitácora de atención y seguimiento (Anexo C).", a: ["anexo:B", "anexo:C"] },
        { q: "dir", t: "La Dirección remite mediante oficio copia del expediente a la Supervisión, a la brevedad posible.", a: ["tel:sup"] },
        P_SUP(", que lo hace del conocimiento del área competente.")] },
      { id: "12a18", t: "Agresor de 12 a 17 años", pasos: [ESCUCHAR, SOLO3, AVISO_E,
        Object.assign(CITAR(), { nota: DUDA }),
        { q: "dir", t: "Si existe riesgo de que la situación se repita, llame al 911.", a: ["tel:911"] },
        DENUNCIA("la Unidad de Investigación Especializada en Justicia para Adolescentes"),
        { q: "dir", t: "La Dirección elabora el Acta de hechos (Anexo B) y la Bitácora (Anexo C).", a: ["anexo:B", "anexo:C"] },
        { q: "dir", t: "La Dirección remite mediante oficio copia del expediente a la Supervisión, a la brevedad posible.", a: ["tel:sup"] },
        P_SUP(", que lo hace del conocimiento del área competente.")] },
      { id: "may18", t: "Agresor mayor de 18 años", pasos: [ESCUCHAR, SOLO3, AVISO_E,
        { q: "dir", t: "Si está involucrado un miembro del personal: evite de inmediato que tenga contacto con alumnos y notifíquele (y a su representación sindical) que se le atribuyen los hechos." },
        Object.assign(CITAR(), { nota: DUDA }),
        { q: "dir", t: "Si existe riesgo de que la situación se repita, llame al 911.", a: ["tel:911"] },
        DENUNCIA("la Fiscalía"),
        { q: "dir", t: "La Dirección elabora el Acta de hechos (Anexo B) y la Bitácora (Anexo C).", a: ["anexo:B", "anexo:C"] },
        { q: "dir", t: "La Dirección remite mediante oficio copia del expediente a la Supervisión, a la brevedad posible.", a: ["tel:sup"] },
        { q: "sup", t: "La Supervisión remite copia del expediente a la Jefatura de Nivel, con copia a Participación Social y Convivencia Escolar. Si hay una figura educativa involucrada, también al Órgano Interno de Control, a la Dirección de Administración de Personal y a Asuntos Jurídicos." }] }] },

  { id: "acoso", t: "Acoso escolar", e: "😔", c: "#6B3F7A", d: "Agresión repetida de uno o varios alumnos hacia otro (también por internet).",
    casos: [{ id: "a", t: "Acoso escolar", pasos: [AVISO_D,
      { q: "dir", t: "La Dirección escucha con atención y respeto a quien reporta el acoso." },
      { q: "dir", t: "La Dirección garantiza la protección de quien recibe el acoso, la investigación justa de los hechos y la intervención educativa con todos los implicados." },
      { q: "dir", t: "La Dirección cita a las familias, les informa los hechos y genera los acuerdos por escrito (Anexo C).", a: ["tel:padres", "anexo:C"] },
      DANNARD("Si el acoso genera afectación emocional, daño patrimonial o lesiones: "),
      { q: "dir", t: "Si la conducta pone en riesgo la integridad del alumno o de los demás, llame al 911.", a: ["tel:911"] },
      { q: "dir", t: "En ciberacoso, la Dirección puede pedir orientación a la Policía Cibernética Preventiva (preservar evidencia digital, reportes a plataformas y denuncia).", a: ["tel:cyber"] },
      P_EXP("el Acta de hechos (Anexo B) y la Bitácora (Anexo C)"), P_SUP()] }] },

  { id: "violencia", t: "Violencia entre alumnos", e: "✋", c: "#A94C2A", d: "Pelea, golpes o agresión entre niñas, niños o adolescentes.", alarma: true,
    casos: [{ id: "a", t: "Violencia entre alumnos", pasos: [
      { q: "doc", t: "Escuche con atención y respeto. Atienda el conflicto de forma pacífica, con diálogo y mediación.", nota: "Si hay un dato de alarma (SIPIR-HT) o la conducta pone en riesgo la integridad de alguien, llame al 911.", a: ["tel:911"], sipir: true },
      AVISO_D,
      { q: "dir", t: "La Dirección escucha con atención y respeto a quien reporta la violencia." },
      { q: "dir", t: "La Dirección garantiza la protección de quien recibió la violencia, la investigación justa y la intervención educativa con todos los implicados." },
      { q: "dir", t: "La Dirección cita a las familias, les informa los hechos y genera los acuerdos por escrito (Anexo C).", a: ["tel:padres", "anexo:C"] },
      DANNARD(),
      { q: "dir", t: "La Dirección elabora el Acta de hechos (Anexo B) y la Bitácora (Anexo C).", a: ["anexo:B", "anexo:C"] },
      { q: "dir", t: "La Dirección remite mediante oficio copia del expediente a la Supervisión.", a: ["tel:sup"] }, P_SUP()] }] },

  { id: "digital", t: "Violencia digital", e: "📱", c: "#1F6F8B", d: "Difusión de fotos o videos, amenazas, sextorsión, grooming o acoso por internet.",
    pregunta: "¿Qué edad tiene la persona presuntamente agresora?",
    casos: [
      { id: "m12", t: "Menor de 12 años", pasos: [
        { q: "doc", t: "Analice el contexto y escuche de manera atenta y respetuosa." },
        Object.assign({}, AVISO_D, { t: "Avise a la Dirección, de forma verbal y por escrito (Anexo D): lo que narra quien recibió la violencia digital y quien presuntamente la generó (si es alumno de la escuela).", nota: "" }),
        { q: "dir", t: "La Dirección cita a las familias de ambos alumnos (si quien la genera es de la escuela), informa los hechos y genera acuerdos por escrito (Anexo C).", a: ["tel:padres", "anexo:C"] },
        { q: "dir", t: "Si implica portación o difusión de pornografía infantil, la Dirección llama de inmediato al 911. Puede pedir orientación a la Policía Cibernética Preventiva.", a: ["tel:911", "tel:cyber"] },
        DANNARD(),
        P_EXP("el Acta de hechos (Anexo B)"), P_SUP(", que lo hace del conocimiento de la Procuraduría de Protección de Niñas, Niños y Adolescentes (Anexo I).")] },
      { id: "12a18", t: "De 12 a 17 años", pasos: [
        { q: "doc", t: "Escuche de manera atenta y respetuosa." },
        Object.assign({}, AVISO_D, { t: "Avise a la Dirección, de forma verbal y por escrito (Anexo D): lo que narra quien recibió la violencia y quien presuntamente la generó (si es alumno de la escuela).", nota: "" }),
        { q: "dir", t: "La Dirección cita a las familias de ambos alumnos, informa los hechos y genera acuerdos por escrito (Anexo C).", a: ["tel:padres", "anexo:C"] },
        { q: "dir", t: "Si implica pornografía infantil, amenaza, sextorsión, extorsión o robo de identidad, la Dirección llama de inmediato al 911 para canalizar al presunto generador a la Fiscalía Especializada en Justicia para Adolescentes. Puede pedir orientación a la Policía Cibernética.", a: ["tel:911", "tel:cyber"] },
        DANNARD("En los demás casos: "),
        P_EXP("el Acta de hechos (Anexo B)"), P_SUP(", que lo hace del conocimiento de la Procuraduría de Protección de Niñas, Niños y Adolescentes (Anexo I).")] },
      { id: "may18", t: "Mayor de 18 años o no se sabe", pasos: [
        { q: "doc", t: "Escuche de manera atenta y respetuosa." },
        Object.assign({}, AVISO_D, { t: "Avise a la Dirección, de forma verbal y por escrito (Anexo D): lo que narra quien recibió la violencia.", nota: "" }),
        CITAR(" de quien recibió la violencia."),
        { q: "dir", t: "Si implica pornografía infantil, amenaza, grooming, sextorsión, extorsión o robo de identidad, la Dirección llama de inmediato al 911. Puede pedir orientación a la Policía Cibernética.", a: ["tel:911", "tel:cyber"] },
        DENUNCIA("la Fiscalía"),
        P_EXP("el Acta de hechos (Anexo B)"), P_SUP(", que lo hace del conocimiento de la Procuraduría de Protección de Niñas, Niños y Adolescentes (Anexo I).")] }] },

  { id: "maltrato", t: "Maltrato infantil", e: "🧸", c: "#8A5A08", d: "Maltrato físico o emocional a un alumno, en casa, en la comunidad o en la escuela.",
    pregunta: "¿Dónde ocurrió el maltrato?",
    casos: [
      { id: "fam", t: "En la familia", pasos: [
        { q: "doc", t: "Escuche de manera atenta y respetuosa a quien reporta el maltrato." }, AVISO_E,
        { q: "dir", t: "La Dirección llama al 911.", a: ["tel:911"] },
        { q: "dir", t: "Avise a la madre, padre o responsable cuando el maltrato lo cometió otro adulto o familiar. Si la madre, padre o responsable está involucrado, acuda a la persona adulta que el alumno identifique como de su confianza.", a: ["tel:padres"] },
        P_EXP("el Acta de hechos (Anexo B)"), P_SUP(", que lo hace del conocimiento de la Procuraduría de Protección de Niñas, Niños y Adolescentes (Anexo I).")] },
      { id: "com", t: "En la comunidad", pasos: [
        { q: "doc", t: "Escuche de manera atenta y respetuosa a quien reporta el maltrato." }, AVISO_E,
        { q: "dir", t: "La Dirección llama al 911.", a: ["tel:911"] },
        { q: "dir", t: "Dé aviso a la madre, padre o persona responsable del cuidado familiar.", a: ["tel:padres"] },
        { q: "dir", t: "La Dirección redacta el Acta de hechos (Anexo B) con los testimonios iniciales (víctima, familia, testigos) e informa a la familia las medidas de protección que se tomarán.", a: ["anexo:B"] },
        { q: "dir", t: "La Dirección remite mediante oficio copia del expediente a la Supervisión.", a: ["tel:sup"] },
        P_SUP(", que lo hace del conocimiento de la Procuraduría de Protección de Niñas, Niños y Adolescentes (Anexo I).")] },
      { id: "esc", t: "En la escuela", pasos: [
        { q: "doc", t: "Informe de inmediato, de forma verbal y por escrito, a su superior jerárquico.", a: ["wa:dir", "tel:dir", "anexo:E"] },
        { q: "todos", t: "Proteja de inmediato la integridad del alumno involucrado, evitando que tenga que volver a contarlo (revictimización)." },
        { q: "dir", t: "La Dirección retira de inmediato de la atención frente a grupo (o del contacto con alumnos) a la figura educativa señalada, previo aviso a ella y a su representación sindical, respetando sus derechos. Si es alguien que presta un servicio, se le retira y no se reincorpora mientras sigue la investigación." },
        { q: "dir", t: "La Dirección llama al 911, informa a la familia de la víctima y comunica las medidas de protección que tomará la escuela.", a: ["tel:911", "tel:padres"] },
        { q: "dir", t: "La Dirección redacta el Acta de hechos (Anexo B) con los testimonios iniciales y remite el expediente a la Supervisión.", a: ["anexo:B", "tel:sup"] },
        P_SUP(", que lo hace del conocimiento de la Procuraduría de Protección de Niñas, Niños y Adolescentes (Anexo I).")] }] },

  { id: "suicida", t: "Conducta suicida", e: "💛", c: "#B23A48", d: "Riesgo inminente de que un alumno se haga daño o intente quitarse la vida.", urgente: true,
    casos: [{ id: "a", t: "Riesgo inminente", pasos: [
      { q: "todos", t: "Contenga y brinde auxilio inmediato: lleve al alumno a un lugar seguro y no lo deje solo en ningún momento.", nota: "Hable con calma, escúchelo sin juzgar y retire objetos con los que pueda hacerse daño." },
      { q: "todos", t: "Llame al 911, siga sus instrucciones y pida que transfieran la llamada a la línea 075. Avise a la Dirección y a la madre, padre o responsable.", a: ["tel:911", "tel:075", "wa:dir", "tel:padres"] },
      { q: "dir", t: "La Dirección solicita a la familia la canalización inmediata al IPEBC (Anexo F), con 2 días de tolerancia para entregar evidencia de la atención.", a: ["anexo:F", "anexo:H", "tel:cecosama"] },
      P_EXP("el Acta de hechos (Anexo B)"),
      { q: "sup", t: "La Supervisión remite mediante oficio copia del expediente a la Jefatura de Nivel, que avisa de la canalización a trabajosocialipebc@gmail.com y seguridadescolar@bcedu.mx." }] }],
    señales: ["Habla de querer morir, de ser una carga o de no valer nada.", "Regala sus cosas importantes o se despide.", "Se aísla, está muy triste, enojado o abrumado.", "Se lastima a sí mismo (cortes, rasguños, golpes).", "Publica en redes que quiere morir.", "Busca formas de hacerse daño."] },

  { id: "drogas", t: "Drogas", e: "🚫", c: "#4A5A2A", d: "Presencia, venta o consumo de drogas lícitas o ilícitas.",
    pregunta: "¿Qué ocurre?",
    casos: [
      { id: "venta", t: "Un alumno tiene o vende drogas", pasos: [
        { q: "doc", t: "Identifique al alumno involucrado." },
        { q: "doc", t: "Llévelo a la Dirección de manera discreta, sin exhibirlo y sin tocar ni alterar la evidencia u objetos." },
        AVISO_E,
        { q: "dir", t: "Si el alumno tiene de 12 a 17 años, la Dirección llama al 911.", a: ["tel:911"] },
        { q: "dir", t: "La Dirección solicita la presencia de la madre, padre o responsable.", a: ["tel:padres"] },
        { q: "dir", t: "Si aún tiene la sustancia, en la Dirección y frente a dos testigos se le pide que saque sus pertenencias; la sustancia se entrega a la autoridad." },
        DANNARD("Si el alumno es menor de 12 años: "),
        P_EXP("el Acta de hechos (Anexo B)"), P_SUP()] },
      { id: "uso", t: "Un alumno consumió drogas", pasos: [
        { q: "doc", t: "Llévelo a la Dirección de manera discreta, sin exhibirlo y sin tocar ni alterar la evidencia u objetos." },
        AVISO_E,
        { q: "todos", t: "Si presenta síntomas de intoxicación, llame al 911 para pedir atención médica y siga las instrucciones.", a: ["tel:911"] },
        { q: "dir", t: "La Dirección solicita la presencia de la madre, padre o responsable.", a: ["tel:padres"] },
        { q: "dir", t: "Si aún tiene la sustancia, en la Dirección y frente a dos testigos se le pide que saque sus pertenencias; la sustancia se entrega a la autoridad." },
        DANNARD(),
        P_EXP("el Acta de hechos (Anexo B)"), P_SUP()] },
      { id: "sin", t: "Se encontró droga y no se sabe de quién", pasos: [
        { q: "doc", t: "No toque ni altere la evidencia u objetos." },
        AVISO_E,
        { q: "dir", t: "La Dirección llama al 911.", a: ["tel:911"] },
        P_EXP("el Acta de hechos (Anexo B)"), P_SUP()] }] },

  { id: "omision", t: "Omisión de cuidados", e: "🚸", c: "#1B7560", d: "Alguien no autorizado quiere recoger a un alumno, o nadie llega por él.",
    pregunta: "¿Qué ocurre?",
    casos: [
      { id: "sust", t: "Lo quiere recoger alguien no autorizado", pasos: [
        { q: "todos", t: "Pida a la persona que espere la confirmación. No entregue al alumno todavía." },
        { q: "dir", t: "La Dirección verifica en el expediente si la persona está autorizada para recogerlo." },
        { q: "dir", t: "Si no está autorizada, la Dirección llama a la madre, padre o responsable para confirmar si se puede entregar.", a: ["tel:padres"] },
        { q: "dir", t: "Si la familia lo autoriza, se entrega al alumno y se recaba la firma en la bitácora de entradas y salidas." },
        { q: "dir", t: "Se registra en el expediente del alumno cómo fue la entrega y la respuesta de la familia." },
        { q: "dir", t: "Si no está autorizada y no hay confirmación de la familia, NO se entrega al alumno y se documenta. Si la persona insiste o hay riesgo, la Dirección llama al 911.", a: ["tel:911"] },
        { q: "dir", t: "Cuando el caso lo amerita (por ejemplo, conflictos de tutela), la Dirección informa a la Supervisión y a la Jefatura de Nivel.", a: ["tel:sup"] }] },
      { id: "aband", t: "Nadie llega por el alumno", pasos: [
        { q: "dir", t: "La Dirección se comunica con la madre, padre o persona responsable.", a: ["tel:padres"] },
        { q: "dir", t: "Si contesta, se le pide un tiempo estimado de llegada y se anota en la bitácora (Anexo C).", a: ["anexo:C"] },
        { q: "dir", t: "Si llega en el tiempo acordado, se entrega al alumno y se firma la bitácora." },
        { q: "dir", t: "Si no responde o no llega a tiempo, se registra por escrito y se pide a la Subprocuraduría de la Defensa del Menor y la Familia el resguardo temporal del alumno, llamando al 911.", a: ["tel:911", "tel:subpro"] },
        { q: "dir", t: "Si aun así nadie llega, el alumno se traslada según la instrucción de la Subprocuraduría y se entrega a la autoridad; queda registrado como posible abandono." },
        { q: "dir", t: "Si ocurre por tercera vez, la Dirección informa por escrito a la Subprocuraduría y solicita su intervención.", a: ["tel:subpro"] },
        { q: "dir", t: "La Dirección remite el expediente mediante oficio a la Supervisión, a la Jefatura de Nivel y a la Dirección de Asuntos Jurídicos.", a: ["tel:sup"] }] }] },

  { id: "amenaza", t: "Amenaza o atentado", e: "⚠️", c: "#9A3412", d: "Amenaza por teléfono, por escrito o redes, o cara a cara.",
    pregunta: "¿Cómo llegó la amenaza?",
    casos: [
      { id: "tel", t: "Por teléfono", pasos: [
        { q: "todos", t: "Llame al 911.", a: ["tel:911"], nota: "Si puede, tome captura de pantalla de la llamada. Anote el número, la hora y cómo era la voz (acento, tono)." },
        { q: "todos", t: "Comuníquese de inmediato con la autoridad educativa inmediata para informar.", a: ["tel:dir", "tel:sup"] },
        { q: "todos", t: "La policía determina si se debe evacuar la escuela. Siga sus indicaciones.", resguardo: true },
        { q: "dir", t: "La Dirección redacta el Acta de hechos (Anexo B) con el número telefónico, la hora y, si es posible, el acento y tono de voz.", a: ["anexo:B"] },
        { q: "dir", t: "La Dirección remite mediante oficio copia del expediente a la Supervisión.", a: ["tel:sup"] }, P_SUP()] },
      { id: "esc", t: "Por escrito, mensaje o redes", pasos: [
        { q: "todos", t: "No toque, mueva, destruya, borre ni difunda el documento, dispositivo o publicación con la amenaza." },
        { q: "todos", t: "Aísle el área o el dispositivo para conservar la evidencia.", nota: "Conserve copia, foto o captura con fecha visible: de dónde vino y quién la recibió, firmada por un testigo." },
        AVISO_E,
        { q: "dir", t: "La Dirección llama al 911 e informa: tipo de amenaza (bomba, arma, ataque…), dónde se encontró (nota, red social, correo, mensaje), hora y lugar del hallazgo, si ya se tomaron medidas y cuántas personas hay en la escuela.", a: ["tel:911"] },
        { q: "dir", t: "Comuníquese con la autoridad educativa inmediata para informar.", a: ["tel:sup"] },
        { q: "todos", t: "La policía determina si se debe evacuar la escuela. Siga sus indicaciones.", resguardo: true },
        P_EXP("el Acta de hechos (Anexo B)"), P_SUP()] },
      { id: "cara", t: "Cara a cara", pasos: [
        { q: "todos", t: "Si es posible, intervenga para resolver el conflicto de forma pacífica entre los alumnos involucrados." },
        { q: "todos", t: "Llame al 911.", a: ["tel:911"] },
        { q: "todos", t: "Si hay riesgo inminente: ponga una barrera entre usted y quien amenaza, responda con calma, evite movimientos bruscos y espere a la autoridad. La policía o la Dirección deciden si se evacúa.", resguardo: true },
        { q: "todos", t: "Comuníquese con la autoridad educativa inmediata para informar.", a: ["tel:dir", "tel:sup"] },
        P_EXP("el Acta de hechos (Anexo B)"), P_SUP()] }] },

  { id: "bomba", t: "Amenaza de bomba", e: "💣", c: "#B91C1C", d: "Aviso de un artefacto explosivo en la escuela.", emergencia: true,
    clave: ["Llame al 911 y active la alarma o el timbrado clave.", "Evacúe la escuela al punto de encuentro.", "Pase lista a su grupo.", "Espere a la policía y siga sus instrucciones."],
    casos: [{ id: "a", t: "Amenaza de bomba", pasos: [
      { q: "dir", t: "La Dirección llama al 911 y activa la alarma o el timbrado clave de emergencia por amenaza de bomba.", a: ["tel:911"] },
      { q: "todos", t: "Evacúen la escuela y concéntrense en el punto de encuentro asignado. Pase lista a su grupo." },
      { q: "todos", t: "Esperen a que llegue la policía y sigan sus instrucciones. No regresen hasta que lo autoricen." },
      { q: "dir", t: "La Dirección elabora el Acta de hechos (Anexo B).", a: ["anexo:B"] },
      { q: "dir", t: "La Dirección remite mediante oficio copia del expediente a la Supervisión.", a: ["tel:sup"] }, P_SUP()] }] },

  { id: "armas", t: "Presencia de armas", e: "🔪", c: "#7F1D1D", d: "Un arma dentro o fuera del salón.", emergencia: true,
    pregunta: "¿Dónde está el arma?",
    clave: ["No toque el arma.", "Mantenga la calma y no confronte a quien la porta.", "Avise a la Dirección para que llame al 911.", "Resguarde a los alumnos o evacúe en silencio."],
    casos: [
      { id: "fuera", t: "Fuera del aula", pasos: [
        { q: "todos", t: "No manipule el arma." },
        { q: "todos", t: "Mantenga la calma y evite confrontar al presunto portador." },
        { q: "todos", t: "Avise de inmediato a la Dirección.", a: ["tel:dir", "wa:dir"] },
        { q: "dir", t: "La Dirección llama al 911, asegura los accesos y resguarda a los alumnos en un área segura o salón cerrado.", a: ["tel:911"] },
        P_EXP("el Acta de hechos (Anexo B)"), P_SUP()] },
      { id: "dentro", t: "Dentro del aula", pasos: [
        { q: "todos", t: "Mantenga la calma y evite cualquier acción que aumente el riesgo." },
        { q: "todos", t: "Avise de inmediato a la Dirección para que llame al 911.", a: ["tel:dir", "wa:dir", "tel:911"] },
        { q: "todos", t: "Si el arma se encontró (por ejemplo, en una mochila): no la toque, déjela donde está y evite que alguien se acerque. Si alguien la porta: no intente desarmarlo ni genere pánico." },
        { q: "todos", t: "Si es posible, evacúe en silencio; si no, manténganse en resguardo." },
        P_EXP("el Acta de hechos (Anexo B)"), P_SUP()] }] },

  { id: "tirador", t: "Tirador activo", e: "🚨", c: "#450A0A", d: "Persona disparando o con un arma de fuego atacando.", emergencia: true,
    pregunta: "¿Dónde está el tirador?",
    clave: ["Alarma y 911 (si no puede hablar, deje la línea abierta).", "Resguárdense: cierren y bloqueen la puerta.", "Al piso, lejos de puertas y ventanas.", "Silencio total y celulares en silencio.", "Salgan solo cuando la policía lo indique."],
    casos: [
      { id: "fuera", t: "Fuera de la escuela", pasos: [
        { q: "dir", t: "Inicie el cierre forzoso: avise a la autoridad educativa, active la alarma y al mismo tiempo llame al 911. Nadie sale a las inmediaciones.", a: ["tel:911", "tel:sup"] },
        { q: "todos", t: "Si están fuera de las aulas: corran, resguárdense y esperen indicaciones de las autoridades." },
        { q: "todos", t: "Si están dentro de las aulas: de ser posible, aseguren la puerta con objetos pesados." },
        { q: "todos", t: "Resguárdense a nivel del piso y protéjanse con muros de concreto." },
        { q: "todos", t: "Esperen instrucciones para la evacuación." },
        { q: "todos", t: "No hagan ningún ruido: permanezcan callados y silencien los celulares." },
        { q: "todos", t: "Esperen a que llegue la policía y salgan solo cuando ella lo indique." },
        P_EXP("el Acta de hechos (Anexo B)"), P_SUP()] },
      { id: "cerca", t: "Cerca de nosotros", pasos: [
        { q: "todos", t: "Active la alarma y llame al 911. Si no puede hablar, deje la línea abierta para que el operador escuche.", a: ["tel:911"] },
        { q: "todos", t: "Si está fuera del aula: corra y resguárdese protegiéndose con algún objeto. Si está dentro del aula: active el protocolo ATICE.", atice: true },
        { q: "todos", t: "No hagan ningún ruido: permanezcan callados y silencien los celulares." },
        { q: "todos", t: "Esperen a que llegue la policía y salgan solo cuando ella lo indique." },
        P_EXP("el Acta de hechos (Anexo B)"), P_SUP()] },
      { id: "dentro", t: "Dentro del aula", pasos: [
        { q: "todos", t: "Salga del ángulo del agresor: muévase de inmediato fuera de la línea de visión del arma." },
        { q: "todos", t: "Baje su cuerpo y desplácese cambiando de altura y dirección; no se quede como blanco fijo." },
        { q: "todos", t: "Protéjase con pupitres, escritorios, muros o mobiliario resistente." },
        { q: "todos", t: "Cubra cabeza, cuello, pecho y abdomen con la mochila u objetos sólidos." },
        { q: "todos", t: "Si hay una salida segura, evacúe de inmediato y aléjese del agresor lo más rápido posible.", nota: "No hacer nada aumenta el riesgo. Si es posible y como defensa, inmovilice al agresor con algún objeto." },
        P_EXP("el Acta de hechos (Anexo B)"), P_SUP()] }] },

  { id: "trabajador", t: "Agresión al personal", e: "🧑‍🏫", c: "#24427A", d: "Agresión, amenaza o acoso de una madre, padre u otra persona al personal de la escuela (también en redes).",
    casos: [{ id: "a", t: "Agresión al personal", pasos: [
      { q: "todos", t: "Póngase a salvo y procure que los alumnos estén resguardados. Si hay riesgo para la integridad de la comunidad escolar, solicite la intervención de seguridad pública llamando al 911 (art. 15, fracc. V).", a: ["tel:911"] },
      { q: "todos", t: "Avise de inmediato a la Dirección.", a: ["wa:dir", "tel:dir"] },
      { q: "dir", t: "La Dirección elabora el acta circunstanciada o Acta de hechos (Anexo B) y, según los hechos, aplica la atención institucional: exhorto verbal o escrito, reunión de conciliación o mediación, o medidas preventivas y de protección (art. 15).", a: ["anexo:B"] },
      { q: "dir", t: "La Dirección canaliza el caso a la autoridad educativa competente: informa a la Supervisión (art. 15, fracc. IV).", a: ["tel:sup"] },
      { q: "doc", t: "Si lo necesita, pida asesoría técnica-legal inmediata a la Dirección de Asuntos Jurídicos, por medio del enlace de su Delegación (art. 7).", nota: "Es confidencial: su consulta no se puede usar en su contra." },
      { q: "doc", t: "Puede recibir apoyo psicológico gratuito en ISSSTECALI, ISSSTE, DIF, el Programa de Atención Comunitaria de la UABC o un CECOSAMA (art. 8).", a: ["tel:cecosama", "tel:dif"] },
      { q: "doc", t: "Si la agresión fue por redes sociales o medios digitales, con la asesoría de la SE e ISEP puede proceder conforme a la ley (art. 14). Guarde capturas de pantalla con fecha.", a: ["tel:cyber"] }] }],
    aviso: "Basado en el Protocolo para la protección e integridad de los derechos de las y los trabajadores de la educación (PPIE, pág. 88): las madres, padres o responsables tienen prohibido agredir, amenazar, intimidar o exhibir en redes al personal (art. 13)." }
];
