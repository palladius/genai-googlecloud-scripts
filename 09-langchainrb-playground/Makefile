
lint:
	rubocop --autocorrect .

hello-vertex:
	GOOGLE_VERTEX_AI_PROJECT_ID='ricc-genai' ./vertex-hello.rb

auth:
	# from sakura : https://github.com/palladius/sakura
	# auto_import_config.py
	gaic
	gcloud config configurations activate pbt-genai
	gcloud auth login
	gcloud auth application-default login
#	gcloud auth application-default print-access-token


# Gemini tests from Baptista
hello-gemini:
	./gemini-baptista-hello.rb
hello-gemini-ultra:
	./gemini-baptista-hello-ultra.rb
