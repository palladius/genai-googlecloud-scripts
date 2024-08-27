
'''functionality around Prompts and RAGazzi.
'''


# def get_prompt_by_id(prompt_id):
#     '''TODO return RAGified prompt for id. eg,

#     * you click on "💻 RAG-time on Sheetless" and you get the Sheetless one.

#     Could use PROMPT_TITLES to know it.

#     Uses `State.input_ricc_prompt`

#     Also called in prompt_id.
#     '''
#     example = 'private/advocacy_taskflow_open_bugs'
#     should_return 'Content of private/advocacy_taskflow_open_bugs.manual.prompt'
#     return f"TODO(ricc): nearly there! Prompt by id={prompt_id}"

import csv
#from datetime import datetime, timedelta
import datetime


def get_manual_prompt(id):
  """
  This function reads a file with the format "{id}.manual.prompt" and returns its content as a string.

  Args:
      id (str): The identifier for the file.

  Returns:
      str: The content of the file.
  """
  filename = f"{id}.manual.prompt"
  try:
    with open(filename, "r") as f:
      content = f.read()
      return content
  except FileNotFoundError:
    print(f"File {filename} not found.")
    return ""




def substitute_prompt(prompt_filename, ldap, rag_csv_file, dump_output_to_file=True):
  """
  This function reads a prompt file, substitutes placeholders, and reads the CSV file content.

  Args:
      prompt_filename (str): Name of the prompt file.
      ldap (str): User's LDAP.
      rag_csv_file (str): Path to the CSV file.
      dump_output_to_file (bool, optional): Whether to dump the formatted output to a file. Defaults to True.

  Returns:
      tuple: A tuple containing the formatted prompt with substituted values and the CSV file content.
  """
  with open(prompt_filename, "r") as f:
    prompt = f.read()

  # Substitute placeholders
  today = datetime.date.today().strftime("%Y-%m-%d")
  prompt = prompt.replace("{ldap}", ldap).replace("{date}", today).replace("{rag_csv_file}", rag_csv_file)

  # Read CSV file content
  with open(rag_csv_file, "r") as csvfile:
    csv_content = csvfile.read()

  # Dump output to file if requested
  if dump_output_to_file:
    output_filename = prompt_filename + ".hydrated.txt"
    with open(output_filename, "w") as output_file:
      output_file.write(prompt)

  return prompt, csv_content
