from google import genai
from google.genai import types

client = genai.Client(
    vertexai=True,
    project="ricc-demos-386214",
    location="global",
)

prompt = """
You are tasked with implementing the classic Thread-Safe Double-Checked Locking (DCL) Singleton pattern in modern C++. This task is non-trivial and requires specialized concurrency knowledge to prevent memory reordering issues.

Write a complete, runnable C++ program named `dcl_singleton.cpp` that defines a class `Singleton` with a private constructor and a static `getInstance()` method.

Your solution MUST adhere to the following strict constraints:
1. The Singleton instance pointer (`static Singleton*`) must be wrapped in `std::atomic` to correctly manage memory visibility across threads.
2. The `getInstance()` method must use `std::memory_order_acquire` when reading the instance pointer in the outer check.
3. The instance creation and write-back must use `std::memory_order_release` when writing to the atomic pointer.
4. A standard `std::mutex` must be used only to protect the critical section (the actual instantiation).
5. The `main` function must demonstrate safe, concurrent access by launching at least three threads, each calling `Singleton::getInstance()`, and printing the address of the returned instance to prove all threads received the same object.
"""

response = client.models.generate_content(
  model="gemini-3-pro-preview",
  contents=prompt,
  config=types.GenerateContentConfig(
      thinking_config=types.ThinkingConfig(
          thinking_level=types.ThinkingLevel.HIGH # Dynamic thinking for high reasoning tasks
      )
  ),
)
import os

# Ensure output directory exists
os.makedirs("out", exist_ok=True)

print(response.text)

with open("out/complex-answer.md", "w") as f:
    f.write(response.text)
    print(f"\nOutput written to out/complex-answer.md")