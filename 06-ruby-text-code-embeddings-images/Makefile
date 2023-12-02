clean:
	rm out/*.txt

ricc-test-embeddings:
	make clean || echo Already cleaned up
	PROJECT_ID=ricc-genai ./genai-embeddings-generate.rb
	./genai-embeddings-crunch.rb

ricc-login:
	echo Ensures login for Riccardo. Feel free to tweak for your own variables.
	../05-ruby-embedding-matrix/activate.sh
