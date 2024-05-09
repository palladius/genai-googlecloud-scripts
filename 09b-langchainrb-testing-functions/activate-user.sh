#!/bin/bash

source .env

set -euo pipefail

#echo gcloud auth activate-service-account --key-file="$SA_KEY_MAC" --project=$PROJECT_ID # SA_KEY2_MAC
#echo gcloud config list

gcloud auth login "$EMAIL_ACCOUNT" --activate --update-adc
gcloud config set project "$PROJECT_ID"
gcloud config list

# ALTRIMENTI

# make auth

