
'''File utilities.'''

import datetime
import os
import re
import uuid
import json

def midjourneyish_filename_from_prompt(prompt, id='', extension='png', out_folder='out/'):
    '''Generate a possible filename based on a generic genai prompt.

    - if prompt is long, it should be shortened/chopped to max 64 chars.
    - all spaces should be moved to underscores.
    - a YYYYMMDD date should be prepended for alpha sorting.
    - if out_folder is not None, it will be prepended to the filename.
    - a unique uuid (chopped to 12 chars) will be added.

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

    # Generate a unique UUID and chop it to 8 characters
    unique_id = str(uuid.uuid4())[:8]

    # Construct the filename
    filename = f"{today}_{prompt}_{unique_id}_{id}.{extension}"

    if out_folder is not None:
        # Ensure the output folder exists
        os.makedirs(out_folder, exist_ok=True)
        filename = os.path.join(out_folder, filename)

    return filename

# def midjourneyish_filename_from_prompt_OLD(prompt, id='', extension='png', out_folder='out/'):
#     '''Generate a possible filename based on a generic genai prompt.

#     - if prompt is long, it should be shortened/chopped to max 64 chars.
#     - all spaces should be moved to underscores.
#     - a YYYYMMDD date should be prepended for alpha sorting.
#     - if out_folder is not None, it will be prepended to the filename.

#     Should have some sort of ID.
#     '''
#     max_length = 96 # 64

#     # Get current date in YYYYMMDD format
#     today = datetime.date.today().strftime("%Y%m%d")

#     # Shorten the prompt if it's too long
#     if len(prompt) > max_length:
#         prompt = prompt[:max_length]

#     # Replace spaces with underscores
#     prompt = prompt.replace(" ", "_")

#     # Remove any characters that are not alphanumeric or underscores
#     prompt = re.sub(r'[^a-zA-Z0-9_]', '', prompt)

#     # Construct the filename
#     filename = f"{today}_{prompt}_{id}.{extension}"

#     if out_folder is not None:
#         # Ensure the output folder exists
#         os.makedirs(out_folder, exist_ok=True)
#         filename = os.path.join(out_folder, filename)

#     return filename


# def write_to_file(file_name, content, verbose=True):
#     '''Writes a file content ot file. If vrbose, prints what it just did with content size.'''

def write_to_file(file_name, content, verbose=True):
    '''Writes a file content ot file. If verbose, prints what it just did with content size.'''
    try:
        with open(file_name, 'w') as f:
            if isinstance(content, dict) or isinstance(content, list):
                json.dump(content, f, indent=2)
            elif isinstance(content, str):
                f.write(content)
            else:
                f.write(str(content))

        if verbose:
            file_size = os.path.getsize(file_name)
            print(f"💾 Wrote {file_size}B to '{file_name}'")
    except Exception as e:
        print(f"🔴 Error in write_to_file: {e}")
