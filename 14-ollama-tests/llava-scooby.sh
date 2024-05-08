#!/bin/bash

# https://ollama.com/library/llava

# ollama rm llava-scooby

# This: llava:latest           	8dd30f6b0cb1	4.7 GB	19 minutes ago
# This llava sucks :) Lets try bigger models:
# * ollama run llava:7b
# * ollama run llava:13b
# * ollama run llava:34b
# https://medium.com/@sudarshan-koirala/run-open-source-multimodal-models-locally-using-ollama-24cb1bb8b955

set -euo pipefail

echo TODO add Bytes parameters on bigger computer..

PROMPT="You are a Scuba Diving Photographer who has plenty of experiences with fish in a region
(the Philippines) When asked to analize an image, please return a JSON in this format:
- a 'photo_description'(STRING) with the high level
- a 'big_fish'(BOOLEAN) - if you see some BIG fish
- a 'fish' part pointing to an Array of elements, one per different maritime life you see, each with two fields:
  - a 'name'(STRING) (succint name/race, like Octopus, Shark, Urchin, Nudibranch, Lionfish, ..)
  - a 'description'(STRING) (a more verbose part of it, conveying number, color, and any additional context you want to add in a single string)

Example:
{
  'photo_description': 'blah blah blah',
  'fish': [
    {
        'name': 'moray eel',
        'description': 'A moray eel hiding behind a rock',
    },
    {
        'name': 'soft coral',
        'description': 'A soft coral with some fish swimming in it',
    },
    ...
  ]
}

Only describe things you're 80% certain you recognize.
"



ollama list | grep llava-scooby:latest &&
    echo Model llava-scooby exists already... ||
        ollama create llava-scooby -f ./Modelfile.llava-scuba-diving

DIR=~/GoPro/20240429-sbobinatio-filippine
#FILES="GOPR4251.JPG GOPR4267.JPG"
#FILES="GOPR4251.JPG GOPR4267.JPG GOPR4279.JPG GOPR4296.JPG GOPR4321.JPG GOPR4333.JPG GOPR4348.JPG GOPR4363.JPG GOPR4375.JPG GOPR4387.JPG GOPR4399.JPG GOPR4411.JPG GOPR4427.JPG GOPR4442.JPG GOPR4454.JPG GOPR4467.JPG GOPR4487.JPG GOPR4502.JPG"
FILES="GOPR4279.JPG GOPR4296.JPG GOPR4321.JPG GOPR4333.JPG GOPR4348.JPG GOPR4363.JPG GOPR4375.JPG GOPR4387.JPG GOPR4399.JPG GOPR4411.JPG GOPR4427.JPG GOPR4442.JPG GOPR4454.JPG GOPR4467.JPG GOPR4487.JPG GOPR4502.JPG"

for FILE in $FILES ; do
    FULL_PATH="$DIR/$FILE"
    if [ -f "$FULL_PATH" ] ; then
        echo "🩻 Describe img: '$FULL_PATH'"
        echo -en "$PROMPT\n\nDescribe this image: $FULL_PATH\n" | time ollama run llava | tee $FULL_PATH.description.txt
    else
        echo "❌ DOESNT EXIST: '$FULL_PATH'"
    fi

done

