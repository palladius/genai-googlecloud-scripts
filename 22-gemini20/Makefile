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

packetize-all: packetize-imagegen packetize-asyncchat packetize-veo packetize-grounding packetize-veo123

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


# fake hellow
packetize-veo:
	pyinstaller --onefile --name g2videogen \
				--add-data ".env:." \
				--hidden-import colorama \
				veo.py
	bin/scopiazza dist/g2videogen gemini20-veo

# TAken from REAL curl example into python :)
packetize-veo123:
	pyinstaller --onefile --name g2videogen123 \
				--add-data ".env:." \
				--hidden-import google-cloud-aiplatform \
				veo1234.py
#				experiments/veo123.py
	bin/scopiazza dist/g2videogen123 gemini20-veo123
