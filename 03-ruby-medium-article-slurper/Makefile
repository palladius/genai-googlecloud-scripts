

# Two people I was following..
#MEDIUM_USER_ID=edureka ruby main.rb
#MEDIUM_USER_ID=allenchun ruby main.rb

# Authenticate first: gcloud auth application-default login

generate-useful-data: clean-empty-files
	# myself
	MEDIUM_USER_ID=palladiusbonton ruby main.rb
	
	# My advocacy team	
	MEDIUM_USER_ID=pvergadia ruby main.rb
	MEDIUM_USER_ID=iromin ruby main.rb
	MEDIUM_USER_ID=val_deleplace ruby main.rb
	MEDIUM_USER_ID=glaforge ruby main.rb
	MEDIUM_USER_ID=PicardParis ruby main.rb
	MEDIUM_USER_ID=alexismp ruby main.rb
	MEDIUM_USER_ID=wietsevenema ruby main.rb
	MEDIUM_USER_ID=mco-blog ruby main.rb
	# Extended advocacy team
	MEDIUM_USER_ID=thagomizer ruby main.rb
	
	
	# My other Google friends who might blog about 
	MEDIUM_USER_ID=ch.stanger ruby main.rb 

	# Popular people
	MEDIUM_USER_ID=dhh ruby main.rb

	# Google friends - GDEs/ICs
	MEDIUM_USER_ID=gianni.forlastro ruby main.rb

regenerate-ricc:
	rm inputs/medium-latest-articles.palladiusbonton.txt || echo ok if it doesnt exist.
	MEDIUM_USER_ID=palladiusbonton ruby main.rb
	
clean-empty-files:
	find inputs/ outputs/ -size 0 -print -delete || echo No file found but still ok.
	find inputs/ outputs/ -size 1 -print -delete || echo No file found but still ok.

clean:
	rm inputs/* outputs/*