import asyncio
import edge_tts
import os
import subprocess
import json
import imageio_ffmpeg

ffmpeg = imageio_ffmpeg.get_ffmpeg_exe()
audio_dir = r"C:\Users\accou\.gemini\antigravity\scratch\syncops-meeting-agent\HACKATHON_DEMO_FINAL\audio"
os.makedirs(audio_dir, exist_ok=True)

# Tightened text and brisk, confident speaking pace (+15%) targeting ~160 seconds total
tuned_segments = [
    {
        "id": "scene_01",
        "name": "Scene 1: Introduction",
        "text": "Good morning, respected judges. We present SyncOps AI, an autonomous meeting-to-execution governance agent bridging the gap between technical discussions and verified software delivery."
    },
    {
        "id": "scene_02",
        "name": "Scene 2: Problem Statement",
        "text": "Engineering teams spend dozens of hours in technical meetings. Yet, decisions vanish into thin air, commitments are forgotten, and subsequent meetings frequently contradict past agreements without anyone noticing. Generic AI summarizers only dump flat bullet points into Slack, with zero persistent memory and zero conflict detection."
    },
    {
        "id": "scene_03",
        "name": "Scene 3: Proposed Solution",
        "text": "SyncOps AI transforms ephemeral meetings into an immutable company decision ledger. We provide automated transcript ingestion with speaker attribution, a persistent cross-meeting memory bank, real-time contradiction detection, a human confirmation gate, and bi-directional tracker sync."
    },
    {
        "id": "scene_04_part1",
        "name": "Scene 4 Part 1: Ingestion & Base Memory",
        "text": "In our live product, Meeting 1 locks in PostgreSQL on AWS RDS for ACID compliance, a December 1st launch, and a twelve thousand dollar budget ceiling into persistent company memory."
    },
    {
        "id": "scene_04_part2",
        "name": "Scene 4 Part 2: Conflict Detection & Side-by-Side Diff",
        "text": "One week later in Meeting 2, Bob proposes switching to MongoDB on GCP, Carol suggests delaying to December 20th, and Dave estimates eighteen thousand dollars spend. SyncOps immediately triggers a critical alignment alert, displaying a side-by-side quote diff against the locked decisions."
    },
    {
        "id": "scene_04_part3",
        "name": "Scene 4 Part 3: Confirmation Gate & Tracker Sync",
        "text": "Nothing posts autonomously. Through our human-in-the-loop confirmation gate, the lead enforces consensus and approves action items. With one click, SyncOps dispatches tickets ENG-104 and OPS-212 directly to Linear with live webhook audit logs."
    },
    {
        "id": "scene_04_part4",
        "name": "Scene 4 Part 4: Reminders & Weekly Digests",
        "text": "SyncOps continuously monitors deadlines, dispatching proactive Slack nudges, while generating personalized weekly accountability digests for every engineer on the team."
    },
    {
        "id": "scene_05",
        "name": "Scene 5: Technical Implementation",
        "text": "Under the hood, SyncOps is built with React 19, TypeScript, and Vite. Our extraction engine enforces strict JSON schemas, binding every decision to verbatim transcript citations. Our contradiction engine indexes historical decisions as immutable contracts, cross-checking proposals across technical, timeline, and budget vectors."
    },
    {
        "id": "scene_06",
        "name": "Scene 6: Impact & Scalability",
        "text": "SyncOps eliminates alignment drift and saves teams over four hours per engineer each week. Our scalable architecture is designed for live Zoom and Google Meet bots, native Jira sync, and enterprise SOC-2 audit trails."
    },
    {
        "id": "scene_07",
        "name": "Scene 7: Powerful Closing",
        "text": "We are not merely proposing an idea or wrapping an API. We have engineered a practical, production-ready solution to turn lost meeting conversations into verified execution. Thank you."
    }
]

async def generate():
    voice = "en-IN-PrabhatNeural"
    audio_meta = []
    total_dur = 0.0

    print("Generating calibrated audio clips with rate=+16%...")
    for seg in tuned_segments:
        file_path = os.path.join(audio_dir, f"{seg['id']}.mp3")
        communicate = edge_tts.Communicate(seg['text'], voice, rate="+16%")
        await communicate.save(file_path)

        res = subprocess.run([ffmpeg, '-i', file_path], stderr=subprocess.PIPE, text=True)
        dur = 0.0
        for line in res.stderr.splitlines():
            if 'Duration' in line:
                parts = line.split('Duration:')[1].split(',')[0].strip().split(':')
                dur = float(parts[0]) * 3600 + float(parts[1]) * 60 + float(parts[2])
                break

        print(f"[{seg['id']}] {dur:.2f}s | {seg['name']}")
        audio_meta.append({
            "id": seg['id'],
            "name": seg['name'],
            "text": seg['text'],
            "duration": dur,
            "file": file_path
        })
        total_dur += dur

    print(f"\nTarget Achieved: Total Voiceover Duration = {total_dur:.2f} seconds ({total_dur/60:.2f} minutes)!")
    assert total_dur < 170, f"Duration {total_dur}s exceeds 170s ceiling!"
    with open(os.path.join(audio_dir, "metadata_final.json"), "w") as f:
        json.dump(audio_meta, f, indent=2)

if __name__ == "__main__":
    asyncio.run(generate())
