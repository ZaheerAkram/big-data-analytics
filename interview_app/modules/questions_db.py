import boto3
import json

# Initialize DynamoDB resource
dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('InterviewQA')  # Change to your table name



# Function to read JSON data from a file
def read_json_file(file_path):
    with open(file_path, 'r') as file:
        data = json.load(file)
    return data

# Function to parse and upload data to DynamoDB
def upload_data_to_dynamodb(data):
    for item in data:
        for session_id, conversation in item.items():  # Iterate over each session
            for index, message in enumerate(conversation, start=1):
                try:
                    # Construct the item to upload
                    dynamo_item = {
                        "session_id": session_id,  # Partition key
                        "question_number": index + 1,  # Sort key
                        "role": message["role"],
                        "content": message["content"]
                    }
                    print(f"Session ID: {session_id}")

                    # Upload item to DynamoDB
                    print(f"Uploading item: {dynamo_item}")
                    response = table.put_item(Item=dynamo_item)
                    print(f"Message {index} uploaded successfully!")
                except Exception as e:
                    print(f"Error uploading message {index}: {e}")

# Path to your JSON file
# file_path = 'interview_log.json'  # Replace with your JSON file path

# # Read data from JSON file
# data = read_json_file(file_path)

# Upload data to DynamoDB
# upload_data_to_dynamodb(data)
