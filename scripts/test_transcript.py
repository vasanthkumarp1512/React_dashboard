
import sys
import json
from youtube_transcript_api import YouTubeTranscriptApi, TranscriptsDisabled, NoTranscriptFound

VIDEO_ID = "jNQXAC9IVRw" # Me at the zoo
# VIDEO_ID = "TckGcxwknYU"

def get_transcript(video_id):
    print(f"Fetching transcript for {video_id}...")
    try:
        # Try instantiation
        api = YouTubeTranscriptApi()
        transcript_data = api.fetch(video_id)
        
        if transcript_data:
            first_entry = transcript_data[0]
            print(f"Entry attributes: {dir(first_entry)}")
            # Try to access text
            # full_text = " ".join([entry.text for entry in transcript_data]) 
            full_text = "DEBUG MODE"
        else:
            full_text = "Empty transcript"
        print("Success!")
        print(f"Length: {len(full_text)}")
        print(f"Preview: {full_text[:100]}...")
        return True
    except Exception as e:
        print(f"Error: {e}")
        return False

if __name__ == "__main__":
    if len(sys.argv) > 1:
        VIDEO_ID = sys.argv[1]
    
    get_transcript(VIDEO_ID)
