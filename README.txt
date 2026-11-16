WEDDING CAMERA · HAFIY & AINA

A static wedding photo app. Guests open the camera directly, choose a frame
and filter, take a photo, then save it or share it to the wedding album.
No guest name or wishes are collected or displayed, including on older posts.

The camera takes one photo with a countdown. Guests can choose a frame and
filter, retake, save, or share. The album displays two photos per row and
provides photo saving and camera access through the bottom navigation.

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
