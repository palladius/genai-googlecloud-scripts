#!/usr/bin/env python

#  pip install ipdb

APP_VERSION = '1.2'

import socketserver
from http.server import BaseHTTPRequestHandler, HTTPServer
#import asyncio
import vertexai
import requests
#import sockets
import socket
#import thread
import socketserver
import threading
import traceback

from dotenv import load_dotenv  # Import dotenv
load_dotenv()

from vertexai.generative_models import (
    Content,
    FunctionDeclaration,
    GenerativeModel,
    GenerationConfig,
    Part,
    Tool,
    ToolConfig,
)
import os
import sys

script_dir = os.path.dirname(os.path.abspath(__file__))
#print(script_dir)
project_root = os.path.dirname(script_dir)
#print(f"project_root: {project_root}")
sys.path.append(project_root)

from lib.py.openmeteo import * # get_weather_forecast
from lib.py.gemini import *
from lib.py.ricc_datetime import ricc_datetime, get_datetime_func
from lib.py.colors import *

# Access environment variables
GCP_PROJECT = os.getenv("GCP_PROJECT", None) # no sensible default. crashes if missing
GCP_PROJECT_LOCATION = os.getenv("GCP_PROJECT_LOCATION", 'us-central1')
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-1.5-flash-002")
PORT = int(os.getenv("PORT", 8080))  # Convert PORT to an integer
DEBUG = os.getenv("DEBUG", "fAlSe").lower() == "true"

CODE_LINK = 'https://github.com/palladius/genai-googlecloud-scripts/blob/main/20-multilang-agents/README.md'
SERVICE_NAME=f"Gemini OSS whelper (weather-helper) powered by '{GEMINI_MODEL}' 🧵 thread-safe TCP-server" #and ⚟
APP_SHORT = f"OSS whelper v{APP_VERSION}"

if GCP_PROJECT is None:
    raise Exception("Sorry, GCP_PROJECT is null, either define in .env or set it manually with: GCP_PROJECT=... <this script>")
else:
    print(f"{colored_gemini()} VertexAI configured with GCP_PROJECT={yellow(GCP_PROJECT)}, GCP_PROJECT_LOCATION={orange(GCP_PROJECT_LOCATION)}")
    #exit(0)

tourism_tool = Tool(function_declarations=[
    get_location_data_func,
    get_weather_forecast_func,
    get_datetime_func,
    ])

# Initialize an empty string to store the cached content
cached_content = ""

def deb(str):
    if DEBUG:
        color_text = colorize(str, 'dark_gray')
        print(f"[DEB] {color_text}")

def handle_client(client_socket, send_funcall_via_tcp=True, debug=DEBUG):
    '''Riccardo sta funzione lha fatta gemini async ma si impappinava allora lho resa sync.
    non credo cached-content ci serva, ogni thread ha vita propria.'''
    #global cached_content
    client_ip, client_port = client_socket.getpeername()  # Get client IP and port

    print(f"🧦 New connection from {client_ip}:{client_port}: instancing a gemini chat")
    #model, chat = get_weather_model_and_chat("Outside of main. Should be after ACCEPT()")
    model = GenerativeModel(GEMINI_MODEL,
                            generation_config=GenerationConfig(temperature=0.1),
                            tools=[tourism_tool],
    )
    chat = model.start_chat()
    deb(f"👋 Sending Welcome message to client in {client_ip}:{client_port}")
    welcome_message = f"👋 Welcome to: {cyan(SERVICE_NAME)}, powered by ♊︎ (v{APP_VERSION})\nCode available: {CODE_LINK}\n"
    client_socket.sendall((welcome_message).encode("utf-8")) # cyan

    cached_content = ""
    while True:
        try:
            data = client_socket.recv(1024).decode("utf-8")
            if not data:  # Client closed the connection
                break

            for char in data:
                if char == '\r':
                    # Wait and see if next char is \n
                    sleep(0.1)
                    continue
                if char == '\n':
                    # Generate a response from Gemini
                    prompt = cached_content
                    # if empty
                    if prompt == "":
                        if debug:
                            print("[ɛ] Empty content - skipping")
                        cached_content = ''
                        continue
                    response = call_gemini_api(chat, prompt)

                    deb(f"Response from Riccardo/Gemini call: ```{response}```")

                    if 'ricc_function_call_text' in response:
                        # [fun_call]
                        # code for FunCall
                        #funcall_tcp_response = f"<funcall_response>\n  {response['ricc_function_call_text']}\n</funcall_response>\n"
                        funcall_tcp_response = f"🧩 {response['ricc_function_call_text']}\n"
                        if send_funcall_via_tcp:
                            client_socket.sendall(funcall_tcp_response.encode("utf-8"))
                    else:
                        # [model] sth else
                        gemini_response = response['ricc_gemini_response'].text
                        gemini_tcp_response = f"🤖✨ {gemini_response}\n"
                        client_socket.sendall(gemini_tcp_response.encode("utf-8"))

                        #import ipdb; ipdb.set_trace()


                    #total_token_count = response.usage_metadata.total_token_count
                    #print(f"[DEB] $$ TokenCount so far: {total_token_count}")
                    # print(f"[DEB] candidates.content.role so far: {response.candidates[0].content.role}")

                    # # copied from https://ai.google.dev/gemini-api/docs/function-calling/tutorial?lang=python
                    # fun_call_signature = None
                    # for part in response.candidates[0].content.parts:
                    #     if fn := part.function_call:
                    #         args = ", ".join(f"{key}='{val}'" for key, val in fn.args.items())
                    #         fun_call_signature = f"{fn.name}({args})"
                    #         print(f"[FN_CALL] Calling function: #{fun_call_signature}")

                    # print(f"[ricc deb] response.candidates[0].content.parts[0]: {response.candidates[0].content.parts[0]}")


                    # # Handle function calls
                    # # <class 'vertexai.generative_models._generative_models.Part'>
                    # part_dict = response.candidates[0].content.parts[0].to_dict()
                    # # if FunCall =>
                    # #ipdb> response.candidates[0].content.parts[0].to_dict().keys()
                    # #dict_keys(['function_call'])

                    # #if "function_call" in response.candidates[0].content.parts[0]["function_call"]: # .get("function_call"):
                    # if "function_call" in part_dict:
                    #     #function_name = response.candidates[0].content.parts[0]["function_call"]["name"]
                    #     #function_args = response.candidates[0].content.parts[0]["function_call"]["args"]

                    #     # Call your fun_call function here
                    #     #function_response = fun_call(function_name, function_args)  # Assuming you have a fun_call function
                    #     if send_funcall_via_tcp:
                    #         print(f"Lets tell our user which function we're calling: {fun_call_signature}")
                    #         tcp_message = f"<!-- OUTBOUND FUN_CALL: {fun_call_signature} -->\n"
                    #         client_socket.sendall(tcp_message.encode("utf-8"))
                    #         print(f"Full response: \n==================\n{response}\n==================\n")
                    #     # TODO get answer
                    #     # client_socket.sendall(function_response.encode("utf-8"))
                    # else:
                    #     # If not a function call, send the regular response text
                    #     client_socket.sendall(response.text.encode("utf-8"))


                    deb("Chat iteration done. Let's continue and reset the cached content")
                    if debug:
                        print("[deb obsolete] Chat iteration done. Let's continue and reset the cached content")
                    cached_content = ""
                    continue
                cached_content += char

        except Exception as e:
            print(f"🚨 Generic Error ({e.__class__}) handling client: {e}")
            traceback.print_exc()  # Print the full traceback
            #break          # debug
            continue        # real world - more riobust
    #print("🧦 Conversatoon is over => closing the socket")
    print(f"🧦 [{APP_SHORT}] CLOSING connection with {client_ip}:{client_port}")
    client_socket.close()


def main_monolith():
    server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    server_socket.bind(("localhost", PORT))
    server_socket.listen(5) # 5 contemporary

    print(f"[SYNC-v2] Gemini Weather-helper powered by '{GEMINI_MODEL}' TCP server listening on port {PORT}...")

    while True:
        client_socket, addr = server_socket.accept()  # Synchronous accept
        print(f"Accepted connection from {addr}")
        handle_client(client_socket)  # Synchronous handle_client call

# if __name__ == "__main__":
#     main()  # No need for asyncio.run()




# class MyTCPHandler(socketserver.BaseRequestHandler):
#     """
#     The RequestHandler class for our server.

#     It is instantiated once per connection to the server, and must
#     override the handle() method to implement communication to the
#     client.
#     """
#     def handle_gemini(self):
#         print("Handle handle_gemini...")
#         # How do I compute the client socket?!?
#         client_socket = self.request  # Get the client socket from self.request
#         handle_client(client_socket, send_funcall_via_tcp=True, debug=DEBUG)

#     def handle(self):
#         print("Handle normale vediamo se va in PARALLELO...")
#         while True:
#             # self.request is the TCP socket connected to the client
#             self.data = self.request.recv(1024).strip()
#             print("{} wrote:".format(self.client_address[0]))
#             print(self.data)
#             # just send back the same data, but upper-cased
#             self.request.sendall(self.data.upper())
#             print(f"E ancora... client_socket = self.request {self.request}")

#     #def handle():


# if __name__ == "__main__":
#     HOST = "localhost"
#     #HOST, PORT = "localhost", 9998
#     print(f"* Ascolto MULTIPLO su port {PORT}")

#     # Create the server, binding to localhost on port 9998
#     server = socketserver.TCPServer((HOST, PORT), MyTCPHandler)

#     # Activate the server; this will keep running until you
#     # interrupt the program with Ctrl-C
#     server.serve_forever()

#HOST, PORT = "localhost", 9998
HOST = "localhost"

class ThreadedTCPRequestHandler(socketserver.BaseRequestHandler):
    def handle(self):
        print(f"[{APP_SHORT}] 🧵 [handle] ThreadedTCPRequestHandler self: {self}")
        client_socket = self.request
        handle_client(client_socket, send_funcall_via_tcp=True, debug=DEBUG)


class ThreadedTCPServer(socketserver.ThreadingMixIn, socketserver.TCPServer):
    pass

if __name__ == "__main__":
    print(f"[{APP_SHORT}] 🧵 MAIN: Threaded super-duper thingy listening on PORT={PORT}")
    server = ThreadedTCPServer((HOST, PORT), ThreadedTCPRequestHandler)
    with server:
        ip, port = server.server_address
        server_thread = threading.Thread(target=server.serve_forever)
        server_thread.daemon = True  # Exit the server thread when the main thread terminates
        server_thread.start()
        print(f"[{APP_SHORT}] Server loop running in 🧵 thread:", server_thread.name)
        server.serve_forever()




# [er metterne 5...]


# if __name__ == "__main__":
#     server = ThreadedTCPServer((HOST, PORT), ThreadedTCPRequestHandler)
#     server.server_bind()  # Explicitly bind the socket
#     server.server_activate()  # Activate the server
#     server.listen(MAX_ACCEPT_SOCKETS)  # Set the backlog
#     # ... (rest of your server code) ...
