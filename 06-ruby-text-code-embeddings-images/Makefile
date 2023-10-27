clean:
	rm out/*.txt

ricc-test-embeddings:
	make clean || echo Already cleaned up
	PROJECT_ID=ricc-genai ./genai-embeddings-generate.rb
	./genai-embeddings-crunch.rb 