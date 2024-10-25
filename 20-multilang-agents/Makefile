
# python installs
install:
	pip install -r requirements.txt

clean-python-cache:
	find . -name __pycache__ | xargs rm -rf

run-whelper:
	PORT=8081 bin/weather-tcp-agent-threaded.py

# GCP/Gemini Vertex initialization
auth:
	gcloud auth application-default login
