'''Images and video logic.'''

from PIL import Image
import pprint
import os

from .constantz import *

#from ...imagen import generate_images
#from ...imagen import generate_images
from imagen import generate_images  # Absolute import
from lib.videoz import veo_generate_and_poll

def handle_image_prompt(cleanedup_prompt, history):
    """Handles the image_prompt classification."""
    st.write("Generating images...")
    image_files = generate_images(cleanedup_prompt, out_folder=OUTPUT_IMAGES_FOLDER)
    # Display images in a 2x2 grid
    cols = st.columns(2)
    for i, image_file in enumerate(image_files):
        with cols[i % 2]:
            st.image(Image.open(image_file), caption=image_file, use_container_width=True)
            # Add a link to download the full-size image
            with open(image_file, "rb") as f:
                st.download_button(
                    label="Download",
                    data=f,
                    file_name=image_file,
                    mime="image/png",
                )
    return image_files

def handle_video_prompt(cleanedup_prompt, history, folder=OUTPUT_VIDEOS_FOLDER):
    """Handles the video_prompt classification.


    returns [ARRAY(video_files) , operation_id ]
    """
    st.write("Generating videos (be patient, it can take up to 60 seconds)...")
    # Call the video generation function
    video_files_info = veo_generate_and_poll(prompt=cleanedup_prompt, output_folder=OUTPUT_VIDEOS_FOLDER)
    #video_files_info = veo_generate_and_poll(prompt=cleanedup_prompt, operation_id='projects/veo-testing/locations/us-central1/publishers/google/models/veo-2.0-generate-001/operations/b140acd9-e1a6-4f56-897e-e7add5cac9a4', output_folder=OUTPUT_VIDEOS_FOLDER)
    pprint.pp(video_files_info)
    #local_files_with_path = [os.path.join(folder, f) for f in os.listdir(folder)] # BUG
    #local_files_with_path = []
    #st.write(f"## 1. video_files_info \n ```json\n{video_files_info}\n```")
    local_files = video_files_info.get('local_files', [])
    st.write(f"## local_files \n{local_files}")
    gcs_stuff = video_files_info.get('gcs_stuff', [])
    operation_id = video_files_info.get('operation_id', [])
    if gcs_stuff:
        st.write(f"## 2. gcs_stuff \n{gcs_stuff}")
    if operation_id:
        st.write(f"## 3. operation_id \n{operation_id}")
    #if local_files:
    #    local_files_with_path = local_files # [os.path.join(folder, f) for f in local_files]
    # Now fixed on library side!
    #st.write(f"## 4. DEBUG local_files_with_path \n{local_files_with_path}\n")

#     {'local_files': ['video-A_cat_playing_the_piano_in_a_jazz_club_cinematic_lighting_Camera-b140acd9-e1a6-4f56-897e-e7add5cac9a4-1.mp4',
#                  'video-A_cat_playing_the_piano_in_a_jazz_club_cinematic_lighting_Camera-b140acd9-e1a6-4f56-897e-e7add5cac9a4-2.mp4',
#                  'video-A_cat_playing_the_piano_in_a_jazz_club_cinematic_lighting_Camera-b140acd9-e1a6-4f56-897e-e7add5cac9a4-3.mp4',
#                  'video-A_cat_playing_the_piano_in_a_jazz_club_cinematic_lighting_Camera-b140acd9-e1a6-4f56-897e-e7add5cac9a4-4.mp4'],
#      'operation_id': '...',
#      'gcs_stuff': None}

    # Display the video
    if video_files_info:
        cols = st.columns(2)
        for i, video_file in enumerate(local_files):
            with cols[i % 2]:
                try:
                    st.video(video_file)
                    # Add a link to download the full-size video
                    with open(video_file, "rb") as f:
                        st.download_button(
                            label="Download",
                            data=f,
                            file_name=video_file,
                            mime="video/mp4",
                        )
                except FileNotFoundError:
                    st.write(f"Video {video_file} not found.")

    return [local_files, operation_id] # video_files_info amnd operation_id
