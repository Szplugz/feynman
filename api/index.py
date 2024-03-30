from urllib import request
from flask import Flask, request, jsonify
import base64
import requests
import os
import json

# to read pdfs
from pypdf import PdfReader

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
        completion = get_claude_response(file)
        return jsonify({"message": completion}), 200
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

  reader = PdfReader(file)
  number_of_pages = len(reader.pages)
  text = ''.join([page.extract_text() for page in reader.pages])

  print('sending req to anthropic')
  completion = get_completion(
      anthropic_client, f"""Here is an academic paper: <paper>{text}</paper>

                              Please do the following:
                              1. Summarize the abstract at a kindergarten reading level. (In <kindergarten_abstract> tags.)
                              2. Write the Methods section as a recipe from the Moosewood Cookbook. (In <moosewood_methods> tags.)
                              3. Compose a short poem epistolizing the results in the style of Homer. (In <homer_results> tags.)
                              """)
  print(completion)
  return completion


if __name__ == "__main__":
    app.run(debug=True)
