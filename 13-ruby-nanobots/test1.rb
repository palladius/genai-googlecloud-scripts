# frozen_string_literal: true

require 'nano-bots'

bot = NanoBot.new(cartridge: 'cartridges/gpt.yml')

bot.eval('Hi!') do |_content, fragment, _finished, _meta|
  print fragment unless fragment.nil?
end
