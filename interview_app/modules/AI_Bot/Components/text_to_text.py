# text_to_text.py
# interview_bot.py

from langchain_core.prompts import ChatPromptTemplate
from langchain.memory import ConversationBufferMemory
from .llm_file import LLMClient
from .add_history import append_message, read_messages

# Initialize LLM Client
llm = LLMClient()

# Strict and Professional Interview System Prompt
SYSTEM_PROMPT = """
You are a professional interviewer at a top-tier tech company, such as Google, Microsoft, Amazon, or Apple.

Your role is solely to conduct a technical interview with the candidate, focusing on the given job title and difficulty level.

Guidelines:
- You will only ask questions. Do not provide feedback, explanations, hints, or evaluations.
- Keep the questions short, clear, and professional, consisting of 1 to 2 sentences only.
- Ask follow-up questions or move to relevant next questions based on the candidate's response.
- Encourage the candidate to elaborate on answers if needed, or ask for an example.
- The candidate's responses should be treated as input only, and you will never provide feedback or additional commentary.
- Your tone should remain polite, neutral, and professional.
- If necessary, ask for clarifications or examples without offering feedback on answers.
- **Do NOT offer any feedback or advice** during the interview. **Only ask questions.**

Job Title: {job_title}

Interview Difficulty Level: {difficulty_level}
"""


job_title = "Machine Learning Engineer (ML Engineer)"
difficulty_level = "easy"

# Create conversation history
history = [
    {
        "role": "system",
        "job_title": job_title,
        "content": SYSTEM_PROMPT.format(job_title=job_title, difficulty_level=difficulty_level)
    }
]

def ask_question(history):
    """Generate the next interview question based on the conversation history."""
    response = llm.chat(history)
    return response.content

def receive_answer(history, candidate_input):
    """Add candidate response to history and prepare for the next question."""
    history.append({"role": "user", "content": candidate_input})
    return ask_question(history)



def text_to_text_interview(
    job_title, difficulty_level, candidate_id, text, file_name="interview_log.json"):
    """Conduct a text-based interview with the candidate."""
    candidate_id = str(candidate_id)
    all_history = read_messages(file_name)
    print("Searching for candidate:", candidate_id)
    
    # Check if candidate history exists, if not create one
    candidate_found = False
    candidate_index = -1
    
    # First pass - check if the exact candidate ID AND job title exists
    for i, record in enumerate(all_history):
        if candidate_id in record:
            candidate_found = True
            candidate_index = i
            if job_title in record[candidate_id][0]['job_title']:
                print(f"Found existing history for candidate {candidate_id} with matching job title")
                # Append the new message to the existing history
                all_history[i][candidate_id].append({"role": "user", "content": text})
                return all_history[i][candidate_id], all_history
    
    # If we found the candidate but not with matching job title
    if candidate_found:
        print(f"Candidate {candidate_id} found but job title does not match. Creating new history.")
        history = [
            {
                "role": "system",
                "job_title": job_title,
                "content": SYSTEM_PROMPT.format(job_title=job_title, difficulty_level=difficulty_level)
            },
            {
                "role": "assistant",
                "content": "Welcome to the interview! Please introduce yourself."
            },
            {
                "role": "user",
                "content": text
            }
        ]
        
        # Remove the old record with this candidate ID
        all_history.pop(candidate_index)
        
        # Add the new record
        new_record = {candidate_id: history}
        all_history.append(new_record)
        return history, all_history
    
    # If we get here, no existing history was found at all
    print(f"Creating new session for candidate {candidate_id}")
    history = [
        {
            "role": "system",
            "job_title": job_title,
            "content": SYSTEM_PROMPT.format(job_title=job_title, difficulty_level=difficulty_level)
        },
        {
            "role": "assistant",
            "content": "Welcome to the interview! Please introduce yourself."
        },
        {
            "role": "user",
            "content": text
        }
    ]
    # Create a new record as a dictionary
    new_record = {candidate_id: history}
    all_history.append(new_record)
    return history, all_history




def main():
    job_title = "Machine Learning Engineer (ML Engineer)"
    difficulty_level = "easy"
    candidate_id = 1
    
    history, all_history = text_to_text_interview(job_title, difficulty_level, candidate_id, "hi how are you")
    
    # print("History:", history)
    # print("All History:", all_history)
    
    # question = ask_question(history)
    # print("Interviewer:", question)

# main()


