from speech_to_text import speech_text, record_audio
from text_to_speech import text_speech
from text_to_text import text_to_text_interview, ask_question, receive_answer
from add_history import read_messages, append_message
import asyncio

async def main():
    """Main function to conduct a speech-to-speech interview."""
    
    job_title = "Machine Learning Engineer (ML Engineer)"
    difficulty_level = "easy"
    candidate_id = 104
    print(f"Candidate ID: {candidate_id}")
    await text_speech("Welcome to the interview! Please introduce yourself.", voice="en-GB-RyanNeural")
    
    text = speech_text()
    print("\n📝 Transcribed Text:\n", text)
    
    history, all_history = text_to_text_interview(job_title, difficulty_level, candidate_id, text)
    
    question = ask_question(history)
    print("🧑 Interviewer:", question)
    await text_speech(question)

    # Candidate response loop
    while True:
        print("🧑‍💻 Candidate Voice: ")
        user_input = speech_text()
        print("🧑‍💻 Candidate:", user_input)
        if user_input.lower().strip() == "exit" or user_input.lower().strip() == "quit":
            thank_you = "Thank you for your time."
            await text_speech(thank_you)
            break
        history.append({"role": "user", "content": user_input})
        ai_reply = receive_answer(history, user_input)
        print("🧑 Interviewer:", ai_reply)
        await text_speech(ai_reply)
        history.append({"role": "assistant", "content": ai_reply})

    # Save updated history
    all_history[candidate_id] = history
    append_message("interview_log2.json", all_history)

    
asyncio.run(main())