# client_send.py
import requests

url = "http://127.0.0.1:8000/upload"
file_path = "../sample.mp3"

with open(file_path, "rb") as f:
    files = {"audio": (file_path, f, "audio/wav")}
    response = requests.post(url, files=files)

print(response.json())
