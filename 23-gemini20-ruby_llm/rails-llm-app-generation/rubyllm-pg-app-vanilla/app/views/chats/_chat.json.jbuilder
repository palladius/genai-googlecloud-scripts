json.extract! chat, :id, :model_id, :user_id, :title, :summary, :created_at, :updated_at
json.url chat_url(chat, format: :json)
