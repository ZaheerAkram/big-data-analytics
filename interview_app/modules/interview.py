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
        
        # Log upload folder path
        print(f"Upload folder: {current_app.config['UPLOAD_FOLDER']}")
        
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
                
            audio_filename = f'interview_audio_{timestamp}_q{data["audioIndex"]}_{question_snippet}.webm'
            audio_path = os.path.join(current_app.config['UPLOAD_FOLDER'], 'audio', audio_filename)
            
            # Ensure audio directory exists
            os.makedirs(os.path.dirname(audio_path), exist_ok=True)
            
            print(f"Saving audio to: {audio_path}")
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
                    
                    # Create audio directory if it doesn't exist
                    audio_dir = os.path.join(current_app.config['UPLOAD_FOLDER'], 'audio')
                    os.makedirs(audio_dir, exist_ok=True)
                    
                    audio_filename = f'interview_audio_{timestamp}_response{index}.webm'
                    audio_path = os.path.join(audio_dir, audio_filename)
                    
                    print(f"Saving audio to: {audio_path}")
                    with open(audio_path, 'wb') as f:
                        f.write(audio_binary)
                        
                    saved_audio_paths.append(audio_path)
            
            return jsonify({
                'success': True,
                'message': 'All audio recordings saved successfully',
                'audioPaths': saved_audio_paths,
                'timestamp': timestamp
            })
        
        # Save video recording
        video_path = None
        if 'video' in data:
            # Remove the data URL prefix if it exists
            video_data = data['video']
            if ',' in video_data:
                video_data = video_data.split(',')[1]
                
            video_binary = base64.b64decode(video_data)
            
            # Create video directory if it doesn't exist
            video_dir = os.path.join(current_app.config['UPLOAD_FOLDER'], 'video')
            os.makedirs(video_dir, exist_ok=True)
            
            video_filename = f'interview_video_{timestamp}.webm'
            video_path = os.path.join(video_dir, video_filename)
            
            print(f"Saving video to: {video_path}")
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
            
            print(f"Saving metadata to: {metadata_path}")
            with open(metadata_path, 'w') as f:
                import json
                json.dump(metadata, f, indent=2)
        
        return jsonify({
            'success': True,
            'message': 'Recordings saved successfully',
            'timestamp': timestamp
        })
        
    except Exception as e:
        print(f"Error saving recording: {str(e)}")
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

@interview_bp.route('/save-audio-chunk', methods=['POST'])
def save_audio_chunk():
    """Save an audio chunk from the interview"""
    try:
        data = request.get_json()
        if not data or 'audio' not in data:
            return jsonify({'success': False, 'error': 'No audio data provided'})

        # Get the audio data and metadata
        audio_data = data['audio']
        index = data.get('index', 0)
        timestamp = data.get('timestamp', int(time.time() * 1000))
        
        # Remove the data URL prefix if it exists
        if ',' in audio_data:
            audio_data = audio_data.split(',')[1]
            
        # Decode base64 audio data
        audio_binary = base64.b64decode(audio_data)
        
        # Create a directory structure for this interview session
        # Format: audio/[date]/[interview_id]/chunks/
        date_str = datetime.fromtimestamp(timestamp/1000).strftime('%Y%m%d')
        interview_id = datetime.fromtimestamp(timestamp/1000).strftime('%H%M%S')
        
        # Create the directory path
        chunk_dir = os.path.join(
            current_app.config['UPLOAD_FOLDER'],
            'audio',
            date_str,
            f'interview_{interview_id}',
            'chunks'
        )
        os.makedirs(chunk_dir, exist_ok=True)
        
        # Create filename with timestamp and index
        chunk_time = datetime.fromtimestamp(timestamp/1000).strftime('%H%M%S_%f')
        filename = f'chunk_{chunk_time}_index{index}.webm'
        
        # Save the audio chunk
        filepath = os.path.join(chunk_dir, filename)
        with open(filepath, 'wb') as f:
            f.write(audio_binary)
        
        # Log the save operation
        print(f"Saved audio chunk to: {filepath}")
        
        return jsonify({
            'success': True,
            'message': 'Audio chunk saved successfully',
            'filename': filename,
            'path': filepath
        })
        
    except Exception as e:
        print(f"Error saving audio chunk: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        })

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