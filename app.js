const $=x=>document.getElementById(x);
let reports=JSON.parse(localStorage.tagelohn||'[]');
let editingReportIndex=null;
const defaultCustomers=[{id:'dreyer',name:'Dreyer Hochbau GmbH & Co. KG',address:'Mühlenberg 12\n27404 Elsdorf'}];
let customers=JSON.parse(localStorage.tagelohnCustomers||'null')||defaultCustomers;
let services=JSON.parse(localStorage.tagelohnServices||'null');
let employees=JSON.parse(localStorage.tagelohnEmployees||'null');
const defaultServices=[
  'Vorarbeiter',
  'Facharbeiter',
  'Minibagger',
  'Kompaktbagger',
  'Kompaktbagger mit Hydraulikmeißel',
  'Raupenbagger',
  'Radlader 1,5 cbm',
  'Radlader 3 cbm',
  'Radlader mit Planmatic',
  'LKW Solo',
  'LKW Anhängerzug',
  'LKW mit Tieflader',
  'Asphaltwalze',
  'Transporter'
];
if(!Array.isArray(services)||!services.length) services=[...defaultServices];
const defaultEmployees=[
  'Alexander Geestmann',
  'Dennis Dählmann',
  'Thorsten Dählmann',
  'Joachim Ziegler',
  'Kevin Wicke',
  'Mario Wicke-Porath',
  'Steven Jansen'
];
if(!Array.isArray(employees)||!employees.length) employees=[...defaultEmployees];

function persistCustomers(){localStorage.tagelohnCustomers=JSON.stringify(customers)}
function persistServices(){localStorage.tagelohnServices=JSON.stringify(services)}
function persistEmployees(){localStorage.tagelohnEmployees=JSON.stringify(employees)}
function openServices(){renderServices();show('services')}
function renderServices(){
  const l=$('serviceList'); l.innerHTML='';
  services.forEach((name,i)=>{
    const d=document.createElement('div'); d.className='serviceRow';
    d.innerHTML=`<input class="serviceEdit" value="${esc(name)}"><div class="serviceActions"><button class="serviceSave">Speichern</button><button class="del serviceDel">Löschen</button></div>`;
    d.querySelector('.serviceSave').onclick=()=>{
      const value=d.querySelector('.serviceEdit').value.trim();
      if(!value){alert('Bitte eine Bezeichnung eingeben.');return}
      if(services.some((s,j)=>j!==i&&s.toLowerCase()===value.toLowerCase())){alert('Diese Leistung gibt es bereits.');return}
      services[i]=value;persistServices();renderServices();
    };
    d.querySelector('.serviceDel').onclick=()=>{
      if(confirm('Leistung wirklich löschen?')){services.splice(i,1);persistServices();renderServices();}
    };
    l.append(d);
  });
  if(!services.length)l.innerHTML='<div class="empty">Noch keine Leistungen angelegt.</div>';
}
function addService(){
  const value=$('serviceName').value.trim();
  if(!value){alert('Bitte eine Bezeichnung eingeben.');return}
  if(services.some(s=>s.toLowerCase()===value.toLowerCase())){alert('Diese Leistung gibt es bereits.');return}
  services.push(value);persistServices();$('serviceName').value='';renderServices();
}
function show(id){document.querySelectorAll('.screen').forEach(x=>x.classList.remove('active'));$(id).classList.add('active');scrollTo(0,0)}
function today(){return new Date().toISOString().slice(0,10)}
function esc(v){return String(v??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;')}

function renderCustomerSelect(selectedName=''){
  const s=$('contractorSelect');
  s.innerHTML='<option value="">— Kunde auswählen —</option>'+customers.map(c=>`<option value="${esc(c.id)}">${esc(c.name)}</option>`).join('')+'<option value="__manual__">Manuell / anderer Auftraggeber</option>';
  const match=customers.find(c=>c.name===selectedName);
  s.value=match?match.id:(selectedName?'__manual__':'');
}
function customerChanged(){
  const id=$('contractorSelect').value;
  if(!id)return;
  if(id==='__manual__'){
    const current=$('contractorSelect').dataset.manualName||'';
    $('contractorSelect').dataset.manualName=current;
    return;
  }
  const c=customers.find(x=>x.id===id); if(!c)return;
  $('contractorSelect').dataset.manualName=c.name;
  $('address').value=c.address;
}
function contractorName(){
  const id=$('contractorSelect').value;
  if(id==='__manual__')return $('contractorSelect').dataset.manualName||'';
  const c=customers.find(x=>x.id===id); return c?.name||'';
}
function openCustomers(){renderCustomers();show('customers')}
function renderCustomers(){
  const l=$('customerList');
  l.innerHTML='';
  if(!customers.length){l.innerHTML='<div class="panel">Noch keine Kunden angelegt.</div>';return}
  customers.forEach(c=>{
    const d=document.createElement('div');d.className='archive';
    d.innerHTML=`<b>${esc(c.name)}</b><small>${esc(c.address).replaceAll('\n','<br>')}</small><button class="del customerDel">Löschen</button>`;
    d.querySelector('.customerDel').onclick=()=>{if(confirm('Kunden wirklich löschen?')){customers=customers.filter(x=>x.id!==c.id);persistCustomers();renderCustomers();renderCustomerSelect($('contractorSelect').dataset.manualName||'')}};
    l.append(d);
  });
}
function addCustomer(){
  const name=$('customerName').value.trim(),address=$('customerAddress').value.trim();
  if(!name||!address){alert('Bitte Kundenname und Anschrift eingeben.');return}
  const existing=customers.find(c=>c.name.toLowerCase()===name.toLowerCase());
  if(existing){existing.address=address}else customers.push({id:'c_'+Date.now(),name,address});
  persistCustomers();
  $('customerName').value='';$('customerAddress').value='';
  renderCustomers();renderCustomerSelect(name);
  $('contractorSelect').dataset.manualName=name;
  $('address').value=address;
  alert('Kunde gespeichert.');
}


function openEmployees(){renderEmployees();show('employeeManager')}
function renderEmployees(){
  const l=$('employeeList'); l.innerHTML='';
  employees.forEach((name,i)=>{
    const d=document.createElement('div'); d.className='serviceRow';
    d.innerHTML=`<input class="employeeEdit" value="${esc(name)}"><div class="serviceActions"><button class="employeeSave">Speichern</button><button class="del employeeDel">Löschen</button></div>`;
    d.querySelector('.employeeSave').onclick=()=>{
      const value=d.querySelector('.employeeEdit').value.trim();
      if(!value){alert('Bitte einen Namen eingeben.');return}
      if(employees.some((e,j)=>j!==i&&e.toLowerCase()===value.toLowerCase())){alert('Diesen Mitarbeiter gibt es bereits.');return}
      employees[i]=value;persistEmployees();renderEmployees();
    };
    d.querySelector('.employeeDel').onclick=()=>{
      if(confirm('Mitarbeiter wirklich löschen?')){employees.splice(i,1);persistEmployees();renderEmployees();}
    };
    l.append(d);
  });
  if(!employees.length)l.innerHTML='<div class="empty">Noch keine Mitarbeiter angelegt.</div>';
}
function addEmployee(){
  const value=$('employeeName').value.trim();
  if(!value){alert('Bitte einen Namen eingeben.');return}
  if(employees.some(e=>e.toLowerCase()===value.toLowerCase())){alert('Diesen Mitarbeiter gibt es bereits.');return}
  employees.push(value);persistEmployees();$('employeeName').value='';renderEmployees();
}
function employeeOptions(selected=''){
  const current=String(selected||'');
  const options=employees.map(n=>`<option value="${esc(n)}"${n===current?' selected':''}>${esc(n)}</option>`).join('');
  return '<option value="">— Mitarbeiter auswählen —</option>'+options;
}

function serviceOptions(selected=''){
  const current=String(selected||'');
  const options=services.map(s=>`<option value="${esc(s)}"${s===current?' selected':''}>${esc(s)}</option>`).join('');
  return '<option value="">— Leistung auswählen —</option>'+options;
}
function addEmp(e={}){
  const selectedService=e.service||e.activity||'';
  const d=document.createElement('div'); d.className='employee';
  d.innerHTML=`<button type="button" class="del">Löschen</button><b>Mitarbeiter</b>
  <label>Name des Mitarbeiters<select class="name" aria-label="Mitarbeiter auswählen">${employeeOptions(e.name||'')}</select></label>
  <div class="grid"><label>Leistung<select class="service" aria-label="Leistung für Mitarbeiter auswählen">${serviceOptions(selectedService)}</select></label>
  <label>Stunden<input class="hours" type="number" step=".25" value="${e.hours??0}"></label></div>
  <div class="grid grid3"><label>Anfang<input class="start" type="time" value="${e.start||''}"></label><label>Ende<input class="end" type="time" value="${e.end||''}"></label><label>Pause<input class="pause" type="number" value="${e.pause??0}"></label></div>`;
  d.querySelector('.del').onclick=()=>d.remove();
  ['start','end','pause'].forEach(c=>d.querySelector('.'+c).oninput=()=>calc(d));
  $('employees').append(d);
}
function calc(d){let s=d.querySelector('.start').value,e=d.querySelector('.end').value,p=+(d.querySelector('.pause').value||0);if(s&&e){let a=s.split(':').map(Number),b=e.split(':').map(Number),m=b[0]*60+b[1]-a[0]*60-a[1]-p;if(m>=0)d.querySelector('.hours').value=(m/60).toFixed(2)}}
function item(id,v=''){let d=document.createElement('div');d.className='item';d.innerHTML=`<input value="${esc(v)}"><button class="del">×</button>`;d.querySelector('button').onclick=()=>d.remove();$(id).append(d)}

function hasSignature(){
  const data=ctx.getImageData(0,0,c.width,c.height).data;
  for(let i=3;i<data.length;i+=4) if(data[i]>10) return true;
  return false;
}
function updateSignatureStatus(){
  const s=$('signatureStatus');
  if(!s)return;
  const signed=hasSignature();
  s.textContent=signed?'✓ Unterschrift vorhanden':'Noch nicht unterschrieben';
  s.classList.toggle('signed',signed);
}
function summaryMoneyHours(){
  return [...document.querySelectorAll('.employee')].reduce((sum,d)=>sum+(Number(d.querySelector('.hours')?.value)||0),0);
}
function renderSummary(){
  const data=collect();
  const rows=data.employees.filter(e=>e.name||e.service||e.hours||e.start||e.end||e.pause).map(e=>`
    <tr><td>${esc(e.name||'—')}</td><td>${esc(e.service||'—')}</td><td>${(Number(e.hours)||0).toFixed(2).replace('.',',')} Std.</td><td>${esc(e.start||'—')}</td><td>${esc(e.end||'—')}</td><td>${e.pause?esc(String(e.pause))+' min':'—'}</td></tr>`).join('');
  $('summaryContent').innerHTML=`
    <div class="summaryBlock"><h3>Tagelohnnachweis</h3><div class="summaryMeta">
      <div><b>Datum</b>${esc(formatDate(data.date)||'—')}</div>
      <div><b>Auftraggeber</b>${esc(data.contractor||'—')}</div>
      <div><b>Bauvorhaben</b>${esc(data.project||'—')}</div>
      <div><b>Anschrift</b>${esc(data.address||'—').replaceAll('\n','<br>')}</div>
    </div></div>
    <div class="summaryBlock"><h3>Mitarbeiter und Leistungen</h3>
      ${rows?`<div style="overflow:auto"><table class="summaryTable"><thead><tr><th>Mitarbeiter</th><th>Leistung</th><th>Stunden</th><th>Anfang</th><th>Ende</th><th>Pause</th></tr></thead><tbody>${rows}</tbody></table></div>`:'<div class="empty">Keine Mitarbeiter eingetragen.</div>'}
    </div>
    <div class="summaryBlock"><h3>Ausgeführte Arbeiten</h3>${data.works.length?`<ul class="summaryList">${data.works.map(v=>`<li>${esc(v)}</li>`).join('')}</ul>`:'<div class="empty">Keine Angaben.</div>'}</div>
    <div class="summaryBlock"><h3>Material / sonstige Leistungen</h3>${data.materials.length?`<ul class="summaryList">${data.materials.map(v=>`<li>${esc(v)}</li>`).join('')}</ul>`:'<div class="empty">Keine Angaben.</div>'}</div>
    <div class="summaryBlock"><h3>Unterschrift Auftraggeber</h3><div class="hint">Mit der Unterschrift bestätigt der Auftraggeber die oben angezeigten Angaben.</div></div>`;
}

function clearSignature(){ctx.clearRect(0,0,c.width,c.height); updateSignatureStatus()}
function fill(r){
  $('date').value=r.date||today();
  renderCustomerSelect(r.contractor||'Dreyer Hochbau GmbH & Co. KG');
  $('contractorSelect').dataset.manualName=r.contractor||'';
  $('address').value=r.address||'Mühlenberg 12\n27404 Elsdorf';
  $('project').value=r.project||'Rohrleitungsarbeiten Betriebsgelände Elsdorf';
  $('client').value=r.client||'';
  $('employees').innerHTML='';(r.employees||[]).forEach(addEmp);
  $('works').innerHTML='';(r.works||[]).forEach(v=>item('works',v));
  $('materials').innerHTML='';(r.materials||[]).forEach(v=>item('materials',v));
  clearSignature();
  if(r.signature){let img=new Image();img.onload=()=>{ctx.drawImage(img,0,0,c.width,c.height);updateSignatureStatus()};img.src=r.signature;} else updateSignatureStatus();
}
function collect(){return{date:$('date').value,contractor:contractorName(),address:$('address').value,project:$('project').value,client:$('client').value,employees:[...document.querySelectorAll('.employee')].map(d=>{const service=d.querySelector('.service').value;return {hours:+d.querySelector('.hours').value||0,service,activity:service,name:d.querySelector('.name').value,start:d.querySelector('.start').value,end:d.querySelector('.end').value,pause:+d.querySelector('.pause').value||0}}),works:[...document.querySelectorAll('#works input')].map(x=>x.value).filter(Boolean),materials:[...document.querySelectorAll('#materials input')].map(x=>x.value).filter(Boolean),signature:$('sig').toDataURL()}}
function save(){localStorage.tagelohn=JSON.stringify(reports);$('count').textContent=reports.length+' Nachweis'+(reports.length==1?'':'e')}
function render(){let l=$('list');l.innerHTML=reports.length?'':'<div class="panel">Noch keine Nachweise gespeichert.</div>';reports.forEach((r,i)=>{let d=document.createElement('div');d.className='archive';d.innerHTML=`<b>${esc(formatDate(r.date))}</b><br>${esc(r.project)}<small>${esc(r.contractor)}</small><br><button>Öffnen</button>`;d.querySelector('button').onclick=()=>{editingReportIndex=i;fill(r);show('editor')};l.append(d)})}

function formatDate(iso){if(!iso)return '';let d=new Date(iso+'T12:00:00');return new Intl.DateTimeFormat('de-DE',{weekday:'long',day:'2-digit',month:'long',year:'numeric'}).format(d).replace(/^./,m=>m.toUpperCase())}
function shortDate(iso){if(!iso)return '';let d=new Date(iso+'T12:00:00');return `${String(d.getDate()).padStart(2,'0')}.${String(d.getMonth()+1).padStart(2,'0')}.${d.getFullYear()}`}

function splitLines(text){return String(text||'').split(/\r?\n/).map(s=>s.trim()).filter(Boolean)}
function fitText(font,text,maxWidth,startSize=10,minSize=7){let size=startSize;while(size>minSize && font.widthOfTextAtSize(text,size)>maxWidth)size-=.25;return size}
function drawWrapped(page,font,text,x,y,maxWidth,size=9,lineGap=2,maxLines=8){let words=String(text||'').split(/\s+/).filter(Boolean),line='',lines=[];for(const word of words){let test=line?line+' '+word:word;if(font.widthOfTextAtSize(test,size)<=maxWidth)line=test;else{if(line)lines.push(line);line=word}}if(line)lines.push(line);lines=lines.slice(0,maxLines);lines.forEach((ln,i)=>page.drawText(ln,{x,y:y-i*(size+lineGap),size,font}));}

async function createPdf(){
  const data=collect(); if(!window.PDFLib){alert('PDF-Bibliothek konnte nicht geladen werden. Bitte Internetverbindung prüfen.');return}
  const btn=$('pdf');btn.disabled=true;btn.textContent='PDF wird erstellt …';
  try{
    const {PDFDocument,StandardFonts,rgb}=PDFLib;
    const bytes=await fetch('OriginalTemplate.pdf',{cache:'no-store'}).then(r=>{if(!r.ok)throw new Error('Vorlage nicht gefunden');return r.arrayBuffer()});
    const pdf=await PDFDocument.load(bytes); const page=pdf.getPages()[0]; const W=page.getWidth(),H=page.getHeight();
    const normal=await pdf.embedFont(StandardFonts.Helvetica),bold=await pdf.embedFont(StandardFonts.HelveticaBold);
    function cover(x,yTop,w,h){page.drawRectangle({x,y:H-yTop-h,width:w,height:h,color:rgb(1,1,1)})}
    cover(225,94,165,18);cover(50,140,220,22);cover(50,165,150,40);
    const dateText=formatDate(data.date),dateSize=fitText(normal,dateText,145,9.5,7.5);
    page.drawText(dateText,{x:(W-normal.widthOfTextAtSize(dateText,dateSize))/2,y:H-108,size:dateSize,font:normal});
    if(data.contractor)page.drawText(data.contractor,{x:54,y:H-158,size:11,font:bold});
    splitLines(data.address).slice(0,2).forEach((ln,i)=>page.drawText(ln,{x:54,y:H-(180+i*20),size:9.5,font:normal}));
    cover(180,241,375,24);drawWrapped(page,normal,data.project||'',198,H-263,350,9.5,1,2);
    const rowTop=H-320,rowStep=20;
    data.employees.slice(0,12).forEach((e,i)=>{const y=rowTop-i*rowStep,hours=(Number(e.hours)||0).toFixed(2).replace('.',',');if(hours!=='0,00')page.drawText(hours,{x:84,y,size:9.5,font:normal});if(e.service||e.activity)drawWrapped(page,normal,e.service||e.activity,145,y,92,9.2,1,2);if(e.name)page.drawText(e.name,{x:247,y,size:9.5,font:normal});if(e.start)page.drawText(e.start,{x:412,y,size:9.5,font:normal});if(e.end)page.drawText(e.end,{x:466,y,size:9.5,font:normal});if(Number(e.pause))page.drawText(String(e.pause),{x:517,y,size:9.5,font:normal})});
    const contentTop=H-565;data.works.slice(0,12).forEach((v,i)=>drawWrapped(page,normal,'• '+v,54,contentTop-i*14,285,9.2,1,2));data.materials.slice(0,12).forEach((v,i)=>drawWrapped(page,normal,'• '+v,355,contentTop-i*14,195,9.2,1,2));
    if(data.signature&&data.signature.length>100){const sigPng=await pdf.embedPng(data.signature);page.drawImage(sigPng,{x:54,y:70,width:190,height:70,opacity:1})}
    // PDF mit maximaler Kompatibilität speichern (ohne Object Streams).
    const out=await pdf.save({useObjectStreams:false});
    const blob=new Blob([out],{type:'application/pdf'});
    const url=URL.createObjectURL(blob);
    const filename='Tagelohnnachweis-'+shortDate(data.date).replaceAll('.','-')+'.pdf';
    // Nicht mehr in einem neuen Browser-Tab öffnen: Das hat bei einigen PDF-Viewern
    // zu einem schwarzen/blanken Bildschirm geführt. Stattdessen wird die fertige
    // PDF direkt als Datei heruntergeladen.
    const a=document.createElement('a');
    a.href=url;
    a.download=filename;
    a.style.display='none';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(()=>URL.revokeObjectURL(url),60000);
  }catch(err){console.error(err);alert('PDF konnte nicht erstellt werden: '+err.message)}finally{btn.disabled=false;btn.textContent='PDF erstellen'}
}

$('new').onclick=$('new2').onclick=()=>{editingReportIndex=null;fill({});show('editor')};
$('addEmp').onclick=()=>addEmp();$('addWork').onclick=()=>item('works');$('addMat').onclick=()=>item('materials');
$('archiveBtn').onclick=()=>{render();show('archive')};$('homeBtn').onclick=()=>show('home');$('customersBtn').onclick=openCustomers;$('homeFromCustomers').onclick=()=>show('home');
$('manageCustomers').onclick=openCustomers;$('addCustomer').onclick=addCustomer;$('contractorSelect').onchange=customerChanged;$('servicesBtn').onclick=openServices;$('homeFromServices').onclick=()=>show('home');$('addService').onclick=addService;$('employeesBtn').onclick=openEmployees;$('homeFromEmployees').onclick=()=>show('home');$('addEmployee').onclick=addEmployee;
$('save').onclick=()=>{reports.unshift(collect());save();render();show('archive')};$('pdf').onclick=createPdf;
document.querySelectorAll('nav button').forEach(b=>b.onclick=()=>show(b.dataset.s));
persistCustomers();persistServices();persistEmployees();renderCustomerSelect('');save();

let c=$('sig'),ctx=c.getContext('2d'),down=false;
c.onpointerdown=e=>{down=true;ctx.beginPath();let p=pos(e);ctx.moveTo(p.x,p.y)};c.onpointermove=e=>{if(!down)return;let p=pos(e);ctx.lineTo(p.x,p.y);ctx.stroke()};window.onpointerup=()=>down=false;
function pos(e){let r=c.getBoundingClientRect();return{x:(e.clientX-r.left)*c.width/r.width,y:(e.clientY-r.top)*c.height/r.height}}
$('clear').onclick=()=>{clearSignature();updateSignatureStatus()};
$('review').onclick=()=>{renderSummary();show('summaryScreen')};
$('backToEditorFromSummary').onclick=()=>show('editor');
$('signNow').onclick=()=>{show('signatureScreen');updateSignatureStatus()};
$('backToSummary').onclick=()=>{renderSummary();show('summaryScreen')};
$('cancelSignature').onclick=()=>show('summaryScreen');
$('saveSignature').onclick=async()=>{
  if(!hasSignature()){alert('Bitte zuerst unterschreiben.');return}
  const btn=$('saveSignature');
  btn.disabled=true; btn.textContent='✓';
  try{
    const signed=collect();
    signed.signed=true;
    signed.signedAt=new Date().toISOString();
    if(editingReportIndex!==null && reports[editingReportIndex]) reports[editingReportIndex]=signed;
    else {reports.unshift(signed); editingReportIndex=0;}
    save(); render(); updateSignatureStatus();
    await createPdf();
    alert('Unterschrieben gespeichert und PDF erstellt.');
    show('archive');
  }catch(err){console.error(err);alert('Der unterschriebene Nachweis konnte nicht vollständig gespeichert werden: '+err.message)}
  finally{btn.disabled=false;btn.textContent='➜'}
};
