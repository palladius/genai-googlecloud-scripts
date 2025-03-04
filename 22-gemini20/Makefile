
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
	python image-generation.py

packetize-grounding:
	pyinstaller --onefile --name grounding2better \
				--add-data ".env:." \
				--hidden-import colorama \
				--hidden-import google.generativeai \
				grounding.py
	cp dist/grounding2better $(GIC)/bin/gemini20-grounding

# markdown
# beautifulsoup4

packetize-all: packetize-imagegen packetize-asyncchat

packetize-imagegen:
	pyinstaller --onefile --name g2imagegen \
				--add-data ".env:." \
				--hidden-import colorama \
				--hidden-import google.generativeai \
				image-generation.py
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

