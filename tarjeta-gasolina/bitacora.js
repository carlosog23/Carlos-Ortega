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
function parseTicket(raw, hoyStr){
  const MES={ENE:1,FEB:2,MAR:3,ABR:4,MAY:5,JUN:6,JUL:7,AGO:8,SEP:9,SET:9,OCT:10,NOV:11,DIC:12,JAN:1,APR:4,AUG:8,DEC:12};
  const T=String(raw||'').toUpperCase()
    .replace(/[ÁÀ]/g,'A').replace(/[ÉÈ]/g,'E').replace(/[ÍÌ]/g,'I').replace(/[ÓÒ]/g,'O').replace(/[ÚÙÜ]/g,'U');
  const lines=T.split(/\r?\n/).map(l=>l.trim()).filter(Boolean);
  // Corrige confusiones típicas del OCR dentro de cifras
  const fixNum=s=>{for(let k=0;k<2;k++)s=s.replace(/(\d)O(?=\d)/g,'$10').replace(/(\d[.,])O/g,'$10').replace(/(\d)O(?=[.,]\d)/g,'$10').replace(/(\d)[IL|](?=\d)/g,'$11');return s};
  const nums=l=>{
    const out=[];const re=/\$?\s?(\d{1,3}(?:,\d{3})+|\d+)(?:[.,](\d{1,3}))?/g;let m;
    const s=fixNum(l);
    while((m=re.exec(s))){
      const ent=m[1].replace(/,/g,'');const dec=m[2];
      // "1,080" sin decimales y con coma de miles
      let v=dec!=null?parseFloat(ent+'.'+dec):parseFloat(ent);
      if(!isFinite(v))continue;
      out.push({v,dec:dec?dec.length:0,money:/\$/.test(m[0]),i:m.index});
      // Una raya vertical o un "$" mal leído suele aparecer como 1 o 7 al inicio: guarda también esa variante
      if(dec&&/^[17]\d/.test(ent))out.push({v:parseFloat(ent.slice(1)+'.'+dec),dec:dec.length,alt:true,i:m.index});
    }
    return out;
  };
  const all=[];lines.forEach((l,li)=>nums(l).forEach(n=>{n.li=li;all.push(n)}));
  const r2=v=>Math.round(v*100)/100;

  // --- Fecha ---
  let fecha=null;
  const hoy=hoyStr?new Date(hoyStr+'T12:00:00'):new Date();
  const val=(y,m,d)=>{if(y<100)y+=2000;if(m<1||m>12||d<1||d>31)return null;
    const dt=new Date(y,m-1,d,12);if(dt.getMonth()!==m-1)return null;
    const dias=(hoy-dt)/864e5;if(dias<-2||dias>500)return null;
    return y+'-'+String(m).padStart(2,'0')+'-'+String(d).padStart(2,'0')};
  const fechaLines=[...lines.filter(l=>/FECHA|FEC\b/.test(l)),...lines];
  for(const l of fechaLines){
    const s=fixNum(l);let m;
    if((m=s.match(/\b(\d{1,2})\s?[\/\-.]\s?(\d{1,2})\s?[\/\-.]\s?(\d{4}|\d{2})\b/))){fecha=val(+m[3],+m[2],+m[1]);if(!fecha)fecha=val(+m[3],+m[1],+m[2])}
    else if((m=l.replace(/([\/\-. ])0(?=[A-Z]{2})/g,'$1O').match(/\b(\d{1,2})\s?[\/\-. ]\s?([A-Z]{3})[A-Z]*\.?\s?[\/\-. ]\s?(\d{4}|\d{2})\b/))&&MES[m[2]])fecha=val(+m[3],MES[m[2]],+m[1]);
    else if((m=s.match(/\b(20\d{2})[\/\-.](\d{1,2})[\/\-.](\d{1,2})\b/)))fecha=val(+m[1],+m[2],+m[3]);
    if(fecha)break;
  }

  // --- Etiquetas ---
  const labeled=(re,excl)=>{const res=[];lines.forEach((l,li)=>{if(re.test(l)&&!(excl&&excl.test(l))){
      let ns=nums(l.replace(re,' ')).filter(n=>n.dec>0);
      if(!ns.length&&lines[li+1])ns=nums(lines[li+1]).filter(n=>n.dec>0);
      ns.forEach(n=>res.push(n.v))}});return res};
  const totales=labeled(/TOTAL|IMPORTE|A PAGAR|MONTO|VENTA/,/SUBTOTAL|SUB TOTAL|SUB-TOTAL|IVA|SALDO/);
  const litrosL=labeled(/LITROS|\bLTS?\b|\bLT\.|CANTIDAD|VOLUMEN|\bL\b/);
  const precioL=labeled(/PRECIO|P\.?\s?U\.?|\$\s?\/\s?L|UNITARIO/);

  // --- Búsqueda de la terna coherente: litros × precio ≈ importe ---
  const cand=all.filter(n=>n.dec>0&&n.v>0);
  let best=null;
  for(const p of cand){if(p.v<14||p.v>45)continue;
    for(const l of cand){if(l===p||l.v<0.5||l.v>400)continue;
      const prod=l.v*p.v;
      for(const t of cand){if(t===p||t===l)continue;
        const err=Math.abs(prod-t.v);if(err>Math.max(0.8,t.v*0.006))continue;
        let sc=0;if(totales.includes(t.v))sc+=3;if(litrosL.includes(l.v))sc+=2;if(precioL.includes(p.v))sc+=2;
        if(l.dec===3)sc+=1;if(t.dec===2)sc+=1;sc-=err/10;if(p.alt||l.alt||t.alt)sc-=1.5;
        if(!best||sc>best.sc)best={sc,l:l.v,p:p.v,t:t.v}}}}

  let importe=null,litros=null,precio=null;
  if(best){importe=best.t;litros=best.l;precio=best.p;
    // si hay un TOTAL etiquetado más grande que coincide, gana (p. ej. con propina o redondeo no)
  }else{
    importe=totales.length?totales[totales.length-1]:null;
    litros=litrosL.find(v=>v>0.5&&v<400)??null;
    precio=precioL.find(v=>v>=14&&v<=45)??null;
    if(importe==null&&litros&&precio)importe=r2(litros*precio);
    if(litros==null&&importe&&precio)litros=Math.round(importe/precio*1000)/1000;
    if(precio==null&&importe&&litros)precio=r2(importe/litros);
  }
  if(importe!=null&&(importe<20||importe>20000))importe=null;

  // --- Otros datos ---
  let combustible=null;const mc=T.match(/MAGNA|PREMIUM|DIESEL|DIÉSEL|REGULAR|SUPER|ROJA|VERDE/);
  if(mc)combustible={ROJA:'Premium',VERDE:'Magna',REGULAR:'Regular',SUPER:'Premium'}[mc[0]]||mc[0][0]+mc[0].slice(1).toLowerCase();
  let folio=null;const mf=fixNum(T).match(/(?:FOLIO|TICKET|TRANSACCION|TRANS\.?|NO\.?\s?OPER(?:ACION)?|DESPACHO|NOTA)\s*[:#NO.\s]*([A-Z0-9\-]{3,})/);
  if(mf&&/\d/.test(mf[1]))folio=mf[1];
  let estacion=null;const me=fixNum(T).match(/(?:E\.?\s?S\.?|ESTACION|EST\.|NO\.?\s?EST(?:ACION)?)\s*[:#NO.\s]*(\d{3,6})/);
  if(me)estacion='E.S. '+me[1];

  const legible=!!(importe||litros||fecha);
  return {legible,fecha,importe:importe!=null?r2(importe):null,litros:litros!=null?Math.round(litros*1000)/1000:null,
          precio_litro:precio!=null?r2(precio):null,combustible,estacion,folio};
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
/* Escala de grises y contraste para que el texto térmico se distinga mejor */
function prepararImagen(blob){
  return new Promise(res=>{const url=URL.createObjectURL(blob);const img=new Image();
    img.onload=()=>{const max=2000;let w=img.naturalWidth,h=img.naturalHeight;const k=Math.min(1,max/Math.max(w,h));w=Math.round(w*k);h=Math.round(h*k);
      const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d',{willReadFrequently:true});x.drawImage(img,0,0,w,h);URL.revokeObjectURL(url);
      try{const d=x.getImageData(0,0,w,h),p=d.data,hist=new Uint32Array(256);
        for(let i=0;i<p.length;i+=4){const g=(p[i]*299+p[i+1]*587+p[i+2]*114)/1000|0;p[i]=g;hist[g]++}
        const n=w*h;let lo=0,hi=255,acc=0;for(;lo<255;lo++){acc+=hist[lo];if(acc>n*0.02)break}
        acc=0;for(;hi>0;hi--){acc+=hist[hi];if(acc>n*0.02)break}
        const sc=hi>lo?255/(hi-lo):1;
        for(let i=0;i<p.length;i+=4){let g=(p[i]-lo)*sc;g=g<0?0:g>255?255:g;p[i]=p[i+1]=p[i+2]=g}
        x.putImageData(d,0,0)}catch(e){}
      res(c)};
    img.onerror=()=>{URL.revokeObjectURL(url);res(null)};img.src=url});
}
async function leerTicket(file,ref){
  const r=$('#tkRead');limpiarLectura();const n=++lecturaN;
  const vigente=()=>n===lecturaN&&foto===ref;
  r.hidden=false;r.textContent=ocrWorker?'Leyendo los datos del ticket…':'Preparando el lector de tickets (la primera vez tarda un poco más)…';
  try{
    const lienzo=await prepararImagen(file);if(!lienzo)throw new Error('imagen');
    const w=await obtenerLector();if(!vigente())return;
    progreso=m=>{if(vigente()&&m.status==='recognizing text')r.textContent='Leyendo los datos del ticket… '+Math.round(m.progress*100)+'%'};
    await w.setParameters({tessedit_pageseg_mode:'6',preserve_interword_spaces:'1'});
    let txt=(await w.recognize(lienzo)).data.text;if(!vigente())return;
    let d=parseTicket(txt,hoy());
    if(!(d.importe&&d.litros&&d.fecha)){
      await w.setParameters({tessedit_pageseg_mode:'4'});
      txt+='\n'+(await w.recognize(lienzo)).data.text;if(!vigente())return;
      d=parseTicket(txt,hoy());
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
  if(imp&&lit&&pl&&Math.abs(lit*pl-imp)>Math.max(2,imp*0.02))aviso='Ojo: litros × precio no da el importe. '+aviso;
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
