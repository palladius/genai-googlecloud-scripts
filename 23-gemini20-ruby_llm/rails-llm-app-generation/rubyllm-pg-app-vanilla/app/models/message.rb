class Message < ApplicationRecord
  # belongs_to :chat
  # belongs_to :tool_call

  # Provides methods like tool_call?, tool_result?
  acts_as_message # Assumes Chat and ToolCall model names

  # --- Add your standard Rails model logic below ---
  # Optional: Use Rails enums for roles
  #enum role: { system: 'system', user: 'user', assistant: 'assistant', tool: 'tool' }
  after_initialize :init

  def init
    self.model_id  ||= DEFAULT_LLM_MODEL
    self.content ||= 'Quanto fa 6 per 7?' # there's a bug this value isnt populated
  end

  def to_s

    role_emoji = (role == 'assistant' ? '♊️' : '🙊')
    role_emoji = '⚙️' if role == 'system'
    ret =    "📨 [#{role}] #{role_emoji} #{content}"
    ret += " 🛠️" if tool_call_id
    ret
  end
end
