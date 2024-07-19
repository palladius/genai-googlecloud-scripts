
test:
	nb - - eval "hello"

install:
	bundle install



ollama-test:
	nb cartridges/ollama.yaml - eval Hello

gemini-test:
	nb cartridges/gemini-key.yaml - eval "Hello Key gemini" || echo Failed with Key
	nb cartridges/gemini-vertex.yaml - eval "Hello Vertex Gemini" || echo Failed with Vertex
	echo Sorry. Failed both.

# works
gemini-test-key:
	nb cartridges/gemini-key.yaml - eval "Hello Key gemini"

#broken still
gemini-test-vertex:
	export GOOGLE_REGION=us-east4
	@echo GOOGLE_CREDENTIALS_FILE_PATH=$(GOOGLE_CREDENTIALS_FILE_PATH)
	@echo GOOGLE_REGION=$(GOOGLE_REGION)
	nb cartridges/gemini-vertex.yaml - eval "Hello vertex gemini"

test-functions-gemini:
	nb cartridges/gemini-key.yaml  - eval 'give me a random number'

lint:
	bundle
	rubocop -A
	rspec
