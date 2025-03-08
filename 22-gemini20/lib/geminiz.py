
"""TODO subsummi tutta la roba di genai qui.

# Prova a giocare con 2 envs, uno di Vertex e uno di Key.

export GOOGLE_GENAI_USE_VERTEXAI=true
export GOOGLE_CLOUD_PROJECT='your-project-id'
export GOOGLE_CLOUD_LOCATION='us-central1'
export GOOGLE_API_KEY='your-api-key'

da Mete https://docs.google.com/presentation/d/18Ym4L1gA4crzSskphxZHE08O_05JZFy9un8OJFWREQA/edit?slide=id.g2d9a2100e51_0_454&resourcekey=0-CZ_jrUIQvd5eq7OvBtsoMg#slide=id.g2d9a2100e51_0_454

E stampare una debug line tipo:

(aut) "Got API Key: starts wioht AIza: ok.
(aut) "Got Vertex: project_id=yellow(prid).

"""

def super_duper_authenticate():
    '''parses env and tells you if GEMINI_API_KEY is set or Vertexc or Exception.


    Mete dice che con le ENV giuste al fa tot lo'!
    '''


# cost is in dollars
def cost_of_api_call(context=None, printCost=True):
    cost = '0.42'
    if context:
        with open('tmp.gemini_api_call_context.json', 'w', encoding='utf-8') as f:
            #f.write(response.candidates[0].grounding_metadata.search_entry_point.rendered_content)
#            TypeError: write() argument must be str, not GenerateImagesResponse
            f.write(context.__str__())
            f.write(context.__dict__)
        print(context)
    if printCost:
        print(f"💰 Gemini API Call cost: {cost}$")
    return cost
