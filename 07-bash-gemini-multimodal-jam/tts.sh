#!/bin/bash

# word to text via vurl :)
# Docs https://cloud.google.com/text-to-speech/docs/create-audio-text-command-line

set -euo pipefail
#PROJECT_ID=$(gcloud config get-value project)
#PROJECT_ID=ric-cccwiki
#PROJECT_ID=ricc-genai
SENTENCE="$(echo "$@" | sed "s/'/\\\\'/g")" # c'e' l'uomo => "c e l uomo"
TMP_OUTPUT_FILE=.tmp.tts-output.json
JQ_PATH=".audioContent"
DEFAULT_LANG="en-US"
TTS_LANG="${TTS_LANG:-$DEFAULT_LANG}"
#DEFAULT_GENDER='MALE' doesnt work in italian -> dflt is it-IT-Neural2-A
DEFAULT_GENDER='FEMALE'

#SENTENCE="${@//\'}"
# common functions
source _common.sh

echo "# PROJECT_ID: $(yellow $PROJECT_ID)"
echo "# TTS_LANG: $(yellow $TTS_LANG)"
echo "# Cleaned up SENTENCE: $(yellow $SENTENCE)"

echodo curl -X POST \
-H "Authorization: Bearer $(gcloud --project "$PROJECT_ID" auth print-access-token)" \
-H "Content-Type: application/json" \
-d "{
  'input': {
    'text': '$SENTENCE'
  },
  'voice': {
    'languageCode': '$TTS_LANG',
    'ssmlGender': '$DEFAULT_GENDER'
  },
  'audioConfig': {
    'audioEncoding': 'MP3'
  }
}" "https://texttospeech.googleapis.com/v1/text:synthesize" \
    > $TMP_OUTPUT_FILE 2>t ||
        show_errors_and_exit

echo "Written $TMP_OUTPUT_FILE. curl_ret=$?"

#cat $TMP_OUTPUT_FILE | jq -r "$JQ_PATH"
cat $TMP_OUTPUT_FILE | jq -r "$JQ_PATH" > t.audio.encoded
_base64_decode_mac_or_linux t.audio.encoded > t.mp3
# i need te LAST so i can copy it deterministically from other script :)
cp t.mp3 "t.${SENTENCE:0:50}.mp3"

# da web: funge
# {
#   "input": {
#     "text": "ciao mamma"
#   },
#   "voice": {
#     "languageCode": "en-US",
#     "ssmlGender": "FEMALE"
#   },
#   "audioConfig": {
#     "audioEncoding": "MP3"
#   }
# }

# echo 2. ADC
# # https://cloud.google.com/text-to-speech/docs/create-audio-text-command-line
# echodo curl -X POST \
#     -H "Authorization: Bearer $(gcloud auth application-default print-access-token)" \
#     -H "Content-Type: application/json; charset=utf-8" \
#     -d @requests/tts-sample.json \
#     "https://texttospeech.googleapis.com/v1/text:synthesize"


# DECODED_AUDIO=$(_base64_mac_or_linux "t.audio.out") # Mac or Linux should both work!

# _base64_mac_or_linux "t.audio.out" > t.audio.out.base64
# base64 --decode t.audio.out > t.audio.out.dovrebbe.mp3

# #echo "$DECODED_AUDIO" > t.audio.mp3

file t.audio* t.mp3

if file t.mp3 | grep 'MPEG ADTS, layer III' ; then
  green "All good. MP3 created: 't.${SENTENCE:0:50}.mp3'"
else
  rosso "# OOps, some errors, I couldnt create a proper MP3 file. Checke the encoding and the quotes in the input."
  cat $TMP_OUTPUT_FILE
  exit -1
fi

