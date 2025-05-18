# add_history.py

import os
import json

def append_message(file_name: str, all_history: list):
    """Writes the entire history to a .json file, ensuring it follows the correct chat format.
    
    Parameters:
    -----------
    file_name: str
        The name of the JSON file to write to.
    all_history: list
        The complete history structure to write to the file.
    """
    file_path = os.path.join("./ChatData", file_name)

    # Ensure the file is a JSON format
    if not file_name.endswith('.json'):
        raise ValueError("Only .json file format is supported for structured chat storage.")

    # Ensure directory exists
    os.makedirs(os.path.dirname(file_path), exist_ok=True)

    # Write the complete history to the file
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(all_history, f, indent=4, ensure_ascii=False)


def read_messages(file_name: str) -> list:
    
    file_path = os.path.join("./ChatData", file_name)

    if os.path.exists(file_path) and os.path.getsize(file_path) > 0:
        with open(file_path, 'r', encoding='utf-8') as f:
            try:
                data = json.load(f)
                if isinstance(data, list):
                    return data
                else:
                    # If it's not a list, wrap it in a list to maintain consistent structure
                    return [data]
            except json.JSONDecodeError:
                print("file not a list")
                return []
    else:
        print("error in opeining file")
        return []

# Example usage
if __name__ == "__main__":
    # Example for interview history structure
    interview_history = [
        {
            "1": [
                {
                    "role": "system",
                    "job_title": "Software Engineer",
                    "content": "You are conducting an interview..."
                },
                {
                    "role": "assistant",
                    "content": "Welcome to the interview! Please introduce yourself."
                },
                {
                    "role": "user",
                    "content": "Hi, I'm a software engineer with 5 years of experience."
                }
            ]
        }
    ]
    
    # Write the interview history
    append_message("interview_log.json", interview_history)
    
    # Read it back
    loaded_history = read_messages("interview_log.json")
    print("Loaded history structure:", json.dumps(loaded_history, indent=2))
    
    