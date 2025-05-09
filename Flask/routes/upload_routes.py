from fastapi import APIRouter, UploadFile, File
from apis.audio_reciever import save_audio_file

router = APIRouter()

@router.post("/upload")
async def upload_audio(audio: UploadFile = File(...)):
    return await save_audio_file(audio)
