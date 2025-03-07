#!/bin/bash

# Input JSON file (replace with your actual file if needed)
json_file="response-with-videoz.json"

# Extract the array of videos using jq
video_array=$(jq '.response.videos[]' "$json_file")

# Check if jq command was successful
if [ $? -ne 0 ]; then
  echo "Error: jq command failed."
  exit 1
fi

# Initialize a counter for the output file names
counter=1

# Iterate through the video array
echo "$video_array" | jq -rc '.bytesBase64Encoded' | while IFS= read -r base64_data; do
  # Check if base64_data is empty
  if [ -z "$base64_data" ]; then
    echo "Warning: Empty base64 data encountered. Skipping."
    continue
  fi

  # Create the output file name
  output_file="output${counter}.mp4"

  # Decode the base64 data and save it to the output file
  echo "$base64_data" | base64 -d > "$output_file"

  # Check if base64 command was successful
  if [ $? -ne 0 ]; then
    echo "Error: base64 decoding failed for output${counter}.mp4"
    exit 1
  fi

  echo "Created: $output_file"

  # Increment the counter
  ((counter++))
done

echo "Done processing videos."
