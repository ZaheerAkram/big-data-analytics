import os
import shutil

AUDIO_DIR = "audio"

async def save_audio_file(audio_file):
    if not os.path.exists(AUDIO_DIR):
        os.makedirs(AUDIO_DIR)

    save_path = os.path.join(AUDIO_DIR, audio_file.filename)
    
    with open(save_path, "wb") as buffer:
        shutil.copyfileobj(audio_file.file, buffer)

    return {"status": "success", "filename": audio_file.filename}
