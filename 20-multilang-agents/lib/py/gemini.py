
from .openmeteo import *
from .ricc_datetime import *

def call_gemini_api(chat, prompt):
  """Calls the Gemini API with the given prompt.

  Args:
    chat: chat context (added by ricc).
    prompt: The prompt to send to the Gemini API.

  Returns:
    The text response from the Gemini API.
  """

  # Send the prompt to the Gemini API
  response = chat.send_message(prompt)


  # Check if the response contains a function call
  if response.candidates[0].content.parts[0].function_call:
    #print("call_gemini_api(): Function calling")
    # Extract the text from the model response
    function_calling_result = call_a_function(chat, response)
    # Return the final text from the function call
    return { 'ricc_function_call_text' : function_calling_result.text.rstrip() }

  else:
    # print("Regular model call")
    # Return the text from the model response for a regular call
    # Without function calling.
    return { 'ricc_gemini_response': response } #response.text

def call_a_function(chat, response):
    """
    This function parses a response object containing a function call,
    constructs the function call string, executes it using eval,
    and returns the API response or makes another function call if necessary.

    Args:
        response: A response object containing the function call information.

    Returns:
        The API response or the response from another function call (recursive).
    """


    # Extract the function name from the response object
    func_name = response.candidates[0].content.parts[0].function_call.name
    calling_parameters_function = ""


    # Loop through function call arguments and construct the argument string
    for param_name in response.candidates[0].content.parts[0].function_call.args:
      param_value = response.candidates[0].content.parts[0].function_call.args[param_name]
      calling_parameters_function += f"{param_name} = '{param_value}',"

    # Remove the trailing comma from the argument string
    # and build final function call statement
    calling_function_string = f"{func_name}({calling_parameters_function[:-1]})"
    print(calling_function_string)

    # Execute the call to the api within the defined function
    # Christ sake, so dangerous!
    response_api = eval(calling_function_string)
    print(response_api)

    # Return the API response back to Gemini, so it can generate a model response or request another function call
    response = chat.send_message(
        Part.from_function_response(
            name= func_name,
            response={
                "content": response_api,
            },
        ),
    )

    # print(response)
    # Check if the response contains another function call
    if response.candidates[0].content.parts[0].function_call:
      # Make another recursive function call if there's another function call
      response_function = call_a_function(chat, response)
      return response_function
    else:
      # If no more function calls, return the response
      # print("No more API calls")
      return response


#print(get_location_data("Il grande tempio di Atene"))
#print(get_location_data("Athens"))
