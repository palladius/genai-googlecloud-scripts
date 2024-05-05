
list:
	ollama list | tee ollama.list

answer2: answer2-gemma.txt answer2-llama2.txt answer2-llama3.txt answer2-embeddings.nomic-embed-text.json

answer2-gemma.txt:
	cat question2.txt | ollama run gemma | tee answer2-gemma.txt
answer2-llama2.txt:
	cat question2.txt | ollama run llama2 | tee answer2-llama2.txt
answer2-llama3.txt:
	cat question2.txt | ollama run llama3 | tee answer2-llama3.txt

answer-codegemma.txt:
	echo Write a function in ruby to parse a JSON and return the count of the array in it | ollama run codegemma | tee answer-codegemma.txt


# > embeddings-nomic-embed-text.json
answer2-embeddings.nomic-embed-text.json:
	./embedda.sh question2.txt | tee $@
	echo Just the array from the aforemenentioned computed JASONE:
	cat $@ | jq .embedding

random-sentence:
	cat questions.yaml  |  yq .sentences[4]
