# -*- coding: utf-8 -*-
"""
GenAI Interaction Module - Let's talk to the big brain! 🧠
Handles communication with the Vertex AI Gemini API.
"""

import sys
import time
from typing import Optional

try:
    import vertexai
    from vertexai.generative_models import GenerativeModel, GenerationConfig, Candidate, Part
    from google.api_core import exceptions as google_exceptions
    _VERTEXAI_AVAILABLE = True
except ImportError:
    _VERTEXAI_AVAILABLE = False
    # print("Warning: google-cloud-aiplatform module not found. GenAI functionality will be disabled.", file=sys.stderr)
    # print("Install it with: pip install google-cloud-aiplatform", file=sys.stderr)

try:
    from lib import colors
except ImportError:
    # Fallback if colors cannot be imported
    class MockColors:
        def __getattr__(self, name):
            return lambda x: x
    colors = MockColors()


# Default configuration values
DEFAULT_MODEL_NAME = "gemini-1.5-flash-001"
DEFAULT_TEMPERATURE = 0.7
DEFAULT_MAX_OUTPUT_TOKENS = 2048
DEFAULT_TOP_P = 0.95 # Often used with temperature
DEFAULT_TOP_K = 40   # Often used with temperature

# The placeholder we expect in prompt files
PROMPT_INPUT_PLACEHOLDER = "{EMAIL_BODY}"

class GeminiClient:
    """Wraps the Vertex AI Gemini client."""

    def __init__(self, project_id: str, location: str, debug: bool = False):
        """
        Initializes the GeminiClient.

        Args:
            project_id: Google Cloud Project ID.
            location: Google Cloud Project Location (e.g., 'us-central1').
            debug: Enable debug printing.

        Raises:
            ImportError: If the 'google-cloud-aiplatform' library is not installed.
            RuntimeError: If Vertex AI initialization fails.
        """
        if not _VERTEXAI_AVAILABLE:
            raise ImportError("The 'google-cloud-aiplatform' library is required for GenAI operations. Please install it (`pip install google-cloud-aiplatform`).")

        self.project_id = project_id
        self.location = location
        self.debug = debug
        self._model: Optional[GenerativeModel] = None # Lazy initialization

        try:
            if self.debug:
                print(colors.grey(f"🔧 Initializing Vertex AI SDK for project '{project_id}' in location '{location}'..."), file=sys.stderr)
            # Retry initialization softly, sometimes network blips happen
            retries = 3
            for i in range(retries):
                try:
                    vertexai.init(project=project_id, location=location)
                    if self.debug:
                        print(colors.grey(f"✅ Vertex AI SDK initialized successfully (attempt {i+1}/{retries})."), file=sys.stderr)
                    break # Success
                except Exception as e:
                    if i < retries - 1:
                        print(colors.yellow(f"⚠️ Vertex AI init failed (attempt {i+1}/{retries}): {e}. Retrying in 2 seconds..."), file=sys.stderr)
                        time.sleep(2)
                    else:
                        print(colors.red(f"❗ Vertex AI init failed after {retries} attempts."), file=sys.stderr)
                        raise RuntimeError(f"Failed to initialize Vertex AI SDK: {e}") from e
        except Exception as e:
             # Catch any unexpected error during the retry logic itself
             print(colors.red(f"❗ Unexpected error during Vertex AI initialization: {e}"), file=sys.stderr)
             raise RuntimeError(f"Unexpected error initializing Vertex AI SDK: {e}") from e


    def _get_model(self, model_name: str) -> GenerativeModel:
        """Initializes and returns the GenerativeModel instance."""
        # Construct the full model resource name expected by the library
        expected_model_name = f"projects/{self.project_id}/locations/{self.location}/publishers/google/models/{model_name}"

        # Check if the current model instance matches the *full resource name*
        # Note: Accessing _model_name might be fragile if library internals change, but it's common practice.
        if self._model is None or self._model._model_name != expected_model_name:
             if self.debug:
                 print(colors.grey(f"🧠 Loading/switching to Generative Model: {model_name} ({expected_model_name})..."), file=sys.stderr)
             try:
                self._model = GenerativeModel(model_name)
                if self.debug:
                    # Verify the internal name matches expectation after loading
                    loaded_name = getattr(self._model, '_model_name', 'Unknown')
                    print(colors.grey(f"✅ Model '{model_name}' loaded. Internal resource name: {loaded_name}"), file=sys.stderr)
             except Exception as e:
                 print(colors.red(f"❗ Failed to load model '{model_name}': {e}"), file=sys.stderr)
                 raise RuntimeError(f"Failed to load model '{model_name}'") from e
        elif self.debug:
            print(colors.grey(f"🧠 Reusing existing model instance for: {model_name}"), file=sys.stderr)

        # Double-check model is not None after attempt
        if self._model is None:
            raise RuntimeError(f"Model object is unexpectedly None after trying to load '{model_name}'.")

        return self._model


    def process_text(
        self,
        prompt_template: str,
        input_text: str,
        model_name: str = DEFAULT_MODEL_NAME,
        temperature: float = DEFAULT_TEMPERATURE,
        max_output_tokens: int = DEFAULT_MAX_OUTPUT_TOKENS,
        top_p: float = DEFAULT_TOP_P,
        top_k: int = DEFAULT_TOP_K
    ) -> str:
        """
        Sends the input text and prompt to the Gemini model for processing.

        Args:
            prompt_template: The prompt string, potentially containing {EMAIL_BODY}.
            input_text: The text to be processed (e.g., the email body).
            model_name: The name of the Gemini model to use.
            temperature: Controls randomness (0.0-1.0). Lower is more deterministic.
            max_output_tokens: Maximum number of tokens in the response.
            top_p: Nucleus sampling parameter.
            top_k: Top-k sampling parameter.

        Returns:
            The processed text returned by the model.

        Raises:
            ValueError: If the prompt template doesn't contain the expected placeholder.
            RuntimeError: If the API call fails or model loading fails.
        """
        if PROMPT_INPUT_PLACEHOLDER not in prompt_template:
             print(colors.yellow(f"⚠️ Warning: Prompt template does not contain the placeholder '{PROMPT_INPUT_PLACEHOLDER}'. Input text will be appended directly after the template."), file=sys.stderr)
             # Ensure there's separation between template and raw input
             full_prompt = f"{prompt_template.rstrip()}\n\n---\n\n{input_text}"
        else:
             full_prompt = prompt_template.replace(PROMPT_INPUT_PLACEHOLDER, input_text)

        if self.debug:
            print(colors.grey("\n--- Sending Prompt to LLM ---"), file=sys.stderr)
            print(colors.grey(full_prompt[:500] + ("..." if len(full_prompt) > 500 else "")), file=sys.stderr) # Print truncated prompt
            print(colors.grey("-----------------------------"), file=sys.stderr)
            print(colors.grey(f"Model: {model_name}, Temp: {temperature}, Max Tokens: {max_output_tokens}, Top-P: {top_p}, Top-K: {top_k}"), file=sys.stderr)


        try:
            model = self._get_model(model_name)
        except RuntimeError as e:
             # Propagate model loading errors
             raise e

        generation_config = GenerationConfig(
            temperature=temperature,
            max_output_tokens=max_output_tokens,
            top_p=top_p,
            top_k=top_k
        )

        try:
            print(colors.cyan(f"✨ Calling Gemini ({model_name})... This might take a moment..."), file=sys.stderr)
            start_time = time.time()
            response = model.generate_content(
                [full_prompt], # Content can be a list of strings or Parts
                generation_config=generation_config,
                # stream=False # We want the full response here
                )
            duration = time.time() - start_time

            if self.debug:
                print(colors.grey(f"✅ Raw API Response received ({type(response)}) in {duration:.2f}s."), file=sys.stderr)
                # print(colors.grey(f"{response}"), file=sys.stderr) # Might be too verbose

            # --- Process Response ---
            # More robust checking based on library documentation and common patterns
            if not response.candidates:
                 # Check usage metadata if available, might give clues
                 usage_metadata = getattr(response, 'usage_metadata', None)
                 if self.debug:
                      print(colors.yellow(f"LLM response missing candidates. Usage metadata: {usage_metadata}"), file=sys.stderr)
                 raise RuntimeError(f"LLM response contained no candidates. Usage: {usage_metadata}")

            # Check the first candidate (usually the only one unless num_candidates > 1)
            candidate = response.candidates[0]
            finish_reason = getattr(candidate, 'finish_reason', Candidate.FinishReason.FINISH_REASON_UNSPECIFIED)
            safety_ratings = getattr(candidate, 'safety_ratings', [])

            # Case 1: Valid content exists
            if candidate.content and candidate.content.parts:
                # Assuming text model, the first part should contain the text
                result_text = candidate.content.parts[0].text
                if self.debug:
                    print(colors.grey(f"✅ Extracted Text Length: {len(result_text)} chars. Finish reason: {finish_reason.name if finish_reason else 'N/A'}"), file=sys.stderr)
                # If finish_reason indicates truncation (MAX_TOKENS), warn the user
                if finish_reason == Candidate.FinishReason.MAX_TOKENS:
                    print(colors.yellow(f"⚠️ Warning: LLM response may be truncated because the maximum output token limit ({max_output_tokens}) was reached."), file=sys.stderr)
                return result_text

            # Case 2: No content, investigate why
            if self.debug:
                 print(colors.yellow(f"LLM response missing content parts. Finish reason: {finish_reason.name if finish_reason else 'N/A'}"), file=sys.stderr)
                 if safety_ratings:
                     print(colors.yellow(f"Safety Ratings: {safety_ratings}"), file=sys.stderr)

            # Specific error based on finish reason
            if finish_reason == Candidate.FinishReason.SAFETY:
                 raise RuntimeError(f"LLM response blocked due to safety concerns. Ratings: {safety_ratings}")
            elif finish_reason == Candidate.FinishReason.RECITATION:
                 raise RuntimeError("LLM response blocked due to potential recitation issues.")
            elif finish_reason == Candidate.FinishReason.OTHER:
                 raise RuntimeError("LLM response failed due to an unspecified 'other' reason.")
            elif finish_reason == Candidate.FinishReason.FINISH_REASON_UNSPECIFIED:
                 raise RuntimeError("LLM response finished with an unspecified reason and no content.")
            else:
                # Should not happen if MAX_TOKENS was handled above, but catch just in case
                 raise RuntimeError(f"LLM response contained no content parts. Finish reason: {finish_reason.name if finish_reason else 'Unknown'}")


        except google_exceptions.PermissionDenied as e:
             print(colors.red("\n🚫 Permission Denied! Check your authentication and ensure the Vertex AI API is enabled."), file=sys.stderr)
             print(colors.red(f"   Project: {self.project_id}, Location: {self.location}"), file=sys.stderr)
             print(colors.red(f"   Attempted Model: {model_name}"), file=sys.stderr)
             print(colors.red(f"   Details: {e}"), file=sys.stderr)
             raise RuntimeError("API Permission Denied") from e
        except google_exceptions.ResourceExhausted as e:
             print(colors.red("\nquota Exceeded! You might be sending requests too quickly or exceeded your quota."), file=sys.stderr)
             print(colors.red(f"   Details: {e}"), file=sys.stderr)
             raise RuntimeError("API Quota Exceeded") from e
        except google_exceptions.InvalidArgument as e:
             print(colors.red(f"\n❗ Invalid Argument Error: {e}"), file=sys.stderr)
             print(colors.red(f"   Check model name ('{model_name}'), parameters (temp, tokens, etc.), or prompt format."), file=sys.stderr)
             raise RuntimeError("API Invalid Argument") from e
        except google_exceptions.GoogleAPICallError as e:
             print(colors.red(f"\n❗ API Call Error: {e}"), file=sys.stderr)
             raise RuntimeError("General API Call Error") from e
        except Exception as e:
             print(colors.red(f"\n❗ An unexpected error occurred during the Gemini API call: {e}"), file=sys.stderr)
             # Re-raise the original exception for better traceback if not handled above
             raise RuntimeError("Unexpected GenAI Error") from e

