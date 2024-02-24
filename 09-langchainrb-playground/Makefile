
lint:
	rubocop --autocorrect .

hello-vertex:
	GOOGLE_VERTEX_AI_PROJECT_ID='ricc-genai' ./vertex-hello.rb

auth:
	# from sakura : https://github.com/palladius/sakura
	auto_import_config.py
	gcloud config configurations activate pbt-genai
	gcloud auth login
