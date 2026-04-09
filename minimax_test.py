"""
MiniMax M2.7 API - Quick start example
Uses OpenAI-compatible API format
"""
import os
from openai import OpenAI

# --- Config ---
MINIMAX_API_KEY = "your-minimax-api-key-here"  # Replace with your key
MINIMAX_BASE_URL = "https://api.minimaxi.chat/v1"

client = OpenAI(
    api_key=MINIMAX_API_KEY,
    base_url=MINIMAX_BASE_URL,
)

def chat(message: str) -> str:
    response = client.chat.completions.create(
        model="MiniMax-M2.7",
        messages=[
            {"role": "user", "content": message}
        ],
    )
    return response.choices[0].message.content

if __name__ == "__main__":
    reply = chat("Hello! What can you do?")
    print(reply)
