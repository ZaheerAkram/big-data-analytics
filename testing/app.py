from flask import Flask, request
from datetime import datetime
import os

app = Flask(__name__)

AUDIO_DIR = 'audio'
os.makedirs(AUDIO_DIR, exist_ok=True)

@app.route('/')
def index():
    return open('index.html').read()

@app.route('/save-audio', methods=['POST'])
def upload():
    audio = request.files['audio']
    now = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"chunk1_{now}.wav"
    filepath = os.path.join(AUDIO_DIR, filename)
    audio.save(filepath)
    return 'OK'

if __name__ == '__main__':
    app.run(debug=True)
