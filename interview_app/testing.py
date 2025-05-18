# evaluate_response.py

from add_history import read_messages, append_message
from llm_file import LLMClient

llm = LLMClient()

SYSTEM_PROMPT = """
You are a professional technical interviewer at a top-tier tech company, such as Google, Microsoft, Amazon, or Apple.

Your task is to evaluate the candidate's answers based on their correctness and clarity. After each answer:
- Score the candidate's response from 1 to 10 based on accuracy.
- Provide feedback on whether the answer is "correct" or "incorrect."
- Provide the actual correct answer in the concise way as should be answered in the interview.

Your tone should remain professional and neutral, without giving unnecessary feedback. Just evaluate the answer, score it, and provide the correct answer.

Job Title: Machine Learning Engineer (ML Engineer)

Interview Difficulty Level: easy

Interview Question: {bot_question}

Candidate's Answer: {candidate_answer}
"""

def evaluate_answer(job_title, difficulty_level, history):
    """Evaluate the candidate's answer."""
    
    evaluation = []
    question = ""
    candidate_answer = ""
    for message in history[0]:
        if message["role"] == "assistant":
            # Extract the assistant's question
            question = message["content"]
            # print(f"Question: {question}")
        if message["role"] == "user":
            # Extract the candidate's answer
            candidate_answer = message["content"]
            # print(f"Candidate Answer: {candidate_answer}")
        else:
            # Skip any other roles
            continue
        
        chat_message = [
            {
                "role": "system",
                "content": SYSTEM_PROMPT.format(job_title=job_title, difficulty_level=difficulty_level, bot_question=question, candidate_answer=candidate_answer)
            }]
        response = llm.chat(chat_message)
        evaluation.append({"role": "assistant", "content": question})
        evaluation.append({"role": "user", "content": candidate_answer})
        evaluation.append({"role": "evaluation_assistant", "content": response.content})
        print(f"Response {len(evaluation) // 3} of {len(history[0]) // 2} saved")

    append_message("interview_evaluation_log.json", evaluation)
    
    return evaluation
    
history = read_messages("interview_log.json")
evaluate_answer("Machine Learning Engineer (ML Engineer)", "easy", history)