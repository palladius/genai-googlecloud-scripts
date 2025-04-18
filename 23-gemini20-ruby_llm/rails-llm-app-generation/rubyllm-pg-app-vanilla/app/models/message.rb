class Message < ApplicationRecord
  # belongs_to :chat
  # belongs_to :tool_call

  # Provides methods like tool_call?, tool_result?
  acts_as_message # Assumes Chat and ToolCall model names

  # --- Add your standard Rails model logic below ---
  # Optional: Use Rails enums for roles
  enum role: { system: 'system', user: 'user', assistant: 'assistant', tool: 'tool' }

end
