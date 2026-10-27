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

  switchBtn.hidden = false;
  captureBtn.hidden = false;

  message.textContent = "Ready to take another photo!";
});

downloadBtn.addEventListener("click", downloadPhoto);