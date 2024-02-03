# Uses dotenv if dotenv..
require 'dotenv'
# put the key under .envrc
Dotenv.load('.envrc')

def auto_project_id
  # 1. if ENv return ENV
  return ENV['PROJECT_ID'] if ENV['PROJECT_ID'].to_s.length > 0
  return `gcloud config get core/project`.chomp
end


def present_gemini_result(result, debug: true)
  result.each_with_index do |partial_result, ir|
    puts "== Result #{ir+1} (I believe these are different options) ==" if ir > 0 and debug
    candidates=partial_result['candidates']
    #puts candidates
    #
    candidate_merge = ''
    candidates.each_with_index do |candidate, ic|
      #puts "+ Candidate #{ic+1} (I believe these need to be merged with CRLF)==" if debug
      #puts candidate
      content = candidate['content']
      # => {"role"=>"model", "parts"=>[{"text"=>"Hello! How can I assist you today?"}]}
      emoji = content['role'] == 'model' ? '♊️' : '🧑🏻‍💻'
      #puts "[#{emoji}] 🟠 #{content['parts'].map{|x| x['text'].chomp}.join(" ")}"
      #candidate_merge << "[#{emoji}] ✅" if ic == 0
      candidate_merge << (content['parts'] || []).map{|x| x['text'].chomp}.join(" 🔗 ")
    end
    puts candidate_merge
    candidate_merge = ''
    #puts content
  end
  puts '----'
end

def gemini_result_to_string(result, debug: true)
  ret = ''
  result.each_with_index do |partial_result, ir|
    #ret << "== Result #{ir+1} (I believe these are different options) ==" if debug
    candidates=partial_result['candidates']
    #candidate_merge = ''
    candidates.each_with_index do |candidate, ic|
      #puts "+ Candidate #{ic+1} (I believe these need to be merged with CRLF)==" if debug
      #puts candidate
      content = candidate['content']
      # => {"role"=>"model", "parts"=>[{"text"=>"Hello! How can I assist you today?"}]}
      emoji = content['role'] == 'model' ? '♊️' : '🧑🏻‍💻'
      #puts "[#{emoji}] 🟠 #{content['parts'].map{|x| x['text'].chomp}.join(" ")}"
      #candidate_merge << "[#{emoji}] ✅" if ic == 0
      ret << (content['parts'] || []).map{|x| x['text'].chomp}.join(" 🔗 ")
    end
    #puts candidate_merge
    #candidate_merge = ''
    #puts content
  end
  ret
end

# returns file name
def generate_transcript(contents)
  version = '1.1'
  file_name = "transcript-#{Time.now}.yaml"
  File.open(file_name, "w") { |f|
    f.write "# #{Time.now} - generate_transcript() v#{version} from Gemini API convo!\n"
    f.write YAML.dump(contents)
  }
  return file_name
end
