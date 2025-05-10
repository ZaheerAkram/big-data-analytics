# text_to_speech.py

import asyncio
import edge_tts # type: ignore
import pygame # type: ignore
import os
import uuid

async def text_speech(prompt: str, voice: str = "en-GB-RyanNeural"):
    """
    Convert text to speech using Microsoft Edge TTS and play it with pygame.

    Args:
        prompt (str): The text to convert to speech.
        voice (str): The voice ID (e.g., "en-US-AriaNeural", "ur-PK-AsadNeural").
    """
    try:
        # Initialize pygame mixer
        pygame.mixer.init()
        
        # Ensure the Audio directory exists
        os.makedirs("Audio", exist_ok=True)

        # Set temporary output filename with unique identifier
        filename = os.path.join("Audio", f"tts_output_{uuid.uuid4().hex}.mp3")

        # Generate speech using Edge TTS
        communicate = edge_tts.Communicate(text=prompt, voice=voice)
        await communicate.save(filename)

        # Play audio
        pygame.mixer.music.load(filename)
        pygame.mixer.music.play()

        # Wait until playback is done
        while pygame.mixer.music.get_busy():
            await asyncio.sleep(0.1)

        # Clean up by stopping music and removing the file
        pygame.mixer.music.stop()
        pygame.mixer.quit()  # <- This releases the file

        os.remove(filename)

    except Exception as e:
        print(f"❌ Error during text-to-speech: {e}")

async def main():
    prompt = "This is a fast and natural voice using Edge TTS from Microsoft."
    
    voices = [
        "en-GB-RyanNeural",  # UK male
        "en-US-AriaNeural",  # US female
        "ur-PK-AsadNeural",  # Urdu male
        "ur-PK-GulNeural"    # Urdu female
    ]
    
    for voice in voices:
        await text_speech(prompt, voice=voice)

# Run the async function
# asyncio.run(main())
