list:
    just -l


genai-apptemplates-googlecloud:
	git clone https://github.com/rominirani/genai-apptemplates-googlecloud


gemini:
    gemini -c

find-lfs-files PATH='.':
    @echo "Searching for LFS files in '{{PATH}}'..."
    @git lfs ls-files | awk '$3 ~ "^{{PATH}}" {print}'

# Pulisce i file generati e i pacchetti scaricati
clean:
    @echo "🧹 Pulizia degli script GenAI..."
    rm -rf node_modules
    rm -rf .venv
    find . -type d -name "__pycache__" -exec rm -rf {} +
    @echo "✨ Pulizia completata!"