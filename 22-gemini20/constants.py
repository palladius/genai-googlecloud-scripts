import os
import json
from colorama import init, Fore, Style


init()  # Initialize colorama

GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
print(f"[constants] {Fore.LIGHTBLACK_EX}DEBUG{Style.RESET_ALL} GEMINI_API_KEY={Fore.RED}{GEMINI_API_KEY}{Style.RESET_ALL} (needs to start with AIza)")

def print_recipe(recipes_json):
    #recipes_json = '''[{"recipe_name": "Chocolate Chip Cookies",...}]'''  # Your JSON string here
    recipes_json = recipes_json.replace('```json', '').replace('```', '').strip()

    # Parse JSON into Python dictionary
    recipes = json.loads(recipes_json)

    # Print each recipe with colors
    for recipe in recipes:
        # Print recipe name in white
        print(f"\n{Style.BRIGHT}{Fore.WHITE}{recipe['recipe_name']}{Style.RESET_ALL}")

        # Print ingredients in yellow
        print(f"{Fore.YELLOW}Ingredients:{Style.RESET_ALL}")
        for ingredient in recipe['ingredients']:
            print(f"{Fore.YELLOW}• {ingredient}{Style.RESET_ALL}")
