"use strict";
const UPLOAD_URL = "https://script.google.com/macros/s/AKfycbycOVcRxvQeVwkeixLfJ_pVufVGeSjibt3WbwdWN1rYyb84sx0GzoiJkcEJnQXkRKoW/exec";
const $=id=>document.getElementById(id),grid=$('galleryGrid'),statusText=$('galleryMessage'),refreshBtn=$('refreshGalleryBtn'),moreBtn=$('loadMoreBtn');
let loading=false,scriptNode=null,timeout=null,offset=0,appendMode=false,nextOffset=null;
function finish(){clearTimeout(timeout);scriptNode?.remove();scriptNode=null;loading=false;refreshBtn.disabled=false;moreBtn.disabled=false;}
function text(tag,className,value){const node=document.createElement(tag);node.className=className;node.textContent=value;return node;}
window.weddingGalleryCallback=data=>{finish();if(!data?.success||!Array.isArray(data.photos)){statusText.textContent='Memories could not load. Please try refreshing.';return;}if(!appendMode)grid.replaceChildren();
for(const item of data.photos){
 if(typeof item.image!=='string'||!/^data:image\/(jpeg|png|gif);base64,/.test(item.image))continue;
 const name=typeof item.name==='string'?item.name.trim().slice(0,60):'';
 const wishes=typeof item.wishes==='string'?item.wishes.trim().slice(0,500):'';
 const post=document.createElement('article');post.className='feed-post';
 const image=document.createElement('img');image.src=item.image;image.alt=name?'Wedding memory shared by '+name:'Wedding memory';image.loading='lazy';image.className='post-photo';post.append(image);
 // Optional fields only. No anonymous labels, generic wishes or date below the photo.
 if(name||wishes){const caption=document.createElement('div');caption.className='post-caption';
  if(name)caption.append(text('strong','caption-name',name));
  if(wishes)caption.append(text('p','post-wishes',wishes));
  post.append(caption);
 }
 grid.append(post);
}
nextOffset=Number.isInteger(data.nextOffset)?data.nextOffset:null;moreBtn.hidden=nextOffset===null;statusText.textContent=grid.children.length?grid.children.length+' memories shared with love.':'No memories yet. Share the first one!';if(data.pendingThumbnails)statusText.textContent+=' New photos are being prepared; refresh shortly.';if(data.backendVersion!==2)statusText.textContent+=' Update Apps Script using the included Code.gs to display names and wishes.';};
function loadGallery(append=false){if(loading)return;appendMode=append;offset=append?(nextOffset||0):0;loading=true;refreshBtn.disabled=true;moreBtn.disabled=true;statusText.textContent='Loading memories…';const url=new URL(UPLOAD_URL);url.search=new URLSearchParams({action:'gallery',callback:'weddingGalleryCallback',offset:String(offset),t:String(Date.now())});scriptNode=document.createElement('script');scriptNode.src=url.toString();scriptNode.onerror=()=>{finish();statusText.textContent='Could not connect. Please refresh or try another browser.';};timeout=setTimeout(()=>{finish();statusText.textContent='Loading took too long. Please refresh.';},45000);document.body.append(scriptNode);}
refreshBtn.onclick=()=>loadGallery();moreBtn.onclick=()=>loadGallery(true);
loadGallery();
