from youtube_transcript_api import YouTubeTranscriptApi
import json

print(dir(YouTubeTranscriptApi))

try:
    # Try alternate method name if get_transcript is missing
    if hasattr(YouTubeTranscriptApi, 'list_transcripts'):
        ts = YouTubeTranscriptApi.list_transcripts("i5WYp4wMXfc")
        print("Found list_transcripts")
        for t in ts:
            print(t.language_code)
            print(t.fetch())
            break
except Exception as e:
    print(e)
