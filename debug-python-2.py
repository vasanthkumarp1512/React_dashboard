import youtube_transcript_api
from youtube_transcript_api import YouTubeTranscriptApi

print("Module dir:", dir(youtube_transcript_api))
print("Class dir:", dir(YouTubeTranscriptApi))

try:
    print("Trying get_transcript...")
    t = YouTubeTranscriptApi.get_transcript("i5WYp4wMXfc")
    print("Success:", len(t))
except Exception as e:
    print("Error:", e)
