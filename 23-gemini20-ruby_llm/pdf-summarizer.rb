#!/usr/bin/env ruby

# generate a sample ruby script which accepts a PDF (or multiple ones) in ARGV
# and calls summarize_pdf() written by me, and writes the summary in FILENAME_WIHTOUT_DOTPDF.summary.md
# for each file passed in ARGV which is a legitimate PDF.

#require 'rainbow'
#require 'ruby_llm'
require_relative 'lib/common_auth'
require 'pathname' # Useful for path manipulation

GlobalChat = RubyLLM.chat(model: 'gemini-2.0-flash')

# --- Your function definition ---
# This is a placeholder. Replace it with your actual implementation
# that likely involves extracting text and calling an LLM API.
# For now, it just returns a dummy string.
def summarize_pdf(pdf_path:)
  puts "  -> Calling summarize_pdf for: #{Rainbow(pdf_path).red}"
  # Simulate work
  #sleep 0.2
  ret = GlobalChat.ask "Summarize this document", with: { pdf: pdf_path }
  # TBD
  summary = ret.content # RubyMessage
  puts("## summary")
  puts(Rainbow(summary).cyan)
  # Replace this with your actual summarization logic
#  return "## Summary for #{File.basename(pdf_path)}\n\nThis is a placeholder summary.\n\nReplace the `summarize_pdf` function body with your actual implementation using an LLM (like Gemini) after extracting text from the PDF at:\n`#{pdf_path}`"
  return "## Summary for #{File.basename(pdf_path)}\n\n#{summary}\n"
end
# --- End of your function definition ---


# --- Main script logic ---

# Check if any arguments were provided
if ARGV.empty?
  puts "Usage: #{$PROGRAM_NAME} <pdf_file1.pdf> [pdf_file2.pdf] ..."
  puts "  For each valid PDF file provided, a summary will be generated"
  puts "  and saved to <filename_without_extension>.summary.md"
  exit(1) # Exit with an error code
end

puts "Starting PDF summarization process..."
processed_count = 0
skipped_count = 0

ARGV.each do |arg|
  puts "\nProcessing argument: '#{arg}'"
  pdf_path = Pathname.new(arg)

  # 1. Check if the file exists
  unless pdf_path.exist?
    puts "  [SKIP] File not found: #{arg}"
    skipped_count += 1
    next # Skip to the next argument
  end

  # 2. Check if it's actually a file (not a directory)
  unless pdf_path.file?
     puts "  [SKIP] Not a file: #{arg}"
     skipped_count += 1
     next # Skip to the next argument
  end

  # 3. Check if the extension looks like .pdf (case-insensitive)
  unless pdf_path.extname.downcase == '.pdf'
    puts "  [SKIP] File does not appear to be a PDF (extension is not .pdf): #{arg}"
    skipped_count += 1
    next # Skip to the next argument
  end

  # If all checks pass, proceed
  puts "  File is a valid PDF path: #{pdf_path}"

  begin
    # Call your summarization function
    summary_content = summarize_pdf(pdf_path: pdf_path.to_s) # Pass the path as a string

    # Determine the output filename
    # Takes the directory of the original PDF, adds the basename without extension, and appends .summary.md
    output_basename = pdf_path.basename(pdf_path.extname).to_s + ".summary.md"
    output_path = pdf_path.dirname.join(output_basename)

    # Write the summary to the output file
    File.open(output_path, 'w') do |file|
      file.write(summary_content)
    end

    puts "  [SUCCESS] Summary written to: #{output_path}"
    processed_count += 1

  rescue StandardError => e
    # Catch potential errors during the summarize_pdf call or file writing
    puts "  [ERROR] Failed to process '#{arg}': #{e.message}"
    # Optional: Print backtrace for debugging
    # puts e.backtrace.join("\n    ")
    skipped_count += 1
  end
end

puts "\n----------------------------------------"
puts "Processing complete."
puts "  Successfully processed: #{processed_count} PDF(s)"
puts "  Skipped / Errored:    #{skipped_count} argument(s)"
puts "----------------------------------------"
