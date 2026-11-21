import asyncio
import edge_tts
import os
import subprocess
import json
import imageio_ffmpeg

ffmpeg = imageio_ffmpeg.get_ffmpeg_exe()
output_dir = r"C:\Users\accou\.gemini\antigravity\scratch\syncops-meeting-agent\HACKATHON_DEMO_FINAL\live_audio"
os.makedirs(output_dir, exist_ok=True)

scenes = [
    {
        "id": "scene_01_intro",
        "name": "Scene 1: Introduction",
        "text": "Hello, respected judges. Welcome to SyncOps AI, a live meeting-to-execution governance workspace engineered to solve a critical problem: decisions made in meetings get lost, forgotten, or contradicted."
    },
    {
        "id": "scene_02_problem",
        "name": "Scene 2: Problem Statement",
        "text": "Engineering teams spend dozens of hours in technical standups and architecture reviews. Yet, key decisions vanish into messy notes, commitments are forgotten, and subsequent meetings frequently overturn past consensus without anyone realizing it. Existing tools only dump flat transcript summaries into Slack, with zero persistent memory and zero conflict detection."
    },
    {
        "id": "scene_03_solution",
        "name": "Scene 3: Proposed Solution",
        "text": "SyncOps AI transforms ephemeral meeting dialogues into an immutable company decision ledger. We provide automated transcript ingestion, a persistent decision memory bank powered by SQLite, real-time contradiction detection, and an interactive Kanban execution tracker."
    },
    {
        "id": "scene_04_live_demo",
        "name": "Scene 4: Live Working Demonstration",
        "text": "Let us explore the live product. On our Meetings workspace, we click Baseline Meeting and click Process and Analyze. Our backend immediately segments turns, attributes speakers, and extracts decisions and action items directly into SQLite. Next, we simulate Meeting 2, where Bob suggests switching to MongoDB and Carol proposes delaying launch. When we analyze this meeting, SyncOps immediately fires a Critical Alignment Alert! In our Conflict Center, we see a live side-by-side quote diff comparing Alice's locked PostgreSQL decision against Bob's rogue proposal. We resolve this live by enforcing the prior decision. In our Execution Tracker, every extracted action item becomes an active Kanban card. We click Add Task to create a new action item, and move cards between To Do, In Progress, and Done. In Deadlines and Nudges, the system tracks time deltas and generates one-click Slack alerts, while our Team Digest provides personalized weekly rollups."
    },
    {
        "id": "scene_05_technical",
        "name": "Scene 5: Technical Explanation",
        "text": "Architecturally, SyncOps is a full-stack application. The frontend uses React 19, TypeScript, and Tailwind CSS. The backend runs a Node.js REST API backed by native SQLite for permanent data persistence. Our extraction engine enforces strict JSON schemas, binding every decision to verbatim transcript citations, while our contradiction engine cross-checks proposals across technical, timeline, and budget dimensions."
    },
    {
        "id": "scene_06_impact",
        "name": "Scene 6: Innovation and Impact",
        "text": "SyncOps eliminates alignment drift, saving engineering teams over four hours per developer every week. With full SQLite persistence and real CSV exports, it guarantees that no organizational decision slips through the cracks."
    },
    {
        "id": "scene_07_closing",
        "name": "Scene 7: Closing",
        "text": "We are not demonstrating a prototype or static presentation. We have built an active, production-grade workspace that turns lost conversations into verified execution. Thank you."
    }
]

async def generate_live_audio():
    voice = "en-IN-PrabhatNeural"
    total_dur = 0.0
    audio_meta = []

    print("Generating calibrated developer voiceover with rate=+22%...")
    for sc in scenes:
        file_path = os.path.join(output_dir, f"{sc['id']}.mp3")
        communicate = edge_tts.Communicate(sc['text'], voice, rate="+22%")
        await communicate.save(file_path)

        res = subprocess.run([ffmpeg, '-i', file_path], stderr=subprocess.PIPE, text=True)
        dur = 0.0
        for line in res.stderr.splitlines():
            if 'Duration' in line:
                parts = line.split('Duration:')[1].split(',')[0].strip().split(':')
                dur = float(parts[0]) * 3600 + float(parts[1]) * 60 + float(parts[2])
                break

        print(f"[{sc['id']}] {dur:.2f}s | {sc['name']}")
        audio_meta.append({
            "id": sc['id'],
            "name": sc['name'],
            "text": sc['text'],
            "duration": dur,
            "file": file_path
        })
        total_dur += dur

    print(f"\nFinal Verified Duration: {total_dur:.2f}s ({total_dur/60:.2f} mins)!")
    assert total_dur <= 175.0, f"Duration {total_dur}s exceeds 2m 55s ceiling!"
    with open(os.path.join(output_dir, "live_metadata.json"), "w") as f:
        json.dump(audio_meta, f, indent=2)

if __name__ == "__main__":
    asyncio.run(generate_live_audio())
