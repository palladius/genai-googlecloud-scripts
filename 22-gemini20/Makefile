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

packetize-grounding:
	pyinstaller --onefile --name grounding2better \
				--add-data ".env:." \
				--hidden-import colorama \
				--hidden-import google.generativeai \
				grounding.py
	cp dist/grounding2better $(GIC)/bin/arch/`arch`/gemini20-grounding
	cp dist/grounding2better bin/gemini20-grounding

# markdown
# beautifulsoup4

packetize-all: packetize-imagegen packetize-asyncchat packetize-veo

packetize-imagegen:
	pyinstaller --onefile --name g2imagegen \
				--add-data ".env:." \
				--hidden-import colorama \
				--hidden-import google.generativeai \
				imagen.py
#manhouse:	cp dist/g2imagegen $GIC/bin/gemini20-imagen
	cp dist/g2imagegen $(GIC)/bin/gemini20-imagen

packetize-asyncchat:
	pyinstaller --onefile --name g2asyncchat \
				--add-data ".env:." \
				--hidden-import colorama \
				--hidden-import google.generativeai \
				multimodal.py
#manhouse:	cp dist/g2multimodal $GIC/bin/gemini20-imagen
	cp dist/g2asyncchat $(GIC)/bin/gemini20-chat



packetize-veo:
	pyinstaller --onefile --name g2videogen \
				--add-data ".env:." \
				--hidden-import colorama \
				veo.py
	cp dist/g2videogen $(GIC)/bin/gemini20-veo-on-`uname`
	cp dist/g2videogen $(GIC)/bin/arch/`arch`/gemini20-veo
	cp dist/g2videogen bin/gemini20-veo
