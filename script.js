"use strict";
const UPLOAD_URL = "https://script.google.com/macros/s/AKfycbycOVcRxvQeVwkeixLfJ_pVufVGeSjibt3WbwdWN1rYyb84sx0GzoiJkcEJnQXkRKoW/exec";
const $ = id => document.getElementById(id);
const camera=$('camera'), photo=$('photo'), canvas=$('canvas'), preview=$('preview'), message=$('message');
const startBtn=$('startBtn'),switchBtn=$('switchBtn'),captureBtn=$('captureBtn'),retakeBtn=$('retakeBtn'),downloadBtn=$('downloadBtn'),uploadBtn=$('uploadBtn');
const frames=[{name:'Garden Party',bg:'#fff0d1',ink:'#705246',colors:['#ed87ae','#f9cd56','#94b9df'],original:true},{name:'Pink Petals',bg:'#fff0f4',ink:'#9b4e68',colors:['#f2a1b6','#d96891','#f8c0aa']},{name:'Sunshine Bloom',bg:'#fff4d5',ink:'#985d35',colors:['#f6c745','#f2a056','#ffdd79']},{name:'Blue Meadow',bg:'#eaf3ff',ink:'#506b91',colors:['#87b9e2','#b5a3da','#e8b4d3']},{name:'Wildflower Picnic',bg:'#fff6e6',ink:'#697952',colors:['#eb88a8','#f9ce54','#8cbad7','#f2a260']}];
const filters=['Original','Warm','Soft','Vintage','Black & White'];
let frameIndex=0,filterIndex=0,layout=1,shots=[],stream=null,facing='user',busy=false,completed=false,saveFile=null,raf=0,lastPaint=0;
const original=new Image();let originalReady=false;
original.onload=()=>{originalReady=true;buildFrames();renderPreview();};
original.onerror=()=>{message.textContent='Your Garden Party PNG could not load. The other four frames are available.';};
original.src='./wedding-frame.png';
const area={x:80,y:55,w:1030,h:1028};
function flower(c,x,y,r,color,turn=0){c.save();c.translate(x,y);c.rotate(turn);c.fillStyle=color;for(let i=0;i<7;i++){c.rotate(Math.PI*2/7);c.beginPath();c.ellipse(0,-r*.62,r*.4,r*.66,0,0,Math.PI*2);c.fill();}c.fillStyle='#b3803e';c.beginPath();c.arc(0,0,r*.23,0,Math.PI*2);c.fill();c.restore();}
function foliage(c,x,y,flip){c.save();c.translate(x,y);c.scale(flip,1);c.strokeStyle='#809770';c.lineWidth=4;c.beginPath();c.moveTo(0,85);c.quadraticCurveTo(55,0,7,-95);c.stroke();c.fillStyle='#a5b68e';for(let j=0;j<5;j++){c.beginPath();c.ellipse(j%2?32:0,65-j*35,11,27,j%2?.8:-.7,0,Math.PI*2);c.fill();}c.restore();}
function drawFrame(c,index){const f=frames[index];if(f.original&&originalReady){c.drawImage(original,0,0,1200,1480);return;}
 c.fillStyle=f.bg;c.fillRect(0,0,1200,area.y);c.fillRect(0,area.y,area.x,area.h);c.fillRect(area.x+area.w,area.y,1200-area.x-area.w,area.h);c.fillRect(0,area.y+area.h,1200,1480-area.y-area.h);
 if(index===4){c.save();c.globalAlpha=.16;c.fillStyle='#e89988';for(let x=0;x<1200;x+=55)c.fillRect(x,1090,22,390);for(let y=1090;y<1480;y+=55)c.fillRect(0,y,1200,22);c.restore();}
 c.strokeStyle=f.ink;c.lineWidth=2;c.strokeRect(24,24,1152,1432);
 for(const [x,y] of [[45,85],[1150,110],[48,1020],[1155,1030],[90,1390],[1100,1395]])foliage(c,x,y,x>600?-1:1);
 const points=[[62,65,64],[150,35,38],[1140,75,67],[1053,35,39],[30,420,39],[1173,530,43],[54,1060,68],[1140,1080,62],[40,1410,69],[153,1453,43],[1150,1407,70],[1045,1450,40]];
 points.forEach(([x,y,r],i)=>flower(c,x,y,r,f.colors[i%f.colors.length],i));
 c.textAlign='center';c.fillStyle=f.ink;c.font='32px Georgia';c.fillText('The wedding of',600,1170);c.font='66px Georgia';c.fillText('Hafiy & Aina',600,1260);c.font='29px Georgia';c.fillText('2 Januari 2027',600,1320);c.font='italic 23px Georgia';c.fillText('Let love bloom',600,1380);
}
function cells(){let a=area,g=12;if(layout===1)return [a];if(layout===2)return [{x:a.x,y:a.y,w:a.w,h:(a.h-g)/2},{x:a.x,y:a.y+(a.h+g)/2,w:a.w,h:(a.h-g)/2}];return [0,1,2,3].map(i=>({x:a.x+(i%2)*(a.w+g)/2,y:a.y+Math.floor(i/2)*(a.h+g)/2,w:(a.w-g)/2,h:(a.h-g)/2}));}
function cover(c,source,r,mirror=false){const sw=source.videoWidth||source.width,sh=source.videoHeight||source.height;if(!sw||!sh)return;const scale=Math.max(r.w/sw,r.h/sh),w=r.w/scale,h=r.h/scale;c.save();if(mirror){c.translate(r.x+r.w,r.y);c.scale(-1,1);c.drawImage(source,(sw-w)/2,(sh-h)/2,w,h,0,0,r.w,r.h);}else c.drawImage(source,(sw-w)/2,(sh-h)/2,w,h,r.x,r.y,r.w,r.h);c.restore();}
// Pixel-based filters keep preview and export consistent, including Safari.
function applyFilter(c,w,h){if(!filterIndex)return;const image=c.getImageData(0,0,w,h),d=image.data;for(let i=0;i<d.length;i+=4){let r=d[i],g=d[i+1],b=d[i+2];if(filterIndex===1){r=r*1.05+9;g=g*1.02+3;b=b*.94;}if(filterIndex===2){r=r*.88+30;g=g*.88+28;b=b*.9+26;}if(filterIndex===3){const gray=.299*r+.587*g+.114*b;r=r*.65+gray*.35+19;g=g*.65+gray*.35+9;b=b*.6+gray*.4-3;}if(filterIndex===4)r=g=b=.299*r+.587*g+.114*b;d[i]=r;d[i+1]=g;d[i+2]=b;}c.putImageData(image,0,0);}
function compose(target,live){const c=target.getContext('2d',{willReadFrequently:true}),s=target.width/1200;c.setTransform(1,0,0,1,0,0);c.fillStyle=frames[frameIndex].bg;c.fillRect(0,0,target.width,target.height);c.save();c.scale(s,s);cells().forEach((r,i)=>{const source=shots[i]||((live&&i===shots.length&&camera.videoWidth)?camera:null);if(source)cover(c,source,r,source===camera&&facing==='user');else{c.fillStyle='#e7ddd0';c.fillRect(r.x,r.y,r.w,r.h);c.fillStyle='#776b61';c.textAlign='center';c.font='26px Georgia';c.fillText(stream?'Next little moment':'Your photo here',r.x+r.w/2,r.y+r.h/2);}});c.restore();applyFilter(c,target.width,target.height);c.save();c.scale(s,s);drawFrame(c,frameIndex);c.restore();}
function renderPreview(){compose(preview,!completed);}
function animate(t){if(t-lastPaint>100){renderPreview();lastPaint=t;}raf=requestAnimationFrame(animate);}
function refreshResult(){if(!completed){renderPreview();return;}canvas.width=1200;canvas.height=1480;compose(canvas,false);photo.src=canvas.toDataURL('image/jpeg',.9);const bytes=Uint8Array.from(atob(photo.src.split(',')[1]),c=>c.charCodeAt(0));saveFile=new File([bytes],`hafiy-aina-${Date.now()}.jpg`,{type:'image/jpeg'});renderPreview();}
function buildFrames(){const holder=$('frameOptions');holder.replaceChildren();frames.forEach((f,i)=>{const b=document.createElement('button');b.type='button';b.className='frame-choice';b.setAttribute('aria-pressed',String(i===frameIndex));const t=document.createElement('canvas');t.width=96;t.height=118;const c=t.getContext('2d');c.fillStyle='#dfdbd3';c.fillRect(0,0,96,118);c.scale(.08,.08);drawFrame(c,i);const label=document.createElement('span');label.textContent=f.name;b.append(t,label);b.onclick=()=>{frameIndex=i;buildFrames();refreshResult();};holder.append(b);});}
function makePills(id,items,selected,choose){const holder=$(id);holder.replaceChildren();items.forEach((name,i)=>{const b=document.createElement('button');b.type='button';b.textContent=name;b.setAttribute('aria-pressed',String(i===selected));b.onclick=()=>choose(i);holder.append(b);});}
function buildFilters(){makePills('filterOptions',filters,filterIndex,i=>{filterIndex=i;buildFilters();refreshResult();});}
function buildLayouts(){makePills('layoutOptions',['Single','2-grid','4-grid'],[1,2,4].indexOf(layout),i=>{layout=[1,2,4][i];shots=[];completed=false;saveFile=null;photo.removeAttribute('src');setButtons();buildLayouts();renderPreview();message.textContent='Layout changed. Take a new set of photos.';});}
function setButtons(){startBtn.hidden=!!stream;switchBtn.hidden=!stream||completed;captureBtn.hidden=!stream||completed;retakeBtn.hidden=!completed;downloadBtn.hidden=!completed;uploadBtn.hidden=!completed;captureBtn.textContent=layout===1?'Take photo':`Take ${layout} photos`;}
function lock(value){busy=value;$('choices').disabled=value;[startBtn,switchBtn,captureBtn,retakeBtn,downloadBtn,uploadBtn].forEach(b=>b.disabled=value);}
function stopCamera(){if(stream)stream.getTracks().forEach(t=>t.stop());stream=null;camera.srcObject=null;}
async function startCamera(){if(busy)return;lock(true);stopCamera();try{if(!navigator.mediaDevices?.getUserMedia)throw new Error('Camera needs HTTPS or localhost.');stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:facing,width:{ideal:1920},height:{ideal:1080}},audio:false});camera.srcObject=stream;await camera.play();shots=[];completed=false;setButtons();message.textContent='Choose your frame and filter, then strike a pose!';}catch(e){stopCamera();setButtons();message.textContent=e.name==='NotAllowedError'?'Please allow camera access in your browser settings.':e.message;}finally{lock(false);}}
const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function takePhoto(){if(busy||!camera.videoWidth)return;if(frameIndex===0&&!originalReady){message.textContent='Garden Party is still loading. Try another frame or refresh the page.';return;}lock(true);shots=[];completed=false;try{for(let i=0;i<layout;i++){message.textContent=`Photo ${i+1} of ${layout} — smile!`;for(let n=3;n>0;n--){$('countdown').hidden=false;$('countdown').textContent=String(n);await pause(1000);if(document.hidden||!stream?.active)throw new Error('Capture paused. Keep this page open and try again.');}$('countdown').hidden=true;const raw=document.createElement('canvas');const scale=Math.min(1,1600/Math.max(camera.videoWidth,camera.videoHeight));raw.width=Math.round(camera.videoWidth*scale);raw.height=Math.round(camera.videoHeight*scale);cover(raw.getContext('2d'),camera,{x:0,y:0,w:raw.width,h:raw.height},facing==='user');shots.push(raw);renderPreview();await pause(180);}completed=true;refreshResult();setButtons();message.textContent='Lovely! You can still change the frame or filter, then save or share.';}catch(e){shots=[];message.textContent=e.message;}finally{$('countdown').hidden=true;lock(false);}}
async function savePhoto(){if(!saveFile||busy)return;try{if(navigator.canShare?.({files:[saveFile]})&&navigator.share){await navigator.share({files:[saveFile],title:'Hafiy & Aina · Wedding memory'});}else{const url=URL.createObjectURL(saveFile),a=document.createElement('a');a.href=url;a.download=saveFile.name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);}$('saveHelp').hidden=false;}catch(e){if(e.name!=='AbortError')message.textContent='Sharing is unavailable. Press and hold the finished photo below to save it.';if(e.name!=='AbortError'){photo.hidden=false;photo.style.width='100%';}}}
async function uploadPhoto(){if(!completed||busy)return;const data=photo.src;if(saveFile.size>5*1024*1024){message.textContent='Photo exceeds the 5 MB upload limit. Please save it instead.';return;}lock(true);message.textContent='Sending your wedding memory…';const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),45000);try{await fetch(UPLOAD_URL,{method:'POST',mode:'no-cors',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({photo:data}),signal:controller.signal});message.textContent='Photo submitted. Refresh the album shortly to check it appeared. Saving cannot be confirmed by this connection.';}catch(e){message.textContent='Could not confirm submission. Check the album before retrying to avoid duplicates.';}finally{clearTimeout(timeout);lock(false);}}
startBtn.onclick=startCamera;switchBtn.onclick=()=>{facing=facing==='user'?'environment':'user';startCamera();};captureBtn.onclick=takePhoto;retakeBtn.onclick=()=>{shots=[];completed=false;saveFile=null;photo.hidden=true;setButtons();message.textContent='Ready for another happy little moment!';};downloadBtn.onclick=savePhoto;uploadBtn.onclick=uploadPhoto;
window.addEventListener('pagehide',()=>{stopCamera();cancelAnimationFrame(raf);});
window.addEventListener('pageshow',e=>{if(e.persisted){setButtons();raf=requestAnimationFrame(animate);}});
buildFrames();buildFilters();buildLayouts();renderPreview();raf=requestAnimationFrame(animate);

// Wedding gallery elements
const galleryGrid = document.getElementById("galleryGrid");
const galleryMessage = document.getElementById("galleryMessage");
const refreshGalleryBtn = document.getElementById("refreshGalleryBtn");

let galleryLoading = false;
let galleryScript = null;
let galleryTimeout = null;


// Clean up after a gallery request.
function finishGalleryRequest() {
  clearTimeout(galleryTimeout);

  if (galleryScript) {
    galleryScript.remove();
    galleryScript = null;
  }

  galleryLoading = false;
  refreshGalleryBtn.disabled = false;
}


// Apps Script calls this function with the gallery data.
window.weddingGalleryCallback = function (data) {
  finishGalleryRequest();

  if (!data || !data.success || !Array.isArray(data.photos)) {
    galleryMessage.textContent =
      "Could not load the gallery. Please try again.";

    return;
  }

  galleryGrid.replaceChildren();

  data.photos.forEach((item, index) => {
    // Only display supported image data.
    if (
      !item ||
      typeof item.image !== "string" ||
      !/^data:image\/(jpeg|png|gif);base64,/.test(item.image)
    ) {
      return;
    }

    const card = document.createElement("figure");
    card.className = "gallery-item";

    const image = document.createElement("img");
    image.src = item.image;
    image.alt = "Wedding guest photo " + (index + 1);
    image.loading = "lazy";

    card.appendChild(image);
    galleryGrid.appendChild(card);
  });

  const displayedCount = galleryGrid.children.length;

  if (displayedCount === 0) {
    galleryMessage.textContent = data.pendingThumbnails
      ? "New photos are being prepared. Please refresh again shortly."
      : "No photos yet. Be the first to share a moment!";

    return;
  }

  galleryMessage.textContent =
    "Showing " + displayedCount + " recent photo previews.";

  if (data.pendingThumbnails > 0) {
    galleryMessage.textContent +=
      " Some new photos are still being prepared.";
  }
};


// Request gallery data from Apps Script.
function loadGallery() {
  if (galleryLoading) {
    return;
  }

  if (
    !UPLOAD_URL ||
    UPLOAD_URL.includes("PASTE_YOUR_WEB_APP_URL_HERE")
  ) {
    galleryMessage.textContent =
      "Please configure the Google Apps Script URL first.";

    return;
  }

  galleryLoading = true;
  refreshGalleryBtn.disabled = true;

  galleryMessage.textContent = "Loading wedding photos...";

  const url = new URL(UPLOAD_URL);

  url.searchParams.set("action", "gallery");
  url.searchParams.set("callback", "weddingGalleryCallback");

  // Ask for a fresh response.
  url.searchParams.set("t", Date.now().toString());

  galleryScript = document.createElement("script");
  galleryScript.src = url.toString();

  galleryScript.onerror = function () {
    finishGalleryRequest();

    galleryMessage.textContent =
      "Could not connect to the gallery. Please try again.";
  };

  galleryTimeout = setTimeout(() => {
    finishGalleryRequest();

    galleryMessage.textContent =
      "The gallery is taking too long. Please try refreshing.";
  }, 45000);

  document.body.appendChild(galleryScript);
}


// Refresh when the guest taps the button.
refreshGalleryBtn.addEventListener("click", loadGallery);


// Load the gallery when the page opens.
loadGallery();