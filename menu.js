"use strict";
const nameInput=document.getElementById('guestName'), wishesInput=document.getElementById('guestWishes');
try{nameInput.value=sessionStorage.getItem('weddingGuestName')||'';wishesInput.value=sessionStorage.getItem('weddingGuestWishes')||'';}catch(e){}
document.getElementById('guestForm').addEventListener('submit',event=>{
 event.preventDefault();
 try{sessionStorage.setItem('weddingGuestName',nameInput.value.trim().slice(0,60));sessionStorage.setItem('weddingGuestWishes',wishesInput.value.trim().slice(0,500));}catch(e){}
 // URL fragment is a fallback when session storage is blocked; not sent to the server.
 const details=new URLSearchParams({name:nameInput.value.trim().slice(0,60),wishes:wishesInput.value.trim().slice(0,500)});
 window.location.assign('camera.html#'+details.toString());
});
