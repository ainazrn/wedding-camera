"use strict";
const UPLOAD_URL = "https://script.google.com/macros/s/AKfycbycOVcRxvQeVwkeixLfJ_pVufVGeSjibt3WbwdWN1rYyb84sx0GzoiJkcEJnQXkRKoW/exec";
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