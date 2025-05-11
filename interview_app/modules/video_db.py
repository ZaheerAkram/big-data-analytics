import boto3
import os

def upload_video_to_s3(file_path, user_id, bucket_name = "interviewchatbot"):
    # Extract file name and extension
    file_name = os.path.basename(file_path)
    _, ext = os.path.splitext(file_name)

    # Validate extension
    if ext.lower() not in [".mp4", ".avi", ".mov", ".mkv"]:
        print(f"Unsupported video format: {ext}")
        return

    # Construct S3 key: videos/<user_id>/<file_name>
    s3_key = f"videos/{user_id}/{file_name}"

    # Create an S3 client
    s3 = boto3.client('s3')

    try:
        # Check if the user folder exists and the file is already uploaded
        response = s3.list_objects_v2(Bucket=bucket_name, Prefix=f"videos/{user_id}/")

        # Check if file already exists
        file_exists = False
        if 'Contents' in response:
            for content in response['Contents']:
                if content['Key'] == s3_key:
                    file_exists = True
                    break

        if file_exists:
            print(f"File {file_name} already exists in S3 bucket under {s3_key}. Skipping upload.")
        else:
            # Upload the file
            s3.upload_file(file_path, bucket_name, s3_key)
            print(f"Uploaded {file_name} to s3://{bucket_name}/{s3_key}")

    except Exception as e:
        print(f"Failed to upload file: {e}")

# Example usage
# upload_video_to_s3("user_3.mp4", "user_3", "interviewchatbot")
# upload_video_to_s3("interview_video.mp4", "fatima", "interviewchatbot")
