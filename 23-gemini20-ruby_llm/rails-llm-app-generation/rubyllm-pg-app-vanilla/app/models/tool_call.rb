class ToolCall < ApplicationRecord
  #belongs_to :message

    # Sets up associations to the calling message and the result message.
    acts_as_tool_call # Assumes Message model name

end
