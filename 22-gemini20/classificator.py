
'''classificator.py

#
Usage: classificator.py --classification-prompt etc/classification.prompt content.txt
Usage: classificator.py -c etc/classification.prompt -

'''

# Needs to have some sort of {{content}} or throw error.
DefaultClassificationPrompt = '''You're a useful prompt classifier.
You need to understand if the user, through a given prompt, is asking to create an image, video, parse a url or simply to explain/summarize
based on normal text.

Based on the following input, please find the most pertinent class for the prompt which is given :

- "image_prompt". Choose this if you seem to be asked something to create an image (something which has no movement or can be in a picture).
- "video_prompt". Choose this if you seem to be asked something to create a video (there is a concept of time, variation, ..).
- "url". Choose this if the content contains an URL.
- "chat". Choose this if the content contains a sample text, something which an LLM might want to summarize or respond to.
- "summary". Choose this if the content contains a sample text, something which an LLM might want to summarize or respond to.
- "unknown". If nothing really fits.

--- GIVEN PROMPT BEGIN ---
{{content}}
--- GIVEN PROMPT END ---

Make sure to return just one of these: ['image_prompt', 'video_prompt', 'chat', 'url', 'summary', 'unknown' ]:
'''
# TODO return a JSON with { 'classification': STRING, 'cleanedup_prompt': LONG_STRING }
