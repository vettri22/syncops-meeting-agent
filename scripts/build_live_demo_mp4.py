import os
import json
import glob
import subprocess
import numpy as np
import soundfile as sf
import imageio_ffmpeg

ffmpeg = imageio_ffmpeg.get_ffmpeg_exe()

base_dir = r"C:\Users\accou\.gemini\antigravity\scratch\syncops-meeting-agent\HACKATHON_DEMO_FINAL"
audio_dir = os.path.join(base_dir, "live_audio")
raw_video_dir = os.path.join(base_dir, "raw_live_video")
output_mp4 = os.path.join(base_dir, "HACKATHON_LIVE_DEMO.mp4")
srt_file = os.path.join(base_dir, "HACKATHON_LIVE_DEMO_SUBTITLES.srt")

# Read audio metadata
with open(os.path.join(audio_dir, "live_metadata.json"), "r") as f:
    segments = json.load(f)

print("Concatenating master narration audio...")
concat_list_file = os.path.join(audio_dir, "live_concat_list.txt")
with open(concat_list_file, "w") as f:
    for seg in segments:
        f.write(f"file '{seg['file'].replace(chr(92), '/')}'\n")

master_narration_wav = os.path.join(audio_dir, "live_master_narration.wav")
subprocess.run([
    ffmpeg, "-y", "-f", "concat", "-safe", "0", "-i", concat_list_file,
    "-c:a", "pcm_s16le", "-ar", "44100", master_narration_wav
], check=True)

# Read narration audio
narration_data, sr = sf.read(master_narration_wav)
if len(narration_data.shape) > 1:
    narration_data = narration_data[:, 0]
total_samples = len(narration_data)
total_seconds = total_samples / sr
print(f"Master voiceover: {total_seconds:.2f}s ({total_seconds/60:.2f} mins)")

# Synthesize subtle ambient background music (warm harmonious pad)
print("Synthesizing ambient background pad...")
t = np.linspace(0, total_seconds, total_samples, endpoint=False)
f1, f2, f3 = 146.83, 220.00, 261.63 # D minor chord
ambient = (
    0.40 * np.sin(2 * np.pi * f1 * t) +
    0.30 * np.sin(2 * np.pi * f2 * t + 0.8) +
    0.20 * np.sin(2 * np.pi * f3 * t + 1.6)
)
# Gentle modulation
ambient *= (0.6 + 0.4 * np.sin(2 * np.pi * 0.12 * t))
# Fade in (3s) and fade out (3s)
fade_len = int(3.0 * sr)
ambient[:fade_len] *= np.linspace(0, 1, fade_len)
ambient[-fade_len:] *= np.linspace(1, 0, fade_len)

# Mix narration (1.0) and quiet background pad (0.028)
mixed_audio = narration_data + 0.028 * ambient
max_val = np.max(np.abs(mixed_audio))
if max_val > 0.95:
    mixed_audio = mixed_audio / max_val * 0.95

final_audio_path = os.path.join(audio_dir, "live_master_audio_mixed.wav")
sf.write(final_audio_path, mixed_audio, sr)
print(f"Mixed audio written to {final_audio_path}")

# Generate Synchronized SRT Subtitle File
print("Generating synchronized subtitles...")
def format_srt_time(seconds):
    h = int(seconds // 3600)
    m = int((seconds % 3600) // 60)
    s = int(seconds % 60)
    ms = int(round((seconds - int(seconds)) * 1000))
    return f"{h:02d}:{m:02d}:{s:02d},{ms:03d}"

srt_entries = []
idx = 1
cur_time = 0.0

for seg in segments:
    dur = seg["duration"]
    seg_start = cur_time
    seg_end = cur_time + dur
    cur_time = seg_end

    words = seg["text"].split()
    chunk_size = 11
    chunks = [' '.join(words[i:i + chunk_size]) for i in range(0, len(words), chunk_size)]
    chunk_dur = dur / len(chunks)

    c_start = seg_start
    for chunk in chunks:
        c_end = c_start + chunk_dur
        srt_entries.append(f"{idx}\n{format_srt_time(c_start)} --> {format_srt_time(c_end)}\n{chunk}\n")
        idx += 1
        c_start = c_end

with open(srt_file, "w", encoding="utf-8") as f:
    f.write("\n".join(srt_entries))
print(f"Subtitles written to {srt_file}")

# Locate raw live webm video
raw_videos = glob.glob(os.path.join(raw_video_dir, "*.webm"))
if not raw_videos:
    raise FileNotFoundError("No raw webm video found in " + raw_video_dir)
raw_video = raw_videos[0]
print(f"Using raw browser video: {raw_video}")

# Mux into final HACKATHON_LIVE_DEMO.mp4
print(f"Encoding final HACKATHON_LIVE_DEMO.mp4 (Target: {total_seconds:.2f}s, 1080p, 30fps)...")
cmd = [
    ffmpeg, "-y",
    "-i", raw_video,
    "-i", final_audio_path,
    "-c:v", "libx264",
    "-preset", "medium",
    "-crf", "19",
    "-r", "30",
    "-pix_fmt", "yuv420p",
    "-c:a", "aac",
    "-b:a", "192k",
    "-t", f"{total_seconds:.2f}",
    output_mp4
]
subprocess.run(cmd, check=True)

# Final Verification
res = subprocess.run([ffmpeg, "-i", output_mp4], stderr=subprocess.PIPE, text=True)
print("\n=== FINAL VERIFICATION OF HACKATHON_LIVE_DEMO.mp4 ===")
for line in res.stderr.splitlines():
    if "Duration" in line or "Video:" in line or "Audio:" in line:
        print(line.strip())

file_size_mb = os.path.getsize(output_mp4) / (1024 * 1024)
print(f"\nSUCCESS: HACKATHON_LIVE_DEMO.mp4 created at {output_mp4}")
print(f"File Size: {file_size_mb:.2f} MB")
