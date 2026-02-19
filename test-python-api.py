from youtube_transcript_api import YouTubeTranscriptApi, TranscriptsDisabled, NoTranscriptFound
import json

video_id = "i5WYp4wMXfc"

try:
    transcript_list = YouTubeTranscriptApi.get_transcript(video_id)
    full_text = " ".join([item['text'] for item in transcript_list])
    print(json.dumps({"success": True, "text": full_text}))
except Exception as e:
    print(json.dumps({"success": False, "error": str(e)}))
