WEDDING CAMERA · HAFIY & AINA

A static wedding photo app. Guests open the camera directly, choose a frame
and filter, take a photo, then save it or share it to the wedding album.
No guest name or wishes are collected or displayed, including on older posts.

Layouts: Single photo, or 3-grid: three timed photos in a vertical photobooth
strip. Each shot retains the selected frame. The strip exports as one JPEG.
The album is a scrolling photo feed with direct camera access and photo saving.

LOCAL DEVELOPMENT
From this folder run: python3 -m http.server 8000 --bind 127.0.0.1
Open the local server in your browser. Camera access requires localhost or HTTPS
and browser permission. There is no package installation or build step.

ALBUM BACKEND
script.js and gallery.js use the existing Google Apps Script UPLOAD_URL.
Uploads send a JSON object containing only photo (a JPEG data URL).
The read-only gallery uses JSONP with action=gallery, callback and offset.
The backend source is not included in this repository. Uploads use no-cors,
so the app cannot confirm receipt; check the album before retrying an upload.
Deploy updated HTML, JavaScript and CSS together to refresh cached assets.
