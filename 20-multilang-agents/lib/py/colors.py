
def cyan(str):
    """Wraps the input string in ANSI escape codes to make it cyan-colored."""
    return f"\033[96m{str}\033[0m"

# def colorize(text, color):
#   """Wraps the input text in ANSI escape codes to colorize it."""
#   color_codes = {
#       "yellow": "\033[93m",
#       "green": "\033[92m",
#       "red": "\033[91m",
#       "purple": "\033[95m",
#       "orange": "\033[38;5;208m",  # ANSI code for a nice orange
#       "gray": "\033[90m",
#       "blue": "\033[94m",
#       # Add more colors as needed!
#   }
#   return f"{color_codes[color]}{text}\033[0m"

def colorize(text, color):
    """Wraps the input text in ANSI escape codes to colorize it.
        Handles invalid color requests gracefully.
    """
    color_codes = {
        "white": '\033[37m', # WRONG"\033[97m",
#         yellow = '\033[33m'
        "yellow": "\033[93m",
#         green = '\033[32m'
        "green": "\033[92m",
#         red = '\033[31m'
        "red": "\033[91m",
        "purple": "\033[95m",
        #  magenta = '\033[35m'
        "magenta": '\033[35m',
        "orange": "\033[38;5;208m", # ricc: echo -en "\033[38;5;208m$*\033[0m\n"
        "gray": "\033[90m",
        "dark_gray": "\033[38;5;240m",  # ANSI code for dark gray
#         blue = '\033[34m'
        "blue": "\033[94m",
        'cyan': '\033[36m', # or 96?!?
        # ... add more colors as needed ...
#         black = '\033[30m'
        'black': '\033[30m',
    }
    try:
        return f"{color_codes[color]}{text}\033[0m"
    except KeyError:
        print(f"⚠️ Invalid color: {color}. Returning plain text.")
        return text  # Return the original text if the color is invalid



def yellow(str):
    return colorize(str, 'yellow')
def white(str):
    return colorize(str, 'white')
def gray(str):
    return colorize(str, 'dark_gray') # i know!
def purple(str):
    return colorize(str, 'purple') # i know!
def green(str):
    return colorize(str, 'green') # i know!
def blue(str):
    return colorize(str, 'blue') # i know!
def orange(str):
    return colorize(str, 'orange') # i know!
def colored_gemini():
    return orange('♊') # i know!

