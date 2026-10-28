/* Tlamatini · Reconocimientos y diplomas
   Se carga solo al entrar al apartado. Todo se hace en el dispositivo: los nombres de los alumnos
   no salen del equipo (la lectura de fotos también corre aquí, con Tesseract).
   Parte 1: motor de diseño (PDF con pdf-lib).  Parte 2: pantalla, listas e importación. */

/* =====================================================================
   PARTE 1 · MOTOR DE DISEÑO
   ===================================================================== */
const RK_FUENTES={
  script:"formatos/fonts/dip-script.ttf", pacifico:"formatos/fonts/dip-pacifico.ttf",
  cinzelB:"formatos/fonts/dip-cinzel-bold.ttf", cinzel:"formatos/fonts/dip-cinzel.ttf",
  playB:"formatos/fonts/dip-playfair-bold.ttf", playI:"formatos/fonts/dip-playfair-italic.ttf",
  lora:"formatos/fonts/dip-lora.ttf", loraI:"formatos/fonts/dip-lora-italic.ttf",
  fredoka:"formatos/fonts/dip-fredoka.ttf", mont:"formatos/fonts/dip-montserrat.ttf", montB:"formatos/fonts/dip-montserrat-bold.ttf"};

const RK_DISENOS=[
  {id:"clasico",nombre:"Clásico elegante",desc:"Doble marco con adornos en las esquinas.",letra:"script",pal:"anil"},
  {id:"greca",nombre:"Greca",desc:"Cenefa escalonada de inspiración mesoamericana.",letra:"playB",pal:"terracota"},
  {id:"infantil",nombre:"Infantil",desc:"Banderines, estrellas y colores alegres.",letra:"fredoka",pal:"multicolor"},
  {id:"moderno",nombre:"Moderno",desc:"Franja de color y letra limpia.",letra:"playB",pal:"verde"},
  {id:"honor",nombre:"Cuadro de honor",desc:"Medalla y laureles, para logros destacados.",letra:"cinzelB",pal:"vino"},
  {id:"fondo",nombre:"Mi propio fondo",desc:"Suba una imagen o un diploma que le guste y Tlamatini escribe encima.",letra:"script",pal:"anil"}];

const RK_PALETAS=[
  {id:"anil",nombre:"Añil y oro",c1:"#1F3A6B",c2:"#B8892B",c3:"#FBF7EE"},
  {id:"terracota",nombre:"Terracota",c1:"#A64B2A",c2:"#1F3A6B",c3:"#F7F1E5"},
  {id:"verde",nombre:"Verde bosque",c1:"#2E6B3F",c2:"#C29A3A",c3:"#F3F7F1"},
  {id:"vino",nombre:"Vino y oro",c1:"#7A1F3D",c2:"#B8892B",c3:"#FBF5F2"},
  {id:"cielo",nombre:"Azul cielo",c1:"#1A6FB4",c2:"#F2A900",c3:"#F1F7FC"},
  {id:"multicolor",nombre:"Multicolor",c1:"#2E86AB",c2:"#E4572E",c3:"#FFFBF0",k:["#E4572E","#F6AE2D","#76B041","#2E86AB","#9B5DE5"]}];

const RK_LETRAS=[["script","Manuscrita elegante"],["playB","Clásica"],["cinzelB","Romana"],["pacifico","Alegre"],["fredoka","Redondeada"],["montB","Moderna"]];
const RK_TIPOS=["Reconocimiento","Diploma","Constancia","Mención honorífica"];

const rkHex=h=>{h=String(h||"#000").replace("#","");if(h.length===3)h=[...h].map(c=>c+c).join("");const n=parseInt(h,16)||0;return[(n>>16&255)/255,(n>>8&255)/255,(n&255)/255]};
const rkMix=(a,b,t)=>a.map((v,i)=>v+(b[i]-v)*t);
const RK_MESES=["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"];
function rkFechaLarga(v){const m=String(v||"").match(/^(\d{4})-(\d{2})-(\d{2})$/);if(!m)return"";return`${+m[3]} de ${RK_MESES[+m[2]-1]} de ${m[1]}`}
const RK_MENORES=new Set(["de","del","la","las","los","y","e","da","van","von"]);
function rkCaso(t,modo){t=String(t||"").replace(/\s+/g," ").trim();if(modo==="mayus")return t.toLocaleUpperCase("es-MX");if(modo!=="titulo")return t;
  return t.toLocaleLowerCase("es-MX").split(" ").map((w,i)=>i&&RK_MENORES.has(w)?w:w.replace(/(^|[-'])(\p{L})/gu,(m,a,b)=>a+b.toLocaleUpperCase("es-MX"))).join(" ")}
/* «LÓPEZ RUIZ ANA SOFÍA» → «ANA SOFÍA LÓPEZ RUIZ» (los dos apellidos van primero en las listas oficiales) */
function rkApellidosAlFinal(n){const p=String(n||"").trim().split(/\s+/);if(p.length<3)return n;const k=RK_MENORES.has(p[0].toLowerCase())?3:2;return p.slice(k).concat(p.slice(0,k)).join(" ")}
function rkApellidosAlInicio(n){const p=String(n||"").trim().split(/\s+/);if(p.length<3)return n;return p.slice(-2).concat(p.slice(0,-2)).join(" ")}
const rkOrdinal=l=>{const t=String(l||"").toLowerCase();const m=t.match(/(\d+)/);if(m)return m[1]+"°";
  const o={primer:"1°",primero:"1°",segundo:"2°",tercer:"3°",tercero:"3°",cuarto:"4°",quinto:"5°"};for(const k in o)if(t.includes(k))return o[k];return""};

/* Diseño y página: devuelve la caja de contenido y dibuja los adornos */
function rkPagina(cfg){const vert=cfg.orient==="vertical";return vert?{PW:612,PH:792,vert}:{PW:792,PH:612,vert}}

async function rkPDF(cfg,personas,env){
  const{PDFLib,fontkit}=env;const{PDFDocument,rgb,degrees}=PDFLib;
  const doc=await PDFDocument.create();doc.registerFontkit(fontkit);
  const F={};const usar=new Set(["cinzelB","cinzel","lora","loraI","mont","montB","playB",cfg.letra||"script","pacifico","fredoka","playI"]);
  for(const k of usar)F[k]=await doc.embedFont(await env.bytes(RK_FUENTES[k]),{subset:true});
  const img=async d=>{if(!d)return null;try{if(d instanceof Uint8Array||d instanceof ArrayBuffer){const u=new Uint8Array(d);return u[0]===0x89?await doc.embedPng(u):await doc.embedJpg(u)}
    return/^data:image\/png/.test(d)?await doc.embedPng(d):await doc.embedJpg(d)}catch(e){return null}};
  const I={inst:cfg.logos.inst?await img(env.inst):null,zona:cfg.logos.zona?await img(env.zona):null,esc:cfg.logos.esc?await img(env.esc):null,
    firma:cfg.firmaDig?await img(env.firma):null,fondo:cfg.diseno==="fondo"?await img(env.fondo):null};
  const pal=cfg.pal==="imagen"&&cfg.palImg?cfg.palImg:(RK_PALETAS.find(p=>p.id===cfg.pal)||RK_PALETAS[0]);
  const c1=rgb(...rkHex(pal.c1)),c2=rgb(...rkHex(pal.c2)),c3=rgb(...rkHex(pal.c3||"#FBF7EE"));
  const K=(pal.k||[pal.c2,pal.c1,"#F6AE2D","#76B041","#E4572E"]).map(h=>rgb(...rkHex(h)));
  const tinta=rgb(.16,.16,.19),gris=rgb(.38,.38,.43),blanco=rgb(1,1,1);
  const{PW,PH,vert}=rkPagina(cfg);const ink=!!cfg.ahorro;

  const lista=(personas&&personas.length?personas:[{nombre:"Nombre de la alumna o el alumno"}]).slice(0,env.max||400);
  for(const per of lista){
    const pg=doc.addPage([PW,PH]);
    const Y=t=>PH-t;
    const w=(t,f,s)=>f.widthOfTextAtSize(t,s);
    const fit=(t,f,s,maxW,min=6)=>{while(s>min&&w(t,f,s)>maxW)s-=0.5;return s};
    const ctr=(t,cx,top,s,f,col)=>{if(!t)return 0;pg.drawText(t,{x:cx-w(t,f,s)/2,y:Y(top),size:s,font:f,color:col});return w(t,f,s)};
    const espaciado=(t,cx,top,s,f,col,sp)=>{const ch=[...t];const tot=ch.reduce((a,c)=>a+w(c,f,s),0)+sp*(ch.length-1);let x=cx-tot/2;
      ch.forEach(c=>{pg.drawText(c,{x,y:Y(top),size:s,font:f,color:col});x+=w(c,f,s)+sp});return tot};
    const svg=(p,o)=>pg.drawSvgPath(p,Object.assign({x:0,y:PH},o));
    const rect=(x,top,ww,hh,o)=>pg.drawRectangle(Object.assign({x,y:Y(top)-hh,width:ww,height:hh},o));
    const pic=(im,x,top,ww,hh,al="c")=>{if(!im)return 0;const k=Math.min(ww/im.width,hh/im.height),iw=im.width*k,ih=im.height*k;
      const xx=al==="l"?x:al==="r"?x+ww-iw:x+(ww-iw)/2;pg.drawImage(im,{x:xx,y:Y(top)-hh+(hh-ih)/2,width:iw,height:ih});return iw};
    const star=(cx,cy,r,n=5,ri=.45)=>{let p="";for(let i=0;i<n*2;i++){const a=-Math.PI/2+i*Math.PI/n,rr=i%2?r*ri:r;p+=(i?"L":"M")+(cx+rr*Math.cos(a)).toFixed(2)+" "+(cy+rr*Math.sin(a)).toFixed(2)}return p+"Z"};
    const rrect=(x,y,ww,hh,r)=>`M${x+r} ${y}H${x+ww-r}A${r} ${r} 0 0 1 ${x+ww} ${y+r}V${y+hh-r}A${r} ${r} 0 0 1 ${x+ww-r} ${y+hh}H${x+r}A${r} ${r} 0 0 1 ${x} ${y+hh-r}V${y+r}A${r} ${r} 0 0 1 ${x+r} ${y}Z`;

    /* ---------- adornos de cada diseño y caja del contenido ---------- */
    let box,col={tit:c1,nom:c1,pre:tinta,txt:tinta,sub:gris,lin:c2,fir:c1},fT=F.cinzelB,fP=F.loraI,fM=F.lora,fS=F.mont,fSB=F.montB,tituloSp=4;
    const M=22;
    if(cfg.diseno==="clasico"){
      if(!ink)rect(M,M,PW-2*M,PH-2*M,{color:c3});
      rect(M,M,PW-2*M,PH-2*M,{borderColor:c1,borderWidth:ink?2:3.4});
      rect(M+8,M+8,PW-2*M-16,PH-2*M-16,{borderColor:c2,borderWidth:.9});
      const esq=(x,y,sx,sy)=>{const q=(r)=>`M${x+sx*r} ${y}A${r} ${r} 0 0 ${sx*sy>0?1:0} ${x} ${y+sy*r}`;
        svg(q(30),{borderColor:c2,borderWidth:1});svg(q(22),{borderColor:c2,borderWidth:.7});
        svg(`M${x+sx*6} ${y+sy*6}l${sx*5} ${sy*-5}l${sx*5} ${sy*5}l${sx*-5} ${sy*5}Z`,{color:c1});
        svg(star(x+sx*40,y+sy*8,3.2,4,.35),{color:c2});svg(star(x+sx*8,y+sy*40,3.2,4,.35),{color:c2})};
      const a=M+14;esq(a,a,1,1);esq(PW-a,a,-1,1);esq(a,PH-a,1,-1);esq(PW-a,PH-a,-1,-1);
      box={x:M+46,top:M+30,w:PW-2*(M+46),h:PH-2*(M+30)};
    }else if(cfg.diseno==="greca"){
      const bh=30,u=bh/6;const banda=(top,inv)=>{const tw=6*u;let x=M;let i=0;
        rect(M,top,PW-2*M,bh,ink?{borderColor:c1,borderWidth:.8}:{color:c3});
        while(x+tw<=PW-M+0.1){const c=i%2?c2:c1;const t0=top+u*1.5,uu=u;
          const P=inv?`M${x} ${t0}h${6*uu}v${uu}h${-uu}v${uu}h${-uu}v${uu}h${-2*uu}v${-uu}h${-uu}v${-uu}h${-uu}Z`
                     :`M${x} ${t0+3*uu}v${-uu}h${uu}v${-uu}h${uu}v${-uu}h${2*uu}v${uu}h${uu}v${uu}h${uu}v${uu}Z`;
          svg(P,{color:c});svg(`M${x+2.5*uu} ${t0+(inv?.5:1.5)*uu}h${uu}v${uu}h${-uu}Z`,{color:ink?c:c3});x+=tw;i++}
        rect(M,top,PW-2*M,.9,{color:c1});rect(M,top+bh-.9,PW-2*M,.9,{color:c1})};
      banda(M,false);banda(PH-M-bh,true);
      rect(M,M,1.2,PH-2*M,{color:c1});rect(PW-M-1.2,M,1.2,PH-2*M,{color:c1});
      rect(M+6,M+bh+6,.6,PH-2*M-2*bh-12,{color:c2});rect(PW-M-6.6,M+bh+6,.6,PH-2*M-2*bh-12,{color:c2});
      col.tit=c2;box={x:M+40,top:M+bh+16,w:PW-2*(M+40),h:PH-2*(M+bh+16)};
    }else if(cfg.diseno==="infantil"){
      fT=F.pacifico;fP=F.fredoka;fM=F.fredoka;tituloSp=0;col.tit=K[3]||c1;col.nom=K[0]||c2;col.lin=K[1]||c2;col.fir=K[3]||c1;
      if(!ink)svg(rrect(M,M,PW-2*M,PH-2*M,26),{color:c3});
      svg(rrect(M,M,PW-2*M,PH-2*M,26),{borderColor:K[3]||c1,borderWidth:5});
      const per_=2*(PW+PH-4*M),paso=22;let d=0,i=0;const pt=t=>{const ww=PW-2*M-20,hh=PH-2*M-20,x0=M+10,y0=M+10;
        if(t<ww)return[x0+t,y0];t-=ww;if(t<hh)return[x0+ww,y0+t];t-=hh;if(t<ww)return[x0+ww-t,y0+hh];t-=ww;return[x0,y0+hh-t]};
      const L=2*(PW-2*M-20)+2*(PH-2*M-20);for(d=0;d<L;d+=paso){const[x,y]=pt(d);pg.drawCircle({x,y:Y(y),size:2.2,color:K[i++%K.length]})}
      /* banderines */
      const bx0=M+60,bx1=PW-M-60,by=M+18;let p=`M${bx0} ${by}`;const n=vert?9:13,sp=(bx1-bx0)/n;
      for(let j=1;j<=n;j++)p+=`Q${bx0+sp*(j-.5)} ${by+10} ${bx0+sp*j} ${by}`;svg(p,{borderColor:gris,borderWidth:.7});
      for(let j=0;j<n;j++){const x=bx0+sp*j+sp*.18,ww=sp*.64;svg(`M${x} ${by+4}L${x+ww} ${by+4}L${x+ww/2} ${by+26}Z`,{color:K[j%K.length],opacity:ink?.55:1})}
      [[M+44,PH-M-48,15,0],[M+78,PH-M-34,8,1],[PW-M-44,PH-M-48,15,2],[PW-M-80,PH-M-30,8,3],[M+40,PH/2+40,7,4],[PW-M-40,PH/2+40,7,0]].forEach(([x,y,r,c])=>svg(star(x,y,r),{color:K[c%K.length],opacity:ink?.6:1}));
      box={x:M+44,top:M+44,w:PW-2*(M+44),h:PH-2*(M+44)-8};
    }else if(cfg.diseno==="moderno"){
      fT=F.montB;fP=F.mont;fM=F.mont;tituloSp=5;
      if(vert){const bh=ink?10:78;rect(0,0,PW,bh,{color:c1});svg(`M0 ${bh}L${PW*.42} ${bh}L${PW*.36} ${bh+8}L0 ${bh+8}Z`,{color:c2});rect(0,PH-14,PW,14,{color:c1});
        box={x:56,top:bh+30,w:PW-112,h:PH-bh-30-50}}
      else{const bw=ink?12:118;rect(0,0,bw,PH,{color:c1});svg(`M${bw} 0L${bw+9} 0L${bw+9} ${PH*.38}L${bw} ${PH*.44}Z`,{color:c2});
        if(!ink){for(let k=0;k<5;k++)pg.drawCircle({x:bw/2,y:Y(PH-70-k*16),size:2.4,color:c2,opacity:.9-k*.15})}
        rect(bw+9,PH-10,PW-bw-9,10,{color:c1,opacity:ink?.5:1});box={x:bw+52,top:42,w:PW-bw-52-48,h:PH-42-58}}
      col.lin=c2;
    }else if(cfg.diseno==="honor"){
      fT=F.playB;tituloSp=3;
      if(!ink)rect(M,M,PW-2*M,PH-2*M,{color:c3});
      rect(M,M,PW-2*M,PH-2*M,{borderColor:c2,borderWidth:2.2});rect(M+5,M+5,PW-2*M-10,PH-2*M-10,{borderColor:c2,borderWidth:.6});
      rect(M+11,M+11,PW-2*M-22,PH-2*M-22,{borderColor:c1,borderWidth:1.2});
      box={x:M+50,top:M+28,w:PW-2*(M+50),h:PH-2*(M+28)};
    }else{ /* fondo propio */
      if(I.fondo){const im=I.fondo,cover=cfg.fondo.ajuste!=="ajustar";const k=cover?Math.max(PW/im.width,PH/im.height):Math.min(PW/im.width,PH/im.height);
        const iw=im.width*k,ih=im.height*k;pg.drawImage(im,{x:(PW-iw)/2,y:(PH-ih)/2,width:iw,height:ih})}
      const ct=rgb(...rkHex(cfg.fondo.color||"#1F3A6B"));col={tit:ct,nom:ct,pre:ct,txt:ct,sub:ct,lin:ct,fir:ct};
      const mg=Math.max(20,Math.min(140,+cfg.fondo.margen||60));box={x:mg,top:mg*.8,w:PW-2*mg,h:PH-1.6*mg};
    }

    /* ---------- contenido ---------- */
    const B=box,cx=B.x+B.w/2,esF=cfg.diseno==="fondo";const dy=esF?(+cfg.fondo.dy||0):0,fdy=esF?(+cfg.fondo.fdy||0):0;const zz=esF?(+cfg.fondo.esc||1):1;
    const mostrar=k=>!esF||cfg.fondo.ver[k]!==false;
    const fr=vert?{tit:.235,pre:.32,nom:.43,gr:.48,mot:.54,lug:.715,fec:.80}:{tit:.255,pre:.35,nom:.475,gr:.535,mot:.595,lug:.75,fec:.82};
    const T=k=>B.top+B.h*fr[k]+dy;

    /* encabezado */
    if(mostrar("encabezado")){const lh=vert?52:46;let xl=B.x;
      if(I.inst)xl+=pic(I.inst,xl,B.top,vert?70:66,lh,"l")+8;if(I.zona)pic(I.zona,xl,B.top+2,lh-4,lh-4,"l");
      if(I.esc)pic(I.esc,B.x+B.w-lh-6,B.top-2,lh+6,lh+4,"r");
      const mw=vert?B.w*.92:B.w-300;const h0=vert?B.top+lh+4:B.top;const l1=cfg.inst||"INSTITUTO DE SERVICIOS EDUCATIVOS Y PEDAGÓGICOS DE BAJA CALIFORNIA";
      ctr(l1,cx,h0+12,fit(l1,fSB,7.2,mw),fSB,col.sub);
      const esc_=`${cfg.esc.tipo||"Escuela Primaria"} «${cfg.esc.nombre||""}»`.toLocaleUpperCase("es-MX");
      if(cfg.esc.nombre)ctr(esc_,cx,h0+27,fit(esc_,fT===F.pacifico?F.fredoka:F.cinzelB,12,mw),fT===F.pacifico?F.fredoka:F.cinzelB,col.tit);
      const l3=[cfg.esc.cct&&`C.C.T. ${cfg.esc.cct.toUpperCase()}`,cfg.esc.zona&&`ZONA ESCOLAR ${cfg.esc.zona}`,cfg.ciclo&&cfg.cicloTxt&&`CICLO ESCOLAR ${cfg.cicloTxt}`].filter(Boolean).join("  ·  ");
      ctr(l3,cx,h0+39,fit(l3,fS,7,mw),fS,col.sub)}

    const fN=F[cfg.letra]||F.script;const nom=rkCaso(per.nombre,cfg.caso);
    let sNom=(fN===F.script?(vert?48:54):fN===F.pacifico?(vert?36:40):(vert?32:36))*zz;sNom=fit(nom,fN,sNom,B.w*(cfg.diseno==="honor"?.66:.88),12);
    /* medalla del cuadro de honor */
    const lug=String(per.lugar||cfg.lugarGral||"").trim();
    if(cfg.diseno==="honor"){const my=B.top+(vert?122:70),mx=cx,r=vert?22:19;
      svg(`M${mx-r*.8} ${my+r*.5}L${mx-r*1.25} ${my+r*2.1}L${mx-r*.6} ${my+r*1.75}L${mx-r*.35} ${my+r*2.35}L${mx} ${my+r*.7}Z`,{color:c1});
      svg(`M${mx+r*.8} ${my+r*.5}L${mx+r*1.25} ${my+r*2.1}L${mx+r*.6} ${my+r*1.75}L${mx+r*.35} ${my+r*2.35}L${mx} ${my+r*.7}Z`,{color:c1});
      pg.drawCircle({x:mx,y:Y(my),size:r,color:c2});pg.drawCircle({x:mx,y:Y(my),size:r*.78,borderColor:blanco,borderWidth:.9,color:c2});
      const o=rkOrdinal(lug);if(o)ctr(o,mx,my+r*.32,r*.95,F.playB,blanco);else svg(star(mx,my,r*.5),{color:blanco});
      /* laureles a los lados del nombre */
      const rama=(sx)=>{const cy0=T("nom")-2,R=vert?40:52,x0=cx+sx*Math.min(B.w*.5-8,w(nom,fN,sNom)/2+46);for(let i=0;i<9;i++){const a=(-62+i*15)*Math.PI/180;
          const lx=x0-sx*R*(1-Math.cos(a))*.55,ly=cy0+R*Math.sin(a);pg.drawEllipse({x:lx,y:Y(ly),xScale:7.5,yScale:2.8,rotate:degrees(sx*(-(-62+i*15)+70)),color:i%2?c2:c1,opacity:.95})}
        const pth=[];for(let i=0;i<=8;i++){const a=(-62+i*15)*Math.PI/180;pth.push(`${(x0-sx*R*(1-Math.cos(a))*.55).toFixed(1)} ${(cy0+R*Math.sin(a)).toFixed(1)}`)}
        svg("M"+pth.join("L"),{borderColor:c1,borderWidth:.8})};
      rama(-1);rama(1)}

    /* título */
    const tipo=(cfg.tipo==="Otro"?cfg.tipoOtro:cfg.tipo)||"Reconocimiento";
    if(mostrar("titulo")){const tt=fT===F.pacifico?tipo:tipo.toLocaleUpperCase("es-MX");let s=(fT===F.pacifico?(vert?46:44):(vert?36:40))*zz;
      const ancho=t=>[...t].reduce((a,c)=>a+w(c,fT,s),0)+tituloSp*s/40*([...t].length-1);while(s>14&&ancho(tt)>B.w*.86)s-=1;
      const top=T("tit")+(cfg.diseno==="honor"?(vert?46:22):0);
      espaciado(tt,cx,top,s,fT,col.tit,tituloSp*s/40);
      if(cfg.diseno!=="infantil"&&!esF){const lw=Math.min(B.w*.5,ancho(tt)*.6);pg.drawLine({start:{x:cx-lw/2,y:Y(top+9)},end:{x:cx+lw/2,y:Y(top+9)},thickness:.8,color:col.lin});
        svg(`M${cx} ${top+5.5}l3.5 3.5l-3.5 3.5l-3.5 -3.5Z`,{color:col.lin})}}

    /* preámbulo */
    const pre=(cfg.pre||"").trim()||rkPreDefault(cfg,tipo);
    if(mostrar("preambulo")&&pre){const s=fit(pre,fP,13*zz,B.w*.9,8);ctr(pre,cx,T("pre")+(cfg.diseno==="honor"?14:0),s,fP,col.pre)}

    /* nombre */
    {const s=sNom;
      const top=T("nom")+(cfg.diseno==="honor"?10:0);ctr(nom,cx,top,s,fN,col.nom);
      if(!esF||cfg.fondo.ver.linea!==false){const lw=Math.min(B.w*.72,Math.max(w(nom,fN,s)+60,B.w*.45));pg.drawLine({start:{x:cx-lw/2,y:Y(top+8)},end:{x:cx+lw/2,y:Y(top+8)},thickness:.7,color:col.lin})}}

    /* grado y grupo */
    const gg=cfg.verGrado&&(per.grado||per.grupo)?[per.grado?String(per.grado).replace(/[°º]/g,"")+"° grado":"",per.grupo?`grupo «${per.grupo}»`:""].filter(Boolean).join(", "):"";
    if(gg)ctr(gg,cx,T("gr")+(cfg.diseno==="honor"?8:0),10*zz,fS,col.sub);

    /* motivo */
    const mot=String(per.motivo||"").trim()||String(cfg.motivo||"").trim();
    if(mot){const maxW=B.w*(vert?.86:.78),alto=B.h*(fr.lug-fr.mot)-6;let s=15*zz,L;
      const partir=sz=>{const out=[];let cur="";for(const pal of mot.split(/\s+/)){const t=cur?cur+" "+pal:pal;if(w(t,fM,sz)>maxW&&cur){out.push(cur);cur=pal}else cur=t}if(cur)out.push(cur);return out};
      for(;;){L=partir(s);if(L.length*s*1.32<=alto||s<=9)break;s-=.5}
      L.forEach((ln,i)=>ctr(ln,cx,T("mot")+(cfg.diseno==="honor"?6:0)+s+i*s*1.32,s,fM,col.txt))}

    /* lugar obtenido */
    if(lug&&cfg.diseno!=="honor"){const t=lug.toLocaleUpperCase("es-MX"),s=10.5*zz,tw=w(t,fSB,s)+30,h=20;const top=T("lug")-4;
      if(esF)ctr(t,cx,top+14,s+2,fSB,col.tit);
      else{svg(rrect(cx-tw/2,top,tw,h,10),{color:cfg.diseno==="infantil"?(K[1]||c2):c2});ctr(t,cx,top+14,s,fSB,blanco)}}
    else if(lug&&cfg.diseno==="honor"){const t=lug.toLocaleUpperCase("es-MX");ctr(t,cx,T("lug")+10,fit(t,F.playB,13,B.w*.6),F.playB,c2)}

    /* lugar y fecha */
    const fe=[String(cfg.lugarFecha||"").trim(),rkFechaLarga(cfg.fecha)].filter(Boolean).join(", a ");
    if(mostrar("fecha")&&fe)ctr(fe+".",cx,T("fec")+(lug?6:0),fit(fe+".",F.loraI,11*zz,B.w*.8),F.loraI,col.sub);

    /* firmas */
    const fs=(cfg.firmas||[]).filter(f=>f.on&&(f.nom||f.car));
    if(mostrar("firmas")&&fs.length){const n=fs.length,ln=B.top+B.h-22+fdy;const pos=n===1?[.5]:n===2?[.25,.75]:[.17,.5,.83];const cw=Math.min(210,B.w/n-24);
      fs.forEach((f,i)=>{const x=B.x+B.w*pos[i];
        if(f.firma&&I.firma)pic(I.firma,x-cw/2+20,ln-44,cw-40,42);
        pg.drawLine({start:{x:x-cw/2,y:Y(ln)},end:{x:x+cw/2,y:Y(ln)},thickness:.7,color:esF?col.fir:tinta});
        const nm=String(f.nom||"").trim();if(nm)ctr(nm,x,ln+11,fit(nm,fSB,9,cw),fSB,col.fir);
        const cg=String(f.car||"").trim();if(cg)ctr(cg,x,ln+21,fit(cg,fS,8,cw),fS,esF?col.sub:gris)})}
  }
  doc.setTitle(`${(cfg.tipo==="Otro"?cfg.tipoOtro:cfg.tipo)||"Reconocimientos"} · ${cfg.esc.nombre||"Tlamatini"}`);doc.setProducer("Tlamatini · Zona 050");doc.setCreator("Tlamatini");
  return await doc.save()}

function rkPreDefault(cfg,tipo){const t=String(tipo||"Reconocimiento").toLocaleLowerCase("es-MX");
  const art=/^(constancia|menci)/.test(t)?"la presente":"el presente";
  const quien=cfg.esc.nombre?`La ${cfg.esc.tipo||"Escuela Primaria"} «${cfg.esc.nombre}»`:"La escuela";
  return`${quien} otorga ${art} ${t} a`}

/* =====================================================================
   PARTE 2 · LECTURA DE LISTAS (texto, Excel, Word, PDF, fotos)
   ===================================================================== */
const RK_LUGAR_RE=/\b((primer|segundo|tercer|cuarto|quinto|1\s*er|1\s*ro|2\s*do|3\s*er|3\s*ro|4\s*to|5\s*to|[1-9]\s*[°ºo]?)\s*lugar|lugar\s*[1-9]|menci[oó]n(\s+honor[ií]fica)?|primero|segundo|tercero)\b/i;
const RK_CURP_RE=/\b[A-Z][AEIOUX][A-Z]{2}\d{6}[HMX][A-Z]{5}[A-Z0-9]\d\b/gi;
const rkN=s=>String(s??"").normalize("NFD").replace(/[̀-ͯ]/g,"").toLowerCase().replace(/[^a-z0-9ñ]+/g," ").trim();
const RK_ALIAS={nombre:["nombre","nombre del alumno","nombre de la alumna","nombre completo","alumno","alumna","alumno a","alumnos","participante","educando","docente","persona","nombre del participante"],
  motivo:["motivo","logro","por","descripcion","concepto","razon","categoria","reconocimiento por","merito","texto"],
  lugar:["lugar","lugar obtenido","posicion","puesto","resultado","premio","clasificacion"],grado:["grado"],grupo:["grupo"]};
function rkLugarNormal(t){t=String(t||"").trim();const n=rkN(t);if(!n)return"";if(/mencion/.test(n))return"Mención honorífica";
  const o=rkOrdinal(n);const nombres={"1°":"Primer lugar","2°":"Segundo lugar","3°":"Tercer lugar","4°":"Cuarto lugar","5°":"Quinto lugar"};return nombres[o]||t}
function rkLimpiaNombre(t){return String(t||"").replace(RK_CURP_RE," ").replace(/^[\s\d.)\-–—•*#]+/,"").replace(/[|_*]+/g," ").replace(/\s{2,}/g," ").replace(/^[,;:\s]+|[,;:\s]+$/g,"").trim()}
const rkPareceNombre=t=>{const p=rkLimpiaNombre(t).split(/\s+/).filter(x=>/^\p{L}[\p{L}'.-]*$/u.test(x));return p.length>=2&&p.length<=7&&rkLimpiaNombre(t).length<=70};

/* Una línea de texto → {nombre, motivo, lugar, grado, grupo} */
function rkDeLinea(l){l=String(l||"").replace(/\t+/g," | ").trim();if(!l)return null;
  let partes=l.split(/\s*(?:\||;|\s[-–—]\s|\s{3,})\s*/).map(x=>x.trim()).filter(Boolean);
  const o={nombre:"",motivo:"",lugar:"",grado:"",grupo:""};
  if(partes.length===1){let t=partes[0];const ml=t.match(RK_LUGAR_RE);if(ml){o.lugar=rkLugarNormal(ml[0]);t=(t.slice(0,ml.index)+" "+t.slice(ml.index+ml[0].length)).trim()}
    const mp=t.match(/\s(por|por su|por haber|por obtener|por participar)\s/i);if(mp&&mp.index>4){o.motivo=t.slice(mp.index+1).trim();t=t.slice(0,mp.index)}
    const mg=t.match(/\s([1-6])\s*[°º]?\s*(?:grado)?\s*[«"]?([A-F])?[»"]?\s*$/);if(mg){o.grado=mg[1];o.grupo=mg[2]||"";t=t.slice(0,mg.index)}
    o.nombre=rkLimpiaNombre(t)}
  else{for(const p of partes){const n=rkN(p);
      if(!o.lugar&&RK_LUGAR_RE.test(p)&&p.length<=30){o.lugar=rkLugarNormal(p);continue}
      if(!o.grado&&/^[1-6]\s*[°º]?\s*(grado)?\s*[«"]?[A-F]?[»"]?$/i.test(p)){const m=p.match(/([1-6])\s*[°º]?\s*(?:grado)?\s*[«"]?([A-F])?/i);o.grado=m[1];o.grupo=(m[2]||"").toUpperCase();continue}
      if(!o.grupo&&/^[A-F]$/i.test(p)){o.grupo=p.toUpperCase();continue}
      if(!o.nombre&&rkPareceNombre(p)&&!/^por\b/i.test(p)){o.nombre=rkLimpiaNombre(p);continue}
      if(n)o.motivo=o.motivo?o.motivo+" "+p:p}
    if(!o.nombre&&partes[0])o.nombre=rkLimpiaNombre(partes[0])}
  if(o.motivo&&!/^(por|en|al|a la|a los|como)\b/i.test(o.motivo)&&o.motivo.length>2){const m0=o.motivo.charAt(0).toLowerCase()+o.motivo.slice(1);
    o.motivo=o.lugar?(/menci/i.test(o.lugar)?"Por obtener mención honorífica en ":"Por obtener el "+o.lugar.toLowerCase()+" en ")+m0:"Por "+m0}
  if(o.motivo)o.motivo=o.motivo.replace(/\s+/g," ").replace(/^por\b/i,"Por");
  if(!o.nombre||o.nombre.length<4||!/\p{L}{2}/u.test(o.nombre)||/[0-9%#@]/.test(o.nombre))return null;
  if(/\b(cuadro|honor|lista|listado|relacion|reconocimientos?|diplomas?|concurso|escuela|primaria|zona|ciclo|grado|grupo|turno|docente|maestr[oa]|director[a]?|fecha|total|alumnos)\b/.test(rkN(o.nombre))&&!/\p{Ll}/u.test(o.nombre.replace(/^\S+/,"")))return null;
  const nn=rkN(o.nombre);if(/^(nombre|alumno|alumna|lista|relacion|grupo|grado|escuela|zona|ciclo|motivo|lugar|no|num|numero)( |$)/.test(nn)&&nn.split(" ").length<=3)return null;
  return o}
function rkDeTexto(txt){const vistos=new Set();return String(txt||"").split(/\r?\n/).map(rkDeLinea).filter(Boolean).filter(o=>{const k=rkN(o.nombre);if(vistos.has(k))return false;vistos.add(k);return true})}
/* Tabla (Excel, CSV o Word) → personas; usa los encabezados si los hay */
function rkDeFilas(filas){filas=(filas||[]).map(r=>(r||[]).map(c=>String(c??"").trim()));
  let hi=-1,map={};for(let i=0;i<Math.min(filas.length,12);i++){const m={};filas[i].forEach((c,j)=>{const n=rkN(c);for(const k in RK_ALIAS)if(!Object.values(m).includes(k)&&RK_ALIAS[k].includes(n))m[j]=k});
    if(Object.values(m).includes("nombre")){hi=i;map=m;break}}
  if(hi<0)return rkDeTexto(filas.map(r=>r.filter(Boolean).join(" | ")).join("\n"));
  const out=[];for(const r of filas.slice(hi+1)){const o={nombre:"",motivo:"",lugar:"",grado:"",grupo:""};for(const j in map)o[map[j]]=r[j]||"";
    o.nombre=rkLimpiaNombre(o.nombre);if(!o.nombre)continue;if(o.lugar)o.lugar=rkLugarNormal(o.lugar);if(o.grado)o.grado=(String(o.grado).match(/\d/)||[o.grado])[0];out.push(o)}
  return out}

/* =====================================================================
   PARTE 3 · PANTALLA (usa las utilidades de Tlamatini: store, esc, app, accion…)
   ===================================================================== */
const RK_KEY="reconocimientos",RK_FONDO_KEY="rk-fondo",RK_MIS_KEY="rk-mis-disenos";
let RK=null,RK_FONDO,RK_THUMBS={},RK_PV_T=null,RK_PV_N=0;
const RK_MOTIVOS=["Por su esfuerzo, dedicación y entusiasmo en su aprendizaje.","Por su destacado aprovechamiento escolar.","Por su asistencia y puntualidad perfectas.",
  "Por su notable avance en lectura y escritura.","Por ser ejemplo de respeto, compañerismo y buena convivencia.","Por su participación destacada en ","Por obtener el primer lugar en ",
  "Por su compromiso, responsabilidad y trabajo en equipo.","Por concluir satisfactoriamente sus estudios de educación primaria."];
const RK_LUGARES=["Primer lugar","Segundo lugar","Tercer lugar","Mención honorífica"];

function rkDirCargo(dcar){return/^Director$/.test(dcar)?"Director de la escuela":/^Directora$/.test(dcar)?"Directora de la escuela":dcar||"Director de la escuela"}
function rkInit(){const s=store.get(RK_KEY,null);if(s&&s.v===1)return s;
  const i=ESCUELAS_050.findIndex(e=>e[1]===perfil.cct);const z={};if(i>=0)psFromZona(z,i);
  const nombreEsc=i>=0?z.nombre:String(perfil.escuela||"").replace(/^Escuela Primaria\s*(Federal(izada)?\s*)?/i,"").trim();
  const loc=i>=0?`${ESCUELAS_050[i][3]}, ${ESCUELAS_050[i][2]}, B.C.`:[perfil.localidad,perfil.municipio].filter(Boolean).join(", ")+(perfil.municipio?", B.C.":"");
  const dir=i>=0?[z.dtit,z.dnom].filter(Boolean).join(" "):(perfil.director||"");
  return{v:1,diseno:"clasico",pal:"anil",letra:"script",orient:"horizontal",ahorro:false,tipo:"Reconocimiento",tipoOtro:"",caso:"titulo",verGrado:true,
    sel:i>=0?String(i):(perfil.cct?"otra":""),esc:{tipo:"Escuela Primaria",nombre:nombreEsc,cct:(i>=0?z.cct:perfil.cct)||"",zona:perfil.zona||"050"},
    logos:{inst:true,zona:String(perfil.zona||"050")==="050",esc:true},ciclo:true,cicloTxt:cicloActual(),pre:"",motivo:RK_MOTIVOS[0],
    lugarFecha:loc,fecha:today(),firmaDig:false,
    firmas:[{on:true,nom:perfil.minombre||"",car:"Docente de grupo",firma:true,fijo:"doc"},{on:true,nom:dir,car:rkDirCargo(i>=0?z.dcar:"Director"),fijo:"dir"}],
    fondo:{ajuste:"cubrir",color:"#1F3A6B",margen:60,dy:0,fdy:0,esc:1,ver:{encabezado:false,titulo:true,preambulo:true,linea:true,fecha:true,firmas:true}},
    palImg:null,personas:[],verIdx:0}}
function rkGuardar(){OUT=null;try{localStorage.setItem(RK_KEY,JSON.stringify(RK))}catch(e){}}
function rkFondoGet(){if(RK_FONDO===undefined)RK_FONDO=store.get(RK_FONDO_KEY,null);return RK_FONDO}
function rkFondoSet(d){RK_FONDO=d;try{if(d)localStorage.setItem(RK_FONDO_KEY,JSON.stringify(d));else localStorage.removeItem(RK_FONDO_KEY);return true}catch(e){return false}}
let RK_ZONA_B=null;
async function rkEnv(){await loadScript("lib/fontkit.min.js");
  if(!RK_ZONA_B){try{RK_ZONA_B=await lvBytes("img/zona050.png")}catch(e){RK_ZONA_B=null}}
  return{PDFLib,fontkit:window.fontkit,bytes:u=>lvBytes(u),inst:await instLogoData(),zona:RK_ZONA_B,esc:logoGet(),
    firma:typeof firmaGet==="function"?firmaGet():null,fondo:rkFondoGet()}}
function rkCfg(extra){const c=Object.assign({},RK,extra||{});c.inst=perfil.subsis==="SEBS"?"SECRETARÍA DE EDUCACIÓN DE BAJA CALIFORNIA":"INSTITUTO DE SERVICIOS EDUCATIVOS Y PEDAGÓGICOS DE BAJA CALIFORNIA";
  c.firmas=(c.firmas||[]).map(f=>Object.assign({},f,{firma:f.fijo==="doc"&&c.firmaDig}));return c}
function rkProblemas(){const p=[];if(!RK.personas.length)p.push("Agregue al menos un nombre en «¿A quién se entrega?».");
  if(RK.diseno==="fondo"&&!rkFondoGet())p.push("Suba la imagen de fondo en «Diseño».");
  if(!RK.firmas.some(f=>f.on&&(f.nom||f.car)))p.push("Elija al menos una firma.");
  if(RK.personas.length>400)p.push("Son más de 400 nombres; divídalos en dos listas.");return p}

async function prepararRK(){if(OUT&&OUT.letra==="rk")return OUT;const env=await rkEnv();const bytes=await rkPDF(rkCfg(),RK.personas,env);
  const tipo=(RK.tipo==="Otro"?RK.tipoOtro:RK.tipo)||"Reconocimiento";const n=RK.personas.length;
  const quien=n===1?rkCaso(RK.personas[0].nombre,"titulo"):`${n} ${tipo==="Constancia"?"constancias":tipo==="Diploma"?"diplomas":"reconocimientos"}`;
  const filename=`${tipo} - ${quien} - ${today()}.pdf`.replace(/[\\/:*?"<>|«»°]/g,"").replace(/\s+/g," ");
  const blob=new Blob([bytes],{type:"application/pdf"});OUT={letra:"rk",filename,blob,file:new File([blob],filename,{type:"application/pdf"})};return OUT}

/* --- imágenes: fondo propio (foto, imagen o PDF) y colores de la imagen --- */
function rkCanvasDe(im,max=2200){const k=Math.min(1,max/Math.max(im.naturalWidth||im.width,im.naturalHeight||im.height));const c=document.createElement("canvas");
  c.width=Math.round((im.naturalWidth||im.width)*k);c.height=Math.round((im.naturalHeight||im.height)*k);const x=c.getContext("2d");x.fillStyle="#fff";x.fillRect(0,0,c.width,c.height);x.drawImage(im,0,0,c.width,c.height);return c}
async function rkFondoDesdeArchivo(f){
  if(/pdf/i.test(f.type)||/\.pdf$/i.test(f.name)){const L=await pdfjs();const pdf=await L.getDocument({data:new Uint8Array(await f.arrayBuffer())}).promise;const pg=await pdf.getPage(1);
    const vp0=pg.getViewport({scale:1}),sc=Math.min(3,2200/Math.max(vp0.width,vp0.height));const vp=pg.getViewport({scale:sc});const c=document.createElement("canvas");c.width=vp.width;c.height=vp.height;
    const x=c.getContext("2d");x.fillStyle="#fff";x.fillRect(0,0,c.width,c.height);await pg.render({canvasContext:x,viewport:vp}).promise;return c.toDataURL("image/jpeg",.9)}
  if(/heic|heif/i.test(f.type)||/\.(heic|heif)$/i.test(f.name))throw new Error("Las fotos HEIC del iPhone no se pueden leer aquí. Compártala como JPG o tome la foto desde Tlamatini.");
  const u=URL.createObjectURL(f);try{const im=await imgLoad(u);return rkCanvasDe(im).toDataURL("image/jpeg",.9)}finally{URL.revokeObjectURL(u)}}
async function rkColoresDe(dataURL){const im=await imgLoad(dataURL);const c=document.createElement("canvas");c.width=c.height=72;const x=c.getContext("2d");x.drawImage(im,0,0,72,72);
  const d=x.getImageData(0,0,72,72).data,cub=new Map();
  for(let i=0;i<d.length;i+=4){const r=d[i],g=d[i+1],b=d[i+2],mx=Math.max(r,g,b),mn=Math.min(r,g,b);if(mx>235&&mn>215)continue;if(mx<28)continue;if(mx-mn<28)continue;
    const k=(r>>4)<<8|(g>>4)<<4|(b>>4);const o=cub.get(k)||{n:0,r:0,g:0,b:0};o.n++;o.r+=r;o.g+=g;o.b+=b;cub.set(k,o)}
  const L=[...cub.values()].sort((a,b)=>b.n-a.n).map(o=>[o.r/o.n,o.g/o.n,o.b/o.n]);if(!L.length)return null;
  const hex=a=>"#"+a.map(v=>Math.round(Math.max(0,Math.min(255,v))).toString(16).padStart(2,"0")).join("");
  const lum=a=>(.299*a[0]+.587*a[1]+.114*a[2])/255;const osc=a=>{let t=a;while(lum(t)>.42)t=t.map(v=>v*.85);return t};
  const dist=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1],a[2]-b[2]);
  const p1=osc(L[0]);const p2=L.find(a=>dist(a,L[0])>90)||L[1]||L[0];return{id:"imagen",nombre:"Colores de mi imagen",c1:hex(p1),c2:hex(osc(p2).map((v,i)=>v*.6+p2[i]*.4)),c3:"#FFFFFF"}}

/* --- leer archivos de lista --- */
async function rkTextoPDF(file){const L=await pdfjs();const pdf=await L.getDocument({data:new Uint8Array(await file.arrayBuffer())}).promise;const out=[];
  for(let i=1;i<=Math.min(pdf.numPages,30);i++){const pg=await pdf.getPage(i);const tc=await pg.getTextContent();const fil=new Map();
    tc.items.forEach(it=>{if(!it.str||!it.str.trim())return;const y=Math.round(it.transform[5]/3);if(!fil.has(y))fil.set(y,[]);fil.get(y).push({x:it.transform[4],w:it.width||0,s:it.str})});
    [...fil.entries()].sort((a,b)=>b[0]-a[0]).forEach(([,its])=>{its.sort((a,b)=>a.x-b.x);let ln="",fx=null;its.forEach(t=>{if(fx!==null)ln+=t.x-fx>14?"   ":(t.x-fx>1?" ":"");ln+=t.s;fx=t.x+t.w});out.push(ln)})}
  return out.join("\n")}
async function rkLeerArchivo(file,prog){const nm=file.name||"archivo",ext=((nm.match(/\.([a-z0-9]+)$/i)||[])[1]||"").toLowerCase();
  if(ext==="csv")return{lista:rkDeFilas(dirCSV(await file.text())),fuente:"CSV"};
  if(ext==="xlsx"){await loadScript("lib/exceljs.min.js");const wb=new ExcelJS.Workbook();await wb.xlsx.load(await file.arrayBuffer());let mejor=[];
    wb.worksheets.forEach(ws=>{const filas=[];ws.eachRow({includeEmpty:true},(r,n)=>{const a=[];r.eachCell({includeEmpty:true},(c,ci)=>{a[ci-1]=dirCelda(c.value)});filas[n-1]=a});const l=rkDeFilas(filas.map(r=>r||[]));if(l.length>mejor.length)mejor=l});
    return{lista:mejor,fuente:"Excel"}}
  if(ext==="xls")throw new Error("Es un Excel antiguo (.xls). Ábralo y guárdelo como «Libro de Excel (.xlsx)».");
  if(ext==="txt")return{lista:rkDeTexto(await file.text()),fuente:"texto"};
  if(ext==="docx"){const d=await docxLeer(file);for(const t of d.tablas){const l=rkDeFilas(t);if(l.length>1)return{lista:l,fuente:"tabla de Word"}}return{lista:rkDeTexto(d.texto),fuente:"Word"}}
  if(ext==="pdf"||/pdf/i.test(file.type)){const t=await rkTextoPDF(file);let l=rkDeTexto(t);if(l.length)return{lista:l,fuente:"PDF"};
    l=rkDeTexto(await ocrPDF(file,p=>prog&&prog(`Leyendo el PDF escaneado: ${p}`)));return{lista:l,fuente:"PDF escaneado",ocr:true}}
  if(/^image\//i.test(file.type)||/^(jpe?g|png|webp|bmp|gif|heic|heif)$/.test(ext)){
    if(/heic|heif/.test(ext)||/heic|heif/i.test(file.type))throw new Error("las fotos HEIC del iPhone no se pueden leer aquí; tómela con el botón «Tomar foto de la lista» o compártala como JPG.");
    const t=await ocrImagen(file,p=>prog&&prog(`Leyendo la foto: ${p} %`));return{lista:rkDeTexto(t),fuente:"foto",ocr:true}}
  throw new Error("Use Excel (.xlsx o .csv), Word (.docx), PDF, texto o una foto.")}
function rkAgregar(lista,marca){let n=0,rep=0;const ya=new Set(RK.personas.map(p=>rkN(p.nombre)));
  lista.forEach(o=>{const k=rkN(o.nombre);if(!k)return;if(ya.has(k)){rep++;return}ya.add(k);RK.personas.push({nombre:o.nombre,motivo:o.motivo||"",lugar:o.lugar||"",grado:o.grado||"",grupo:o.grupo||"",rev:marca?1:0});n++});
  if(n&&RK.personas.some(p=>p.grado||p.grupo))RK.verGrado=RK.verGrado!==false;rkGuardar();return{n,rep}}

/* --- estilos propios del apartado --- */
function rkCSS(){if(document.getElementById("rkcss"))return;const s=document.createElement("style");s.id="rkcss";s.textContent=`
.rkwrap [hidden]{display:none!important}
.rkgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:10px;margin:8px 0 4px}
.rkd{display:flex;flex-direction:column;gap:6px;padding:8px;border:2px solid var(--line,#ddd);border-radius:14px;background:var(--card,#fff);cursor:pointer;text-align:left;font:inherit;color:inherit}
.rkd.on{border-color:var(--ind,#1F3A6B);box-shadow:0 0 0 3px color-mix(in srgb,var(--ind,#1F3A6B) 18%,transparent)}
.rkd .th{aspect-ratio:11/8.5;border-radius:8px;background:#f3efe6;display:flex;align-items:center;justify-content:center;overflow:hidden}
.rkd.v .th{aspect-ratio:8.5/11}.rkd .th img{width:100%;height:100%;object-fit:contain;display:block}.rkd .th span{font-size:12px;color:#888;padding:6px;text-align:center}
.rkd b{font-size:14px;line-height:1.2}.rkd small{font-size:12px;color:var(--muted,#666);line-height:1.3}
.rkpal{display:flex;flex-wrap:wrap;gap:8px}.rkpal button{display:flex;align-items:center;gap:8px;padding:6px 10px;border-radius:999px;border:2px solid var(--line,#ddd);background:var(--card,#fff);font:inherit;font-size:14px;cursor:pointer;color:inherit}
.rkpal button.on{border-color:var(--ind,#1F3A6B)}.rkpal i{display:inline-flex;border-radius:999px;overflow:hidden;width:30px;height:16px}.rkpal i em{flex:1}
.rkper{display:grid;grid-template-columns:28px 1fr auto;gap:6px 8px;align-items:start;padding:10px 0;border-top:1px solid var(--line,#e5e0d6)}
.rkper .n{font-weight:700;color:var(--muted,#777);padding-top:12px;text-align:right;font-size:14px}.rkper .c{display:grid;gap:6px;min-width:0}
.rkper .c .r{display:grid;grid-template-columns:1fr 1fr 56px 56px;gap:6px}.rkper input{min-width:0}
.rkper.rev input[data-k=nombre]{border-color:#d9a400;background:#fffbe6}.rkper .x{display:flex;flex-direction:column;gap:4px}
@media (max-width:560px){.rkper .c .r{grid-template-columns:1fr 1fr}}
.rkbar{display:flex;flex-wrap:wrap;gap:8px;margin:8px 0}.rkpv{background:#ece7dc;border-radius:12px;padding:10px;min-height:120px;display:flex;align-items:center;justify-content:center}
.rkpv canvas{max-width:100%;height:auto;box-shadow:0 2px 12px rgba(0,0,0,.18);background:#fff;display:block}
.rkfondo{display:flex;gap:12px;align-items:center;flex-wrap:wrap}.rkfondo .pv{width:150px;aspect-ratio:11/8.5;border-radius:10px;background:#f3efe6;overflow:hidden;display:flex;align-items:center;justify-content:center;border:1px solid var(--line,#ddd)}
.rkfondo .pv img{width:100%;height:100%;object-fit:cover}.rkrange{display:grid;grid-template-columns:150px 1fr 44px;gap:8px;align-items:center;margin:6px 0}
.rkrange input{width:100%}.rkmini{font-size:13px;color:var(--muted,#666)}.rkalu{max-height:320px;overflow:auto;border:1px solid var(--line,#ddd);border-radius:10px;padding:6px 10px;margin:8px 0}
.rkalu label{display:flex;gap:8px;align-items:center;padding:5px 0;font-size:15px}`;document.head.appendChild(s)}

/* --- miniaturas reales de cada diseño --- */
async function rkMiniaturas(){const clave=RK.orient+"|"+(RK.ahorro?1:0);const L=await pdfjs();const env=await rkEnv();
  for(const d of RK_DISENOS){const k=d.id+"|"+clave;const el=document.querySelector(`.rkd[data-d="${d.id}"] .th`);if(!el)return;
    if(d.id==="fondo"&&!rkFondoGet()){el.innerHTML="<span>Suba su imagen o diploma</span>";continue}
    if(!RK_THUMBS[k]||d.id==="fondo"){try{const c=rkCfg({diseno:d.id,pal:d.id==="fondo"?RK.pal:d.pal,letra:d.letra,firmaDig:false});
        const b=await rkPDF(c,[{nombre:"Nombre del alumno",lugar:d.id==="honor"?"Primer lugar":""}],env);const pdf=await L.getDocument({data:b}).promise;const pg=await pdf.getPage(1);
        const vp=pg.getViewport({scale:.42});const cv=document.createElement("canvas");cv.width=vp.width;cv.height=vp.height;await pg.render({canvasContext:cv.getContext("2d"),viewport:vp}).promise;
        RK_THUMBS[k]=cv.toDataURL("image/jpeg",.82)}catch(e){continue}}
    const el2=document.querySelector(`.rkd[data-d="${d.id}"] .th`);if(el2)el2.innerHTML=`<img src="${RK_THUMBS[k]}" alt="">`}}

/* --- vista previa --- */
function rkPrevia(ya){clearTimeout(RK_PV_T);RK_PV_T=setTimeout(rkPintaPrevia,ya?0:650)}
async function rkPintaPrevia(){const box=document.getElementById("rk_pv");if(!box||S.view!=="rk")return;const n=++RK_PV_N;
  try{const env=await rkEnv();if(RK.diseno==="fondo"&&!env.fondo){box.innerHTML='<p class="rkmini">Suba la imagen de fondo para ver la vista previa.</p>';return}
    const i=Math.min(RK.verIdx||0,Math.max(0,RK.personas.length-1));const per=RK.personas.length?[RK.personas[i]]:[{nombre:"Nombre de la alumna o el alumno",motivo:""}];
    const b=await rkPDF(rkCfg(),per,env);if(n!==RK_PV_N)return;const L=await pdfjs();const pdf=await L.getDocument({data:b}).promise;const pg=await pdf.getPage(1);
    const wv=Math.min(box.clientWidth-20||700,900);const vp0=pg.getViewport({scale:1});const vp=pg.getViewport({scale:Math.max(.5,wv/vp0.width)*(window.devicePixelRatio>1?2:1)});
    const cv=document.createElement("canvas");cv.width=vp.width;cv.height=vp.height;cv.style.width=Math.round(vp.width/(window.devicePixelRatio>1?2:1))+"px";
    await pg.render({canvasContext:cv.getContext("2d"),viewport:vp}).promise;if(n!==RK_PV_N)return;box.innerHTML="";box.appendChild(cv)}
  catch(e){box.innerHTML=`<div class="alert"><b>No se pudo mostrar la vista previa.</b> (${esc(e.message||e)})</div>`}}

/* --- pantalla principal --- */
async function rkView(){S.view="rk";S.sec="reconocimientos";S.letra=null;setBar("");OUT=null;if(!RK)RK=rkInit();rkCSS();const v=RK;
  const g=id=>document.getElementById(id);const fondo=rkFondoGet();const mis=store.get(RK_MIS_KEY,[]);
  const opt=(arr,val)=>arr.map(o=>{const[k,t]=Array.isArray(o)?o:[o,o];return`<option value="${esc(k)}" ${String(val)===String(k)?"selected":""}>${esc(t)}</option>`}).join("");
  const chk=(id,on,txt)=>`<label class="opt ${on?"on":""}"><input type="checkbox" id="${id}" ${on?"checked":""}>${txt}</label>`;
  const pals=RK_PALETAS.concat(v.palImg?[v.palImg]:[]);
  const palHTML=pals.map(p=>`<button type="button" data-pal="${p.id}" class="${v.pal===p.id?"on":""}"><i>${(p.k||[p.c1,p.c2]).map(c=>`<em style="background:${c}"></em>`).join("")}</i>${esc(p.nombre)}</button>`).join("");
  const firmaHTML=(f,i)=>`<div class="rkfir" data-i="${i}"><div class="opts">${chk("rk_fon"+i,f.on,f.fijo==="doc"?"Firma del docente":f.fijo==="dir"?"Firma de la dirección":`Otra firma ${i-1}`)}${f.fijo?"":`<button type="button" class="btn link" data-qf="${i}">Quitar</button>`}</div>
    <div class="row2" ${f.on?"":"hidden"}><div class="field"><label>Nombre con título</label><input type="text" data-fk="nom" value="${esc(f.nom)}" placeholder="${f.fijo==="dir"?"Ej. Profr. Juan Pérez Ruiz":"Ej. Profra. Ana López Ruiz"}" autocomplete="off"></div>
     <div class="field"><label>Cargo o puesto</label><input type="text" data-fk="car" value="${esc(f.car)}" placeholder="Ej. Presidente del Consejo de Participación" autocomplete="off"></div></div></div>`;
  const perHTML=(p,i)=>`<div class="rkper ${p.rev?"rev":""}" data-i="${i}"><span class="n">${i+1}</span><div class="c">
     <input type="text" data-k="nombre" value="${esc(p.nombre)}" placeholder="Nombre completo" autocomplete="off" aria-label="Nombre">
     <div class="r"><input type="text" data-k="motivo" value="${esc(p.motivo)}" placeholder="Motivo (vacío = el general)" autocomplete="off" aria-label="Motivo">
      <input type="text" data-k="lugar" value="${esc(p.lugar)}" list="rk_lugares" placeholder="Lugar (opcional)" autocomplete="off" aria-label="Lugar">
      <input type="text" data-k="grado" value="${esc(p.grado)}" placeholder="Grado" inputmode="numeric" autocomplete="off" data-nodict maxlength="6" aria-label="Grado"><input type="text" data-k="grupo" value="${esc(p.grupo)}" placeholder="Grupo" autocomplete="off" data-nodict maxlength="6" aria-label="Grupo"></div></div>
    <div class="x"><button type="button" class="btn link" data-ver="${i}" title="Ver en la vista previa">Ver</button><button type="button" class="btn link" data-ord="${i}" title="Pasar los apellidos al final o al inicio">⇄</button><button type="button" class="btn link" data-qp="${i}" title="Quitar">Quitar</button></div></div>`;
  const grupos=(typeof DIR!=="undefined"&&DIR.alumnos.length)?dirGrupos():[];
  app.innerHTML=`<div class="rkwrap"><div class="top"><button class="back" id="salir" aria-label="Regresar">←</button><div style="min-width:0"><div class="eyebrow">Mi escuela y mis alumnos</div><h2>Reconocimientos y diplomas</h2></div></div>
   <p class="muted">Elija un diseño o use su propia imagen de fondo, agregue los nombres uno por uno o suba la lista (Excel, Word, PDF o una foto) y obtenga todos los reconocimientos en un solo PDF, uno por hoja.</p>
   <section class="card"><h3>1. Diseño</h3>
    <div class="rkgrid">${RK_DISENOS.map(d=>`<button type="button" class="rkd ${v.diseno===d.id?"on":""} ${v.orient==="vertical"?"v":""}" data-d="${d.id}"><span class="th"><span>Preparando…</span></span><b>${esc(d.nombre)}</b><small>${esc(d.desc)}</small></button>`).join("")}</div>
    ${mis.length?`<div class="field"><label>Mis diseños guardados</label><div class="chips">${mis.map((m,i)=>`<button type="button" class="chip" data-mis="${i}">${esc(m.nombre)}</button>`).join("")}</div><p class="help">Toque uno para usarlo. <button type="button" class="btn link" id="rk_misdel">Borrar un diseño guardado</button></p></div>`:""}
    <div id="rk_fondoBox" ${v.diseno==="fondo"?"":"hidden"}><div class="field"><label>Imagen de fondo</label><p class="help">Una foto o imagen de un diploma que le guste (vacío o con adornos), o un PDF. Tlamatini escribe encima los nombres y textos. Use imágenes propias o libres: evite personajes comerciales.</p>
      <div class="rkfondo"><div class="pv">${fondo?`<img src="${fondo}" alt="Fondo">`:'<span class="rkmini">Sin imagen</span>'}</div><div style="display:grid;gap:8px">
       <label class="btn primary" style="display:flex;align-items:center;justify-content:center;cursor:pointer">Subir imagen o PDF<input type="file" id="rk_ffile" accept="image/*,.pdf" hidden></label>
       ${fondo?`<button type="button" class="btn ghost" id="rk_fcol">Usar sus colores en los demás diseños</button><button type="button" class="btn link" id="rk_fdel">Quitar imagen</button>`:""}</div></div><div class="help" id="rk_fmsg"></div></div>
     ${fondo?`<div class="row2"><div class="field"><label for="rk_fajuste">Acomodo de la imagen</label><select id="rk_fajuste">${opt([["cubrir","Llenar toda la hoja"],["ajustar","Que se vea completa"]],v.fondo.ajuste)}</select></div>
      <div class="field"><label for="rk_fcolor">Color del texto</label><input type="color" id="rk_fcolor" value="${esc(v.fondo.color)}" style="height:48px;width:100%"></div></div>
      <div class="field"><label>Qué escribe Tlamatini encima</label><div class="opts">${[["encabezado","Logos y nombre de la escuela"],["titulo","Título"],["preambulo","Frase «otorga el presente…»"],["linea","Línea bajo el nombre"],["fecha","Lugar y fecha"],["firmas","Firmas"]].map(([k,t])=>chk("rk_fv_"+k,v.fondo.ver[k]!==false,t)).join("")}</div>
       <p class="help">Si su imagen ya trae el título o las líneas de firma, desmárquelos para que no se encimen.</p></div>
      <div class="field"><label>Acomodar el texto</label>
       <div class="rkrange"><span>Subir o bajar textos</span><input type="range" id="rk_fdy" min="-140" max="140" step="2" value="${+v.fondo.dy||0}"><span class="rkmini" id="rk_fdyv">${+v.fondo.dy||0}</span></div>
       <div class="rkrange"><span>Subir o bajar firmas</span><input type="range" id="rk_ffdy" min="-120" max="40" step="2" value="${+v.fondo.fdy||0}"><span class="rkmini" id="rk_ffdyv">${+v.fondo.fdy||0}</span></div>
       <div class="rkrange"><span>Margen a los lados</span><input type="range" id="rk_fmar" min="20" max="140" step="2" value="${+v.fondo.margen||60}"><span class="rkmini" id="rk_fmarv">${+v.fondo.margen||60}</span></div>
       <div class="rkrange"><span>Tamaño de letra</span><input type="range" id="rk_fesc" min="0.7" max="1.3" step="0.05" value="${+v.fondo.esc||1}"><span class="rkmini" id="rk_fescv">${Math.round((+v.fondo.esc||1)*100)}%</span></div></div>`:""}</div>
    <div class="field" ${v.diseno==="fondo"?"hidden":""}><label>Colores</label><div class="rkpal" id="rk_pal">${palHTML}</div></div>
    <div class="row2"><div class="field"><label for="rk_tipo">Documento</label><select id="rk_tipo">${opt(RK_TIPOS.concat(["Otro"]).map(t=>[t,t==="Otro"?"Otro (escribirlo)":t]),v.tipo)}</select></div>
     <div class="field"><label for="rk_orient">Orientación</label><select id="rk_orient">${opt([["horizontal","Horizontal"],["vertical","Vertical"]],v.orient)}</select></div></div>
    <div class="field" id="rk_tipoOF" ${v.tipo==="Otro"?"":"hidden"}><label for="rk_tipoO">Título del documento</label><input type="text" id="rk_tipoO" value="${esc(v.tipoOtro)}" placeholder="Ej. Alumno del mes" autocomplete="off"></div>
    <div class="row2"><div class="field"><label for="rk_letra">Letra del nombre</label><select id="rk_letra">${opt(RK_LETRAS,v.letra)}</select></div>
     <div class="field"><label for="rk_caso">Escribir los nombres</label><select id="rk_caso">${opt([["titulo","Ana Sofía López Ruiz"],["mayus","ANA SOFÍA LÓPEZ RUIZ"],["tal","Tal como están en la lista"]],v.caso)}</select></div></div>
    <div class="opts">${chk("rk_ahorro",v.ahorro,"Ahorrar tinta (sin fondos de color)")}</div></section>

   <section class="card"><h3>2. Escuela y textos</h3>
    <div class="field"><label for="rk_sel">Escuelas de la Zona 050</label><p class="help">Elija la escuela y se llenan los datos. Si es de otra zona, elija «Otra escuela».</p>
     <select id="rk_sel"><option value="">Elija…</option>${ESCUELAS_050.map((e,i)=>`<option value="${i}" ${v.sel===String(i)?"selected":""}>${esc(e[0])} · ${e[1]}</option>`).join("")}<option value="otra" ${v.sel==="otra"?"selected":""}>Otra escuela (llenar a mano)</option></select></div>
    <div class="field"><label for="rk_enom">Nombre de la escuela</label><input type="text" id="rk_enom" value="${esc(v.esc.nombre)}" placeholder="Solo el nombre, sin «Escuela Primaria»" autocomplete="off"></div>
    <div class="row2"><div class="field"><label for="rk_ecct">C.C.T.</label><input type="text" id="rk_ecct" value="${esc(v.esc.cct)}" style="text-transform:uppercase" autocomplete="off" data-nodict></div>
     <div class="field"><label for="rk_ezona">Zona escolar</label><input type="text" id="rk_ezona" value="${esc(v.esc.zona)}" inputmode="numeric" autocomplete="off" data-nodict></div></div>
    <div class="field"><label>Logos</label><div class="opts">${chk("rk_lg_inst",v.logos.inst,perfil.subsis==="SEBS"?"Secretaría de Educación":"ISEP")}${chk("rk_lg_zona",v.logos.zona,"Zona Escolar 050")}${chk("rk_lg_esc",v.logos.esc,"Logo de la escuela")}</div></div>
    <div class="field"><label for="rk_pre">Frase de entrega</label><p class="help">Si la deja vacía se usa: «${esc(rkPreDefault(v,(v.tipo==="Otro"?v.tipoOtro:v.tipo)||"Reconocimiento"))}».</p><input type="text" id="rk_pre" value="${esc(v.pre)}" autocomplete="off"></div>
    <div class="field"><label for="rk_mot">Motivo general</label><p class="help">Se usa para todos los que no tengan su propio motivo en la lista.</p><textarea id="rk_mot" rows="2">${esc(v.motivo)}</textarea>
     <div class="chips" style="margin-top:6px">${RK_MOTIVOS.map((m,i)=>`<button type="button" class="chip" data-mot="${i}">${esc(m.trim().replace(/ en$/," en…"))}</button>`).join("")}</div></div>
    <div class="row2"><div class="field"><label for="rk_lf">Lugar</label><input type="text" id="rk_lf" value="${esc(v.lugarFecha)}" placeholder="Localidad, municipio, B.C." autocomplete="off"></div>
     <div class="field"><label for="rk_fecha">Fecha</label><input type="date" id="rk_fecha" value="${esc(v.fecha)}"></div></div>
    <div class="opts">${chk("rk_ciclo",v.ciclo,"Poner el ciclo escolar")}${chk("rk_vgr",v.verGrado,"Poner grado y grupo (si vienen en la lista)")}</div>
    <div class="field" id="rk_cicloF" ${v.ciclo?"":"hidden"}><label for="rk_cicloT">Ciclo escolar</label><input type="text" id="rk_cicloT" value="${esc(v.cicloTxt)}" autocomplete="off"></div></section>
   ${logoWidgetHTML()}
   <section class="card"><h3>3. ¿Quién lo entrega?</h3><p class="help">Marque las firmas que lleva: maestro y director, solo el maestro, o agregue a otra persona con su nombre y puesto (hasta 3 firmas).</p>
    <div id="rk_firmas">${v.firmas.map(firmaHTML).join("")}</div>
    ${v.firmas.length<4?`<button type="button" class="btn ghost" id="rk_fmas">+ Agregar otra firma</button>`:""}
    ${typeof firmaGet==="function"&&firmaGet()?`<div class="opts" style="margin-top:10px">${chk("rk_fdig",v.firmaDig,"Poner mi firma digital en la firma del docente")}</div>`:""}
    <div id="rk_fwarn"></div></section>

   <section class="card"><h3>4. ¿A quién se entrega?</h3>
    <div class="field"><label for="rk_nn">Capturar uno por uno</label><div style="display:grid;gap:6px">
     <input type="text" id="rk_nn" placeholder="Nombre completo" autocomplete="off">
     <div class="row2"><input type="text" id="rk_nm" placeholder="Motivo (opcional)" autocomplete="off"><input type="text" id="rk_nl" list="rk_lugares" placeholder="Lugar (opcional)" autocomplete="off"></div>
     <button type="button" class="btn primary" id="rk_add">Agregar a la lista</button></div></div>
    <div class="field"><label>O cargar la lista completa</label><p class="help">Excel, Word, PDF o una foto de la lista (escrita a máquina o en computadora). Si trae columnas de <b>motivo</b> y <b>lugar</b>, también se leen. La foto se lee en este equipo, sin enviarse a ningún lado.</p>
     <div class="rkbar"><label class="btn primary" style="display:flex;align-items:center;cursor:pointer">Subir archivo<input type="file" id="rk_file" accept=".xlsx,.csv,.docx,.pdf,.txt,image/*" multiple hidden></label>
      <label class="btn ghost" style="display:flex;align-items:center;cursor:pointer">Tomar foto de la lista<input type="file" id="rk_cam" accept="image/*" capture="environment" hidden></label>
      <button type="button" class="btn ghost" id="rk_pegarB">Pegar una lista</button>
      ${grupos.length?`<button type="button" class="btn ghost" id="rk_aluB">Desde Mis alumnos</button>`:""}
      <button type="button" class="btn link" id="rk_plant">Descargar plantilla de Excel</button></div>
     <div id="rk_pegarBox" hidden><textarea id="rk_pegar" rows="6" placeholder="Un nombre por renglón. Puede agregar el motivo y el lugar separados por guion o tabulador:&#10;Ana Sofía López Ruiz - Primer lugar - Concurso de lectura&#10;Juan Pérez Gil por su asistencia perfecta"></textarea><button type="button" class="btn primary" id="rk_pegarOk" style="margin-top:6px">Agregar estos nombres</button></div>
     <div id="rk_aluBox" hidden></div><div id="rk_msg"></div></div>
    <datalist id="rk_lugares">${RK_LUGARES.map(l=>`<option value="${l}">`).join("")}</datalist>
    <div id="rk_lista">${v.personas.length?`<div class="rkbar"><b style="align-self:center">${v.personas.length} ${v.personas.length===1?"nombre":"nombres"}</b>
      <button type="button" class="btn link" id="rk_apF" title="LÓPEZ RUIZ ANA → ANA LÓPEZ RUIZ">Apellidos al final</button>${v.personas.some(p=>p.apF)?'<button type="button" class="btn link" id="rk_apI">Deshacer orden</button>':""}<button type="button" class="btn link" id="rk_vac">Quitar todos</button></div>
      ${v.personas.some(p=>p.rev)?`<div class="alert" style="margin-bottom:6px">Los nombres en amarillo se leyeron de una foto o PDF escaneado: <b>revíselos</b>, la lectura puede tener errores.</div>`:""}
      ${v.personas.map(perHTML).join("")}`:'<p class="rkmini">Todavía no hay nombres en la lista.</p>'}</div></section>

   <section class="card"><h3>Vista previa</h3><p class="help">${v.personas.length>1?`Se muestra el de <b>${esc(rkCaso((v.personas[Math.min(v.verIdx||0,v.personas.length-1)]||{}).nombre,"titulo"))}</b>. Toque «Ver» en la lista para revisar otro.`:"Así se imprimirá cada hoja."}</p><div class="rkpv" id="rk_pv"><span class="rkmini">Preparando…</span></div></section>
   <section class="card"><h3>¿Qué desea hacer?</h3><p class="muted" style="font-size:15px">Hojas tamaño <b>Carta</b>, orientación <b>${v.orient==="vertical"?"vertical":"horizontal"}</b>, al <b>100 %</b>. Se genera uno por hoja${v.personas.length>1?`: <b>${v.personas.length} hojas</b>`:""}. Para que luzcan más, use opalina o cartulina delgada.</p>
    <div id="rk_res"></div>
    <div class="acts"><button class="btn primary act" data-act="print"><span class="ic" aria-hidden="true">${EI.print}</span>Imprimir</button>
     <button class="btn primary act" data-act="share"><span class="ic" aria-hidden="true">${EI.mail}</span>Enviar por correo o WhatsApp</button>
     <button class="btn ghost act" data-act="save"><span class="ic" aria-hidden="true">${EI.down}</span>Guardar en este dispositivo</button></div>
    <button type="button" class="btn link" id="rk_misSave" style="margin-top:8px">Guardar este diseño en «Mis diseños»</button>
    <div id="msg"></div></section>
   <p class="foot">Los nombres, los diseños y las imágenes se guardan solo en este dispositivo.</p></div>`;

  const re=()=>{rkGuardar();rkView()};
  const cambio=(pv=true)=>{rkGuardar();resumen();if(pv)rkPrevia()};
  const resumen=()=>{const p=rkProblemas();app.querySelectorAll(".act").forEach(b=>b.disabled=!!p.length);
    g("rk_res").innerHTML=p.length?`<div class="alert"><b>Falta:</b> ${p.map(esc).join(" ")}</div>`:"";
    const fs=v.firmas.filter(f=>f.on);g("rk_fwarn").innerHTML=fs.length>3?'<div class="alert">Caben hasta <b>3 firmas</b> por hoja; desmarque alguna.</div>':""};
  const msg=(h,ok)=>{g("rk_msg").innerHTML=h?`<div class="${ok?"okmsg":"alert"}" style="margin-top:8px">${h}</div>`:""};

  /* diseño */
  app.querySelectorAll(".rkd").forEach(b=>b.onclick=()=>{const d=RK_DISENOS.find(x=>x.id===b.dataset.d);v.diseno=d.id;if(d.id!=="fondo"&&v.pal!=="imagen")v.pal=d.pal;v.letra=d.letra;
    if(d.id==="fondo")v.logos.esc=v.logos.esc;re()});
  app.querySelectorAll("[data-pal]").forEach(b=>b.onclick=()=>{v.pal=b.dataset.pal;app.querySelectorAll("[data-pal]").forEach(x=>x.classList.toggle("on",x===b));cambio()});
  [["rk_tipo","tipo"],["rk_letra","letra"],["rk_caso","caso"]].forEach(([id,k])=>g(id).onchange=()=>{v[k]=g(id).value;if(k==="tipo"){g("rk_tipoOF").hidden=v.tipo!=="Otro"}cambio()});
  g("rk_tipoO").oninput=()=>{v.tipoOtro=g("rk_tipoO").value;cambio()};
  g("rk_orient").onchange=()=>{v.orient=g("rk_orient").value;re()};
  g("rk_ahorro").onchange=()=>{v.ahorro=g("rk_ahorro").checked;re()};
  app.querySelectorAll(".opt input").forEach(i=>i.addEventListener("change",()=>i.closest(".opt").classList.toggle("on",i.checked)));
  app.querySelectorAll("[data-mis]").forEach(b=>b.onclick=()=>{const m=store.get(RK_MIS_KEY,[])[+b.dataset.mis];if(!m)return;const keep={personas:v.personas,verIdx:v.verIdx,esc:v.esc,sel:v.sel,firmas:v.firmas,fecha:v.fecha,lugarFecha:v.lugarFecha};
    Object.assign(v,JSON.parse(JSON.stringify(m.cfg)),keep);if(m.fondo){if(!rkFondoSet(m.fondo))RK_FONDO=m.fondo}re()});
  if(g("rk_misdel"))g("rk_misdel").onclick=()=>{const L=store.get(RK_MIS_KEY,[]);const n=prompt("¿Cuál desea borrar? Escriba su número:\n"+L.map((m,i)=>`${i+1}. ${m.nombre}`).join("\n"));const k=parseInt(n)-1;
    if(L[k]&&confirm(`¿Borrar «${L[k].nombre}»?`)){L.splice(k,1);store.set(RK_MIS_KEY,L);rkView()}};
  g("rk_misSave").onclick=()=>{const n=prompt("Nombre para este diseño (por ejemplo «Honores fin de bimestre»):");if(!n||!n.trim())return;const L=store.get(RK_MIS_KEY,[]);
    const cfg=JSON.parse(JSON.stringify(v));["personas","verIdx","esc","sel","firmas","fecha","lugarFecha"].forEach(k=>delete cfg[k]);
    L.push({nombre:n.trim().slice(0,40),cfg,fondo:v.diseno==="fondo"?rkFondoGet():null});
    try{localStorage.setItem(RK_MIS_KEY,JSON.stringify(L));say("ok",`<b>Diseño guardado.</b> Lo encontrará arriba, en «Mis diseños guardados».`)}catch(e){L[L.length-1].fondo=null;try{localStorage.setItem(RK_MIS_KEY,JSON.stringify(L));say("warn","Se guardó el diseño, pero <b>sin la imagen de fondo</b>, porque no cupo en la memoria del navegador.")}catch(e2){say("warn","No se pudo guardar: la memoria del navegador está llena.")}}};
  /* fondo propio */
  if(g("rk_ffile"))g("rk_ffile").onchange=async e=>{const f=e.target.files[0];e.target.value="";if(!f)return;g("rk_fmsg").textContent="Preparando la imagen…";
    try{const d=await rkFondoDesdeArchivo(f);const ok=rkFondoSet(d);const im=await imgLoad(d);v.orient=im.naturalWidth>=im.naturalHeight?"horizontal":"vertical";
      try{const c=await rkColoresDe(d);if(c)v.fondo.color=c.c1}catch(_){}rkGuardar();rkView();if(!ok)setTimeout(()=>{const m=g("rk_fmsg");if(m)m.innerHTML="<b>Ojo:</b> la imagen es grande y no cupo en la memoria del navegador; se usará mientras no cierre esta página."},50)}
    catch(err){g("rk_fmsg").textContent=err.message||String(err)}};
  if(g("rk_fdel"))g("rk_fdel").onclick=()=>{rkFondoSet(null);re()};
  if(g("rk_fcol"))g("rk_fcol").onclick=async()=>{const c=await rkColoresDe(rkFondoGet());if(!c){g("rk_fmsg").textContent="No se encontraron colores en la imagen.";return}v.palImg=c;v.pal="imagen";RK_THUMBS={};
    g("rk_fmsg").innerHTML="Listo: elija otro diseño y verá la opción <b>«Colores de mi imagen»</b> seleccionada.";rkGuardar()};
  if(g("rk_fajuste")){g("rk_fajuste").onchange=()=>{v.fondo.ajuste=g("rk_fajuste").value;cambio()};g("rk_fcolor").oninput=()=>{v.fondo.color=g("rk_fcolor").value;cambio()};
    ["encabezado","titulo","preambulo","linea","fecha","firmas"].forEach(k=>g("rk_fv_"+k).onchange=()=>{v.fondo.ver[k]=g("rk_fv_"+k).checked;cambio()});
    [["rk_fdy","dy",x=>x],["rk_ffdy","fdy",x=>x],["rk_fmar","margen",x=>x],["rk_fesc","esc",x=>Math.round(x*100)+"%"]].forEach(([id,k,f])=>g(id).oninput=()=>{v.fondo[k]=+g(id).value;g(id+"v").textContent=f(+g(id).value);cambio()})}
  /* escuela y textos */
  g("rk_sel").onchange=()=>{const s=g("rk_sel").value;v.sel=s;if(s==="otra"){v.esc.nombre="";v.esc.cct="";v.esc.zona="";v.lugarFecha=""}
    else if(s!==""){const z={};psFromZona(z,+s);v.esc.nombre=z.nombre;v.esc.cct=z.cct;v.esc.zona="050";v.lugarFecha=`${ESCUELAS_050[+s][3]}, ${ESCUELAS_050[+s][2]}, B.C.`;
      const d=v.firmas.find(f=>f.fijo==="dir");if(d){d.nom=[z.dtit,z.dnom].filter(Boolean).join(" ");d.car=rkDirCargo(z.dcar)}}re()};
  [["rk_enom",x=>v.esc.nombre=x],["rk_ecct",x=>v.esc.cct=x.toUpperCase()],["rk_ezona",x=>v.esc.zona=x],["rk_pre",x=>v.pre=x],["rk_mot",x=>v.motivo=x],["rk_lf",x=>v.lugarFecha=x],["rk_cicloT",x=>v.cicloTxt=x]]
    .forEach(([id,f])=>g(id).addEventListener("input",()=>{f(g(id).value);cambio()}));
  g("rk_fecha").onchange=()=>{v.fecha=g("rk_fecha").value;cambio()};
  [["rk_lg_inst","inst"],["rk_lg_zona","zona"],["rk_lg_esc","esc"]].forEach(([id,k])=>g(id).onchange=()=>{v.logos[k]=g(id).checked;RK_THUMBS={};cambio()});
  g("rk_ciclo").onchange=()=>{v.ciclo=g("rk_ciclo").checked;g("rk_cicloF").hidden=!v.ciclo;cambio()};
  g("rk_vgr").onchange=()=>{v.verGrado=g("rk_vgr").checked;cambio()};
  app.querySelectorAll("[data-mot]").forEach(b=>b.onclick=()=>{v.motivo=RK_MOTIVOS[+b.dataset.mot];g("rk_mot").value=v.motivo;cambio();if(/ en $/.test(v.motivo)){g("rk_mot").focus();g("rk_mot").setSelectionRange(v.motivo.length,v.motivo.length)}});
  wireLogo(()=>{RK_THUMBS={};cambio()});
  /* firmas */
  app.querySelectorAll(".rkfir").forEach(el=>{const i=+el.dataset.i,f=v.firmas[i];
    el.querySelector('input[type=checkbox]').onchange=e=>{f.on=e.target.checked;el.querySelector(".row2").hidden=!f.on;cambio()};
    el.querySelectorAll("[data-fk]").forEach(inp=>inp.oninput=()=>{f[inp.dataset.fk]=inp.value;cambio()})});
  app.querySelectorAll("[data-qf]").forEach(b=>b.onclick=()=>{v.firmas.splice(+b.dataset.qf,1);re()});
  if(g("rk_fmas"))g("rk_fmas").onclick=()=>{v.firmas.push({on:true,nom:"",car:""});re()};
  if(g("rk_fdig"))g("rk_fdig").onchange=()=>{v.firmaDig=g("rk_fdig").checked;cambio()};
  /* lista */
  const agregarUno=()=>{const n=g("rk_nn").value.trim();if(!n){g("rk_nn").focus();return}const r=rkAgregar([{nombre:n,motivo:g("rk_nm").value.trim(),lugar:g("rk_nl").value.trim()}]);
    if(!r.n){msg("Ese nombre ya está en la lista.");return}v.verIdx=v.personas.length-1;rkGuardar();rkView();setTimeout(()=>{const x=g("rk_nn");if(x){x.scrollIntoView({block:"center"});x.focus()}},30)};
  g("rk_add").onclick=agregarUno;g("rk_nn").onkeydown=e=>{if(e.key==="Enter"){e.preventDefault();agregarUno()}};g("rk_nm").onkeydown=g("rk_nl").onkeydown=e=>{if(e.key==="Enter"){e.preventDefault();agregarUno()}};
  const subir=async files=>{const out=[];for(const f of files){msg(`Leyendo «${esc(f.name)}»…`,true);
      try{const r=await rkLeerArchivo(f,t=>msg(esc(t),true));const a=rkAgregar(r.lista,r.ocr);out.push(`«${esc(f.name)}» (${r.fuente}): <b>${a.n}</b> agregado${a.n===1?"":"s"}${a.rep?`, ${a.rep} ya estaba${a.rep===1?"":"n"}`:""}.`)}
      catch(err){out.push(`«${esc(f.name)}»: <b>no se pudo leer</b>: ${esc(err.message||err)}`)}}
    rkView();setTimeout(()=>{msg(out.join("<br>")+(out.some(x=>/foto|escaneado/.test(x))?"<br>Revise los nombres en amarillo.":""),!out.some(x=>/no se pudo/.test(x)));const l=g("rk_lista");if(l)l.scrollIntoView({block:"start",behavior:"smooth"})},30)};
  g("rk_file").onchange=e=>{const f=[...e.target.files];e.target.value="";if(f.length)subir(f)};
  g("rk_cam").onchange=e=>{const f=[...e.target.files];e.target.value="";if(f.length)subir(f)};
  g("rk_pegarB").onclick=()=>{g("rk_pegarBox").hidden=!g("rk_pegarBox").hidden;if(!g("rk_pegarBox").hidden)g("rk_pegar").focus()};
  g("rk_pegarOk").onclick=()=>{const l=rkDeTexto(g("rk_pegar").value);if(!l.length){msg("No encontré nombres. Escriba un nombre por renglón.");return}const a=rkAgregar(l);rkView();
    setTimeout(()=>msg(`<b>${a.n}</b> agregado${a.n===1?"":"s"}${a.rep?`, ${a.rep} ya estaba${a.rep===1?"":"n"}`:""}.`,true),30)};
  g("rk_plant").onclick=async()=>{try{await loadScript("lib/exceljs.min.js");const wb=new ExcelJS.Workbook();const ws=wb.addWorksheet("Reconocimientos");
      ws.columns=[{header:"Nombre",key:"n",width:38},{header:"Motivo",key:"m",width:60},{header:"Lugar",key:"l",width:18},{header:"Grado",key:"g",width:8},{header:"Grupo",key:"p",width:8}];
      ws.addRow({n:"Ana Sofía López Ruiz",m:"Por obtener el primer lugar en el Concurso de Lectura",l:"Primer lugar",g:3,p:"A"});ws.addRow({n:"Juan Pablo García Soto",m:"Por su asistencia y puntualidad perfectas",l:"",g:3,p:"A"});
      ws.getRow(1).font={bold:true};const buf=await wb.xlsx.writeBuffer();const blob=new Blob([buf],{type:"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"});
      const o={filename:"Plantilla reconocimientos Tlamatini.xlsx",blob,file:new File([blob],"Plantilla reconocimientos Tlamatini.xlsx",{type:blob.type})};anchorSave(o);msg("Plantilla descargada. Llénela (un renglón por persona) y súbala con «Subir archivo».",true)}
    catch(e){msg("No se pudo crear la plantilla. ("+esc(e.message||e)+")")}};
  if(g("rk_aluB"))g("rk_aluB").onclick=()=>{const box=g("rk_aluBox");box.hidden=!box.hidden;if(box.hidden)return;
    box.innerHTML=`<div class="field"><label for="rk_ag">Grupo</label><select id="rk_ag">${grupos.map(x=>`<option value="${esc(x.k)}">${esc(dirGLabel(x.grado,x.grupo))} · ${x.n} alumnos</option>`).join("")}</select></div><div id="rk_al"></div>`;
    if(typeof yoGrado==="function"){const mk=yoGrado()+"|"+yoGrupo();if([...g("rk_ag").options].some(o=>o.value===mk))g("rk_ag").value=mk}
    const pinta=()=>{const[gr,gp]=g("rk_ag").value.split("|");const L=DIR.alumnos.filter(dirActivo).filter(a=>(a.grado||"?")===gr&&(a.grupo||"")===gp).sort((a,b)=>String(a.nombre).localeCompare(b.nombre,"es"));
      g("rk_al").innerHTML=`<label class="opt"><input type="checkbox" id="rk_alT">Marcar todos</label><div class="rkalu">${L.map((a,i)=>`<label><input type="checkbox" data-al="${i}">${esc(a.nombre)}</label>`).join("")}</div>
        <button type="button" class="btn primary" id="rk_alOk">Agregar los marcados</button>`;
      g("rk_alT").onchange=()=>g("rk_al").querySelectorAll("[data-al]").forEach(c=>c.checked=g("rk_alT").checked);
      g("rk_alOk").onclick=()=>{const sel=[...g("rk_al").querySelectorAll("[data-al]:checked")].map(c=>L[+c.dataset.al]);if(!sel.length){msg("Marque al menos un alumno.");return}
        const a=rkAgregar(sel.map(x=>({nombre:x.nombre,grado:x.grado&&x.grado!=="?"?x.grado:"",grupo:x.grupo||""})));rkView();setTimeout(()=>msg(`<b>${a.n}</b> alumno${a.n===1?"":"s"} agregado${a.n===1?"":"s"}${a.rep?`, ${a.rep} ya estaba${a.rep===1?"":"n"}`:""}. Si los apellidos quedaron al principio, toque «Apellidos al final».`,true),30)}};
    g("rk_ag").onchange=pinta;pinta()};
  app.querySelectorAll(".rkper input").forEach(inp=>inp.addEventListener("input",()=>{const el=inp.closest(".rkper"),i=+el.dataset.i,p=v.personas[i];p[inp.dataset.k]=inp.value;
    if(inp.dataset.k==="nombre"&&p.rev){p.rev=0;el.classList.remove("rev")}v.verIdx=i;cambio()}));
  app.querySelectorAll("[data-qp]").forEach(b=>b.onclick=()=>{v.personas.splice(+b.dataset.qp,1);v.verIdx=Math.max(0,Math.min(v.verIdx,v.personas.length-1));re()});
  app.querySelectorAll("[data-ver]").forEach(b=>b.onclick=()=>{v.verIdx=+b.dataset.ver;rkGuardar();rkPrevia(true);g("rk_pv").scrollIntoView({block:"center",behavior:"smooth"})});
  if(g("rk_apF"))g("rk_apF").onclick=()=>{let n=0;v.personas.forEach(p=>{if(!p.apF&&p.nombre===p.nombre.toLocaleUpperCase("es-MX")){p.nombre=rkApellidosAlFinal(p.nombre);p.apF=1;n++}});rkGuardar();rkView();
    setTimeout(()=>msg(n?`Se cambió el orden de <b>${n}</b> nombre${n===1?"":"s"} escritos en mayúsculas (como vienen en las listas oficiales). Si alguno quedó mal, use «⇄» en ese renglón.`:"No hay nombres en mayúsculas por acomodar. Use «⇄» en el renglón que quiera cambiar.",true),30)};
  if(g("rk_apI"))g("rk_apI").onclick=()=>{v.personas.forEach(p=>{if(p.apF){p.nombre=rkApellidosAlInicio(p.nombre);p.apF=0}});re()};
  app.querySelectorAll("[data-ord]").forEach(b=>b.onclick=()=>{const p=v.personas[+b.dataset.ord];if(p.apF){p.nombre=rkApellidosAlInicio(p.nombre);p.apF=0}else{p.nombre=rkApellidosAlFinal(p.nombre);p.apF=1}v.verIdx=+b.dataset.ord;re()});
  if(g("rk_vac"))g("rk_vac").onclick=()=>{if(confirm(`¿Quitar los ${v.personas.length} nombres de la lista?`)){v.personas=[];v.verIdx=0;re()}};
  app.querySelectorAll(".act").forEach(b=>b.onclick=()=>accion(b.dataset.act,b));
  g("salir").onclick=()=>{S.sec=null;home()};resumen();rkPrevia(true);rkMiniaturas()}
