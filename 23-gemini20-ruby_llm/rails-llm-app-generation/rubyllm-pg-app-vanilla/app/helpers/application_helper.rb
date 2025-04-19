# app/helpers/application_helper.rb (or messages_helper.rb)
require 'redcarpet'

module ApplicationHelper # Or MessagesHelper
  def markdown_to_html(text)
    # Return an empty safe string if text is blank to avoid errors
    return ''.html_safe if text.blank?

    # --- Redcarpet Options ---

    # Renderer options control how HTML is generated
    options = {
      filter_html:     true,  # Don't allow raw HTML embedded in the markdown
      hard_wrap:       true,  # Treat single newlines as <br> tags
      link_attributes: { rel: 'nofollow', target: "_blank" }, # Add attributes to links
      space_after_headers: true,
      fenced_code_blocks: true # Enable ```ruby ... ``` syntax
    }

    # Extensions control which markdown features are enabled
    extensions = {
      autolink:           true,  # Automatically turn URLs into links
      superscript:        true,  # Enable ^ notation
      disable_indented_code_blocks: false, # Keep standard indented code blocks
      strikethrough:      true,  # Enable ~~text~~
      tables:             true,  # Enable Markdown tables
      no_intra_emphasis:  true,  # Don't italicize_within_words
      lax_spacing:        true  # Allow more flexible spacing for block elements
    }

    # Create the renderer and markdown parser
    renderer = Redcarpet::Render::HTML.new(options)
    markdown = Redcarpet::Markdown.new(renderer, extensions)

    # Render the markdown and mark it as HTML safe
    markdown.render(text).html_safe
  end
end
