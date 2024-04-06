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
        file_contents = file.read()
        r = Response(get_claude_response(file_contents), mimetype="text/event-stream")
        r.headers["Content-Encoding"] = "none",
        return r
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

  with anthropic_client.messages.stream(model=MODEL_NAME,

                                  max_tokens=500,

                                  messages=[{

                                      'role': 'user',

                                      'content': f"""
                                      Here is an academic paper: <paper>{text}</paper> Please do the following:
                                      Summarize the paper at a high school level in a manner that everyone can understand without losss of information. Use only one paragraph. Then state: 
                                      1. The significance of the findings of this study on our daily lives, if at all.
                                      2. The strength of the study, based on the domain of the study. For example, if it is an epidemiological study trying to establish cause and effect,
                                      how many of the Bradford Hill criteria does the study match?

                                      If the text you recieved is not an academic paper, say so.
                                      
                                      Format your response as HTML. For example, wrap each paragraph in a <p> tag, render lists with <ol> + <li>,
                                      split up sections using <div>, etc. 
                                      """

    }]) as stream:
    buffer = ""
    for text in stream.text_stream:
        buffer += text
        print(buffer)
        if len(buffer.split(" ")) >= 20:
            yield buffer
            buffer = ""
    yield buffer


if __name__ == "__main__":
    app.run(debug=True)
