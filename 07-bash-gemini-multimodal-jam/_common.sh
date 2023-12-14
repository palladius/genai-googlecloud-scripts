


function _base64_mac_or_linux() {
    echo "This is obsolete, tell me if you need encoding or decoding!" >&2
    echo Use instead: _base64_encode_mac_or_linux "$1" >&2
    echo "OBSOLETIZZIMO"
}

# Encode (used to encode image to give to Gemini)
function _base64_encode_mac_or_linux() {
    IMAGE="$1"
    #data=$(base64 -i "$IMAGE" -o -) # Mac
    #data=$(base64 -w 0 "$IMAGE") # linux
    if [[ $(uname) == "Darwin" ]] ; then
        base64 -i "$IMAGE" -o -
    else
        base64 -w 0 "$IMAGE"
    fi
}

# Decode (used in TTS to decode MP3)
function _base64_decode_mac_or_linux() {
    IMAGE="$1"
    if [[ $(uname) == "Darwin" ]] ; then
        base64 --decode -i "$IMAGE" -o -
    else
        base64 "$IMAGE" --decode
    fi
}



# assumes you have the output in file 't'
function show_errors_and_exit() {
    echo Woops. Some Errors found. See error in t:
    cat t | srossa
    exit 42
}
