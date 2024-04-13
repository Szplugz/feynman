from urllib import request
from flask import Flask, request, jsonify, Response, stream_with_context
import base64
import requests
import os
import json
from dotenv import load_dotenv
from io import BytesIO

from re import template

import pydantic

from langchain.prompts import PromptTemplate
from langchain_core.output_parsers import JsonOutputParser
from langchain_core.pydantic_v1 import BaseModel, Field
from langchain_anthropic import ChatAnthropic

from typing import List, Union, Optional
from pypdf import PdfReader

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
        file_contents = file.read() # convert to bytes
        # r = get_claude_response(file_contents)
        r = Response(stream_with_context(get_claude_response(file_contents)), content_type="application/json")
        r.headers["Content-Encoding"] = "none"
        return r
    else:
        return jsonify({"error": "File not found"}), 400


# Function to encode the image
def encode_image(image_path):
    with open(image_path, "rb") as image_file:
        return base64.b64encode(image_file.read()).decode('utf-8')


def get_claude_response(file):

    model = ChatAnthropic(model='claude-3-opus-20240229')

    # The structure of the response is defined by the pydantic ResponseModel object
    # Each part of the response is a ContentItem
    class ContentItem(BaseModel):
        type: str
        # From my testing, wrapping the list with Optional doesn't change anything, it all comes down to the prompt.
        # Need to find a better way to decide when to use lists, but not a priority right now.
        content: Union[str, Optional[List[str]]] = Field(
            None,
            description=
            "Content of the item, can be a paragraph or a list of items. Only use lists when the content is easier to understand as a list."
        )

    class MetadataItem(BaseModel):
        type: str
        data: str

    class ResponseModel(BaseModel):
        metadata: List[MetadataItem] = Field(
            ...,
            description="Two metadata items, title of paper followed by authors")
        content: List[ContentItem] = Field(
            ...,
            description=
            '''List of content items, each item can be either a paragraph or a list. If the response does not
                naturally evoke the need for a list, the content can consist of just paragraphs.
                ''')

    class Config:
        schema_extra = {
            "example": {
                "metadata": [{
                    "type": "title",
                    "data": "title of paper"
                }, {
                    "type": "authors",
                    "data": "author1, author2, etc"
                }],
                "content": [{
                    "type": "paragraph",
                    "content": "This is a paragraph."
                }, {
                    "type": "list",
                    "content": ["Item 1", "Item 2", "Item 3"]
                }]
            }
        }

    file_like_object = BytesIO(file) # Create an in-memory binary stream to feed into PdfReader
    reader = PdfReader(file_like_object)
    # number_of_pages = len(reader.pages)
    text = ''.join([page.extract_text() for page in reader.pages])
    print(text)

    # sample_query = f"""Here is an academic paper: <paper>{text}</paper> Please do the following:
    # Tell me the title of the paper and list the authors.
    #                                     Summarize the paper at a high school level in a manner that everyone can understand without loss of information. Use only one paragraph. Then state:
    #                                     1. The significance of the findings of this study on our daily lives, if at all.
    #                                     2. The strength of the study, based on the domain of the study. For example, if it is an epidemiological study trying to establish cause and effect,
    #                                     how many of the Bradford Hill criteria does the study match? If it is not an epigemiological study, use the relevant criteria from whatever field the paper belongs to.

    #                                     If the text you recieved is not an academic paper, say so.
    # """

    sample_query = f"""Here is an academic paper: <paper>{text}</paper> Please do the following:
    Tell me the title of the paper and list the authors.
                                        Summarize the paper at a high school level in a manner that everyone can understand without loss of information. Limit your response to a single paragraph with 2 sentences.
    """

    parser = JsonOutputParser(pydantic_object=ResponseModel)

    prompt = PromptTemplate(
        template="Answer the user query.\n{format_instructions}\n{query}\n",
        input_variables=["query"],
        partial_variables={
            "format_instructions": parser.get_format_instructions()
        },
    )

    chain = prompt | model | parser

    # generator just doesn't work sometiomes?
    print('starting generator')
    # def generator():
    #     for s in chain.stream({"query": sample_query}):
    #         print(s)
    #         # Convert the Python object to a JSON string
    #         json_str = json.dumps(s)
    #         # Encode the JSON string to bytes
    #         yield json_str.encode('utf-8')

    for s in chain.stream({"query": sample_query}):
        print("here")
        print(s)
        # Convert the Python object to a JSON string
        json_str = json.dumps(s)
        # Encode the JSON string to bytes
        yield json_str.encode('utf-8')

    print('done generating')
    # return Response(stream_with_context(generator()), content_type="application/json")


if __name__ == "__main__":
    app.run(debug=True)