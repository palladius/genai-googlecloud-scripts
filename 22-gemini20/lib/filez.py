
'''File utilities.'''

import datetime
import os
import re

def midjourneyish_filename_from_prompt(prompt, id='', extension='png', out_folder='out/'):
    '''Generate a possible filename based on a generic genai prompt.

    - if prompt is long, it should be shortened/chopped to max 64 chars.
    - all spaces should be moved to underscores.
    - a YYYYMMDD date should be prepended for alpha sorting.
    - if out_folder is not None, it will be prepended to the filename.

    Should have some sort of ID.
    '''
    max_length = 96 # 64

    # Get current date in YYYYMMDD format
    today = datetime.date.today().strftime("%Y%m%d")

    # Shorten the prompt if it's too long
    if len(prompt) > max_length:
        prompt = prompt[:max_length]

    # Replace spaces with underscores
    prompt = prompt.replace(" ", "_")

    # Remove any characters that are not alphanumeric or underscores
    prompt = re.sub(r'[^a-zA-Z0-9_]', '', prompt)

    # Construct the filename
    filename = f"{today}_{prompt}_{id}.{extension}"

    if out_folder is not None:
        # Ensure the output folder exists
        os.makedirs(out_folder, exist_ok=True)
        filename = os.path.join(out_folder, filename)

    return filename
