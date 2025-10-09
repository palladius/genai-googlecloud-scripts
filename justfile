list:
    just -l


genai-apptemplates-googlecloud:
	git clone https://github.com/rominirani/genai-apptemplates-googlecloud


gemini:
    gemini -c

find-lfs-files PATH='.':
    @echo "Searching for LFS files in '{{PATH}}'..."
    @git lfs ls-files | awk '$3 ~ "^{{PATH}}" {print}'