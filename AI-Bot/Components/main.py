from text_to_text import LLMClient

prompt = "List 5 creative startup ideas for AI in education."

# Lower temperature = more deterministic, Higher = more creative
client = LLMClient(temperature=0.2)  

client = LLMClient(max_tokens=50)
print("\nShort Response:\n", client.chat(prompt))

client = LLMClient(max_tokens=500)
print("\nLong Response:\n", client.chat(prompt))
