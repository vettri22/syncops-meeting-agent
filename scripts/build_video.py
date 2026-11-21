import os
import json
import subprocess
import numpy as np
import soundfile as sf
import imageio_ffmpeg

ffmpeg = imageio_ffmpeg.get_ffmpeg_exe()

base_dir = r"C:\Users\accou\.gemini\antigravity\scratch\syncops-meeting-agent\HACKATHON_DEMO_FINAL"
audio_dir = os.path.join(base_dir, "audio")
slides_dir = os.path.join(base_dir, "graphic_slides")
screens_dir = os.path.join(base_dir, "raw_screens")
output_mp4 = os.path.join(base_dir, "syncops_hackathon_demo_1080p.mp4")

with open(os.path.join(audio_dir, "metadata_final.json"), "r") as f:
    segments = json.load(f)

# Step 1: Concatenate narration audio
print("Concatenating audio segments...")
concat_list_file = os.path.join(audio_dir, "concat_list.txt")
with open(concat_list_file, "w") as f:
    for seg in segments:
        f.write(f"file '{seg['file'].replace(chr(92), '/')}'\n")

master_narration = os.path.join(audio_dir, "master_narration.wav")
subprocess.run([
    ffmpeg, "-y", "-f", "concat", "-safe", "0", "-i", concat_list_file,
    "-c:a", "pcm_s16le", "-ar", "44100", master_narration
], check=True)

# Read narration audio to get exact sample count and duration
narration_data, sr = sf.read(master_narration)
if len(narration_data.shape) > 1:
    narration_data = narration_data[:, 0]
total_samples = len(narration_data)
total_seconds = total_samples / sr
print(f"Master narration: {total_seconds:.2f}s ({total_samples} samples at {sr}Hz)")

# Step 2: Generate subtle ambient background music (soft synth drone chord)
print("Synthesizing ambient background pad...")
t = np.linspace(0, total_seconds, total_samples, endpoint=False)
# Warm harmonious chord (D minor 9: D3, F3, A3, C4, E4)
f_d3 = 146.83
f_f3 = 174.61
f_a3 = 220.00
f_c4 = 261.63
f_e4 = 329.63

ambient = (
    0.35 * np.sin(2 * np.pi * f_d3 * t) +
    0.25 * np.sin(2 * np.pi * f_f3 * t + 0.5) +
    0.20 * np.sin(2 * np.pi * f_a3 * t + 1.0) +
    0.15 * np.sin(2 * np.pi * f_c4 * t + 1.5) +
    0.10 * np.sin(2 * np.pi * f_e4 * t + 2.0)
)
# Add subtle slow modulation (chorus/shimmer)
modulation = 0.5 + 0.5 * np.sin(2 * np.pi * 0.15 * t)
ambient = ambient * modulation

# Fade in (3s) and fade out (4s)
fade_in_len = int(3.0 * sr)
fade_out_len = int(4.0 * sr)
ambient[:fade_in_len] *= np.linspace(0, 1, fade_in_len)
ambient[-fade_out_len:] *= np.linspace(1, 0, fade_out_len)

# Mix narration (1.0) and ambient (0.035 - quiet background)
mixed_audio = narration_data + 0.035 * ambient
# Normalize to avoid clipping
max_amp = np.max(np.abs(mixed_audio))
if max_amp > 0.95:
    mixed_audio = mixed_audio / max_amp * 0.95

final_audio_path = os.path.join(audio_dir, "final_master_audio.wav")
sf.write(final_audio_path, mixed_audio, sr)
print(f"Final master audio written to {final_audio_path}")

# Step 3: Build visual cuts mapping to audio segments
# Define visual clip mapping: (image_path, duration)
clips_plan = []

for seg in segments:
    dur = seg["duration"]
    seg_id = seg["id"]

    if seg_id == "scene_01":
        clips_plan.append((os.path.join(slides_dir, "slide_01_intro.png"), dur))
    elif seg_id == "scene_02":
        clips_plan.append((os.path.join(slides_dir, "slide_02_problem.png"), dur))
    elif seg_id == "scene_03":
        clips_plan.append((os.path.join(slides_dir, "slide_03_architecture.png"), dur))
    elif seg_id == "scene_04_part1":
        # Split between meeting 1 ingest and memory bank
        clips_plan.append((os.path.join(screens_dir, "screen_04_ingest_meeting1.png"), dur * 0.5))
        clips_plan.append((os.path.join(screens_dir, "screen_05_memory_bank.png"), dur * 0.5))
    elif seg_id == "scene_04_part2":
        # Split between conflict banner and side-by-side diff
        clips_plan.append((os.path.join(screens_dir, "screen_01_conflict_initial.png"), dur * 0.48))
        clips_plan.append((os.path.join(screens_dir, "screen_02_conflict_diff.png"), dur * 0.52))
    elif seg_id == "scene_04_part3":
        # Split between confirmation staging gate and execution kanban
        clips_plan.append((os.path.join(screens_dir, "screen_06_staging_gate.png"), dur * 0.5))
        clips_plan.append((os.path.join(screens_dir, "screen_07_execution_kanban.png"), dur * 0.5))
    elif seg_id == "scene_04_part4":
        # Split between deadline reminders and personal digest
        clips_plan.append((os.path.join(screens_dir, "screen_08_deadline_reminders.png"), dur * 0.5))
        clips_plan.append((os.path.join(screens_dir, "screen_10_personal_digest_bob.png"), dur * 0.5))
    elif seg_id == "scene_05":
        clips_plan.append((os.path.join(slides_dir, "slide_05_tech_stack.png"), dur))
    elif seg_id == "scene_06":
        clips_plan.append((os.path.join(slides_dir, "slide_06_impact.png"), dur))
    elif seg_id == "scene_07":
        clips_plan.append((os.path.join(slides_dir, "slide_07_closing.png"), dur))

print(f"Total visual cuts planned: {len(clips_plan)}")

# Step 4: Render individual video segments and concatenate
temp_vids = []
temp_dir = os.path.join(base_dir, "temp_video_parts")
os.makedirs(temp_dir, exist_ok=True)

for i, (img_path, dur) in enumerate(clips_plan):
    v_out = os.path.join(temp_dir, f"part_{i:02d}.mp4")
    temp_vids.append(v_out)
    
    # Generate 1080p 30fps clip for exact duration
    cmd = [
        ffmpeg, "-y",
        "-loop", "1",
        "-i", img_path,
        "-c:v", "libx264",
        "-t", f"{dur:.3f}",
        "-pix_fmt", "yuv420p",
        "-r", "30",
        "-vf", "scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2",
        v_out
    ]
    subprocess.run(cmd, check=True)

# Concat video parts
video_concat_txt = os.path.join(temp_dir, "video_concat.txt")
with open(video_concat_txt, "w") as f:
    for v in temp_vids:
        f.write(f"file '{v.replace(chr(92), '/')}'\n")

raw_video_path = os.path.join(temp_dir, "concatenated_visuals.mp4")
subprocess.run([
    ffmpeg, "-y", "-f", "concat", "-safe", "0", "-i", video_concat_txt,
    "-c:v", "copy", raw_video_path
], check=True)

# Step 5: Merge visuals with master audio into final MP4
print("Muxing final 1080p MP4 with master audio...")
cmd_final = [
    ffmpeg, "-y",
    "-i", raw_video_path,
    "-i", final_audio_path,
    "-c:v", "libx264",
    "-preset", "medium",
    "-crf", "18",
    "-c:a", "aac",
    "-b:a", "192k",
    "-shortest",
    output_mp4
]
subprocess.run(cmd_final, check=True)

# Verify final video specs
res = subprocess.run([ffmpeg, "-i", output_mp4], stderr=subprocess.PIPE, text=True)
print("\n=== FINAL VIDEO VERIFICATION ===")
for line in res.stderr.splitlines():
    if "Duration" in line or "Video:" in line or "Audio:" in line:
        print(line.strip())

file_size_mb = os.path.getsize(output_mp4) / (1024 * 1024)
print(f"Final MP4 Exported Successfully: {output_mp4}")
print(f"File Size: {file_size_mb:.2f} MB")
