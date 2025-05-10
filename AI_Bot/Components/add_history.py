# add_history.py

import os
import json

def append_message(file_name: str, message: dict):
    """Appends a structured message to a .json file, ensuring it follows the correct chat format."""
    file_path = os.path.join("./ChatData", file_name)

    # Ensure the file is a JSON format
    if not file_name.endswith('.json'):
        raise ValueError("Only .json file format is supported for structured chat storage.")

    # Ensure directory exists
    os.makedirs(os.path.dirname(file_path), exist_ok=True)

    # Load existing data or initialize an empty list
    if os.path.exists(file_path) and os.path.getsize(file_path) > 0:
        with open(file_path, 'r', encoding='utf-8') as f:
            try:
                data = json.load(f)
                if not isinstance(data, list):
                    raise ValueError("Invalid JSON format. Expected a list.")
            except json.JSONDecodeError:
                data = []
    else:
        data = []

    # Append the new message
    data.append(message)

    # Write back to the file
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=4, ensure_ascii=False)


def read_messages(file_name: str) -> list:
    """Reads messages from a .json file and returns them as a list."""
    file_path = os.path.join("../ChatData", file_name)

    if os.path.exists(file_path) and os.path.getsize(file_path) > 0:
        with open(file_path, 'r', encoding='utf-8') as f:
            try:
                data = json.load(f)
                if not isinstance(data, list):
                    raise ValueError("Invalid JSON format. Expected a list.")
                return data
            except json.JSONDecodeError:
                return []
    else:
        return []

# Example usage
if __name__ == "__main__":
    append_message("log.json", {"role": "system", "content": "Hello! I am your assistant."})
    append_message("log.json", {"role": "user", "content": "Can you create a job description?"})
    append_message("log.json", {"role": "assistant", "content": "Sure! Would you like to use a template or create a new one?"})
