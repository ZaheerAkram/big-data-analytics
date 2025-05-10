# text_to_speech.py

import asyncio
import edge_tts # type: ignore
import os
import uuid
from datetime import datetime

async def text_speech(prompt: str, voice: str = "en-GB-RyanNeural") -> str:
    """
    Convert text to speech using Microsoft Edge TTS and return the file name.

    Args:
        prompt (str): The text to convert to speech.
        voice (str): The voice ID (e.g., "en-US-AriaNeural", "ur-PK-AsadNeural").

    Returns:
        str: The name of the generated MP3 file.
    """
    try:
        # Get the current file's directory and navigate to interview_app/uploads/questions
        current_dir = os.path.dirname(os.path.abspath(__file__))
        interview_app_dir = os.path.abspath(os.path.join(current_dir, "..", "..", ".."))
        upload_dir = os.path.join(interview_app_dir, "uploads", "questions")
        os.makedirs(upload_dir, exist_ok=True)

        # Generate filename with current date and time
        current_time = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"audio_{current_time}.mp3"
        full_path = os.path.join(upload_dir, filename)

        # Generate speech using Edge TTS
        communicate = edge_tts.Communicate(text=prompt, voice=voice)
        await communicate.save(full_path)

        return filename

    except Exception as e:
        print(f"Error during text-to-speech: {e}")
        return ""

async def main():
    prompt = "This is a fast and natural voice using Edge TTS from Microsoft."
    
    voices = [
        "en-GB-RyanNeural",  # UK male
        "en-US-AriaNeural",  # US female
        "ur-PK-AsadNeural",  # Urdu male
        "ur-PK-GulNeural"    # Urdu female
    ]
    
    # for voice in voices:
    #     file_path = await text_speech(prompt, voice=voice)
    #     print(f"Generated audio file: {file_path}")
    
    file_path = await text_speech(prompt)
    print(f"Generated audio file: {file_path}")

# Run the async function
asyncio.run(main())
