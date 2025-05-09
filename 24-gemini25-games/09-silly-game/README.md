This game was created as a demonstration for HSLU May24.

## Things to do

**Phase 1: Gemini and p5 iteration.**

1. Prompt: *Make me a captivating endless runner game. Key instructions on the screen. p5js scene, no HTML. I like pixelated dinosaurs and interesting backgrounds.*
    * Make sure to vary this at your own liking.
2. Inject it into AI studio with gemini 2.5 Pro or Flash.
3. Go to https://editor.p5js.org/ and inject JS in `sketch.js`. 
4. Iterate 2/3 until it works, possibly pasting the error into Gemini.
5. Once it works remotely, try it locally. 


**Phase 2: Run on Firebase**

* On your local computer, make sure to have `npm` to work. If possible, install it via `nvm`. 
    * Currently Firebase requires version `20.0` or moooooooooooore.
* ONce its installed do this:

```bash
# install firebase CLI
npm install firebase-tools
# logs in as XXX@gmail.com
firebase login
# mkdir public
touch public/index.html public/sketch.js public/style.css
# initalize the repo
firebase init
```

* in the `firebase init`, do this:
    * Choose **hosting** (space + enter)
    * Choose new project + ENTER. Give it a nice looking name, like 'riccardo-simple-game'.
    * accept 'public/' directory.
    * Do NOT accept it to write PWA app, or this will overwrite index.html. If you accidentally overwrite it, just re-copy the files.

* NOTE you might need to go online and accept TOS for the first time.


## Notes

* Inspiration from five games ive crested: https://medium.com/@palladiusbonton/wip-code-3d-kid-games-with-gemini-2-5-d580d6b9802b 

 `npm [-g] install firebase`.