#!/bin/bash
source .env

# Usage: gcloud auth activate-service-account [ACCOUNT] --key-file=KEY_FILE [optional flags]

#echo gcloud auth activate-service-account "$EMAIL_ACCOUNT" --key-file="$SA_KEY2_MAC"
echodo gcloud auth activate-service-account --key-file="$SA_KEY_MAC" --project=$PROJECT_ID # SA_KEY2_MAC
echodo gcloud config list
