This game was created as a demonstration for HSLU May24.

## Things to do

**Phase 1: Gemini and p5 iteration.**

1. Prompt: *Make me a captivating endless runner game. Key instructions on the screen. p5js scene, no HTML. I like pixelated dinosaurs and interesting backgrounds.*
    * Make sure to vary this at your own liking.
2. Inject it into AI studio with gemini 2.5 Pro or Flash.
3. Go to https://editor.p5js.org/ and inject JS in `sketch.js`. 
4. Iterate 2/3 until it works, possibly pasting the error into Gemini.
5. Once it works remotely, move to phase 2 (try it locally and push).


**Phase 2: Run on Firebase**

* On your local computer, make sure to have `npm` to work. If possible, install it via `nvm`. 
    * Currently Firebase requires version `20.0` or moooooooooooore.
* ONce its installed do this:

```bash
# install firebase CLI
npm install firebase-tools
npm install firebase

# logs in as XXX@gmail.com
firebase login

# Creates skeleton for the files to come.
mkdir public
touch public/index.html public/sketch.js public/style.css
```

* Paste the 3 files in the public folder.
* initalize the repo: `firebase init`. In the `firebase init`, do this:
    * Choose **hosting** (space + ENTER)
    * Choose "new project" + ENTER. Give it a nice looking name, like `riccardo-simple-game`
    * accept `public/` directory as source for firebase files (its the default)
    * Do NOT accept it to write PWA app, or this will overwrite index.html. If you accidentally overwrite it, just re-copy the files. If you make this mistake, just re-paste the index.html code. It will contain links to `sketch.js` and `style.css`.
* If the `init` process fails, it might need y9ou can't create a Firebase project at all.  In this case,  go online to Firebase Console and accept Terms of Services for the first time. after this, it should work.
* `firebase deploy` and take note of the URL! Your app is online!

## Notes

* Inspiration from five games ive crested: https://medium.com/@palladiusbonton/wip-code-3d-kid-games-with-gemini-2-5-d580d6b9802b 
* NOte this might not work great on mobile. Ask Gemini to help you make it work with mobile too!
* If the app doesn't seem to refresh on mobile, it probably isn't! Refresh is your friend here.