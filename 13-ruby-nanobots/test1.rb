require 'nano-bots'

bot = NanoBot.new(cartridge: 'gpt.yml')

bot.eval('Hi!') do |content, fragment, finished, meta|
  print fragment unless fragment.nil?
end
