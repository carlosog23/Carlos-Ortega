(function(){
const $=s=>document.querySelector(s);
const money=n=>(n<0?'−':'')+'$'+Math.abs(n).toLocaleString('es-MX',{minimumFractionDigits:2,maximumFractionDigits:2});
const MESES=['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
const fdate=s=>{const [y,m,d]=s.split('-');return +d+' '+MESES[+m-1]+' '+y};
const hoy=()=>{const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')};
const TXT={
  carga:{btn:'Guardar carga',lbl:'Importe $',help:'Lo que pagaste con la tarjeta. Se descuenta del saldo.'},
  saldo:{btn:'Guardar saldo nuevo',lbl:'Saldo nuevo $',help:'Escribe el saldo que te dieron. La app calcula sola cuánto te abonaron comparándolo con el saldo anterior.'},
  abono:{btn:'Guardar abono',lbl:'Monto abonado $',help:'Cuando ya sabes cuánto te depositaron a la tarjeta. Se suma al saldo.'}
};
let tipo='carga', items=[], openId=null, foto=null, addTarget=null;

/* --- fotos: IndexedDB del navegador --- */
const DBN='tarjetaGasolina',ST='fotos';
let dbp=null;
function idb(){if(dbp)return dbp;dbp=new Promise((res,rej)=>{try{const r=indexedDB.open(DBN,1);r.onupgradeneeded=()=>r.result.createObjectStore(ST);r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)}catch(e){rej(e)}});return dbp}
async function fotoOp(mode,fn){const db=await idb();return new Promise((res,rej)=>{const tx=db.transaction(ST,mode);const r=fn(tx.objectStore(ST));tx.oncomplete=()=>res(r&&r.result);tx.onerror=()=>rej(tx.error)})}
const fotoPut=(id,blob)=>fotoOp('readwrite',s=>s.put(blob,id));
const fotoGet=id=>fotoOp('readonly',s=>s.get(id));
const fotoDel=id=>fotoOp('readwrite',s=>s.delete(id)).catch(()=>{});
const urlCache={};
async function fotoUrl(id){if(urlCache[id])return urlCache[id];const b=await fotoGet(id).catch(()=>null);if(!b)return null;return urlCache[id]=URL.createObjectURL(b)}

/* Reduce la foto a ~1600 px JPEG para que ocupe poco */
function comprimir(file){
  return new Promise((res)=>{
    const url=URL.createObjectURL(file);const img=new Image();
    img.onload=()=>{const max=1600;let w=img.naturalWidth,h=img.naturalHeight;const k=Math.min(1,max/Math.max(w,h));w=Math.round(w*k);h=Math.round(h*k);
      const c=document.createElement('canvas');c.width=w;c.height=h;c.getContext('2d').drawImage(img,0,0,w,h);URL.revokeObjectURL(url);
      c.toBlob(b=>res(b||file),'image/jpeg',0.82)};
    img.onerror=()=>{URL.revokeObjectURL(url);res(file)};
    img.src=url;
  });
}
async function subir(blob){
  const id='f'+Date.now()+Math.random().toString(36).slice(2,6);
  try{await fotoPut(id,blob);return id}
  catch(e){toast(e&&e.name==='QuotaExceededError'?'Ya no hay espacio para más fotos':'No se pudo guardar la foto');return null}
}
async function elegirFoto(input){
  const f=input.files&&input.files[0];input.value='';if(!f)return;
  foto=await comprimir(f);
  const img=$('#tkImg');if(img.dataset.u)URL.revokeObjectURL(img.dataset.u);
  img.dataset.u=URL.createObjectURL(foto);img.src=img.dataset.u;
  $('#tkPrev').hidden=false;$('#tkBtns').hidden=true;
  leerTicket(f,foto);
}
function quitarFoto(){foto=null;lecturaN++;$('#tkPrev').hidden=true;$('#tkBtns').hidden=false;limpiarLectura()}
function limpiarLectura(){const r=$('#tkRead');r.hidden=true;r.className='tk-read';r.textContent='';
  document.querySelectorAll('input.leido').forEach(i=>i.classList.remove('leido'));$('#guardar').textContent=TXT[tipo].btn}

/* --- lectura del ticket: OCR en el propio teléfono (Tesseract.js) + interpretación de los datos --- */
/* Interpreta el texto de un ticket de gasolinera mexicana (salida de OCR).
   Devuelve {legible, fecha, importe, litros, precio_litro, combustible, estacion, folio}. */
/* --- 2. Entender el texto ---
   La clave: en todo ticket de gasolina LITROS × PRECIO = IMPORTE. Si el lector se come un punto decimal o confunde
   un dígito (3↔8, 5↔6, 1↔7…), se buscan las combinaciones que cuadran con el menor número de correcciones. */
function parseTicket(raw,hoyStr){
  const MES={ENE:1,FEB:2,MAR:3,ABR:4,MAY:5,JUN:6,JUL:7,AGO:8,SEP:9,SET:9,OCT:10,NOV:11,DIC:12};
  const T=String(raw||'').toUpperCase().normalize('NFD').replace(/[̀-ͯ]/g,'');
  const lines=T.split(/\r?\n/).map(l=>l.trim()).filter(Boolean);
  // Letras que el lector pone en lugar de dígitos cuando están entre cifras
  const fix=s=>{const m={O:'0',D:'0',Q:'0',I:'1',L:'1','|':'1',Z:'2',S:'5',B:'8',G:'6',T:'7'};
    for(let k=0;k<2;k++)s=s.replace(/(\d)([ODQILZSBGT|])(?=[\d.,])/g,(a,d,c)=>d+m[c]).replace(/([\d][.,])([ODQILZSBGT|])/g,(a,d,c)=>d+m[c]);return s};
  const r2=v=>Math.round(v*100)/100;
  const hoy=hoyStr?new Date(hoyStr+'T12:00:00'):new Date();

  /* Fragmentos numéricos de una línea: «$ 1,157.27», «654 00», «313547», «22.30» */
  const fragmentos=l=>{const s=fix(l),out=[];const re=/\$?\s?\d[\d,.' ]*\d|\$?\s?\d/g;let m;
    while((m=re.exec(s))){let t=m[0];const pesos=/\$/.test(t);t=t.replace(/\$/g,'').trim();
      // separa grupos claramente distintos (dos o más espacios)
      t.split(/\s{2,}/).forEach(p=>{p=p.trim();if(p)out.push({t:p,pesos})})}
    return out};
  /* Interpretaciones de un fragmento: valor y los dígitos tal cual (para comparar) */
  const lecturas=(f,tipo)=>{const res=[];let t=f.t.replace(/'/g,'.');
    const d=t.replace(/\D/g,'');if(!d||d.length>9)return res;
    const push=(v,dig,dec,costo)=>{if(isFinite(v)&&v>0)res.push({v,dig,dec,costo})};
    // con separador decimal visible: el último . o , (o espacio) seguido de 2-4 dígitos al final
    const m=t.match(/^(.*?)[.,\s](\d{2,4})$/);
    if(m&&/\d/.test(m[1])){const e=m[1].replace(/\D/g,'');push(parseFloat(e+'.'+m[2]),e+m[2],m[2].length,0)}
    else if(!/[.,\s]/.test(t)||t.replace(/[^\d]/g,'')===d){
      // sin punto: se prueban las posiciones decimales razonables (cuesta 1 corrección)
      if(tipo==='imp'&&d.length>=3)push(parseFloat(d.slice(0,-2)+'.'+d.slice(-2)),d,2,1);
      if(tipo==='lit')for(const q of [3,4])if(d.length>q)push(parseFloat(d.slice(0,-q)+'.'+d.slice(-q)),d,q,1);
      if(tipo==='pre'&&d.length===4)push(parseFloat(d.slice(0,2)+'.'+d.slice(2)),d,2,1);
      if(tipo==='imp')push(parseFloat(d),d,0,0.5);
    }
    return res};
  const ETQ={imp:/IMPORTE|TOTAL|A PAGAR|MONTO/,lit:/LITROS|LTS\b|CANTIDAD|VOLUMEN/,pre:/PRECIO|P\.?\s?U\b|UNITARIO/};
  const NOETQ=/SUB\s?-?\s?TOTAL|SUE\s?TOTAL|IVA|SALDO|KILOMETRAJE|BOMBA|CODIGO|TRANSACCION|ECONOMICO|VENTA|TICKET|CUENTA|TEL/;
  const cand={imp:[],lit:[],pre:[]};
  const agrega=(tipo,l,li,peso)=>{fragmentos(l).forEach(f=>lecturas(f,tipo).forEach(x=>{x.li=li;x.peso=peso;x.pesos=f.pesos;cand[tipo].push(x)}))};
  lines.forEach((l,li)=>{
    for(const k of ['imp','lit','pre']){if(ETQ[k].test(l)&&!(k==='imp'&&NOETQ.test(l))){
        const resto=l.replace(ETQ[k],' ');
        if(/\d/.test(resto))agrega(k,resto,li,0);else if(lines[li+1]&&!/[A-Z]{4}/.test(lines[li+1].replace(/\$|MN/g,'')))agrega(k,lines[li+1],li+1,0.3)}}
    // Formato «Cant Descripcion Precio Importe»: 40.848 32011 Extra 22.30 910.93
    const m=fix(l).match(/(?:^|\s)(\d{1,3}[.,]\d{2,4})\s+\S.*?\s(\d{2}[.,]\d{2})\s+\$?\s?(\d{1,2},\d{3}[.,]\d{2}|\d{2,4}[.,]\d{2})\s*\W?$/);
    if(m){agrega('lit',m[1],li,0);agrega('pre',m[2],li,0);agrega('imp',m[3],li,0)}
    else{const m2=fix(l).match(/(?:^|\s)(\d{2}[.,]\d{2})\s+\$?\s?(\d{1,2},\d{3}[.,]\d{2}|\d{3,4}[.,]\d{2})\s*\W?$/);
      if(m2&&/CANT|DESCRIP|PRECIO|IMPORTE/.test(lines[li-1]||'')){agrega('pre',m2[1],li,0.3);agrega('imp',m2[2],li,0.3)}}
  });
  // Cifras sueltas como respaldo (cuestan más)
  lines.forEach((l,li)=>{if(NOETQ.test(l))return;fragmentos(l).forEach(f=>{if(!/[.,]\d{2}/.test(f.t))return;
    for(const k of ['imp','lit','pre'])lecturas(f,k).forEach(x=>{x.li=li;x.peso=1.5;cand[k].push(x)})})});
  cand.pre=cand.pre.filter(x=>x.v>=14&&x.v<=40);cand.lit=cand.lit.filter(x=>x.v>=1&&x.v<=250);cand.imp=cand.imp.filter(x=>x.v>=20&&x.v<=20000);

  /* Diferencia en dígitos entre lo leído y lo calculado (misma longitud = sustituciones; una de más o de menos = 1) */
  const difDig=(a,b)=>{if(a===b)return 0;if(a.length===b.length){let n=0;for(let i=0;i<a.length;i++)if(a[i]!==b[i])n++;return n}
    if(Math.abs(a.length-b.length)===1){const [c,l]=a.length<b.length?[a,b]:[b,a];for(let i=0;i<l.length;i++)if(l.slice(0,i)+l.slice(i+1)===c)return 1}return 9};
  const fmt=(v,dec)=>v.toFixed(dec).replace('.','');
  let mejor=null;
  const prueba=(l,p,i,c)=>{if(!mejor||c<mejor.c)mejor={l,p,i,c}};
  for(const p of cand.pre)for(const i of cand.imp){
    const lc=i.v/p.v;if(lc<1||lc>250)continue;
    for(const l of cand.lit){const dec=l.dec||3;
      // ¿el litro leído coincide con importe ÷ precio? (los tickets redondean, por eso se mira ± 1 en el último dígito)
      let dl=9,lb=null;for(const e of [0,-1,1]){const lv=Math.round(lc*10**dec+e)/10**dec;if(Math.abs(lv*p.v-i.v)<=Math.max(0.03,i.v*0.0006)){const x=difDig(l.dig,fmt(lv,dec));if(x<dl){dl=x;lb=lv}}}
      if(dl<=2)prueba(lb,p.v,i.v,dl+p.costo+i.costo+l.costo*0.5+p.peso+i.peso+l.peso)}
  }
  // ¿El importe es el que está mal? importe = litros × precio
  for(const p of cand.pre)for(const l of cand.lit){const ic=r2(l.v*p.v);
    for(const i of cand.imp){const di=difDig(i.dig,fmt(ic,2));
      if(di<=2&&Math.abs(ic-i.v)>0.009)prueba(l.v,p.v,ic,di+0.5+p.costo+l.costo+i.costo*0.5+p.peso+l.peso+i.peso)}}
  // ¿El precio es el que está mal? precio = importe ÷ litros
  for(const l of cand.lit)for(const i of cand.imp){const pc=r2(i.v/l.v);if(pc<14||pc>40)continue;
    for(const p of cand.pre){const dp=difDig(p.dig,fmt(pc,2));if(dp<=2&&dp>0)prueba(l.v,pc,i.v,dp+0.5+l.costo+i.costo+l.peso+i.peso+p.peso)}}

  if(!mejor||mejor.c>3){const ps=cand.pre.filter(x=>x.peso<1),is=cand.imp.filter(x=>x.peso<1&&x.costo<1);
    for(const p of ps)for(const i of is){const lc=i.v/p.v;if(lc>=3&&lc<=200)prueba(Math.round(lc*1000)/1000,p.v,i.v,3+p.costo+i.costo+p.peso+i.peso)}}
  let importe=null,litros=null,precio=null,seguro=false;
  if(mejor&&mejor.c<=4.5){importe=mejor.i;litros=mejor.l;precio=mejor.p;seguro=mejor.c<=2}
  else{const et=k=>cand[k].filter(x=>x.peso<1&&x.costo===0);
    importe=(et('imp')[0]||{}).v??null;litros=(et('lit')[0]||{}).v??null;precio=(et('pre')[0]||{}).v??null}

  /* Fecha: día/mes/año (México), año-mes-día o con mes en letras. Si el año se leyó mal, se usa el que tiene sentido */
  let fecha=null;
  const val=(y,m,d)=>{if(m<1||m>12||d<1||d>31)return null;if(y<100)y+=2000;
    const pr=[y,hoy.getFullYear(),hoy.getFullYear()-1];
    for(const yy of pr){const dt=new Date(yy,m-1,d,12);if(dt.getMonth()!==m-1)continue;const dias=(hoy-dt)/864e5;if(dias>=-2&&dias<=400)return yy+'-'+String(m).padStart(2,'0')+'-'+String(d).padStart(2,'0')}
    return null};
  const orden=[...lines.filter(l=>/FECHA|FEC\b|TICKET|HORA/.test(l)),...lines];
  for(const l0 of orden){const l=fix(l0);let m;
    if((m=l.match(/\b(20\d{2})\s?[\/\-.\s]\s?(\d{1,2})\s?[\/\-.\s]\s?(\d{1,2})\b/)))fecha=val(+m[1],+m[2],+m[3]);
    if(!fecha&&(m=l.match(/\b(\d{1,2})\s?[\/\-.]\s?(\d{1,2})\s?[\/\-.]\s?(20\d{2}|\d{2})\b/)))fecha=val(+m[3],+m[2],+m[1]);
    if(!fecha&&(m=l0.match(/\b(\d{1,2})\s?[\/\-. ]\s?([A-Z]{3})[A-Z]*\.?\s?[\/\-. ]\s?(\d{4}|\d{2})\b/))&&MES[m[2]])fecha=val(+m[3],MES[m[2]],+m[1]);
    if(fecha)break}

  /* Otros datos */
  let combustible=null;const mc=T.match(/MAGNA|PREMIUM|DIESEL|EXTRA|REGULAR|SUPER|ROJA|VERDE|MAGHA|MAGWA/);
  if(mc)combustible={ROJA:'Premium',VERDE:'Magna',SUPER:'Premium',MAGHA:'Magna',MAGWA:'Magna',DIESEL:'Diésel'}[mc[0]]||mc[0][0]+mc[0].slice(1).toLowerCase();
  let estacion=null;
  const ie=lines.findIndex(l=>/ESTACI[O0]N\b/.test(l)&&!/SERVICIO/.test(l));
  if(ie>=0){const m=(fix(lines[ie]).match(/(\d[\d ]{2,6}\d)/)||(lines[ie+1]&&fix(lines[ie+1]).match(/^\D{0,3}(\d[\d ]{2,6}\d)\b/)));if(m)estacion=m[1].replace(/\s/g,'')}
  if(!estacion){for(const l of lines.slice(0,6)){const m=fix(l).match(/(?:^|\s)(\d{3,6})\s?[-–]\s?[A-Z]{2}/);if(m){estacion=m[1];break}}}
  if(!estacion){const m=fix(T).match(/\b(?:E\.\s?S\.|EST\.)[ \t]*(?:NO\.?[ \t]*)?(\d{3,6})/);if(m)estacion=m[1]}
  let folio=null;const mf=fix(T).match(/(?:TICKET|FOLIO|NO\.?\s?VENTA|VENTA)\s*[:#.\s]*([0-9][0-9\-]{3,})/);if(mf)folio=mf[1];

  const legible=!!(importe||litros||fecha);
  return {legible,seguro,fecha,importe:importe!=null?r2(importe):null,litros:litros!=null?Math.round(litros*1000)/1000:null,
          precio_litro:precio!=null?r2(precio):null,combustible,estacion:estacion?'E.S. '+estacion:null,folio};
}

const TJS='https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/tesseract.min.js';
let ocrWorker=null,ocrCarga=null,lecturaN=0,progreso=null;
function cargarScript(src){return new Promise((res,rej)=>{if(window.Tesseract)return res();const sc=document.createElement('script');sc.src=src;sc.onload=()=>res();sc.onerror=()=>rej(new Error('red'));document.head.append(sc)})}
function obtenerLector(){
  if(ocrWorker)return Promise.resolve(ocrWorker);
  if(!ocrCarga)ocrCarga=(async()=>{await cargarScript(TJS);
    const w=await Tesseract.createWorker('spa',1,{logger:m=>{if(progreso)progreso(m)}});ocrWorker=w;return w})()
    .catch(e=>{ocrCarga=null;throw e});
  return ocrCarga;
}
/* --- 1. Preparar la foto: varias versiones para que el lector tenga de dónde escoger ---
   A) Se quita la sombra/luz dispareja dividiendo entre el «fondo» (la misma foto muy borrosa) y se agranda.
   B) La misma, pasada a blanco y negro puro con umbral local (sirve en tickets claros o con letra delgada).
   C) La foto original en gris con contraste (la versión de antes, por si las otras fallan). */
function lienzoDe(img,w,h){const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d',{willReadFrequently:true});x.imageSmoothingQuality='high';x.drawImage(img,0,0,w,h);return c}
function grises(c){const x=c.getContext('2d',{willReadFrequently:true});const d=x.getImageData(0,0,c.width,c.height);const p=d.data,g=new Float32Array(c.width*c.height);
  for(let i=0,j=0;i<p.length;i+=4,j++)g[j]=(p[i]*299+p[i+1]*587+p[i+2]*114)/1000;return g}
function aLienzo(g,w,h){const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d');const d=x.createImageData(w,h),p=d.data;
  for(let j=0,i=0;j<g.length;j++,i+=4){const v=g[j]<0?0:g[j]>255?255:g[j];p[i]=p[i+1]=p[i+2]=v;p[i+3]=255}x.putImageData(d,0,0);return c}
/* Desenfoque de caja rápido (imagen integral): da el «fondo» local */
function fondo(g,w,h,r){const I=new Float64Array((w+1)*(h+1));
  for(let y=0;y<h;y++){let s=0;for(let x=0;x<w;x++){s+=g[y*w+x];I[(y+1)*(w+1)+x+1]=I[y*(w+1)+x+1]+s}}
  const o=new Float32Array(w*h);
  for(let y=0;y<h;y++){const y0=Math.max(0,y-r),y1=Math.min(h,y+r+1);for(let x=0;x<w;x++){const x0=Math.max(0,x-r),x1=Math.min(w,x+r+1);
    o[y*w+x]=(I[y1*(w+1)+x1]-I[y0*(w+1)+x1]-I[y1*(w+1)+x0]+I[y0*(w+1)+x0])/((y1-y0)*(x1-x0))}}
  return o}
function estirar(g,bajo,alto){const n=g.length,h=new Uint32Array(256);for(let i=0;i<n;i++)h[g[i]<0?0:g[i]>255?255:g[i]|0]++;
  let lo=0,hi=255,a=0;for(;lo<255;lo++){a+=h[lo];if(a>n*bajo)break}a=0;for(;hi>0;hi--){a+=h[hi];if(a>n*alto)break}
  const k=hi>lo?255/(hi-lo):1;const o=new Float32Array(n);for(let i=0;i<n;i++)o[i]=(g[i]-lo)*k;return o}
function prepararImagenes(blob){
  return new Promise(res=>{const url=URL.createObjectURL(blob);const img=new Image();
    img.onload=()=>{URL.revokeObjectURL(url);const out=[];
      try{
        const W=img.naturalWidth,H=img.naturalHeight;
        // Letra de ticket: conviene que el lado corto quede cerca de 1700 px (agranda si la foto es chica, reduce si es enorme)
        const k=Math.min(2.2,Math.max(0.4,1700/Math.min(W,H))),w=Math.round(W*k),h=Math.round(H*k);
        const g=grises(lienzoDe(img,w,h));
        const r=Math.max(15,Math.round(Math.min(w,h)/25));
        const bg=fondo(g,w,h,r);
        const n=new Float32Array(g.length);for(let i=0;i<g.length;i++)n[i]=bg[i]>1?Math.min(255,g[i]/bg[i]*235):255;
        const A=estirar(n,0.01,0.30);
        out.push(aLienzo(A,w,h));
        // B: umbral local sobre la versión sin sombra
        const bgA=fondo(A,w,h,Math.round(r*0.6)),B=new Float32Array(A.length);
        for(let i=0;i<A.length;i++)B[i]=A[i]<bgA[i]*0.86?0:255;
        out.push(aLienzo(B,w,h));
        // C: como antes (gris con contraste, sin agrandar)
        const k2=Math.min(1,2000/Math.max(W,H)),w2=Math.round(W*k2),h2=Math.round(H*k2);
        out.push(aLienzo(estirar(grises(lienzoDe(img,w2,h2)),0.02,0.02),w2,h2));
      }catch(e){}
      res(out)};
    img.onerror=()=>{URL.revokeObjectURL(url);res([])};img.src=url});
}

async function leerTicket(file,ref){
  const r=$('#tkRead');limpiarLectura();const n=++lecturaN;
  const vigente=()=>n===lecturaN&&foto===ref;
  r.hidden=false;r.textContent=ocrWorker?'Leyendo los datos del ticket…':'Preparando el lector de tickets (la primera vez tarda un poco más)…';
  try{
    const vers=await prepararImagenes(file);if(!vers.length)throw new Error('imagen');
    const w=await obtenerLector();if(!vigente())return;
    // Varias pasadas (foto sin sombras, en blanco y negro, original) hasta que litros × precio = importe y haya fecha
    const plan=[[1,'6'],[2,'6'],[0,'6'],[1,'4'],[2,'4']].filter(p=>vers[p[0]]);
    let txt='',d=null,paso=0;
    progreso=m=>{if(vigente()&&m.status==='recognizing text')r.textContent='Leyendo los datos del ticket… '+Math.round(((paso+m.progress)/plan.length)*100)+'%'};
    for(const [vi,psm] of plan){
      await w.setParameters({tessedit_pageseg_mode:psm,preserve_interword_spaces:'1'});
      txt+='\n'+(await w.recognize(vers[vi])).data.text;if(!vigente())return;
      d=parseTicket(txt,hoy());paso++;
      if(d.seguro&&d.fecha)break;
    }
    mostrarLectura(d);
  }catch(e){if(!vigente())return;r.className='tk-read err';
    r.textContent=navigator.onLine===false?'Sin internet no se puede preparar el lector la primera vez. Escribe los datos a mano; la foto sí se guarda.':'No se pudo leer el ticket. Escribe los datos a mano; la foto sí se guarda.'}
  finally{if(n===lecturaN)progreso=null}
}
function mostrarLectura(d){
  const r=$('#tkRead');
  const imp=d.importe,lit=d.litros,pl=d.precio_litro,fecha=d.fecha;
  if(!d.legible||(!imp&&!lit&&!fecha)){r.className='tk-read err';r.textContent='No se distinguen los datos en la foto. Escribe los datos a mano o toma otra foto: de frente, con buena luz y el ticket estirado.';return}
  const set=(sel,v)=>{if(v==null)return;const i=$(sel);i.value=v;i.classList.add('leido')};
  set('#fecha',fecha);set('#monto',imp!=null?imp.toFixed(2):null);set('#litros',lit);
  const notaParts=[d.estacion,d.combustible,d.folio?('Folio '+d.folio):null].filter(Boolean);
  if(notaParts.length&&!$('#nota').value.trim())set('#nota',notaParts.join(' · '));
  updatePreview();
  const filas=[['Fecha',fecha?fdate(fecha):'no se leyó'],['Importe',imp!=null?money(imp):'no se leyó'],['Litros',lit!=null?lit+' L':'no se leyó']];
  if(pl)filas.push(['Precio por litro',money(pl)]);
  if(d.combustible)filas.push(['Combustible',d.combustible]);
  if(d.estacion)filas.push(['Estación',d.estacion]);
  if(d.folio)filas.push(['Folio',d.folio]);
  r.className='tk-read';r.innerHTML='';
  const h=document.createElement('strong');h.textContent='Datos leídos del ticket';
  const dl=document.createElement('dl');for(const [k,v] of filas){const dt=document.createElement('dt');dt.textContent=k;const dd=document.createElement('dd');dd.textContent=v;dl.append(dt,dd)}
  const p=document.createElement('div');p.className='hint';
  let aviso='Compáralos con el ticket. Si algo está mal, corrígelo en los campos de arriba antes de guardar.';
  if(imp&&lit&&pl&&d.seguro)aviso='Litros × precio cuadra con el importe. '+aviso;
  else if(imp||lit)aviso='Ojo: no se pudo comprobar que litros × precio dé el importe; revísalos con cuidado. '+aviso;
  if(!imp)aviso='No se leyó el importe: escríbelo antes de guardar. '+aviso;
  if(!fecha)aviso='No se leyó la fecha: revísala. '+aviso;
  p.textContent=aviso;r.append(h,dl,p);
  $('#guardar').textContent='Datos correctos: guardar carga';
}
['#fecha','#monto','#litros','#nota'].forEach(sel=>$(sel).addEventListener('input',e=>e.target.classList.remove('leido')));
$('#fCam').addEventListener('change',e=>elegirFoto(e.target));
$('#fGal').addEventListener('change',e=>elegirFoto(e.target));
$('#tkQuitar').onclick=quitarFoto;
async function verFoto(id){const u=await fotoUrl(id);if(!u){toast('No se encontró la foto');return}$('#vImg').src=u;$('#viewer').hidden=false}
$('#vCerrar').onclick=()=>{$('#viewer').hidden=true};
$('#viewer').onclick=e=>{if(e.target.id==='viewer')$('#viewer').hidden=true};
$('#fAdd').addEventListener('change',async e=>{
  const f=e.target.files&&e.target.files[0];e.target.value='';const id=addTarget;addTarget=null;if(!f||!id)return;
  const it=items.find(i=>i.id===id);if(!it)return;
  const fid=await subir(await comprimir(f));if(!fid)return;
  if(it.fotoId)fotoDel(it.fotoId);
  it.fotoId=fid;lsSave();render();toast('Ticket agregado');
});

function toast(m){const t=$('#toast');t.textContent=m;t.hidden=false;clearTimeout(toast.h);toast.h=setTimeout(()=>t.hidden=true,2200)}

function compute(){
  const arr=[...items].sort((a,b)=>a.fecha<b.fecha?-1:a.fecha>b.fecha?1:(a.creado||0)-(b.creado||0));
  let bal=0;
  for(const it of arr){
    if(it.tipo==='carga'){bal-=it.monto;it.diff=null}
    else if(it.tipo==='abono'){bal+=it.monto;it.diff=null}
    else {it.diff=Math.round((it.monto-bal)*100)/100;bal=it.monto}
    it.bal=Math.round(bal*100)/100;
  }
  return {arr,bal:Math.round(bal*100)/100};
}

function render(){
  const {arr,bal}=compute();
  $('#saldo').textContent=arr.length?money(bal):'$0.00';
  const lastSaldo=[...arr].reverse().find(i=>i.tipo==='saldo');
  $('#ultimo').textContent=lastSaldo?('Último saldo confirmado: '+money(lastSaldo.monto)+' el '+fdate(lastSaldo.fecha)):(arr.length?'Aún no confirmas saldo con el banco':'Registra tu saldo inicial con “Poner saldo nuevo”');
  const ym=hoy().slice(0,7);
  const mes=arr.filter(i=>i.fecha.slice(0,7)===ym);
  $('#mesLbl').textContent='Cargas de '+MESES[+ym.slice(5)-1];
  $('#sGasto').textContent=money(mes.filter(i=>i.tipo==='carga').reduce((s,i)=>s+i.monto,0));
  const ab=mes.reduce((s,i)=>s+(i.tipo==='abono'?i.monto:(i.tipo==='saldo'&&i.diff>0?i.diff:0)),0);
  $('#sAbono').textContent=money(ab);
  const lt=mes.filter(i=>i.tipo==='carga').reduce((s,i)=>s+(+i.litros||0),0);
  $('#sLitros').textContent=lt?lt.toLocaleString('es-MX',{maximumFractionDigits:2})+' L':'—';

  const list=$('#list');list.querySelectorAll('.item,.empty').forEach(n=>n.remove());
  if(!arr.length){const e=document.createElement('div');e.className='empty';e.textContent='Todavía no hay movimientos. Empieza con “Poner saldo nuevo” para poner el saldo inicial.';list.append(e)}
  for(const it of [...arr].reverse()){
    const el=document.createElement('div');el.className='item';el.dataset.t=it.tipo;el.tabIndex=0;
    const titulo=it.tipo==='carga'?'Carga de combustible':it.tipo==='abono'?'Abono a la tarjeta':'Saldo nuevo';
    const det=[fdate(it.fecha)];
    if(it.litros)det.push((+it.litros).toLocaleString('es-MX')+' L'+(it.tipo==='carga'&&it.monto&&+it.litros>0?' a $'+(it.monto/it.litros).toFixed(2)+'/L':''));
    if(it.km)det.push((+it.km).toLocaleString('es-MX')+' km');
    if(it.nota)det.push(it.nota);
    const signo=it.tipo==='carga'?'−':it.tipo==='abono'?'+':'=';
    el.innerHTML='<div class="bar"></div><div style="min-width:0"><div class="t"></div><div class="d"></div></div><div class="m"><div class="a"></div><div class="r"></div></div>';
    el.querySelector('.t').textContent=titulo;
    el.querySelector('.d').textContent=det.join(' · ');
    el.querySelector('.a').textContent=signo+' '+money(it.monto).replace('−','');
    el.querySelector('.r').textContent='saldo '+money(it.bal);
    if(it.tipo==='saldo'&&it.diff&&Math.abs(it.diff)>=0.5){
      const c=document.createElement('span');c.className='chip '+(it.diff>0?'up':'down');
      c.textContent=it.diff>0?('Te abonaron +'+money(it.diff)):('Cargo no anotado '+money(it.diff));
      el.children[1].append(c);
    }
    if(it.fotoId){
      const t=document.createElement('img');t.className='thumb';t.alt='Ticket';t.hidden=true;
      fotoUrl(it.fotoId).then(u=>{if(u){t.src=u;t.hidden=false}});
      t.onclick=ev=>{ev.stopPropagation();verFoto(it.fotoId)};
      el.children[1].append(t);
    }
    if(openId===it.id){
      const a=document.createElement('div');a.className='actions';
      const del=document.createElement('button');del.type='button';del.className='del';del.textContent='Eliminar';
      del.onclick=ev=>{ev.stopPropagation();if(del.dataset.c){remove(it.id)}else{del.dataset.c=1;del.textContent='Toca otra vez para eliminar'}};
      const no=document.createElement('button');no.type='button';no.textContent='Cerrar';no.onclick=ev=>{ev.stopPropagation();openId=null;render()};
      if(it.tipo==='carga'){
        const fb=document.createElement('button');fb.type='button';
        fb.textContent=it.fotoId?'Cambiar foto del ticket':'Agregar foto del ticket';
        fb.onclick=ev=>{ev.stopPropagation();addTarget=it.id;$('#fAdd').click()};
        a.append(fb);
      }
      a.append(del,no);el.append(a);
    }
    el.onclick=()=>{openId=openId===it.id?null:it.id;render()};
    el.onkeydown=e=>{if(e.key==='Enter')el.onclick()};
    list.append(el);
  }
  updatePreview();
}

function updatePreview(){
  const p=$('#preview');const v=parseFloat($('#monto').value);
  if(isNaN(v)){p.hidden=true;return}
  const {bal}=compute();
  if(tipo==='saldo'){const d=Math.round((v-bal)*100)/100;
    p.innerHTML='';const s=document.createElement('strong');
    s.textContent=Math.abs(d)<0.5?'Sin abono: coincide con tu saldo anterior.':d>0?('Te abonaron '+money(d)):('Faltan '+money(-d)+': hay un cargo que no anotaste.');
    p.append(s,document.createTextNode(' (saldo anterior '+money(bal)+')'));}
  else p.textContent='Saldo después: '+money(tipo==='carga'?bal-v:bal+v);
  p.hidden=false;
}

function setTipo(t){tipo=t;document.querySelectorAll('.seg button').forEach(b=>b.setAttribute('aria-pressed',b.dataset.t===t));
  $('#guardar').textContent=TXT[t].btn;$('#montoLbl').textContent=TXT[t].lbl;$('#help').textContent=TXT[t].help;
  $('#extra').hidden=t!=='carga';$('#ticket').hidden=!(t==='carga'&&window.indexedDB);updatePreview()}
document.querySelectorAll('.seg button').forEach(b=>b.onclick=()=>setTipo(b.dataset.t));
$('#monto').addEventListener('input',updatePreview);
$('#nuevoSaldo').onclick=()=>{setTipo('saldo');$('#fecha').value=hoy();$('#f').scrollIntoView({behavior:'smooth',block:'start'});setTimeout(()=>$('#monto').focus(),300)};
$('#fecha').value=hoy();setTipo('carga');

/* --- registros: almacenamiento del navegador (clave propia de esta app) --- */
const LS='tarjetaGasolina.movs';
function lsLoad(){try{return JSON.parse(localStorage.getItem(LS)||'[]')}catch(e){return[]}}
function lsSave(){try{localStorage.setItem(LS,JSON.stringify(items.map(({diff,bal,...r})=>r)));return true}catch(e){toast('No se pudo guardar en este teléfono');return false}}

async function add(rec){rec.id='l'+Date.now()+Math.random().toString(36).slice(2,5);items.push(rec);if(!lsSave()){items.pop();return false}render();return true}
async function remove(id){
  openId=null;const it=items.find(i=>i.id===id);
  items=items.filter(i=>i.id!==id);lsSave();if(it&&it.fotoId)fotoDel(it.fotoId);render();toast('Movimiento eliminado');
}

$('#f').addEventListener('submit',async e=>{
  e.preventDefault();
  const monto=parseFloat($('#monto').value);if(isNaN(monto)||monto<0){toast('Escribe un importe válido');return}
  const rec={tipo,fecha:$('#fecha').value||hoy(),monto:Math.round(monto*100)/100,creado:Date.now()};
  if(tipo==='carga'){const l=parseFloat($('#litros').value),k=parseFloat($('#km').value);if(!isNaN(l))rec.litros=l;if(!isNaN(k))rec.km=k}
  const n=$('#nota').value.trim();if(n)rec.nota=n;
  const b=$('#guardar');b.disabled=true;
  if(tipo==='carga'&&foto){const fid=await subir(foto);if(!fid){b.disabled=false;return}rec.fotoId=fid}
  const ok=await add(rec);b.disabled=false;
  if(ok){quitarFoto();$('#monto').value='';$('#litros').value='';$('#km').value='';$('#nota').value='';updatePreview();
    toast(tipo==='carga'?'Carga guardada':tipo==='abono'?'Abono guardado':'Saldo actualizado')}
});

/* --- respaldo y restauración (archivo .json con fotos incluidas) --- */
const aDataUrl=b=>new Promise(r=>{const fr=new FileReader();fr.onload=()=>r(fr.result);fr.onerror=()=>r(null);fr.readAsDataURL(b)});
$('#respaldo').onclick=async()=>{
  toast('Preparando respaldo…');
  const fotos={};
  for(const it of items)if(it.fotoId){const b=await fotoGet(it.fotoId).catch(()=>null);if(b)fotos[it.fotoId]=await aDataUrl(b)}
  const data={app:'tarjeta-gasolina',version:1,creado:new Date().toISOString(),movimientos:items.map(({diff,bal,...r})=>r),fotos};
  const blob=new Blob([JSON.stringify(data)],{type:'application/json'});
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='respaldo-gasolina-'+hoy()+'.json';
  document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),5000);
};
$('#restaurar').onclick=()=>$('#fRes').click();
$('#fRes').addEventListener('change',async e=>{
  const f=e.target.files&&e.target.files[0];e.target.value='';if(!f)return;
  let d;try{d=JSON.parse(await f.text())}catch(err){toast('Ese archivo no es un respaldo válido');return}
  if(!d||!Array.isArray(d.movimientos)){toast('Ese archivo no es un respaldo válido');return}
  const ids=new Set(items.map(i=>i.id));let n=0;
  for(const m of d.movimientos){
    if(!m||!m.tipo||!m.fecha||typeof m.monto!=='number'||ids.has(m.id))continue;
    const rec=Object.assign({},m);if(!rec.id)rec.id='r'+Date.now()+n;
    if(rec.fotoId&&d.fotos&&d.fotos[rec.fotoId]){try{const b=await (await fetch(d.fotos[rec.fotoId])).blob();await fotoPut(rec.fotoId,b)}catch(err){delete rec.fotoId}}
    else delete rec.fotoId;
    items.push(rec);ids.add(rec.id);n++;
  }
  lsSave();render();toast(n?('Se recuperaron '+n+' movimientos'):'No había movimientos nuevos en el respaldo');
});

$('#copiar').onclick=async()=>{
  const {arr}=compute();
  const lines=['Fecha\tTipo\tImporte\tLitros\tKm\tSaldo\tNota'];
  for(const i of arr)lines.push([i.fecha,i.tipo==='saldo'?'Saldo nuevo':i.tipo==='carga'?'Carga':'Abono',i.monto.toFixed(2),i.litros||'',i.km||'',i.bal.toFixed(2),i.nota||''].join('\t'));
  const txt=lines.join('\n');const ta=$('#csv');ta.value=txt;
  try{await navigator.clipboard.writeText(txt);toast('Historial copiado')}catch(e){ta.hidden=false;ta.focus();ta.select();toast('Mantén presionado el texto y copia')}
};

items=lsLoad();render();
if(navigator.storage&&navigator.storage.persist)navigator.storage.persist().catch(()=>{});
})();
