"use strict";
const UPLOAD_URL = "https://script.google.com/macros/s/AKfycbycOVcRxvQeVwkeixLfJ_pVufVGeSjibt3WbwdWN1rYyb84sx0GzoiJkcEJnQXkRKoW/exec";
const $=id=>document.getElementById(id),grid=$('galleryGrid'),statusText=$('galleryMessage'),refreshBtn=$('refreshGalleryBtn'),moreBtn=$('loadMoreBtn');
let loading=false,scriptNode=null,timeout=null,offset=0,appendMode=false,nextOffset=null;
function finish(){clearTimeout(timeout);scriptNode?.remove();scriptNode=null;loading=false;refreshBtn.disabled=false;moreBtn.disabled=false;}
function text(tag,className,value){const node=document.createElement(tag);node.className=className;node.textContent=value;return node;}
window.weddingGalleryCallback=data=>{finish();if(!data?.success||!Array.isArray(data.photos)){statusText.textContent='Memories could not load. Please try refreshing.';return;}if(!appendMode)grid.replaceChildren();
for(const item of data.photos){
 if(typeof item.image!=='string'||!/^data:image\/(jpeg|png|gif);base64,/.test(item.image))continue;
 const post=document.createElement('article');post.className='feed-post';
 const image=document.createElement('img');image.src=item.image;image.alt='A photo shared from Hafiy and Aina’s wedding';image.loading='lazy';image.className='post-photo';
 const print=document.createElement('div');print.className='polaroid-print';
 const label=text('span','polaroid-label','Gambar kita');
 print.append(image,label);
 const actions=document.createElement('div');actions.className='post-actions';
 const save=document.createElement('a');save.href=item.image;save.download='hafiy-aina-memory.jpg';save.className='post-save';save.textContent='Save photo';
 actions.append(text('span','post-note','Hafiy & Aina'),save);
 post.append(print,actions);
 grid.append(post);
}
nextOffset=Number.isInteger(data.nextOffset)?data.nextOffset:null;moreBtn.hidden=nextOffset===null;statusText.textContent=grid.children.length?grid.children.length+' memories shared with love.':'No memories yet. Share the first one!';if(data.pendingThumbnails)statusText.textContent+=' New photos are being prepared; refresh shortly.';};
function loadGallery(append=false){if(loading)return;appendMode=append;offset=append?(nextOffset||0):0;loading=true;refreshBtn.disabled=true;moreBtn.disabled=true;statusText.textContent='Loading memories…';const url=new URL(UPLOAD_URL);url.search=new URLSearchParams({action:'gallery',callback:'weddingGalleryCallback',offset:String(offset),t:String(Date.now())});scriptNode=document.createElement('script');scriptNode.src=url.toString();scriptNode.onerror=()=>{finish();statusText.textContent='Could not connect. Please refresh or try another browser.';};timeout=setTimeout(()=>{finish();statusText.textContent='Loading took too long. Please refresh.';},45000);document.body.append(scriptNode);}
refreshBtn.onclick=()=>loadGallery();moreBtn.onclick=()=>loadGallery(true);
loadGallery();
