# interview.py

from flask import Blueprint, request, jsonify, current_app, render_template
import os
import base64
import time
from datetime import datetime
import sys
import os
import threading
import asyncio
import json

# Add the root directory to sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../')))

import io
from .AI_Bot.Components.speech_to_text import speech_text
from .AI_Bot.Components.text_to_text import text_to_text_interview, ask_question
from .AI_Bot.Components.text_to_speech import text_speech
from .AI_Bot.Components.add_history import append_message, read_messages

interview_bp = Blueprint('interview', __name__, url_prefix='/interview')

@interview_bp.route('/')
def interview():
    """Render the interview page"""
    system_audio_path = "system.mp3"  # The system audio file in uploads directory
    return render_template('interview.html', system_audio_path=system_audio_path)

@interview_bp.route('/save-video', methods=['POST'])
def save_video():
    """Save the video recording"""
    try:
        data = request.get_json()
        if not data or 'video' not in data:
            return jsonify({'success': False, 'error': 'No video data provided'})

        # Decode base64 video data
        video_data = base64.b64decode(data['video'])
        
        # Create filename with timestamp
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f'video_{timestamp}.webm'
        
        # Ensure upload directory exists
        upload_dir = os.path.join(current_app.config['UPLOAD_FOLDER'], 'video')
        os.makedirs(upload_dir, exist_ok=True)
        
        # Save the video file
        filepath = os.path.join(upload_dir, filename)
        with open(filepath, 'wb') as f:
            f.write(video_data)
        
        return jsonify({
            'success': True,
            'message': 'Video saved successfully',
            'filename': filename
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        })
        
@interview_bp.route('/save-audio', methods=['POST'])
def save_audio():
    audio = request.files['audio']
    now = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"chunk1_{now}.wav"
    
    print("audio transfered for conversion")
    # Convert audio to text
    text = speech_text(audio)
    print("audio converted to text: ", text)
    
    upload_dir = os.path.join(current_app.config['UPLOAD_FOLDER'], 'audio')
    os.makedirs(upload_dir, exist_ok=True)
    
    filepath = os.path.join(upload_dir, filename)
    audio.save(filepath)
    return jsonify({'success': True, 'text': text})

@interview_bp.route('/generate-question', methods=['POST'])
def generate_question():
    
    job_title = "Machine Learning Engineer (ML Engineer)"
    difficulty_level = "easy"
    candidate_id = "110"
    file_name = "interview_log.json"
    
    try:
        data = request.get_json()
        if not data or 'text' not in data:
            return jsonify({'success': False, 'error': 'No text data provided'})
            
        human_text = data['text']
        
        history, all_history = text_to_text_interview(job_title, difficulty_level, candidate_id, human_text, file_name)
        print("history: ", history)
        print("all_history: ", all_history)
    
        question = ask_question(history)
        print("Interviewer:", question)
        
        history.append({"role": "assistant", "content": question})
        
        # Save updated history
        # Find and update the existing record
        found = False
        for record in all_history:
            if str(candidate_id) in record:
                record[str(candidate_id)] = history
                found = True
                break
        
        # If no existing record found, create a new one
        if not found:
            all_history.append({str(candidate_id): history})
            
        # Save the entire history as a single update
        with open("ChatData/interview_log.json", 'w', encoding='utf-8') as f:
            json.dump(all_history, f, indent=4, ensure_ascii=False)
        
        # Convert question to speech using asyncio
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        question_audio_path = loop.run_until_complete(text_speech(question))
        loop.close()
        
        # For now, just echo back the text
        return jsonify({
            'success': True,
            'text': question,
            'audio_path': question_audio_path
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        })
