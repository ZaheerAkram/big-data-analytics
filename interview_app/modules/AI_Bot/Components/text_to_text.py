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
    all_history = read_messages(file_name)
    print("Searching for candidate:", candidate_id)
    
    # Check if candidate history exists, if not create one
    history = None
    for record in all_history:
        if str(candidate_id) in record:
            history = record[str(candidate_id)]
            print(f"Found existing history for candidate {candidate_id}")
            history.append({"role": "user", "content": text})
            return history, all_history

    # If we get here, no existing history was found
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
    new_record = {str(candidate_id): history}
    all_history.append(new_record)
    return history, all_history


def main():
    job_title = "Machine Learning Engineer (ML Engineer)"
    difficulty_level = "easy"
    candidate_id = 110
    
    history, all_history = text_to_text_interview(job_title, difficulty_level, candidate_id, "hi how are you")
    
    question = ask_question(history)
    print("Interviewer:", question)

