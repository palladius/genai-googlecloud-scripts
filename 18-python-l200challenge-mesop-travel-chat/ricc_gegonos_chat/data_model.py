from dataclasses import dataclass, field
from typing import Literal
from enum import Enum

import mesop as me
import os

Role = Literal["user", "model"]

@dataclass(kw_only=True)
class ChatMessage:
    role: Role = "user"
    content: str = ""
    prompt_context: str = ""
    in_progress: bool = False

class Models(Enum):
    # ALSO:
    # * gemini-1.0-pro
    # * text-embedding-004
    # docs: https://ai.google.dev/api/models#method:-models.get
    GEMINI_1_5_FLASH = "Gemini 1.5 Flash"
    GEMINI_1_5_PRO = "Gemini 1.5 Pro"
    GEMINI_EXP_FLASH = "Gemini ?? Flash (experimental)" # gemini-flash-experimental
    GEMINI_EXP_PRO = "Gemini ?? Pro (experimental)" # gemini-pro-experimetnal
    CLAUDE_3_5_SONNET = "Claude 3.5 Sonnet"
    RICCARDO_S_WIFE =  "My wife knows everything"

DefaultSelectedModel = "Gemini 1.5 Flash" # "Gemini 1.5 Pro"

@dataclass
class Conversation:
    model: str = ""
    messages: list[ChatMessage] = field(default_factory=list)

@me.stateclass
class State:
    #
    is_model_picker_dialog_open: bool = False
    input: str = "also empty"
    input_ricc_prompt: str = "empty"
    input_either: str = "" # "Either Normal (lab) or RAG (Riccardo)"
    conversations: list[Conversation] = field(default_factory=list)
    #models: list[str] = field(default_factory=list)
    models: list[str] = field(default_factory=lambda: [DefaultSelectedModel])

    gemini_api_key: str = os.environ.get('GEMINI_KEY') or '<Add Key here>'
    #claude_api_key: str = ""
    ldap: str = "ricc"
    big_prompt: str = '' # contains the BIG caluclated prompt.

@me.stateclass
class ModelDialogState:
    selected_models: list[str] = field(default_factory=list)
