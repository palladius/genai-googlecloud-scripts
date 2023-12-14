
# auth:
# 	gcloud config set account ricc@google.com
# 	gcloud auth login
# 	gcloud auth application-default login
# 	gcloud config set project ricc-genai
# 	gcloud auth application-default set-quota-project ricc-genai

setup:
	./01-setup.sh

age-test:
	GENERATE_MP3=true ./gemini-generic.sh images/ricc-family-with-santa.jpg Tell me the age of the 5 people you see, from left to right.

annotate:
	./annotate-all.sh

this-works:
	echo "this works"
	./gemini-explain-image.sh images/image.jpg


this-doesnt-work-yet:
	echo "this doesn't work yet"
	./gemini-explain-image-request-su-file.sh  riccardo\ jogging\ by\ lake.jpeg

compare-two-ricc-pics:
	./gemini-generic-two-pics.sh riccardo\ jogging\ by\ lake.jpeg ricc-presenting-slides_MW_9468_FullRes.jpg

compare-two-geminis:
	./gemini-generic-two-pics.sh images/costellazione\ di\ Gemini.png images/Saga-di-Gemini-Armatura-di-Gemini.jpg

compare-ale-seby:
	./gemini-generic-two-pics.sh images/ale*.jpg
clean:
	rm t .tmp* t.audio* t.*.mp3 t.mp3
clean-all:
	rm images/*.mp3 images/*.explain.txt
	make clean

vertexai-images/sky.jpg:
	gsutil ls "gs://cloud-samples-data/generative-ai/image/"
	gsutil -m cp -r gs://cloud-samples-data/generative-ai/image/* ./vertexai-images/
