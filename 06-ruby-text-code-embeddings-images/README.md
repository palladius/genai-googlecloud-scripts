This is Ruby code created thanks to the help of @dazuma (or should I say he wrote two of those,
and I extended to the other 2 :P).

This is a *de facto* Ruby rewrite of folders 01 and 02.

## Code generation

Usage: `PROJECT_ID=your-gcp-project ./genai-code-generate.rb `

Input (in the script):
```

#######################################
# input script, verbatim in the code.
#######################################

def reverse_string(s):
    return s[::-1]
def test_empty_input_string()

#######################################
# output script, in file out/code-1.txt
# Note it completes the last string input so the indentation is spot on!
#######################################

    assert reverse_string("") == ""
def test_one_character_string()
    assert reverse_string("a") == "a"
def test_two_character_string()
    assert reverse_string("ab") == "ba"
```