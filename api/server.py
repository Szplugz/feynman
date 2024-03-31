from urllib import request
from flask import Flask, request, jsonify, Response
import base64
import requests
import os
import json
from dotenv import load_dotenv
from io import BytesIO

# to read pdfs
from pypdf import PdfReader

load_dotenv()

SAMPLE_COMPLETION = '''
Here is my attempt:

<kindergarten_abstract>
Some people thought a medicine called metformin helps people with a sickness called diabetes live longer than people without diabetes. But in this study, the scientists found out that is not true. People with diabetes who take metformin still die earlier than people without diabetes.
</kindergarten_abstract>

<moosewood_methods>
Danish Health Register Delight
Serves the entire Danish population from 1996-2012

Ingredients:
- 1 Danish National Prescription Register, containing data on all prescriptions filled at Danish pharmacies
- 1 Danish Civil Registration System, for selecting a 5% random sample of the Danish population 
- 1 Danish Twin Registry, containing all twins born in Denmark
- A generous handful of statistical analyses

Instructions:
1. Using the Danish National Prescription Register, identify all individuals who filled a new prescription for metformin to treat their type 2 diabetes. 
2. From the Danish Civil Registration System, select a 5% random sample of the population. Match each metformin initiator to an individual without diabetes of the same age and sex.
3. From the Danish Twin Registry, identify all same-sex twin pairs where one twin initiated metformin and the other twin did not have diabetes. 
4. Follow all these tasty cohorts over time in the registers, making note of any deaths that occur.
5. Bring the data to a boil with Cox proportional hazards models and conditional logistic regression. Season with covariates to taste. Simmer until associations between metformin use and mortality are clear.
6. Serve results garnished with 95% confidence intervals. Savor the robust flavor, as these findings are unchanged by many sensitivity analyses.
</moosewood_methods>

<homer_results>
Sing, O Muse, of the fates of those plagued by diabetes!
Some thought metformin a panacea, conferring long life
Even surpassing those free of the disease.
But alas! The data decree a harsher truth -
Those taking the drug still meet earlier doom
Than their untainted counterparts, 
No matter the dosage or duration.
Increased mortality is their inevitable lot,
A bitter pill no amount of metformin may sweeten.
</homer_results>
'''

from anthropic import Anthropic
app = Flask(__name__)

@app.route("/api/upload", methods=["POST"])
def handle_file_upload():
    if 'files' not in request.files:
        return jsonify({"error": "No file part"}), 400
    file = request.files['files']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
    if file:
        # Process the file here
        # For example, save it to a directory
        # completion = get_claude_response(file)
        # return jsonify({"message": completion}), 200
        file_contents = file.read()
        return Response(get_claude_response(file_contents), mimetype="text/event-stream")
    else:
        return jsonify({"error": "File not found"}), 400

# OpenAI API Key
openai_api_key = os.environ.get("OPENAI_API_KEY")


# Function to encode the image
def encode_image(image_path):
  with open(image_path, "rb") as image_file:
    return base64.b64encode(image_file.read()).decode('utf-8')


def get_openai_response():
  # Path to your image
  image_path = "feynman-test.png"

  # Getting the base64 string
  base64_image = encode_image(image_path)

  headers = {
      "Content-Type": "application/json",
      "Authorization": f"Bearer {api_key}"
  }

  payload = {
      "model":
      "gpt-4-vision-preview",
      "messages": [{
          "role":
          "user",
          "content": [{
              "type":
              "text",
              "text":
              "Summarize this image and highlight any important points from it that you think I should be aware of."
          }, {
              "type": "image_url",
              "image_url": {
                  "url": f"data:image/jpeg;base64,{base64_image}"
              }
          }]
      }],
      "max_tokens":
      2000
  }

  response = requests.post("https://api.openai.com/v1/chat/completions",
                           headers=headers,
                           json=payload)
  response = response.json()
  with open('data.json', 'w', encoding='utf-8') as f:
    json.dump(response, f, ensure_ascii=False, indent=4)

  print(response['choices'][0]['message'])


def get_claude_response(file):

  anthropic_client = Anthropic(
      api_key=os.environ.get("ANTHROPIC_API_KEY")
  )
  MODEL_NAME = "claude-3-opus-20240229"

  def get_completion(client, prompt):
    return client.messages.create(model=MODEL_NAME,
                                  max_tokens=4096,
                                  messages=[{
                                      'role': 'user',
                                      'content': prompt
                                  }]).content[0].text
  file_like_object = BytesIO(file)
  reader = PdfReader(file_like_object)
  text = ''.join([page.extract_text() for page in reader.pages])

  print('sending req to anthropic')
#   completion = get_completion(
#       anthropic_client, f"""Here is an academic paper: <paper>{text}</paper>

#                               Please do the following:
#                               1. Summarize the abstract at a kindergarten reading level. (In <kindergarten_abstract> tags.)
#                               2. Write the Methods section as a recipe from the Moosewood Cookbook. (In <moosewood_methods> tags.)
#                               3. Compose a short poem epistolizing the results in the style of Homer. (In <homer_results> tags.)
#                               """)
#   print(type(completion))
#   return completion

  with anthropic_client.messages.stream(model=MODEL_NAME,

                                  max_tokens=4096,

                                  messages=[{

                                      'role': 'user',

                                      'content': f"""Here is an academic paper: <paper>{text}</paper>



                              Please do the following:

                              1. Summarize the abstract at a kindergarten reading level. (In <kindergarten_abstract> tags.)

                              2. Write the Methods section as a recipe from the Moosewood Cookbook. (In <moosewood_methods> tags.)

                              3. Compose a short poem epistolizing the results in the style of Homer. (In <homer_results> tags.)

                              """

    }]) as stream:
    for text in stream.text_stream:
        print(text, end="", flush=True)
        yield text


if __name__ == "__main__":
    app.run(debug=True)
