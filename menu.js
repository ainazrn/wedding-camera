"use strict";
const nameInput=document.getElementById('guestName');
try{nameInput.value=sessionStorage.getItem('weddingGuestName')||'';}catch(e){}
document.getElementById('guestForm').addEventListener('submit',event=>{
 event.preventDefault();
 try{sessionStorage.setItem('weddingGuestName',nameInput.value.trim());}catch(e){}
 window.location.assign('camera.html');
});
