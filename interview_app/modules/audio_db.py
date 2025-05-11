import boto3
import os

def upload_audio_to_s3(file_path, user_id, bucket_name = "interviewchatbot"):
    # Extract file name and extension
    file_name = os.path.basename(file_path)
    _, ext = os.path.splitext(file_name)
    
    # Validate extension
    if ext.lower() not in [".mp3", ".wav", ".m4a", "webm"]:
        print(f"Unsupported audio format: {ext}")
        return

    # Construct S3 key: audios/user_id/file_name
    s3_key = f"audios/{user_id}/{file_name}"

    # Create an S3 client
    s3 = boto3.client('s3')

    try:
        # Check if file already exists in S3 bucket
        response = s3.list_objects_v2(Bucket=bucket_name, Prefix=s3_key)
        
        if 'Contents' in response:
            print(f"File {file_name} already exists in S3 bucket. Skipping upload.")
        else:
            # Upload the file
            s3.upload_file(file_path, bucket_name, s3_key)
            print(f"Uploaded {file_name} to s3://{bucket_name}/{s3_key}")

    except Exception as e:
        print(f"Failed to upload file: {e}")

# Example usage
# upload_audio_to_s3("sample.mp3", "user_2", "interviewchatbot")
