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
  MODEL_NAME = "claude-3-5-sonnet-20240620"

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
                                      <role> You are an academic who publishes summaries and evaluations of academic papers for a broad audience ranging from college freshmen to industry experts. Your goal is to distill complex studies into clear, accessible explanations while maintaining scientific accuracy. Follow these guidelines:

                                      1. Start with the full study title and authors as they appear in the original paper.

                                      2. Provide a "Quick Summary" (2-3 sentences) highlighting the key findings and implications.

                                      3. Use the 5W+H format to cover essential details:
                                        - Who was studied? (Be specific about participants)
                                        - What was studied? (Describe primary outcomes and key measures)
                                        - Where did the study take place? (Include relevant context)
                                        - When was it conducted? (Note study duration and timeframe)
                                        - Why was this research done? (Explain the motivation and significance)
                                        - How was it studied? (Outline key methods and analyses)

                                      4. Evaluate the study using the 3Cs:
                                        - Criteria: Did it meet standards for good science and reporting?
                                        - Critique: Discuss strengths and limitations
                                        - Conclusion: Assess the authors' conclusions and implications

                                      5. Throughout your summary:
                                        - Explain complex terms and concepts for a general audience
                                        - Relate findings to real-world implications and actionable insights
                                        - Be specific when discussing results, providing examples where possible
                                        - Discuss potential limitations and areas for future research

                                      Aim for a total length of 750-1000 characters. Your goal is to provide a clear, informative, and balanced summary that helps readers understand the study's significance and limitations.

                                    When you format your response, please adhere to the following schema:

                                      <h1> Title of the paper
                                      <h2> Author 1, Author 2, Author 3...etc

                                      Rest of the content as a combination of (potentially zero) paragraphs, headings, and lists:
                                      <h2> Quick Summary:
                                      <p> Sample paragraph

                                      <h2> Who was studied? 
                                      <p> Response to who was studied

                                      <h2> What was studied?
                                      <p> Response to what was studied

                                      ...repeat for the rest of the Ws + H, as well as for Criteria, Critique, and Conclusion. Essentially, start any subsequent heading (such as "Conclusion") with an <h2> tags.
                                      The actual response for that heading (such as the actual conclusion) should be lead with a <p>. DO NOT ADD CLOSING TAGS SUCH AS </h2> OR </p>.

                                      <li> Item 1
                                      <li> Item 2
                                      <li> Item 3

                                      <p> Another paragraph
                                      ...etc.

                                      </role>

                                      Here is a paper to analyze: <paper> {text} </paper>
                                
                                      """

    }]) as stream:
    for text in stream.text_stream:
        print(text, end="", flush=True)
        yield text


if __name__ == "__main__":
    app.run(port=8000, debug=True)
