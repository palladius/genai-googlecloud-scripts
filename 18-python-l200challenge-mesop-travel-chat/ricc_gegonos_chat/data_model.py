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
    CLAUDE_3_5_SONNET = "Claude 3.5 Sonnet"
    RICCARDO_S_WIFE =  "My wife knows everything"

@dataclass
class Conversation:
    model: str = ""
    messages: list[ChatMessage] = field(default_factory=list)

@me.stateclass
class State:
    #dDefaultSelectedModel = "Gemini 1.5 Pro"
    is_model_picker_dialog_open: bool = False
    input: str = ""
    input_ricc_prompt: str = ""
    conversations: list[Conversation] = field(default_factory=list)
    #models: list[str] = field(default_factory=list)
    models: list[str] = field(default_factory=lambda: ["Gemini 1.5 Pro"])

    gemini_api_key: str = os.environ.get('GEMINI_KEY') or '<Add Key here>'
    #claude_api_key: str = ""
    ldap: str = "ricc"

@me.stateclass
class ModelDialogState:
    selected_models: list[str] = field(default_factory=list)
