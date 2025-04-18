class Chat < ApplicationRecord
  #belongs_to :user
  # Includes methods like ask, with_tool, with_instructions, etc.
  # Automatically persists associated messages and tool calls.
  acts_as_chat # Assumes Message and ToolCall model names
  #broadcasts_to ->(chat) { "chat_#{chat.id}" }

  # --- Add your standard Rails model logic below ---
  belongs_to :user, optional: true
  validates :model_id, presence: true

  # TODO https://stackoverflow.com/questions/328525/rails-how-can-i-set-default-values-in-activerecord
  # Add Gemini model from RubyLLM.config.default_model
  after_initialize :init
  def init
    self.model_id  ||= RubyLLM.config.default_model
    #NONVA self.user_id   ||= current_user.id # 43 # (current_user.id rescue nil)
    #self.summary   ||= '[This is gonna be populated by Gemini later..]'
  end

end
