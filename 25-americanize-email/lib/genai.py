# -*- coding: utf-8 -*-
"""
GenAI Interaction Module - Let's talk to the big brain using google-genai! 🧠
Handles communication with the Gemini API via API Key.
"""

import sys
import os
import time
import traceback # For detailed error logging
from typing import Optional, Dict, Any
#import .colors as colors # import red, yellow, grey, cyan
#from .colors import red, yellow, grey, cyan
#import .colors as colors

# Attempt to import google-genai library
try:
    from google import genai
    from google.genai import types
    #from google.genai import safety_settings # Keep top-level import
    from google.genai import errors as google_genai_errors
    _GENAI_AVAILABLE = True
except ImportError as e:
    print(f"\n[ERROR] Failed to import 'google-genai' library or its dependencies.", file=sys.stderr)
    print(f"        Please ensure it's installed: pip install google-genai", file=sys.stderr)
    print(f"        Original error: {e}", file=sys.stderr)
    # Print traceback here too, as this is a critical failure point
    print(f"\n--- Import Traceback ---", file=sys.stderr)
    traceback.print_exc(file=sys.stderr)
    print(f"--- End Import Traceback ---", file=sys.stderr)
    _GENAI_AVAILABLE = False

# Import dotenv to load environment variables like GOOGLE_API_KEY
try:
    from dotenv import load_dotenv
    _DOTENV_AVAILABLE = True
except ImportError:
    _DOTENV_AVAILABLE = False

try:
    # Assume running from top level where llm-americanize.py is
    if __package__ is None or __package__ == '':
        # Running as script or top-level module
        from colors import red, yellow, grey, cyan
    else:
        # Running as part of the 'lib' package
        from .colors import red, yellow, grey, cyan
except ImportError:
    class MockColors:
        def __getattr__(self, name):
            return lambda x: x
    colors = MockColors()
    red = yellow = grey = cyan = red

# Default configuration values
DEFAULT_MODEL_NAME = "gemini-1.5-flash-001"
DEFAULT_TEMPERATURE = 0.7
DEFAULT_MAX_OUTPUT_TOKENS = 2048
DEFAULT_TOP_P = 0.95
DEFAULT_TOP_K = 40

# Define safety settings mapping - moved inside __init__ where 'safety_settings' alias is guaranteed
# DEFAULT_SAFETY_SETTINGS = { ... }


class GeminiClient:
    """Wraps the google-genai client for Gemini API calls."""

    def __init__(self, debug: bool = False):
        """
        Initializes the GeminiClient using API Key authentication.

        Args:
            debug: Enable debug printing.

        Raises:
            ImportError: If 'google-genai' library is not installed.
            RuntimeError: If the GOOGLE_API_KEY environment variable is not set or client init fails.
        """
        if not _GENAI_AVAILABLE:
            # Error message and traceback printed during import failure
            raise ImportError("Required 'google-genai' library failed to import. Cannot proceed.")

        self.debug = debug
        self._client: Optional[genai.Client] = None
        #self.safety_settings: Optional[Dict[Any, Any]] = None # Initialize safety settings field

        # Define safety settings mapping here, now that imports are confirmed successful
        # Using the 'safety_settings' alias directly from the import
        # self.safety_settings = {
        #     safety_settings.HarmCategory.HARM_CATEGORY_HARASSMENT: safety_settings.HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        #     safety_settings.HarmCategory.HARM_CATEGORY_HATE_SPEECH: safety_settings.HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        #     safety_settings.HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT: safety_settings.HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        #     safety_settings.HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT: safety_settings.HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        # }
        # if self.debug:
        #     print(grey(f"🔒 Default Safety Settings configured: {self.safety_settings}"), file=sys.stderr)

        # --- Environment Variable Loading ---
        if not _DOTENV_AVAILABLE:
             print(yellow("⚠️ Warning: 'python-dotenv' not installed. Cannot automatically load '.env' file."), file=sys.stderr)
             print(yellow("   Ensure GOOGLE_API_KEY is set in your environment."), file=sys.stderr)
        else:
            env_path = '.env'
            if os.path.exists(env_path):
                 if debug:
                    print(grey(f"🔑 Loading environment variables from '{env_path}'..."), file=sys.stderr)
                 load_dotenv(dotenv_path=env_path, override=False)
            elif debug:
                 print(grey(f"🔑 '.env' file not found, relying on existing environment variables."), file=sys.stderr)

        # --- API Key Check ---
        api_key = os.environ.get("GOOGLE_API_KEY")
        if not api_key:
            print(red("\n❗ Critical Error: GOOGLE_API_KEY environment variable not set."), file=sys.stderr)
            print(yellow("   Please set the GOOGLE_API_KEY environment variable."), file=sys.stderr)
            print(yellow("   You can create one at https://aistudio.google.com/app/apikey"), file=sys.stderr)
            print(yellow("   Set it directly or place it in a '.env' file: GOOGLE_API_KEY=AIzaSy..."), file=sys.stderr)
            raise RuntimeError("Missing GOOGLE_API_KEY environment variable.")

        # --- Client Initialization ---
        try:
            if self.debug:
                print(grey("🔧 Initializing google-genai Client..."), file=sys.stderr)
                masked_key = api_key[:5] + "..." + api_key[-4:] if len(api_key) > 9 else api_key
                print(grey(f"   (Using API Key starting with {masked_key})"), file=sys.stderr)

            # Initialize client - uses GOOGLE_API_KEY from env by default
            self._client = genai.Client()

            if self.debug:
                print(grey("✅ google-genai Client initialized successfully."), file=sys.stderr)

        except Exception as e:
            print(red(f"❗ Failed to initialize google-genai Client: {e}"), file=sys.stderr)
            print(grey("\n--- Client Init Traceback ---"), file=sys.stderr)
            traceback.print_exc(file=sys.stderr) # Print traceback for init errors too
            print(grey("--- End Client Init Traceback ---"), file=sys.stderr)
            raise RuntimeError(f"Failed to initialize google-genai Client") from e

    def process_text(
        self,
        system_prompt: str,
        input_text: str,
        model_name: str = DEFAULT_MODEL_NAME,
        temperature: float = DEFAULT_TEMPERATURE,
        max_output_tokens: int = DEFAULT_MAX_OUTPUT_TOKENS,
        top_p: float = DEFAULT_TOP_P,
        top_k: int = DEFAULT_TOP_K
    ) -> str:
        """
        Sends the input text and system prompt to the Gemini model for processing.
        (Args/Returns/Raises documentation unchanged from previous version)
        """
        if self._client is None:
            raise RuntimeError("GenAI client is not initialized.")

        # Ensure model name has the "models/" prefix required by google-genai
        if not model_name.startswith("models/"):
            model_path = f"models/{model_name}"
        else:
            model_path = model_name

        if self.debug:
            print(grey("\n--- Preparing Call to Gemini API ---"), file=sys.stderr)
            print(grey(f"Model: {model_path}"), file=sys.stderr)
            print(grey(f"System Prompt Snippet:\n'''\n{system_prompt[:300]}...\n'''"), file=sys.stderr)
            print(grey(f"Input Text Snippet:\n'''\n{input_text[:300]}...\n'''"), file=sys.stderr)
            print(grey(f"Config: Temp={temperature}, MaxTokens={max_output_tokens}, TopP={top_p}, TopK={top_k}"), file=sys.stderr)
            print(grey("------------------------------------"), file=sys.stderr)

        generation_config = types.GenerationConfig(
            temperature=temperature,
            max_output_tokens=max_output_tokens,
            top_p=top_p,
            top_k=top_k,
        )
        contents = [input_text]

        try:
            print(cyan(f"✨ Calling Gemini ({model_path})... Thinking... 🤔"), file=sys.stderr)
            start_time = time.time()

            response = self._client.models.generate_content(
                model=model_path,
                contents=contents,
                #generation_config=generation_config,
                #safety_settings=self.safety_settings, # Use safety settings from init
                #system_instruction=system_prompt if system_prompt.strip() else None
                config=types.GenerateContentConfig(
                    system_instruction=system_prompt,
                    #max_output_tokens=3,
                    temperature=0.3,
                ),
            )

            duration = time.time() - start_time
            if self.debug:
                print(grey(f"✅ API Response received in {duration:.2f}s."), file=sys.stderr)

            try:
                result_text = response.text
                if self.debug:
                    # Check finish reason if available and debug is on
                    finish_reason_str = "N/A"
                    if response.candidates:
                         finish_reason = getattr(response.candidates[0], 'finish_reason', None)
                         if finish_reason:
                              finish_reason_str = finish_reason.name
                    print(grey(f"✅ Extracted Text Length: {len(result_text)} chars. Finish Reason: {finish_reason_str}"), file=sys.stderr)
                    # Also print safety ratings if available
                    if response.prompt_feedback:
                         print(grey(f"   Prompt Feedback: Block={response.prompt_feedback.block_reason}, Safety={response.prompt_feedback.safety_ratings}"), file=sys.stderr)
                    elif response.candidates and response.candidates[0].safety_ratings:
                         print(grey(f"   Candidate Safety Ratings: {response.candidates[0].safety_ratings}"), file=sys.stderr)

                return result_text

            except ValueError as e:
                # Handle cases where response.text access fails (e.g., blocked response)
                print(red(f"❗ Error accessing response text: {e}"), file=sys.stderr)
                block_reason_str = "Unknown"
                finish_reason_str = "Unknown"
                safety_ratings_str = "Unknown"
                try:
                    # Try extracting feedback info for better error message
                    if response.prompt_feedback:
                        block_reason_str = response.prompt_feedback.block_reason.name if response.prompt_feedback.block_reason else "None"
                        safety_ratings_str = str(response.prompt_feedback.safety_ratings) if response.prompt_feedback.safety_ratings else "N/A"
                        print(yellow(f"   Prompt Feedback: Block={block_reason_str}, Safety={safety_ratings_str}"), file=sys.stderr)
                    elif response.candidates:
                         candidate = response.candidates[0]
                         finish_reason_str = candidate.finish_reason.name if candidate.finish_reason else "N/A"
                         safety_ratings_str = str(candidate.safety_ratings) if candidate.safety_ratings else "N/A"
                         print(yellow(f"   Candidate Finish Reason: {finish_reason_str}, Safety: {safety_ratings_str}"), file=sys.stderr)
                except Exception as inner_e:
                     if self.debug: print(grey(f"   Could not extract detailed feedback: {inner_e}"), file=sys.stderr)

                raise RuntimeError(f"Content generation failed or was blocked. Reason: {block_reason_str}/{finish_reason_str}. Safety: {safety_ratings_str}") from e

            except Exception as e:
                 print(red(f"❗ Unexpected error processing response: {e}"), file=sys.stderr)
                 # Print traceback for unexpected response processing errors
                 print(grey("\n--- Response Processing Traceback ---"), file=sys.stderr)
                 traceback.print_exc(file=sys.stderr)
                 print(grey("--- End Response Processing Traceback ---"), file=sys.stderr)
                 raise RuntimeError("Unexpected error processing LLM response.") from e

        # --- Handle API Errors ---
        except (
#            google_genai_errors.PermissionDenied,
#            google_genai_errors.ResourceExhausted,
#            google_genai_errors.InvalidArgument,
#            google_genai_errors.NotFound,
#            google_genai_errors.InternalServerError,
            google_genai_errors.APIError
        ) as e:
            error_type = type(e).__name__
            print(red(f"\n❗ Gemini API Error ({error_type}): {e}"), file=sys.stderr)
            # Provide specific hints based on error type
            if isinstance(e, google_genai_errors.PermissionDenied):
                print(yellow("   Suggestion: Check your GOOGLE_API_KEY validity and ensure it's enabled."))
            elif isinstance(e, google_genai_errors.ResourceExhausted):
                print(yellow("   Suggestion: Check API quotas (e.g., requests per minute). Try again later."))
            elif isinstance(e, google_genai_errors.InvalidArgument):
                 print(yellow(f"   Suggestion: Verify model name ('{model_path}') and generation parameters."))
            elif isinstance(e, google_genai_errors.NotFound):
                 print(yellow(f"   Suggestion: Ensure model name ('{model_path}') is correct and available."))
            elif isinstance(e, google_genai_errors.InternalServerError):
                 print(yellow(f"   Suggestion: Temporary Google API issue? Try again later."))

            # Print traceback for API errors if debugging
            if self.debug:
                 print(grey("\n--- API Error Traceback ---"), file=sys.stderr)
                 traceback.print_exc(file=sys.stderr)
                 print(grey("--- End API Error Traceback ---"), file=sys.stderr)
            raise RuntimeError(f"Gemini API Error ({error_type})") from e # Re-raise wrapped error

        except Exception as e:
             print(red(f"\n❗ An unexpected error occurred during the Gemini API call: {type(e).__name__} - {e}"), file=sys.stderr)
             # Print traceback for truly unexpected errors during the call
             print(grey("\n--- Unexpected API Call Traceback ---"), file=sys.stderr)
             traceback.print_exc(file=sys.stderr)
             print(grey("--- End Unexpected API Call Traceback ---"), file=sys.stderr)
             raise RuntimeError("Unexpected GenAI Error") from e

