import json
import os

meta_path = r"C:\Users\accou\.gemini\antigravity\scratch\syncops-meeting-agent\HACKATHON_DEMO_FINAL\audio\metadata_final.json"
srt_path = r"C:\Users\accou\.gemini\antigravity\scratch\syncops-meeting-agent\HACKATHON_DEMO_FINAL\subtitles.srt"
script_md_path = r"C:\Users\accou\.gemini\antigravity\scratch\syncops-meeting-agent\HACKATHON_DEMO_FINAL\VOICEOVER_SCRIPT.md"

with open(meta_path, "r") as f:
    segments = json.load(f)

def format_time(seconds):
    h = int(seconds // 3600)
    m = int((seconds % 3600) // 60)
    s = int(seconds % 60)
    ms = int(round((seconds - int(seconds)) * 1000))
    return f"{h:02d}:{m:02d}:{s:02d},{ms:03d}"

# Generate SRT
current_time = 0.0
srt_entries = []
index = 1

for seg in segments:
    dur = seg["duration"]
    start_time = current_time
    end_time = current_time + dur
    current_time = end_time

    # Split text into 2-3 readable subtitle lines
    words = seg["text"].split()
    chunk_size = 12
    chunks = [' '.join(words[i:i + chunk_size]) for i in range(0, len(words), chunk_size)]
    
    chunk_dur = dur / len(chunks)
    c_start = start_time
    for chunk in chunks:
        c_end = c_start + chunk_dur
        srt_entries.append(f"{index}\n{format_time(c_start)} --> {format_time(c_end)}\n{chunk}\n")
        index += 1
        c_start = c_end

with open(srt_path, "w", encoding="utf-8") as f:
    f.write("\n".join(srt_entries))

print(f"Generated {len(srt_entries)} subtitle cues in {srt_path}")

# Generate VOICEOVER_SCRIPT.md
script_content = """# SyncOps AI — Official Hackathon Voice-Over & Presentation Script

**Project Name:** SyncOps AI  
**Track:** Problem 03 — Meeting-to-Execution Agent  
**Total Target Duration:** 2 minutes 46 seconds (166.5 seconds)  
**Voice Engine:** Edge Neural TTS (`en-IN-PrabhatNeural` / Indian English Developer Presentation Voice)  
**Format:** 1080p High-Definition MP4 (30 FPS)  

---

"""

current_time = 0.0
for seg in segments:
    dur = seg["duration"]
    start_fmt = f"{int(current_time//60):02d}:{int(current_time%60):02d}"
    end_fmt = f"{int((current_time+dur)//60):02d}:{int((current_time+dur)%60):02d}"
    
    script_content += f"### {seg['name']} `[{start_fmt} - {end_fmt}]` ({dur:.1f}s)\n"
    script_content += f"> **Visual:** Matching high-definition screen / UI demo.\n\n"
    script_content += f"**Narration:**\n> \"{seg['text']}\"\n\n---\n\n"
    current_time += dur

with open(script_md_path, "w", encoding="utf-8") as f:
    f.write(script_content)

print(f"Generated complete script in {script_md_path}")
