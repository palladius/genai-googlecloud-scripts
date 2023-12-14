#!/bin/bash

set -euo pipefail

export CONFIG_NAME=${GCLOUD_CONFIG_NAME:-gemini-tests}
direnv allow
export STD_SA_LOCATION="private/$PROJECT_ID.json"

gcloud config configurations create "$CONFIG_NAME" --activate || \
		gcloud config configurations activate "$CONFIG_NAME"
	gcloud config set project "$PROJECT_ID"
	if [ -f "$STD_SA_LOCATION" ]; then
		echo "Standard SvcAcct key found: DHH would be so proud of me! Authenticating as SA"
		gcloud auth activate-service-account --key-file="$STD_SA_LOCATION"
	# For TTS:
	else
		echo "Standard SvcAcct key NOT found in $STD_SA_LOCATION: logging in as '$ACCOUNT' then."
		gcloud config set account "$ACCOUNT"
		gcloud auth login
	fi
	gcloud auth application-default set-quota-project "$PROJECT_ID"
	gcloud auth application-default login
#	gcloud auth login
	gcloud config set project "$PROJECT_ID"
