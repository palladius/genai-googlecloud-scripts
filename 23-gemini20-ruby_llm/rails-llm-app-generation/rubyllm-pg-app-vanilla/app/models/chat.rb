class Chat < ApplicationRecord
  #belongs_to :user
  # Includes methods like ask, with_tool, with_instructions, etc.
  # Automatically persists associated messages and tool calls.
  acts_as_chat # Assumes Message and ToolCall model names
  #broadcasts_to ->(chat) { "chat_#{chat.id}" }

  # --- Add your standard Rails model logic below ---
  belongs_to :user, optional: true
  validates :model_id, presence: true
end
