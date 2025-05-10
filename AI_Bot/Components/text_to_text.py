# text_to_text.py
# interview_bot.py

from langchain_core.prompts import ChatPromptTemplate
from langchain.memory import ConversationBufferMemory
from llm_file import LLMClient
from add_history import append_message, read_messages

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
        "content": SYSTEM_PROMPT.format(job_title=job_title, difficulty_level=difficulty_level)
    }
]

def ask_question(history):
    """Generate the next interview question based on the conversation history."""
    response = llm.chat(history)
    history.append({"role": "assistant", "content": response.content})
    return response.content

def receive_answer(history, candidate_input):
    """Add candidate response to history and prepare for the next question."""
    history.append({"role": "user", "content": candidate_input})
    return ask_question(history)

def text_to_text_interview(job_title, difficulty_level, candidate_id, text, filename="interview_log.json"):
    """Conduct a text-based interview with the candidate."""

    all_history = read_messages(filename)

    # Check if candidate history exists, if not create one
    if candidate_id not in all_history:
        print(f"🆕 Creating new session for candidate {candidate_id}")
        
        all_history = {
            candidate_id: [
                {
                    "role": "system",
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
        }
        
    else:
        print(f"📂 Resuming session for candidate {candidate_id}")
        all_history[candidate_id].insert(0, 
                {
                    "role": "assistant",
                    "content": "Welcome to the interview! Please introduce yourself."
                },
                {
                    "role": "user",
                    "content": text
                })

    history = all_history[candidate_id]
    return history, all_history
    # question = ask_question(history)
    # print("🧑 Interviewer:", question)

    # # Candidate response loop
    # while True:
    #     print("🧑‍💻 Candidate: ")
        
    #     user_input = input("🧑‍💻 Candidate: ")
    #     if user_input.lower() == "exit":
    #         print("🧑 Interviewer: Thank you for your time.")
    #         break
    #     history.append({"role": "user", "content": user_input})
    #     ai_reply = receive_answer(history, user_input)
    #     print("🧑 Interviewer:", ai_reply)
    #     history.append({"role": "assistant", "content": ai_reply})

    # # Save updated history
    # all_history[candidate_id] = history
    # append_message("interview_log2.json", all_history)

# text_to_text_interview(job_title = "Machine Learning Engineer (ML Engineer)", difficulty_level = "easy", candidate_id = 102)

# # ---- Example run ----
# if __name__ == "__main__":
#     # First Question
#     print("🧑 Interviewer:", ask_question(history))

#     # Simulate candidate response
#     while True:
#         user_input = input("🧑‍💻 Candidate: ")
#         if user_input.lower() == "exit":
#             print("🧑 Interviewer: Thank you for your time.")
#             break
#         print("🧑 Interviewer:", receive_answer(history, user_input))
        
#     append_message("interview_log.json", history)
