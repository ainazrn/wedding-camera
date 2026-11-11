WEDDING CAMERA — SOCIAL ALBUM UPDATE

1. BACK UP YOUR EXISTING APPS SCRIPT
Open script.google.com and your Wedding Camera Upload project.
Copy your existing Code.gs into a local backup first.
Keep the current Google Drive FOLDER_ID (the part after /folders/ in its URL).

2. UPDATE APPS SCRIPT
Open the supplied Code.gs in VS Code. Copy its contents into the Apps Script
Code.gs editor, replacing the old version. Replace ONLY
PASTE_YOUR_EXISTING_FOLDER_ID_HERE with your current folder ID.
Do NOT paste your web app URL into FOLDER_ID.
Save. Run authorizeAndCheckFolder once; authorize if asked.
Deploy > Manage deployments > select current web app > pencil > New version > Deploy.
Keep Execute as Me and Who has access Anyone (same as your existing setup).
Update the EXISTING deployment, so your /exec URL stays the same.
If you create a new deployment instead, update UPLOAD_URL in BOTH script.js and gallery.js.

3. UPDATE YOUR WEBSITE
Copy all website files from this package into your VS Code project and GitHub root.
Do not upload Code.gs or this SETUP.txt to GitHub: Code.gs belongs in Google Apps Script.
You may upload README.txt, but it is not needed by the website.
Commit changes. Wait for GitHub Pages deployment. Refresh the page.

4. TEST END TO END
On menu.html enter a test name and a short wish.
Choose Original, take a photo and Share to Album.
Tap View Album, then Refresh feed shortly after the submission.
Confirm the photo, name and wishes appear together.
Repeat with another name, a different frame and 4-grid.
Also test the album's Choose a photo upload form.

DETAILS
- Original = no decorative frame. 4-grid still retains its Polaroid layout.
- The Album icon beside the shutter is removed. View Album after capture is retained.
- Album page has no Take photos buttons at the top or bottom; Main menu remains.
- New posts store their name/wishes in each Drive file's description.
- Previous photos cannot recover names/wishes that were never stored.
- Anyone with the album link can view the posts and captions. Folder stays Restricted.
- Gallery uses Drive thumbnails, so photos may take time to appear.
- Upload uses the existing no-cors submission: refresh the feed to confirm receipt.
- No likes, comments, accounts or deletion controls are added.
- All supplied frame artwork, mobile fixes and #5B6E2C theme are preserved.
