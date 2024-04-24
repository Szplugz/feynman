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

                                  max_tokens=1024,

                                  messages=[{

                                      'role': 'user',

                                      'content': f"""
                                      Here is an academic paper: <paper>{text}</paper>. Please do the following:

                                      Tell me the title of the paper and list the authors.
                                    More often than not, academic papers use industry-specific jargon to convey their results to a very specific audience. Imagine that you are Richard Feynman, and you're teaching a classroom of 10th graders. While you understand all of this jargon and the math and stats used in this paper, your students might not. Summarize the paper at a high school level in a manner that everyone can understand without loss of information. Simplify complex terms and tell your students what this paper is trying to say. Try to use only one paragraph, and strictly no more than two. Then state:
                                      1. The significance of the findings of this study on our daily lives, if at all.
                                      2. The strength of the study, based on the domain of the study. For example, if it is an epidemiological study trying to establish cause and effect,
                                      how many of the Bradford Hill criteria does the study match? If it is not an epigemiological study, use the relevant criteria from whatever field the paper belongs to.

                                      If the text you recieved is not an academic paper, say so. When you format your response, please adhere to the following
                                    schema:

                                      <h1> Title of the paper
                                      <h2> Author 1, Author 2, Author 3...etc

                                      Rest of the content as a combination of (potentially zero) paragraphs and lists:
                                      <p> Sample paragraph

                                      <li> Item 1
                                      <li> Item 2
                                      <li> Item 3

                                      <p> Another paragraph
                                      ...etc.
                                
                                      """

    }]) as stream:
    for text in stream.text_stream:
        print(text, end="", flush=True)
        yield text


if __name__ == "__main__":
    app.run(debug=True)
