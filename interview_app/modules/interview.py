# interview.py

from flask import Blueprint, request, jsonify, current_app
import os
import base64
import time
from datetime import datetime
import sys
import os

# Add the root directory to sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../')))

import io
from AI_Bot.Components.speech_to_text import speech_text

# with open("1.mp3", "rb") as f:
#     buffer = io.BytesIO(f.read())  # Load file into buffer
#     buffer.seek(0)
#     text = speech_text(buffer)
#     print("\n📝 Transcribed Text:\n", text)

interview_bp = Blueprint('interview', __name__, url_prefix='/interview')

@interview_bp.route('/save-recording', methods=['POST'])
def save_recording():
    """Save the recorded audio and video files"""
    data = request.get_json()
    
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    
    try:
        # Create a unique timestamp for this request
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')

        # Handle individual audio recording
        if 'audio' in data and 'audioIndex' in data:
            # Remove the data URL prefix if it exists
            audio_data = data['audio']
            if ',' in audio_data:
                audio_data = audio_data.split(',')[1]
                
            audio_binary = base64.b64decode(audio_data)
            
            # Create a more detailed filename with the index and question
            question_snippet = ""
            if 'question' in data:
                # Sanitize question for filename
                question_snippet = data['question'][:20].replace(' ', '_').replace('?', '').replace(',', '')
                
            audio_filename = f'interview_audio_{timestamp}_q{data["audioIndex"]}_{question_snippet}.wav'
            audio_path = os.path.join(current_app.config['UPLOAD_FOLDER'], audio_filename)
            
            with open(audio_path, 'wb') as f:
                f.write(audio_binary)
                
            # Return success for individual audio save
            return jsonify({
                'success': True,
                'message': 'Audio recording saved successfully',
                'audioPath': audio_path,
                'timestamp': timestamp
            })
        
        # Handle multiple audio recordings in one go
        if 'allAudio' in data:
            saved_audio_paths = []
            
            for index, audio_data in data['allAudio'].items():
                if audio_data:
                    # Remove the data URL prefix if it exists
                    if ',' in audio_data:
                        audio_data = audio_data.split(',')[1]
                        
                    audio_binary = base64.b64decode(audio_data)
                    
                    
                    text = speech_text(audio_binary)
                    print("\n📝 Transcribed Text:\n", text)

                    audio_filename = f'interview_audio_{timestamp}_response{index}.wav'
                    audio_path = os.path.join(current_app.config['UPLOAD_FOLDER'], audio_filename)
                    
                    with open(audio_path, 'wb') as f:
                        f.write(audio_binary)
                        
                    saved_audio_paths.append(audio_path)
        
        # Save video recording
        video_path = None
        if 'video' in data:
            # Remove the data URL prefix if it exists
            video_data = data['video']
            if ',' in video_data:
                video_data = video_data.split(',')[1]
                
            video_binary = base64.b64decode(video_data)
            
            video_filename = f'interview_video_{timestamp}.wav'
            video_path = os.path.join(current_app.config['UPLOAD_FOLDER'], video_filename)
            
            with open(video_path, 'wb') as f:
                f.write(video_binary)
        
        # Create a metadata file if this is the final submission
        if data.get('isFinal', False) and video_path:
            metadata_filename = f'interview_metadata_{timestamp}.json'
            metadata_path = os.path.join(current_app.config['UPLOAD_FOLDER'], metadata_filename)
            
            metadata = {
                'timestamp': timestamp,
                'video_path': video_path,
                'audio_recordings': saved_audio_paths if 'allAudio' in data else []
            }
            
            with open(metadata_path, 'w') as f:
                import json
                json.dump(metadata, f, indent=2)
        
        return jsonify({
            'success': True,
            'message': 'Recordings saved successfully',
            'timestamp': timestamp
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@interview_bp.route('/questions', methods=['GET'])
def get_questions():
    """Return a list of interview questions"""
    # In a real app, these would come from a database
    questions = [
        "Tell me about yourself.",
        "What are your strengths and weaknesses?",
        "Why do you want to work for this company?",
        "Where do you see yourself in five years?",
        "Describe a challenging situation you faced and how you handled it."
    ]
    return jsonify(questions)