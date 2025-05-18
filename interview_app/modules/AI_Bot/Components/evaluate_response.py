# evaluate_response.py

import os
import json
import re
from langchain.output_parsers import StructuredOutputParser, ResponseSchema
from .add_history import read_messages, append_message
from .llm_file import LLMClient

# === Setup LLM & Output Schema ===
llm = LLMClient()

response_schemas = [
    ResponseSchema(name="score", description="Numerical score between 0 and 10"),
    ResponseSchema(name="feedback", description="Short feedback on the candidate's answer"),
    ResponseSchema(name="justification", description="Explanation of why the score and feedback were given"),
    ResponseSchema(name="correct_answer", description="Ideal or model answer for the question")
]

parser = StructuredOutputParser.from_response_schemas(response_schemas)
format_instructions = parser.get_format_instructions()

system_prompt = f"""
You are an expert technical interviewer.

Evaluate the candidate's answer to the given question. Provide:
- score (0–10),
- feedback (one-line summary),
- justification (why this score was given),
- correct_answer (ideal response).

Respond in this exact format:
{format_instructions}
"""

def interview_evaluation(candidate_id, job_title, file_path='interview_log.json'):
    # Adjust file path to point to the actual location
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..', 'ChatData'))
    full_path = os.path.join(base_dir, file_path)

    print(f"Looking for file at: {full_path}")  # Debug line

    with open(full_path, 'r') as file:
        interview_log = json.load(file)

    print(f"Candidate ID: {candidate_id}")
    print(f"job title: {job_title}")

    # === Extract Q&A pairs ===
    qa_pairs = []

    for entry in interview_log:
        for key, messages in entry.items():
            print(f"key: {key}")
            print(f"messages: {messages}")
            # if (key == candidate_id) and (messages[0]["job_title"] == job_title):
                # Extract Q&A pairs from the messages
            print("User ID and job title match.")
            for i in range(len(messages) - 1):
                if messages[i]["role"] == "assistant" and messages[i+1]["role"] == "user":
                    qa_pairs.append({
                        "question": messages[i]["content"],
                        "answer": messages[i+1]["content"]
                    })
    
    if qa_pairs == []:
        print("No Q&A pairs found for the specified candidate ID and job title.")
        return []
    
    print(f"Found {len(qa_pairs)} question-answer pairs to evaluate.")

    # === Evaluate each Q&A pair ===
    evaluations = []

    for i, qa in enumerate(qa_pairs):
        print(f"\nEvaluating Q&A pair {i+1}/{len(qa_pairs)}")

        question = qa["question"]
        answer = qa["answer"]

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": f"Question: {question}\nAnswer: {answer}"}
        ]

        try:
            response = llm.chat(messages)
            raw = response.content

            # Attempt structured parse
            try:
                parsed = parser.parse(raw)
            except Exception:
                print("⚠️ Structured parse failed, attempting manual JSON fix.")
                raw_fixed = raw.replace('\n', ' ')
                raw_fixed = re.sub(r'(\d+)\s*"', r'\1, "', raw_fixed)
                raw_fixed = re.sub(r',\s*}', '}', raw_fixed)
                raw_fixed = re.sub(r',\s*]', ']', raw_fixed)

                parsed = json.loads(raw_fixed)

            evaluations.append({
                "question": question,
                "answer": answer,
                "evaluation": parsed
            })
            print(f"✅ Score: {parsed['score']}, Feedback: {parsed['feedback']}")

        except Exception as err:
            print(f"❌ Failed to evaluate Q&A pair {i+1}: {err}")
            pass

    # Save evaluations
    eval_path = f'{candidate_id}_evaluation.json'
    eval_path = os.path.join(base_dir, eval_path)
    append_message(eval_path, evaluations)

    scoring = 0
    for messages in evaluations:
        scoring += int(messages['evaluation']['score'])
    
    scoring = scoring / len(evaluations)
    return scoring, True

# candidate_id = "1"
# job_title = "IOT eng"

# score = interview_evaluation(candidate_id, job_title) 
# print(score)
