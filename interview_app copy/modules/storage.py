import os
from flask import current_app
import json

class InterviewStorage:
    @staticmethod
    def save_interview_metadata(candidate_id, video_path, audio_path, responses):
        """Save interview metadata to a JSON file"""
        timestamp = os.path.basename(video_path).split('_')[2].split('.')[0]
        
        metadata = {
            'candidate_id': candidate_id,
            'timestamp': timestamp,
            'video_path': video_path,
            'audio_path': audio_path,
            'responses': responses
        }
        
        metadata_file = os.path.join(
            current_app.config['UPLOAD_FOLDER'], 
            f'interview_metadata_{candidate_id}_{timestamp}.json'
        )
        
        with open(metadata_file, 'w') as f:
            json.dump(metadata, f)
        
        return metadata_file