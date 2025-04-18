UNAME := $(shell uname)

# /Users/ricc/git/gic/bin/arch

# ifeq ($(UNAME), Darwin)
#     # macOS
#     GIC_BIN := $(HOME)/Library/bin
# else ifeq ($(UNAME), Linux)
#     # Linux
#     GIC_BIN := $(HOME)/.local/bin
# else
#     # Windows or other
#     $(error Unsupported operating system: $(UNAME))
# endif

install:
	echo setup virtualenv and pip install reqs.txt as usual... when done do touch install to silence this..
	pip install --upgrade -r requirements.txt

run: install
	python structured-output-wrong.py
	python structured-output-right.py

app:
	pip install -r requirements-streamlit.txt
	streamlit run app.py

demo-multimodal: install
	echo Dammi una lista NON ORDINATA dei 12 segni zodiacali. | python multimodal.py
	echo Dimmi i 12 segni zodiacali, o 13 se li sai | python multimodal.py
	echo Spiegami il gioco del DanDan a MTG | python multimodal.py



image-demo:
	python imagen.py 'A CD cover with elements of Pink Floyd and Genesis titled "Makefile (by Stuart Feldman)".'

packetize-all: packetize-imagegen packetize-asyncchat packetize-veo packetize-grounding packetize-veo packetize-url-summarizer packetize-story

packetize-grounding:
	pyinstaller --onefile --name g2grounding \
				--add-data ".env:." \
				--hidden-import colorama \
				--hidden-import google.generativeai \
				grounding.py
	bin/scopiazza dist/g2grounding gemini20-grounding


# TODO(): use dockerfile
packetize-imagegen:
	pyinstaller --onefile --name g2imagegen \
				--add-data ".env:." \
				--hidden-import colorama \
				--hidden-import pillow \
				--hidden-import google.generativeai \
				imagen.py
	bin/scopiazza dist/g2imagegen gemini20-imagen

packetize-asyncchat:
	pyinstaller --onefile --name g2asyncchat \
				--add-data ".env:." \
				--hidden-import colorama \
				--hidden-import google.generativeai \
				chat-multimodal.py
	bin/scopiazza dist/g2asyncchat gemini20-chat


# TAken from REAL curl example into python :)
packetize-veo:
	pyinstaller --onefile --name g2videogen \
				--add-data ".env:." \
				--hidden-import google-cloud-aiplatform \
				--hidden-import google-cloud-storage \
				veo.py
	bin/scopiazza dist/g2videogen gemini20-veo


packetize-url-summarizer:
	pyinstaller --onefile --name g2urlsynth \
				--add-data ".env:." \
				--hidden-import google-cloud-aiplatform \
				url-synthetizer.py
	bin/scopiazza dist/g2urlsynth gemini20-urlsynth


packetize-story:
	pyinstaller --onefile --name g2story \
				--add-data ".env:." \
				story.py
	bin/scopiazza dist/g2story gemini20-story



push2gcs:
	gsutil mv *mp4 gs://ricc-genai-prove/gemini20/videos/unlisted/
#	gsutil mv experiments/*mp4 gs://ricc-genai-prove/videos/unlisted/


video-elio:
	python veo.py 'Panettone is on the table and everybody is drinking Moscato. Below, a writing appears: "christmas with the yours"'
	python veo.py 'A nativity scene with a very beef above a radiator surrounded by funny zombies. Below, a writing appears: "Il bue riscaldante"'
	python veo.py 'A fun-loving veal whose hooves are on top of tuna sauce. Below, a writing appears: "vitello dai piedi tonnati"'
	python veo.py 'A fun-loving veal whose hooves are  made of balsa wood. Below, a writing appears: "vitello dai piedi di balsa"'

video-from-prompt:
	python veo.py --prompt etc/veo-saint-seya.prompt
	python veo.py --promptfile etc/videos/php-amarcord.prompt

clean:
	rm -rf tmp.* t.* *.spec
	mv video-*.mp4 ~/Videos/veo-unsorted/

url-summarize-test:
	python url-synthetizer.py --url-file etc/summarize-urls-rag.txt


test-classification:
	echo Create a Gioconda in style of Van Gogh | python classificator.py  -
	echo A vscode with PHP code shrinks and becomes a rocket which gets launched into space | python classificator.py  -
	echo 'What is your name?' | python classificator.py  -
	echo "A cat playing the piano in a jazz club, cinematic lighting" | python classificator.py -
	echo "Write an iterative fibonacci function in Rust" | python classificator.py -
	echo "Write an iterative fibonacci function in Rust" | python classificator.py -c etc/classification/video-image-text-classification.prompt -


# TEST
video-test-operation:
	python veo.py -o projects/veo-testing/locations/us-central1/publishers/google/models/veo-2.0-generate-001/operations/c1ba0947-077c-4e17-a897-8308f639e178 --promptfile etc/veo-saint-seya.prompt

video-test-from-image:
#	python veo.py -i etc/images/ricc-pescara.jpg person gets wing and flies on top of Milan Piazza Duomo and circulates around it on a sunny day.
	python veo.py -i etc/images/ricc-pescara.jpg Person grow wings and flies on top of Milan Piazza Duomo and circulates around it on a sunny day. then he puts on a Google hat, sunglasses and smiles at the camera. Fades out.


# story-test-cli:
# 	python story.py Story of Pollicino in italian with images.
story-test-shrek-milan:
	python story.py --prompt etc/stories/shrek-milan.prompt
story-test-turtle:
	python story.py --prompt etc/stories/turtle-original.prompt
story-test-istanbul:
	python story.py -p etc/stories/puffin-istanbul.prompt


history.json: fix-history.json

fix-history.json:
	echo tODO remove non-local stuff like streamlit/blah/blah in paths.
