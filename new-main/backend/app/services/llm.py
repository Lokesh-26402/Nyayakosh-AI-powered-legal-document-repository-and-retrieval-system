import httpx
from typing import AsyncGenerator

OLLAMA_API_URL = "http://localhost:11434/api/chat"
DEFAULT_MODEL = "llama3"

async def generate_offline_chat_stream(messages: list, model: str = DEFAULT_MODEL) -> AsyncGenerator[str, None]:
    payload = {
        "model": model,
        "messages": messages,
        "stream": True,
        "options": {
            "temperature": 0.2
        }
    }
    
    timeout = httpx.Timeout(60.0, connect=10.0)
    
    async with httpx.AsyncClient(timeout=timeout) as client:
        try:
            async with client.stream("POST", OLLAMA_API_URL, json=payload) as response:
                if response.status_code != 200:
                    yield f"Error from local Ollama framework: Status code {response.status_code}"
                    return
                
                async for line in response.aiter_lines():
                    if line:
                        import json
                        data = json.loads(line)
                        token = data.get("message", {}).get("content", "")
                        if token:
                            yield token
                            
        except httpx.ConnectError:
            yield "Error: Python backend could not connect to local Ollama. Verify Ollama application is running."