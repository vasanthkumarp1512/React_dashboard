
import sys
import json
from youtube_transcript_api import YouTubeTranscriptApi, TranscriptsDisabled, NoTranscriptFound

def get_transcript(video_id):
    try:
        # Instantiate the API class as verified in tests
        api = YouTubeTranscriptApi()
        
        # Fetch the transcript
        # valid_langs = ['en', 'en-US', 'en-GB'] # Optional: could filter languages
        transcript_data = api.fetch(video_id)
        
        # Extract text from the list of objects (not dicts)
        # Each entry is a FetchedTranscriptSnippet object with .text attribute
        full_text = " ".join([entry.text for entry in transcript_data])
        
        # Print the text to stdout for the Node.js process to capture
        # Use UTF-8 encoding for stdout to handle special characters
        sys.stdout.reconfigure(encoding='utf-8')
        print(full_text)
        return True

    except Exception as e:
        # Print error to stderr so Node.js can distinguish it
        sys.stderr.write(f"Error fetching transcript: {str(e)}\n")
        return False

if __name__ == "__main__":
    if len(sys.argv) < 2:
        sys.stderr.write("Usage: python fetch_transcript.py <video_id>\n")
        sys.exit(1)
    
    video_id = sys.argv[1]
    success = get_transcript(video_id)
    
    if not success:
        sys.exit(1)
