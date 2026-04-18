from openai import OpenAI

# 1. Initialize the client
# We point it to YOUR local FastAPI server, not the real internet.
# We pass a dummy key because your FastAPI server is the one that actually 
# holds the real GEMINI_API_KEY in its .env file.
client = OpenAI(
    api_key="dummy_key_not_used", 
    base_url="http://localhost:8000/v1"
)

# 2. Make the request
print("Sending request to Aether AI Hub...")

response = client.chat.completions.create(
    model="gpt-4o-mini",  # GitHub Model (gpt-4o, gpt-4o-mini, etc.)
    messages=[
        {"role": "system", "content": "You are a helpful AI assistant."},
        {"role": "user", "content": "Write a haiku about writing code."}
    ]
)

# 3. Print the result
print("\nResponse Received:")
print(response.choices[0].message.content)