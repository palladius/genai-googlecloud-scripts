#!/bin/bash
ollama create marvin -f ./Modelfile.marvin

echo 'Hi Im Riccardo, how are you?' | ollama run marvin

