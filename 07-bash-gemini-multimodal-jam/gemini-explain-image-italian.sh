#!/bin/bash

# set -euo pipefail

#echodo ./gemini-generic.sh "$1" "Descrivimi cosa vedi in questa immagine e se ci sono c'e' correlazione alcuna con l'Italia come nazione e come cultura italiana"
TTS_LANG='it-IT' echodo ./gemini-generic.sh "$1" "Descrivimi cosa vedi in questa immagine"
