
'''Utilities, motly built with Gemini..'''


def read_file_to_string(filename):
  """Reads the entire content of a file into a string.

  Args:
      filename: The name of the file to read.

  Returns:
      The content of the file as a string, or None if the file doesn't exist.
  """
  try:
    with open(filename, 'r') as file:
      return file.read()
  except FileNotFoundError:
    print(f"Error: File '{filename}' not found.")
    return None



