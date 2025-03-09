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

run: install
	python structured-output-wrong.py
	python structured-output-right.py

demo-multimodal: install
	echo Dammi una lista NON ORDINATA dei 12 segni zodiacali. | python multimodal.py
	echo Dimmi i 12 segni zodiacali, o 13 se li sai | python multimodal.py
	echo Spiegami il gioco del DanDan a MTG | python multimodal.py



image-demo:
	python imagen.py 'A CD cover with elements of Pink Floyd and Genesis titled "Makefile (by Stuart Feldman)".'

packetize-all: packetize-imagegen packetize-asyncchat packetize-veo packetize-grounding packetize-veo

packetize-grounding:
	pyinstaller --onefile --name g2grounding \
				--add-data ".env:." \
				--hidden-import colorama \
				--hidden-import google.generativeai \
				grounding.py
	bin/scopiazza dist/g2grounding gemini20-grounding



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
	pyinstaller --onefile --name g2videogen123 \
				--add-data ".env:." \
				--hidden-import google-cloud-aiplatform \
				--hidden-import google-cloud-storage \
				veo1234.py
	bin/scopiazza dist/g2videogen123 gemini20-veo123


push2gcs:
	gsutil mv *mp4 gs://ricc-genai-prove/gemini20/videos/unlisted/
#	gsutil mv experiments/*mp4 gs://ricc-genai-prove/videos/unlisted/


video-elio:
	python veo1234.py 'Panettone is on the table and everybody is drinking Moscato. Below, a writing appears: "christmas with the yours"'
	python veo1234.py 'A nativity scene with a very beef above a radiator surrounded by funny zombies. Below, a writing appears: "Il bue riscaldante"'
	python veo1234.py 'A fun-loving veal whose hooves are on top of tuna sauce. Below, a writing appears: "vitello dai piedi tonnati"'
	python veo1234.py 'A fun-loving veal whose hooves are  made of balsa wood. Below, a writing appears: "vitello dai piedi di balsa"'

video-from-prompt:
#	python veo1234.py --prompt etc/veo-pizzorni.prompt
	python veo1234.py --prompt etc/veo-saint-seya.prompt

clean:
	rm -rf tmp.* t.* *.spec

url-summarize-test:
	python url-synthetizer.py --url-file etc/summarize-urls-rag.txt
