class ChatsController < ApplicationController
  # Make sure the user is logged in for actions that modify data or show specific user data
  before_action :authenticate_user! # Add this if you haven't already for relevant actions

  # Ensure @chat is set for send_msg as well
  before_action :set_chat, only: %i[ show edit update destroy send_msg ] # <-- Added :send_msg

  # GET /chats or /chats.json
  def index
    # Scope chats to the current user
    @chats = current_user.chats rescue []
    # Assuming User has_many :chats
    # If User doesn't have has_many :chats, use:
    # @chats = Chat.where(user: current_user)
    @all_chats = Chat.all # Keep if needed for admin or other purposes
  end

  # GET /chats/1 or /chats/1.json
  def show
    # @chat is already set by the before_action
    # You might want to load associated messages here if not handled by Turbo Streams later
    # @messages = @chat.messages.order(:created_at) # Assuming Chat has_many :messages
  end

  # GET /chats/new
  def new
    @chat = Chat.new
  end

  # GET /chats/1/edit
  def edit
    # @chat is already set
    # Optional: Add authorization check
    authorize_chat_owner!
  end

  # POST /chats/:id/send_msg
  def send_msg
    # @chat is already set by the before_action

    # Optional but recommended: Authorize that the current_user owns this chat
    authorize_chat_owner!

    # Get the message content from the form parameters
    message_content = params[:message_content] # Use the name given in the form's text_area

    # Basic validation: Ensure message is not blank
    if message_content.blank?
      # Option 1: Redirect back with an alert
      #redirect_to @chat, alert: "Message cannot be empty."
      # Option 2: Render the show page again (might need @messages loaded)
      flash.now[:alert] = "Message cannot be empty."
      render :show, status: :unprocessable_entity
      return # Stop further processing
    end

    print("DEBUG: message_content=#{message_content}")
    # Msg is NOT blank now.
    #return @chat.ask(message_content)

    # Render and/or redirect were called multiple times in this action. Please note that you may only call render OR redirect, and at most once per action. Also note that neither redirect nor render terminate execution of the action, so if you want to exit an action after redirecting, you need to do something like "redirect_to(...); return".


    # Message Create (0.7ms)  INSERT INTO "messages" ("chat_id", "role", "content", "model_id", "input_tokens", "output_tokens", "tool_call_id", "created_at", "updated_at") VALUES (4, 'assistant', '', 'gemini-2.0-flash', NULL, NULL, NULL, '2025-04-18 17:55:29.657000', '2025-04-18 17:55:29.657000') RETURNING "id" /*application='RubyllmPgAppVanilla'*/

    # --- Core Logic ---
    # Assuming the ruby-llm gem's `acts_as_chat` sets up a `has_many :messages`
    # association on your Chat model, and Message belongs_to :chat.
    # Create the new message associated with the current chat.
    # The 'role' should be 'user' for messages sent via the form.
    @message = @chat.messages.build(content: message_content, role: 'user', model_id: DEFAULT_LLM_MODEL)
    # Note: `acts_as_message` might automatically handle the role based on context,
    # but explicitly setting it is safer. Check ruby-llm docs if needed.

    if @message.save
      # --- Placeholder for LLM Interaction ---
      # TODO: Trigger the LLM response here if desired.
      # This might involve calling a method like `@chat.ask(message_content)`
      # or similar, depending on how ruby-llm works.
      # For now, we just save the user's message.
      puts("User message saved for chat=#{@chat.id}. Message ID=#{@message.id}. Content: '#{message_content}'")

      # --- Response ---
      # Option 1: Redirect back to the chat page (simple, full page reload)
      redirect_to @chat, notice: "Message sent."

      # Option 2: Respond with Turbo Stream (more advanced, updates page dynamically)
      # respond_to do |format|
      #   format.turbo_stream do
      #     # Render a stream to append the new message and clear the form
      #     render turbo_stream: [
      #       turbo_stream.append("messages_list", partial: "messages/message", locals: { message: @message }), # Assumes a div#messages_list and messages/_message partial
      #       turbo_stream.update("new_message_form", partial: "chats/form", locals: { chat: @chat }) # Or just clear the textarea
      #     ]
      #   end
      #   format.html { redirect_to @chat, notice: "Message sent." } # Fallback for non-JS
      # end

    else
      # Handle message saving errors (e.g., validations)
      redirect_to @chat, alert: "Failed to send message: #{@message.errors.full_messages.join(', ')}"
      # Or render the show page again with errors
      # render :show, status: :unprocessable_entity
    end

  end

  # POST /chats or /chats.json
  def create
    # Associate the new chat with the current user
    @chat = Chat.new(chat_params)
    @chat.user = current_user # Explicitly assign the user

    respond_to do |format|
      if @chat.save
        format.html { redirect_to @chat, notice: "Chat was successfully created." }
        format.json { render :show, status: :created, location: @chat }
      else
        format.html { render :new, status: :unprocessable_entity }
        format.json { render json: @chat.errors, status: :unprocessable_entity }
      end
    end
  end

  # PATCH/PUT /chats/1 or /chats/1.json
  def update
    authorize_chat_owner! # Add authorization
    respond_to do |format|
      # Ensure user_id isn't accidentally changed if it's in chat_params
      safe_params = chat_params.except(:user_id)
      if @chat.update(safe_params)
        format.html { redirect_to @chat, notice: "Chat was successfully updated." }
        format.json { render :show, status: :ok, location: @chat }
      else
        format.html { render :edit, status: :unprocessable_entity }
        format.json { render json: @chat.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /chats/1 or /chats/1.json
  def destroy
    authorize_chat_owner! # Add authorization
    @chat.destroy!

    respond_to do |format|
      format.html { redirect_to chats_path, status: :see_other, notice: "Chat was successfully destroyed." }
      format.json { head :no_content }
    end
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_chat
      # Find the chat ensuring it belongs to the current user if appropriate
      # If chats should be strictly private:
      # @chat = current_user.chats.find(params[:id]) # This raises RecordNotFound if not found or not owned
      # If chats might be viewable by others but only editable/messagable by owner:
      @chat = Chat.find(params[:id])
      # We'll add specific authorization checks in actions like update, destroy, send_msg
    rescue ActiveRecord::RecordNotFound
      redirect_to chats_path, alert: "Chat not found."
    end

    # Helper method for authorization
    def authorize_chat_owner!
      unless @chat.user == current_user
        redirect_to chats_path, alert: "You are not authorized to perform this action."
        # Or raise an exception like Pundit::NotAuthorizedError if using an authorization gem
      end
    end

    # Only allow a list of trusted parameters through.
    def chat_params
      # Ensure user_id is not mass-assignable here for security.
      # It should be set explicitly from current_user in `create`.
      params.require(:chat).permit(:model_id, :title, :summary)
      # Original had .expect - require().permit() is more standard for strong params
      # params.expect(chat: [ :model_id, :user_id, :title, :summary ])
    end
end
