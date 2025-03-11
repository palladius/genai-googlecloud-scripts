```bash
# Install:
pip install streamlit pyyaml
```

## prompt

Wow! Now finally please create a small streamlit application that has a bit textarea and prompts me for any prompt. on the left it has some sample prompts: one with a sample video prompt, a sample image prompt, a sample code prompt, ... Once the user clicks on one of these sample prompts (contained conveniently in a etc/prompts.yaml) or types one, this calls the classification function in classificator.py. Based on the JSON class, it will then invoke specific per-class function (I'll implement it myself). It will type in the app the class chosen with one of the 4 google logo colors.


## p2

ok now lets add a function which, based on the (classification, prompt) couple, executes some code. Some will have to visualize local videos and images, so make sure the UI will allow for 4 images and videos to be attached.

Let's start with images. Im going to trigger an image function I already have in imagen.py , call it and return an array of 4 generated local  image files. The UI will need to present a clickable thumbnail.

## P3

Now I'd like on top left some sort of "mosaic" button which visualizes ALL the pictures in a tiled manner. Every picture and video from HISTORY.json is visualized and HOVER reveals their prompt. A click opens a page with just the image (this time BIG) and the prompt.
