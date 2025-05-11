# interview.py

from flask import Blueprint, request, jsonify, current_app, render_template, session, redirect, url_for, flash
import os
import base64
import time
from datetime import datetime
import sys
import os
import threading
import asyncio
import json
from .audio_db import upload_audio_to_s3
from .video_db import upload_video_to_s3
from .questions_db import upload_data_to_dynamodb

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
    if 'user_id' not in session:
        flash('Please log in to access the interview.', 'error')
        return redirect(url_for('auth.login'))
        
    system_audio_path = "system.mp3"  # The system audio file in uploads directory
    return render_template('main/interview.html', system_audio_path=system_audio_path, session=session)

@interview_bp.route('/schedule_interview', methods=['POST'])
def schedule_interview():
    """Schedule an interview"""
    if request.method == 'POST':
        title = request.form.get('title')
        department = request.form.get('department')
        difficulty = request.form.get('difficulty')
        
        # Store values in session
        session['title'] = title
        session['department'] = department
        session['difficulty_level'] = difficulty
                
        print("Interview Title:", title)
        print("Department:", department)
        print("Difficulty Level:", difficulty)
        
        # You can process or store the data here
        
        return redirect(url_for('interview.interview'))  # redirect or render success message
    return render_template('main/interview_menu.html')


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
        
        # Upload the video file to S3
        try:
            upload_video_to_s3(filepath, session['user_id'])
            print(f"Uploaded video to S3: {filepath}")
        except Exception as e:
            print(f"Error uploading video to S3: {e}")
            return jsonify({'success': False, 'error': 'Failed to upload video to S3'})
        
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
    filename = f"chunk1_{now}.webm"
    
    print("audio transfered for conversion")
    # Convert audio to text
    text = speech_text(audio)
    print("audio converted to text: ", text)
    
    upload_dir = os.path.join(current_app.config['UPLOAD_FOLDER'], 'audio')
    os.makedirs(upload_dir, exist_ok=True)
    
    # Save the audio file to Aws S3
    
    filepath = os.path.join(upload_dir, filename)
    audio.save(filepath)
    
    try:
        upload_audio_to_s3(filepath, session['user_id'])
    except Exception as e:
        print(f"Error uploading audio to S3: {e}")
        
    return jsonify({'success': True, 'text': text})

@interview_bp.route('/generate-question', methods=['POST'])
def generate_question():   
    # print("Generating question...")
    # print("job_title: ", job_title)
    # print("difficulty_level: ", difficulty_level)
        
    job_title = session.get('title', 'Software Engineer')
    difficulty_level = session.get('difficulty_level', 'Easy')
    candidate_id = session['user_id']
    file_name = "interview_log.json"
    file_path = "ChatData/" + file_name
    
    
    try:
        data = request.get_json()
        if not data or 'text' not in data:
            return jsonify({'success': False, 'error': 'No text data provided'})
            
        human_text = data['text']
        
        history, all_history = text_to_text_interview(job_title, difficulty_level, candidate_id, human_text, file_name)
        # print("history: ", history)
        # print("all_history: ", all_history)
    
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
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(all_history, f, indent=4, ensure_ascii=False)
        
        # Upload the updated history to DynamoDB
        try:
            upload_data_to_dynamodb(all_history)
            print("Uploaded updated history to DynamoDB")
        except Exception as e:
            print(f"Error uploading updated history to DynamoDB: {e}")
        
        # Convert question to speech using asyncio
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        question_audio_path = loop.run_until_complete(text_speech(question))
        loop.close()
        
        # Save the audio file to AWS S3
        try:
            upload_audio_to_s3(question_audio_path, session['user_id'])
            print(f"Uploaded question audio to S3: {question_audio_path}")
        except Exception as e:
            print(f"Error uploading question audio to S3: {e}")
        
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



