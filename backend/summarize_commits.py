import sys
import os
from groq import Groq
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Fetch Groq API key from environment variables
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

# Initialize Groq client with API key
client = Groq(api_key=GROQ_API_KEY)

def summarize_commits(commits):
    if not commits:
        return "No commits found."

    # Prepare the commit messages
    commit_messages = "\n".join(commits)

    # Groq API call to summarize the commits
    chat_completion = client.chat.completions.create(
        messages=[
            {"role": "system", "content": "You are a helpful assistant."},
            {"role": "user", "content": f"Summarize the following commit messages:\n{commit_messages}"}
        ],
        model="llama-3.3-70b-versatile",  # Adjust model as needed
        temperature=0.5,
        max_tokens=1024,
        top_p=1,
        stop=None,
        stream=False,
    )

    # Return the summary
    return chat_completion.choices[0].message.content.strip()

if __name__ == "__main__":
    # Get commits from the command line argument
    commits = sys.argv[1].split('|')
    summary = summarize_commits(commits)
    print(summary)
