// Google Apps Script web app URL
const UPLOAD_URL = "https://script.google.com/macros/s/AKfycbycOVcRxvQeVwkeixLfJ_pVufVGeSjibt3WbwdWN1rYyb84sx0GzoiJkcEJnQXkRKoW/exec";

// Get elements from the HTML page
const camera = document.getElementById("camera");
const photo = document.getElementById("photo");
const canvas = document.getElementById("canvas");

const message = document.getElementById("message");

const startBtn = document.getElementById("startBtn");
const switchBtn = document.getElementById("switchBtn");
const captureBtn = document.getElementById("captureBtn");
const retakeBtn = document.getElementById("retakeBtn");
const downloadBtn = document.getElementById("downloadBtn");
const uploadBtn = document.getElementById("uploadBtn");

// Store the active camera stream
let cameraStream = null;

// Start with the phone's back camera when available
let facingMode = "environment";

// Stop the current camera
function stopCamera() {
  if (cameraStream) {
    cameraStream.getTracks().forEach((track) => {
      track.stop();
    });

    cameraStream = null;
  }

  camera.srcObject = null;
}

// Open the camera
async function startCamera() {
  stopCamera();

  // Camera access normally requires HTTPS or localhost
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    message.textContent =
      "Camera access is unavailable. Open this page using HTTPS or localhost.";

    return;
  }

  try {
    message.textContent = "Opening camera...";

    cameraStream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: facingMode
      },
      audio: false
    });

    camera.srcObject = cameraStream;

    await camera.play();

    camera.hidden = false;
    photo.hidden = true;

    startBtn.hidden = true;
    switchBtn.hidden = false;
    captureBtn.hidden = false;

    retakeBtn.hidden = true;
    downloadBtn.hidden = true;
    uploadBtn.hidden = true;

    message.textContent = "Smile! Tap “Take Photo” when ready.";
  } catch (error) {
    console.error("Camera error:", error);

    stopCamera();

    startBtn.hidden = false;
    switchBtn.hidden = true;
    captureBtn.hidden = true;

    if (error.name === "NotAllowedError") {
      message.textContent =
        "Camera permission was denied. Allow camera access in your browser settings and try again.";
    } else if (error.name === "NotFoundError") {
      message.textContent =
        "No camera was found on this device.";
    } else {
      message.textContent =
        "Could not open the camera. Please try again or use another browser.";
    }
  }
}

// Take a photo from the current video
function takePhoto() {
  if (!camera.videoWidth || !camera.videoHeight) {
    message.textContent = "The camera is still loading. Please try again.";
    return;
  }

  // Save the full camera image
  canvas.width = camera.videoWidth;
  canvas.height = camera.videoHeight;

  const context = canvas.getContext("2d");

  context.drawImage(
    camera,
    0,
    0,
    canvas.width,
    canvas.height
  );

  // Convert the canvas into an image
  photo.src = canvas.toDataURL("image/jpeg", 0.9);

  camera.hidden = true;
  photo.hidden = false;

  switchBtn.hidden = true;
  captureBtn.hidden = true;

  retakeBtn.hidden = false;
  downloadBtn.hidden = false;
  uploadBtn.hidden = false;

  message.textContent =
    "Your photo is ready! Download it or take another one.";
}

// Switch between front and back camera
async function switchCamera() {
  if (facingMode === "environment") {
    facingMode = "user";
  } else {
    facingMode = "environment";
  }

  await startCamera();
}

// Save the captured image
function downloadPhoto() {
  if (!photo.src) {
    return;
  }

  const link = document.createElement("a");

  link.href = photo.src;
  link.download = "wedding-photo.jpg";

  document.body.appendChild(link);

  link.click();

  link.remove();

  message.textContent =
    "Your photo is ready to save. Check your downloads or photo options.";
}

// Button actions
startBtn.addEventListener("click", startCamera);

captureBtn.addEventListener("click", takePhoto);

switchBtn.addEventListener("click", switchCamera);

retakeBtn.addEventListener("click", () => {
  photo.hidden = true;
  camera.hidden = false;

  retakeBtn.hidden = true;
  downloadBtn.hidden = true;
  uploadBtn.hidden = true;

  switchBtn.hidden = false;
  captureBtn.hidden = false;

  message.textContent = "Ready to take another photo!";
});

downloadBtn.addEventListener("click", downloadPhoto);

// Send the captured photo to Google Apps Script.
async function uploadPhoto() {
  if (!photo.src || photo.hidden) {
    message.textContent = "Please take a photo first.";
    return;
  }

  if (
    !UPLOAD_URL ||
    UPLOAD_URL.includes("PASTE_YOUR_WEB_APP_URL_HERE")
  ) {
    message.textContent = "The upload URL has not been configured.";
    return;
  }

  // Check the approximate JPEG size before sending.
  const base64Data = photo.src.split(",")[1];

  if (!base64Data) {
    message.textContent = "Could not read the captured photo.";
    return;
  }

  const approximateBytes = Math.ceil(base64Data.length * 3 / 4);
  const maxBytes = 5 * 1024 * 1024;

  if (approximateBytes > maxBytes) {
    message.textContent =
      "This photo is too large to upload. Please take another photo.";
    return;
  }

  uploadBtn.disabled = true;
  retakeBtn.disabled = true;
  downloadBtn.disabled = true;

  message.textContent = "Sending your photo. Please wait...";

  try {
    await fetch(UPLOAD_URL, {
      method: "POST",

      // This allows the browser to send the request to Apps Script,
      // but the response cannot be read by this basic version.
      mode: "no-cors",

      headers: {
        "Content-Type": "text/plain;charset=utf-8"
      },

      body: JSON.stringify({
        photo: photo.src
      })
    });

    message.textContent =
      "Photo submitted. Please check the Google Drive folder to confirm it was saved.";

  } catch (error) {
    console.error("Upload error:", error);

    message.textContent =
      "Could not send the photo. Check your internet connection and try again.";

  } finally {
    uploadBtn.disabled = false;
    retakeBtn.disabled = false;
    downloadBtn.disabled = false;
  }
}

uploadBtn.addEventListener("click", uploadPhoto);
