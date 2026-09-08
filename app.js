const $=x=>document.getElementById(x);
let reports=JSON.parse(localStorage.tagelohn||'[]');

function show(id){document.querySelectorAll('.screen').forEach(x=>x.classList.remove('active'));$(id).classList.add('active');scrollTo(0,0)}
function today(){return new Date().toISOString().slice(0,10)}
function esc(v){return String(v??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;')}

function addEmp(e={}){
  let d=document.createElement('div'); d.className='employee';
  d.innerHTML=`<button class="del">Löschen</button><b>Mitarbeiter</b><div class="grid"><label>Stunden<input class="hours" type="number" step=".25" value="${e.hours??0}"></label><label>Art der Tätigkeit<input class="activity" value="${esc(e.activity||'')}"></label></div><label>Name des Mitarbeiters<input class="name" value="${esc(e.name||'')}"></label><div class="grid grid3"><label>Anfang<input class="start" type="time" value="${e.start||''}"></label><label>Ende<input class="end" type="time" value="${e.end||''}"></label><label>Pause<input class="pause" type="number" value="${e.pause??0}"></label></div>`;
  d.querySelector('.del').onclick=()=>d.remove();
  ['start','end','pause'].forEach(c=>d.querySelector('.'+c).oninput=()=>calc(d));
  $('employees').append(d);
}
function calc(d){let s=d.querySelector('.start').value,e=d.querySelector('.end').value,p=+(d.querySelector('.pause').value||0);if(s&&e){let a=s.split(':').map(Number),b=e.split(':').map(Number),m=b[0]*60+b[1]-a[0]*60-a[1]-p;if(m>=0)d.querySelector('.hours').value=(m/60).toFixed(2)}}
function item(id,v=''){let d=document.createElement('div');d.className='item';d.innerHTML=`<input value="${esc(v)}"><button class="del">×</button>`;d.querySelector('button').onclick=()=>d.remove();$(id).append(d)}

function clearSignature(){ctx.clearRect(0,0,c.width,c.height)}
function fill(r){
  $('date').value=r.date||today();
  $('contractor').value=r.contractor||'Dreyer Hochbau GmbH & Co. KG';
  $('address').value=r.address||'Mühlenberg 12\n2404 Elsdorf';
  $('project').value=r.project||'Rohrleitungsarbeiten Betriebsgelände Elsdorf';
  $('client').value=r.client||'';
  $('employees').innerHTML='';(r.employees||[]).forEach(addEmp);
  $('works').innerHTML='';(r.works||[]).forEach(v=>item('works',v));
  $('materials').innerHTML='';(r.materials||[]).forEach(v=>item('materials',v));
  clearSignature();
  if(r.signature){let img=new Image();img.onload=()=>ctx.drawImage(img,0,0,c.width,c.height);img.src=r.signature;}
}
function collect(){return{date:$('date').value,contractor:$('contractor').value,address:$('address').value,project:$('project').value,client:$('client').value,employees:[...document.querySelectorAll('.employee')].map(d=>({hours:+d.querySelector('.hours').value||0,activity:d.querySelector('.activity').value,name:d.querySelector('.name').value,start:d.querySelector('.start').value,end:d.querySelector('.end').value,pause:+d.querySelector('.pause').value||0})),works:[...document.querySelectorAll('#works input')].map(x=>x.value).filter(Boolean),materials:[...document.querySelectorAll('#materials input')].map(x=>x.value).filter(Boolean),signature:$('sig').toDataURL()}}
function save(){localStorage.tagelohn=JSON.stringify(reports);$('count').textContent=reports.length+' Nachweis'+(reports.length==1?'':'e')}
function render(){let l=$('list');l.innerHTML=reports.length?'':'<div class="panel">Noch keine Nachweise gespeichert.</div>';reports.forEach((r,i)=>{let d=document.createElement('div');d.className='archive';d.innerHTML=`<b>${esc(formatDate(r.date))}</b><br>${esc(r.project)}<small>${esc(r.contractor)}</small><br><button>Öffnen</button>`;d.querySelector('button').onclick=()=>{fill(r);show('editor')};l.append(d)})}

function formatDate(iso){if(!iso)return '';let d=new Date(iso+'T12:00:00');return new Intl.DateTimeFormat('de-DE',{weekday:'long',day:'2-digit',month:'long',year:'numeric'}).format(d).replace(/^./,m=>m.toUpperCase())}
function shortDate(iso){if(!iso)return '';let d=new Date(iso+'T12:00:00');return `${String(d.getDate()).padStart(2,'0')}.${String(d.getMonth()+1).padStart(2,'0')}.${d.getFullYear()}`}

function splitLines(text){return String(text||'').split(/\r?\n/).map(s=>s.trim()).filter(Boolean)}
function drawText(page,font,text,x,y,size=10,bold=false){page.drawText(String(text||''),{x,y,size,font})}
function fitText(font,text,maxWidth,startSize=10,minSize=7){let size=startSize;while(size>minSize && font.widthOfTextAtSize(text,size)>maxWidth)size-=.25;return size}
function white(page,x,y,w,h){page.drawRectangle({x,y,width:w,height:h,color:PDFLib.rgb(1,1,1)})}
function drawWrapped(page,font,text,x,y,maxWidth,size=9,lineGap=2,maxLines=8){
  let words=String(text||'').split(/\s+/).filter(Boolean), line='', lines=[];
  for(const word of words){let test=line?line+' '+word:word;if(font.widthOfTextAtSize(test,size)<=maxWidth)line=test;else{if(line)lines.push(line);line=word}}
  if(line)lines.push(line);lines=lines.slice(0,maxLines);
  lines.forEach((ln,i)=>page.drawText(ln,{x,y:y-i*(size+lineGap),size,font}));
}

async function createPdf(){
  const data=collect();
  if(!window.PDFLib){alert('PDF-Bibliothek konnte nicht geladen werden. Bitte Internetverbindung prüfen.');return}
  const btn=$('pdf');btn.disabled=true;btn.textContent='PDF wird erstellt …';
  try{
    const {PDFDocument,StandardFonts,rgb}=PDFLib;
    const bytes=await fetch('OriginalTemplate.pdf',{cache:'no-store'}).then(r=>{if(!r.ok)throw new Error('Vorlage nicht gefunden');return r.arrayBuffer()});
    const pdf=await PDFDocument.load(bytes);
    const page=pdf.getPages()[0];
    const W=page.getWidth(),H=page.getHeight();
    const normal=await pdf.embedFont(StandardFonts.Helvetica);
    const bold=await pdf.embedFont(StandardFonts.HelveticaBold);

    // Variable fields are white-covered only inside their original text areas.
    white(page,245, H-116, 125, 22);                         // date
    white(page,48, H-163, 220, 26);                         // contractor
    white(page,48, H-204, 150, 48);                         // address
    white(page,185, H-269, 270, 27);                        // project
    // The table, work/material boxes, and signature area are intentionally NOT white-covered.
    // Their borders belong to the original template and must remain completely intact.

    // Header values.
    const dateText=formatDate(data.date);
    const dateSize=fitText(normal,dateText,120,10.5,8);
    page.drawText(dateText,{x:(W-normal.widthOfTextAtSize(dateText,dateSize))/2,y:H-110,size:dateSize,font:normal});
    page.drawText(data.contractor||'',{x:54,y:H-158,size:11.5,font:bold});
    const addr=splitLines(data.address); addr.slice(0,2).forEach((ln,i)=>page.drawText(ln,{x:54,y:H-(180+i*20),size:9.5,font:normal}));
    drawWrapped(page,normal,data.project||'',190,H-262,260,10,1,2);

    // Employees. The original form has an open table area, so rows are placed at its original spacing.
    const rowTop=H-331, rowStep=19.72;
    const maxRows=12;
    data.employees.slice(0,maxRows).forEach((e,i)=>{
      const y=rowTop-i*rowStep;
      const hours=(Number(e.hours)||0).toFixed(2).replace('.',',');
      page.drawText(hours,{x:85,y,size:9.5,font:normal});
      drawWrapped(page,normal,e.activity||'',144,y,90,9.5,1,2);
      page.drawText(e.name||'',{x:247,y,size:9.5,font:normal});
      page.drawText(e.start||'',{x:412,y,size:9.5,font:normal});
      page.drawText(e.end||'',{x:466,y,size:9.5,font:normal});
      if(Number(e.pause))page.drawText(String(e.pause),{x:517,y,size:9.5,font:normal});
    });

    // Work/material lists. Headers and boxes remain untouched from the original template.
    const workY=H-566, matY=H-566, line=14;
    data.works.slice(0,10).forEach((v,i)=>drawWrapped(page,normal,'• '+v,41,workY-i*line,285,9.5,1,2));
    data.materials.slice(0,10).forEach((v,i)=>drawWrapped(page,normal,'• '+v,380,matY-i*line,155,9.5,1,2));

    // Signature is drawn above the original signature line; the line and label remain original.
    if(data.signature && data.signature.length>100){
      const sigPng=await pdf.embedPng(data.signature);
      page.drawImage(sigPng,{x:55,y:78,width:190,height:76,opacity:1});
    }
    if(data.client) page.drawText(data.client,{x:54,y:48,size:9.5,font:normal});

    const out=await pdf.save();
    const blob=new Blob([out],{type:'application/pdf'});
    const url=URL.createObjectURL(blob);
    const a=document.createElement('a');a.href=url;a.target='_blank';a.rel='noopener';a.click();
    setTimeout(()=>URL.revokeObjectURL(url),60000);
  }catch(err){console.error(err);alert('PDF konnte nicht erstellt werden: '+err.message)}
  finally{btn.disabled=false;btn.textContent='PDF erstellen'}
}

$('new').onclick=$('new2').onclick=()=>{fill({});show('editor')};
$('addEmp').onclick=()=>addEmp();$('addWork').onclick=()=>item('works');$('addMat').onclick=()=>item('materials');
$('archiveBtn').onclick=()=>{render();show('archive')};$('homeBtn').onclick=()=>show('home');
$('save').onclick=()=>{reports.unshift(collect());save();render();show('archive')};
$('pdf').onclick=createPdf;
document.querySelectorAll('nav button').forEach(b=>b.onclick=()=>show(b.dataset.s));save();

let c=$('sig'),ctx=c.getContext('2d'),down=false;
c.onpointerdown=e=>{down=true;ctx.beginPath();let p=pos(e);ctx.moveTo(p.x,p.y)};
c.onpointermove=e=>{if(!down)return;let p=pos(e);ctx.lineTo(p.x,p.y);ctx.stroke()};
window.onpointerup=()=>down=false;
function pos(e){let r=c.getBoundingClientRect();return{x:(e.clientX-r.left)*c.width/r.width,y:(e.clientY-r.top)*c.height/r.height}}
$('clear').onclick=clearSignature;
