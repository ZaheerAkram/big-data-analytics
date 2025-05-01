# speech_to_text.py

import os
import io
import numpy as np
import time
import numpy as np # type: ignore
import sounddevice as sd # type: ignore
import soundfile as sf # type: ignore
import requests # type: ignore
import keyboard # type: ignore
from dotenv import load_dotenv # type: ignore

# --- Load API key from .env ---
load_dotenv()
API_KEY = os.getenv("GROQ_API_KEY")

# --- Configuration ---
SAMPLE_RATE = 44100
CHANNELS = 1
AUDIO_FILE = "recording.wav"
API_URL = "https://api.groq.com/openai/v1/audio/transcriptions"

# --- Record audio until 'q' is pressed ---
def record_audio(filename=AUDIO_FILE):
    print("🎙️ Recording... Press 'q' to stop.")
    frames = []

    def callback(indata, *_):
        frames.append(indata.copy())

    with sd.InputStream(samplerate=SAMPLE_RATE, channels=CHANNELS, callback=callback):
        while not keyboard.is_pressed('q'):
            sd.sleep(100)

    audio = np.concatenate(frames, axis=0)
    # sf.write(filename, audio, SAMPLE_RATE)
    # print(f"✅ Audio saved to '{filename}'")
    
    # Save to in-memory buffer
    buffer = io.BytesIO()
    sf.write(buffer, audio, SAMPLE_RATE, format='WAV')
    buffer.seek(0)
    print("✅ Audio captured in memory")
    return buffer


# --- Transcribe audio using Whisper API ---
def speech_text():
    
    buffer = record_audio()
    
    print("⏳ Transcribing audio...")
    start_time = time.time()

    files = {
        'file': ('audio.wav', buffer, 'audio/wav'),
        'model': (None, 'whisper-large-v3')
    }
    headers = {
        'Authorization': f'Bearer {API_KEY}'
    }

    response = requests.post(API_URL, headers=headers, files=files)
    response.raise_for_status()
    duration = time.time() - start_time

    text = response.json().get("text", "")
    print(f"✅ Transcription complete in {duration:.2f} seconds")
    return text

# --- Main Execution ---
def main():
    text = speech_text()
    print("\n📝 Transcribed Text:\n", text)

if __name__ == "__main__":
    main()
