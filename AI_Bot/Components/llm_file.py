# llm_file.py.py

import os
from dotenv import load_dotenv # type: ignore
from langchain_groq import ChatGroq # type: ignore

# --- Load API key from .env ---
load_dotenv()
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

class LLMClient:
    """
    A wrapper class to interact with Groq LLM using LangChain.
    """

    def __init__(
        self,
        model: str = "llama3-70b-8192",
        temperature: float = 0.8,
        max_tokens: int = 300,
        stop: list = None
    ):
        self.llm = ChatGroq(
            groq_api_key=GROQ_API_KEY,
            model=model,
            temperature=temperature,
            max_tokens=max_tokens,
            stop=stop
        )

    def chat(self, prompt: str) -> str:
        """
        Sends a prompt to the model and returns the response.
        """
        return self.llm.invoke(prompt)

# --- For standalone testing ---
if __name__ == "__main__":
    prompt = "Write a short story about a robot who learns to bake."
    client = LLMClient()
    response = client.chat(prompt)
    print("🤖 Chatbot Response:\n", response.content)
