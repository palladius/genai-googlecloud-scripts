

# Two people I was following..
#MEDIUM_USER_ID=edureka ruby main.rb
#MEDIUM_USER_ID=allenchun ruby main.rb

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
	
	# Popular people
	MEDIUM_USER_ID=dhh ruby main.rb
	
	
clean-empty-files:
	find inputs/ outputs/ -size 0 -print -delete || echo No file found but still ok.
	find inputs/ outputs/ -size 1 -print -delete || echo No file found but still ok.

clean:
	rm inputs/* outputs/*