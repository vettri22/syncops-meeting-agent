import asyncio
import edge_tts
import os
import subprocess
import json
import imageio_ffmpeg

ffmpeg = imageio_ffmpeg.get_ffmpeg_exe()
audio_dir = r"C:\Users\accou\.gemini\antigravity\scratch\syncops-meeting-agent\HACKATHON_DEMO_FINAL\audio"
os.makedirs(audio_dir, exist_ok=True)

# Define narration script segments mapped to the exact 7 scenes
# Total targeted speaking rate: ~140-150 words per minute
segments = [
    {
        "id": "scene_01",
        "name": "Scene 1: Introduction",
        "text": "Good morning, respected judges. Today, we present SyncOps AI, an autonomous meeting-to-execution governance agent engineered to bridge the critical gap between decisions made in technical discussions and real-world software delivery.",
        "target_start": 0.0
    },
    {
        "id": "scene_02",
        "name": "Scene 2: Problem Statement",
        "text": "In engineering organizations, teams spend dozens of hours in technical meetings. Yet, critical architectural decisions vanish into thin air, commitments are forgotten, and subsequent meetings frequently contradict past agreements without anyone realizing it. Existing tools only dump static transcript summaries into Slack. They lack persistent memory, offer zero conflict detection, and fail to translate talk into verified execution.",
        "target_start": 12.0
    },
    {
        "id": "scene_03",
        "name": "Scene 3: Proposed Solution",
        "text": "To solve this, we built SyncOps AI. SyncOps transforms ephemeral discussions into an immutable company decision ledger. Our solution features five integrated pillars: automated transcript ingestion with speaker attribution, a persistent cross-meeting decision memory bank, a real-time contradiction guard, a human-in-the-loop confirmation gate, and bi-directional synchronization with issue trackers like Linear and GitHub.",
        "target_start": 38.0
    },
    {
        "id": "scene_04_part1",
        "name": "Scene 4 Part 1: Ingestion & Base Memory",
        "text": "Let us examine the live application. We begin with Meeting 1: Sprint 42 Architecture Kickoff. Here, lead architect Alice Chen locks in PostgreSQL on AWS RDS for ACID compliance, sets a hard public launch date of December 1st, and establishes a twelve thousand dollar monthly infrastructure ceiling. SyncOps extracts these into our persistent company memory bank.",
        "target_start": 60.0
    },
    {
        "id": "scene_04_part2",
        "name": "Scene 4 Part 2: Conflict Detection & Side-by-Side Diff",
        "text": "Now observe what happens one week later in Meeting 2. Senior engineer Bob proposes abandoning PostgreSQL for MongoDB on GCP, Carol proposes postponing the launch to December 20th, and Dave projects cloud costs jumping to eighteen thousand dollars. Immediately, SyncOps triggers a critical alignment alert! It highlights three distinct contradictions, presenting a side-by-side quote diff comparing the stored decision against the rogue proposal.",
        "target_start": 82.0
    },
    {
        "id": "scene_04_part3",
        "name": "Scene 4 Part 3: Confirmation Gate & Tracker Sync",
        "text": "Nothing posts autonomously. Through our human-in-the-loop confirmation gate, the engineering lead reviews the diff, enforces historical consensus, and approves staged action items. With one click, SyncOps dispatches these tasks to Linear, creating official tickets ENG-104 and OPS-212 with verified transcript citations and live webhook audit logs.",
        "target_start": 105.0
    },
    {
        "id": "scene_04_part4",
        "name": "Scene 4 Part 4: Reminders & Weekly Digests",
        "text": "SyncOps also guards deadlines proactively. Our reminder engine monitors approaching due dates, automatically drafting tailored Slack nudges. Finally, each engineer receives an individualized weekly digest summarizing their active commitments and decision ownership.",
        "target_start": 128.0
    },
    {
        "id": "scene_05",
        "name": "Scene 5: Technical Implementation",
        "text": "Under the hood, SyncOps is built with React 19, TypeScript, and Vite for sixty frames-per-second performance. Our extraction engine enforces strict JSON schemas for deterministic parsing, binding every entity to verbatim transcript citations for zero hallucinations. The conflict engine indexes historical decisions as immutable contracts, cross-checking every proposal across technical, timeline, and financial dimensions.",
        "target_start": 142.0
    },
    {
        "id": "scene_06",
        "name": "Scene 6: Impact & Scalability",
        "text": "SyncOps eliminates alignment drift and saves teams over four hours per engineer each week. Our scalable architecture is designed for production integration with Zoom and Google Meet bots, bi-directional Jira synchronization, and enterprise SOC-2 audit trails.",
        "target_start": 165.0
    },
    {
        "id": "scene_07",
        "name": "Scene 7: Powerful Closing",
        "text": "We are not merely proposing an idea or wrapping an API. We have engineered a practical, production-ready solution to turn lost meeting conversations into verified execution. Thank you, respected judges.",
        "target_start": 178.0
    }
]

async def generate_audio():
    print("Generating audio narration clips with edge-tts...")
    voice = "en-IN-PrabhatNeural"
    
    total_duration = 0.0
    audio_meta = []

    for seg in segments:
        file_path = os.path.join(audio_dir, f"{seg['id']}.mp3")
        # Generate with slightly measured speaking rate for clarity
        communicate = edge_tts.Communicate(seg['text'], voice, rate="+2%")
        await communicate.save(file_path)

        # Get exact duration using ffprobe/ffmpeg
        res = subprocess.run([ffmpeg, '-i', file_path], stderr=subprocess.PIPE, text=True)
        dur = 0.0
        for line in res.stderr.splitlines():
            if 'Duration' in line:
                # Duration: 00:00:11.83
                parts = line.split('Duration:')[1].split(',')[0].strip().split(':')
                dur = float(parts[0]) * 3600 + float(parts[1]) * 60 + float(parts[2])
                break

        print(f"Segment {seg['id']}: {dur:.2f}s | {seg['name']}")
        audio_meta.append({
            "id": seg['id'],
            "name": seg['name'],
            "text": seg['text'],
            "duration": dur,
            "file": file_path
        })
        total_duration += dur

    print(f"\nTotal raw voiceover duration: {total_duration:.2f}s ({total_duration/60:.2f} mins)")
    with open(os.path.join(audio_dir, "metadata.json"), "w") as f:
        json.dump(audio_meta, f, indent=2)

if __name__ == "__main__":
    asyncio.run(generate_audio())
