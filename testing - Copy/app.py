from flask import Flask, render_template, request
from datetime import datetime
import os

app = Flask(__name__)

AUDIO_DIR = 'audio'
VIDEO_DIR = 'video'
os.makedirs(AUDIO_DIR, exist_ok=True)
os.makedirs(VIDEO_DIR, exist_ok=True)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/audio')
def audio_page():
    return render_template('audio.html')

@app.route('/video')
def video_page():
    return render_template('video.html')

@app.route('/save-audio', methods=['POST'])
def save_audio():
    audio = request.files['audio']
    now = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"audio_{now}.webm"
    audio.save(os.path.join(AUDIO_DIR, filename))
    return 'Audio Saved'

@app.route('/save-video', methods=['POST'])
def save_video():
    video = request.files['video']
    now = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"video_{now}.webm"
    video.save(os.path.join(VIDEO_DIR, filename))
    return 'Video Saved'

if __name__ == '__main__':
    app.run(debug=True)
