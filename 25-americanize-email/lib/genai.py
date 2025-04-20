# -*- coding: utf-8 -*-
"""
GenAI Interaction Module - Let's talk to the big brain using google-genai! 🧠
Handles communication with the Gemini API via API Key.
"""

import sys
import os
import time
from typing import Optional

# Attempt to import google-genai library
try:
    from google import genai
    from google.genai import types
    from google.genai import safety_settings as safety
    from google.genai import errors as google_genai_errors
    _GENAI_AVAILABLE = True
except ImportError:
    _GENAI_AVAILABLE = False

# Import dotenv to load environment variables like GOOGLE_API_KEY
try:
    from dotenv import load_dotenv
    _DOTENV_AVAILABLE = True
except ImportError:
    _DOTENV_AVAILABLE = False

try:
    from lib import colors
except ImportError:
    class MockColors:
        def __getattr__(self, name):
            return lambda x: x
    colors = MockColors()


# Default configuration values
DEFAULT_MODEL_NAME = "gemini-1.5-flash-001" # Or "models/gemini-1.5-flash-001"
DEFAULT_TEMPERATURE = 0.7
DEFAULT_MAX_OUTPUT_TOKENS = 2048
DEFAULT_TOP_P = 0.95
DEFAULT_TOP_K = 40
# Default safety settings (block medium+ for most categories)
DEFAULT_SAFETY_SETTINGS = {
    safety.HarmCategory.HARM_CATEGORY_HARASSMENT: safety.HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    safety.HarmCategory.HARM_CATEGORY_HATE_SPEECH: safety.HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    safety.HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT: safety.HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    safety.HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT: safety.HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
}

class GeminiClient:
    """Wraps the google-genai client for Gemini API calls."""

    def __init__(self, debug: bool = False):
        """
        Initializes the GeminiClient using API Key authentication.

        Args:
            debug: Enable debug printing.

        Raises:
            ImportError: If 'google-genai' or 'python-dotenv' library is not installed.
            RuntimeError: If the GOOGLE_API_KEY environment variable is not set or client init fails.
        """
        if not _GENAI_AVAILABLE:
            raise ImportError("The 'google-genai' library is required. Please install it (`pip install google-genai`).")
        if not _DOTENV_AVAILABLE:
             print(colors.yellow("⚠️ Warning: 'python-dotenv' not installed. Cannot automatically load '.env' file."), file=sys.stderr)
             print(colors.yellow("   Ensure GOOGLE_API_KEY is set in your environment."), file=sys.stderr)
             # Continue, maybe the key is set directly in the environment
        else:
            # Load .env file if it exists, this will not override existing env vars
            env_path = '.env'
            if os.path.exists(env_path):
                 if debug:
                    print(colors.grey(f"🔑 Loading environment variables from '{env_path}'..."), file=sys.stderr)
                 load_dotenv(dotenv_path=env_path, override=False)
            elif debug:
                 print(colors.grey(f"🔑 '.env' file not found, relying on existing environment variables."), file=sys.stderr)

        self.debug = debug
        self._client: Optional[genai.Client] = None

        # Check for API key after attempting to load .env
        api_key = os.environ.get("GOOGLE_API_KEY")
        if not api_key:
            print(colors.red("\n❗ Critical Error: GOOGLE_API_KEY environment variable not set."), file=sys.stderr)
            print(colors.yellow("   Please set the GOOGLE_API_KEY environment variable."), file=sys.stderr)
            print(colors.yellow("   You can create one at https://aistudio.google.com/app/apikey"), file=sys.stderr)
            print(colors.yellow("   You can set it directly or place it in a '.env' file in the script's directory:"), file=sys.stderr)
            print(colors.yellow("   Example .env file content:"), file=sys.stderr)
            print(colors.yellow("   GOOGLE_API_KEY=AIzaSy..."), file=sys.stderr)
            raise RuntimeError("Missing GOOGLE_API_KEY environment variable.")

        try:
            if self.debug:
                print(colors.grey("🔧 Initializing google-genai Client..."), file=sys.stderr)
                # Optionally mask part of the key in debug logs if needed
                masked_key = api_key[:5] + "..." + api_key[-4:] if len(api_key) > 9 else api_key
                print(colors.grey(f"   (Using API Key starting with {masked_key})"), file=sys.stderr)

            # Initialize client - it uses GOOGLE_API_KEY from env by default
            self._client = genai.Client()

            # Optional: Make a lightweight call to verify connectivity/key validity?
            # E.g., list models, but that might be too slow for init.
            # Let's rely on the first generate_content call to fail if key is bad.
            if self.debug:
                print(colors.grey("✅ google-genai Client initialized successfully."), file=sys.stderr)

        except Exception as e:
            print(colors.red(f"❗ Failed to initialize google-genai Client: {e}"), file=sys.stderr)
            # Provide specific hints if possible, e.g., check network, API key format?
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

        Args:
            system_prompt: The system instructions for the model (from the prompt file).
            input_text: The text to be processed (e.g., the email body).
            model_name: The name or path of the Gemini model to use (e.g., 'gemini-1.5-flash-001').
            temperature: Controls randomness (0.0-1.0).
            max_output_tokens: Maximum number of tokens in the response.
            top_p: Nucleus sampling parameter.
            top_k: Top-k sampling parameter.

        Returns:
            The processed text returned by the model.

        Raises:
            RuntimeError: If the API call fails, is blocked, or returns no valid text.
        """
        if self._client is None:
             # This should not happen if __init__ succeeded, but safeguard anyway
             raise RuntimeError("GenAI client is not initialized.")

        # Ensure model name doesn't have the "models/" prefix if user provides it like that
        if not model_name.startswith("models/"):
            model_path = f"models/{model_name}"
        else:
            model_path = model_name # Assume user provided full path

        if self.debug:
            print(colors.grey("\n--- Preparing Call to Gemini API ---"), file=sys.stderr)
            print(colors.grey(f"Model: {model_path}"), file=sys.stderr)
            print(colors.grey(f"System Prompt Snippet:\n'''\n{system_prompt[:300]}...\n'''"), file=sys.stderr)
            print(colors.grey(f"Input Text Snippet:\n'''\n{input_text[:300]}...\n'''"), file=sys.stderr)
            print(colors.grey(f"Config: Temp={temperature}, MaxTokens={max_output_tokens}, TopP={top_p}, TopK={top_k}"), file=sys.stderr)
            print(colors.grey("------------------------------------"), file=sys.stderr)

        # Prepare the generation configuration
        generation_config = types.GenerationConfig(
            temperature=temperature,
            max_output_tokens=max_output_tokens,
            top_p=top_p,
            top_k=top_k,
            # candidate_count=1 # Default is 1
        )

        # Prepare the contents - use the input_text directly as the user's message
        contents = [input_text] # Simple string content for user role

        try:
            print(colors.cyan(f"✨ Calling Gemini ({model_path})... Be patient, magic takes time... ✨"), file=sys.stderr)
            start_time = time.time()

            response = self._client.models.generate_content(
                model=model_path,
                contents=contents,
                generation_config=generation_config,
                safety_settings=DEFAULT_SAFETY_SETTINGS,
                system_instruction=system_prompt if system_prompt.strip() else None # Pass system prompt here
            )

            duration = time.time() - start_time
            if self.debug:
                print(colors.grey(f"✅ API Response received in {duration:.2f}s."), file=sys.stderr)
                # print(colors.grey(f"Raw response type: {type(response)}"), file=sys.stderr) # Less useful now

            # --- Process Response ---
            # 1. Check for immediate errors indicated by lack of text and prompt feedback
            try:
                # Accessing response.text should be the primary method
                result_text = response.text
                if self.debug:
                    print(colors.grey(f"✅ Extracted Text Length: {len(result_text)} chars."), file=sys.stderr)
                return result_text

            except ValueError as e:
                # google-genai raises ValueError if response access fails (e.g., blocked)
                print(colors.red(f"❗ Error accessing response text: {e}"), file=sys.stderr)
                # Try to get more info from prompt_feedback or candidates
                finish_reason = "Unknown"
                safety_ratings = "Unknown"
                block_reason = "Unknown"
                try:
                    if response.prompt_feedback:
                        block_reason = response.prompt_feedback.block_reason
                        safety_ratings = response.prompt_feedback.safety_ratings
                        print(colors.yellow(f"   Prompt Feedback Block Reason: {block_reason}"), file=sys.stderr)
                        print(colors.yellow(f"   Safety Ratings: {safety_ratings}"), file=sys.stderr)
                    elif response.candidates and response.candidates[0].finish_reason:
                        finish_reason = response.candidates[0].finish_reason.name
                        safety_ratings = response.candidates[0].safety_ratings
                        print(colors.yellow(f"   Candidate Finish Reason: {finish_reason}"), file=sys.stderr)
                        print(colors.yellow(f"   Safety Ratings: {safety_ratings}"), file=sys.stderr)

                except Exception as inner_e:
                     if self.debug:
                         print(colors.grey(f"   Could not extract detailed feedback: {inner_e}"), file=sys.stderr)

                # Raise a more informative error
                if block_reason != "Unknown" and block_reason != "BLOCK_REASON_UNSPECIFIED":
                     raise RuntimeError(f"Content generation blocked. Reason: {block_reason}. Ratings: {safety_ratings}")
                elif finish_reason != "Unknown" and finish_reason != "FINISH_REASON_UNSPECIFIED" and finish_reason != "STOP":
                     raise RuntimeError(f"Content generation failed or stopped unexpectedly. Reason: {finish_reason}. Ratings: {safety_ratings}")
                else:
                     raise RuntimeError(f"Content generation failed. Could not extract text from response. Original error: {e}")

            except Exception as e:
                 # Catch any other unexpected error during text extraction
                 print(colors.red(f"❗ Unexpected error processing response: {e}"), file=sys.stderr)
                 raise RuntimeError("Unexpected error processing LLM response.") from e


        # --- Handle API Errors ---
        except google_genai_errors.PermissionDenied as e:
             print(colors.red("\n🚫 API Permission Denied!"), file=sys.stderr)
             print(colors.red(f"   Check your GOOGLE_API_KEY. Is it valid and enabled?"), file=sys.stderr)
             print(colors.red(f"   Details: {e}"), file=sys.stderr)
             raise RuntimeError("API Permission Denied (Check GOOGLE_API_KEY)") from e
        except google_genai_errors.ResourceExhausted as e:
             print(colors.red("\nquota Exceeded or Rate Limited!"), file=sys.stderr)
             print(colors.red(f"   You might be sending requests too quickly or exceeded your quota (often 60 RPM for free tier)."), file=sys.stderr)
             print(colors.red(f"   Details: {e}"), file=sys.stderr)
             raise RuntimeError("API Quota Exceeded / Rate Limited") from e
        except google_genai_errors.InvalidArgument as e:
             print(colors.red(f"\n❗ Invalid Argument Error: {e}"), file=sys.stderr)
             print(colors.red(f"   Check model name ('{model_path}'), parameters (temp, tokens, etc.), or prompt format."), file=sys.stderr)
             raise RuntimeError("API Invalid Argument") from e
        except google_genai_errors.NotFound as e:
             print(colors.red(f"\n❗ Model Not Found Error: {e}"), file=sys.stderr)
             print(colors.red(f"   Ensure the model name '{model_path}' is correct and available for your API key region/tier."), file=sys.stderr)
             raise RuntimeError(f"Model '{model_path}' not found") from e
        except google_genai_errors.InternalServerError as e:
            print(colors.red(f"\n❗ Internal Server Error from API: {e}"), file=sys.stderr)
            print(colors.yellow(f"   This might be a temporary issue with the Google API. Try again later."), file=sys.stderr)
            raise RuntimeError("API Internal Server Error") from e
        except google_genai_errors.APIError as e:
             # Catch other specific API errors
             print(colors.red(f"\n❗ Gemini API Error ({type(e).__name__}): {e}"), file=sys.stderr)
             raise RuntimeError("Gemini API Error") from e
        except Exception as e:
             # Catch unexpected errors during the call itself
             print(colors.red(f"\n❗ An unexpected error occurred during the Gemini API call: {type(e).__name__} - {e}"), file=sys.stderr)
             raise RuntimeError("Unexpected GenAI Error") from e

