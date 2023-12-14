#!/bin/bash

for F in images/*jpg images/*png ; do 
    ANNOTATION_FILE="$F.explain.txt"
    if [ -f "$ANNOTATION_FILE" ] ; then 
        echo File exists, skipping: "$ANNOTATION_FILE" 
    else 
        GENERATE_MP3=true ./gemini-explain-image.sh "$F" | tee "$ANNOTATION_FILE" 
        cp 
    fi
done