

summarize-zugersee:
	echo This takes a swiss page with the ZugerSee water temperature and summarizes it.
#	./curlit.rb https://www.boot24.ch/chde/service/temperaturen/zugersee/ | ollama run gemma Please summarize succintly this site and tell me the current water temperature of Zuger See if you can see it # as of today `date`
	./curlit.rb https://www.boot24.ch/chde/service/temperaturen/zugersee/ | ollama run gemma Tell me the current water temperature of Zuger See

rag-example-complex:
	./wasser-temperatur-rag.rb

summarize-eu-elections:
	./curlit.rb https://www.ilfattoquotidiano.it/| ollama run gemma 'Come vanno le elezioni europee?'
	./curlit.rb https://www.ilfattoquotidiano.it/| ollama run llama3 'Come vanno le elezioni europee?'
	./curlit.rb https://www.youtrend.it/| ollama run gemma 'Come vanno le elezioni europee?'

	./curlit.rb https://www.repubblica.it/ | ollama run gemma '\n---\n\n Raccontami le ultime notizie: '

lint:
#rubocop -A
	rubocop --autocorrect-all
