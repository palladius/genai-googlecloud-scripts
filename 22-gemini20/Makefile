
install:
	echo setup virtualenv and pip install reqs.txt as usual... when done do touch install to silence this

run: install
	python structured-output-wrong.py
	python structured-output-right.py


demo-multimodal: install
	echo Dammi una lista NON ORDINATA dei 12 segni zodiacali. | python multimodal.py
	echo Dimmi i 12 segni zodiacali, o 13 se li sai | python multimodal.py
	echo Spiegami il gioco del DanDan a MTG | python multimodal.py

