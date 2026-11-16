"""Inspect a generated sigil video; optionally trim a matched loop into QA only.

No interpolation, crossfade, frame blending, generation, or live-asset writes.
Measurements flag review points; they cannot prove that geometry stays rigid.
"""
from __future__ import annotations

import argparse
import json
import math
from pathlib import Path
import subprocess

import cv2
import imageio_ffmpeg
import numpy as np


ROOT = Path(__file__).resolve().parents[1]
QA_ROOT = ROOT / "qa" / "sigil-motion"


def subject_mask(image):
    # Intended for the approved metallic sigil on a nearly black background.
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    return gray > 18


def distance(a, b):
    mask = subject_mask(a) | subject_mask(b)
    delta = np.abs(a.astype(np.float32) - b.astype(np.float32)).mean(axis=2)
    return float(delta[mask].mean() / 255) if mask.any() else float(delta.mean() / 255)


def frame_metrics(image):
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    mask = subject_mask(image)
    y, x = np.nonzero(mask)
    h, w = gray.shape
    if x.size:
        box = [int(x.min()), int(y.min()), int(x.max() + 1), int(y.max() + 1)]
        clearance = min(box[0] / w, box[1] / h, (w-box[2]) / w, (h-box[3]) / h)
    else:
        box, clearance = None, 1
    rim = np.zeros_like(mask)
    bw, bh = max(2, round(w*.035)), max(2, round(h*.035))
    rim[:bh] = rim[-bh:] = True
    rim[:, :bw] = rim[:, -bw:] = True
    edge = np.concatenate((gray[0], gray[-1], gray[:, 0], gray[:, -1]))
    lap = cv2.Laplacian(gray, cv2.CV_32F)
    return {
        "bbox_small": box,
        "minimum_edge_clearance_fraction": round(clearance, 5),
        "subject_area_fraction": round(float(mask.mean()), 5),
        "edge_lit_fraction": round(float((edge > 18).mean()), 5),
        "border_mean_255": round(float(gray[rim].mean()), 3),
        "border_p95_255": round(float(np.percentile(gray[rim], 95)), 3),
        "subject_laplacian_variance": round(float(lap[mask].var()) if mask.any() else 0, 3),
    }


def sheet(path, full_frames, indices, fps, columns=4, label=""):
    tile_w = 480
    src_h, src_w = next(iter(full_frames.values())).shape[:2]
    tile_h = round(tile_w * src_h / src_w)
    band = 35
    rows = math.ceil(len(indices) / columns)
    canvas = np.full((rows*(tile_h+band), columns*tile_w, 3), 13, dtype=np.uint8)
    for position, index in enumerate(indices):
        frame = full_frames[index]
        tile = cv2.resize(frame, (tile_w, tile_h), interpolation=cv2.INTER_AREA)
        row, col = divmod(position, columns)
        x, y = col*tile_w, row*(tile_h+band)
        canvas[y:y+tile_h, x:x+tile_w] = tile
        text = f"{label} frame {index} / {index/fps:.3f}s"
        cv2.putText(canvas, text, (x+12, y+tile_h+23), cv2.FONT_HERSHEY_SIMPLEX,
                    .48, (230, 230, 230), 1, cv2.LINE_AA)
    cv2.imwrite(str(path), canvas, [cv2.IMWRITE_JPEG_QUALITY, 93])


def capture_selected(video, indices):
    wanted = set(indices)
    capture = cv2.VideoCapture(str(video))
    result = {}
    for index in sorted(wanted):
        capture.set(cv2.CAP_PROP_POS_FRAMES, index)
        ok, image = capture.read()
        if not ok:
            raise RuntimeError(f"Could not reread frame {index}")
        result[index] = image
    capture.release()
    return result


def matched_candidates(frames, fps):
    count = len(frames)
    window = min(round(1.4*fps), count//4)
    stride = max(1, round(fps/15))
    k = max(1, round(fps/12))
    candidates = []
    for start in range(0, max(1, window), stride):
        for end in range(max(start+k+2, count-window-1), count, stride):
            if end-start < count*.65 or start+k >= count or end-k < 0:
                continue
            endpoint = distance(frames[start], frames[end])
            outgoing = frames[start+k].astype(np.float32)-frames[start].astype(np.float32)
            incoming = frames[end].astype(np.float32)-frames[end-k].astype(np.float32)
            mask = subject_mask(frames[start]) | subject_mask(frames[end])
            velocity = float(np.abs(outgoing-incoming)[mask].mean()/255) if mask.any() else 0
            seam = distance(frames[end-1], frames[start])
            score = endpoint + .25*velocity + .006*(1-(end-start)/count)
            candidates.append({
                "start_frame": start, "end_frame_exclusive": end,
                "start_seconds": round(start/fps, 6),
                "end_seconds_exclusive": round(end/fps, 6),
                "duration_seconds": round((end-start)/fps, 6),
                "endpoint_difference": round(endpoint, 6),
                "velocity_difference": round(velocity, 6),
                "actual_boundary_difference": round(seam, 6),
                "score": round(score, 6),
            })
    return sorted(candidates, key=lambda item:item["score"])[:8]


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("video", type=Path)
    parser.add_argument("--output", default="review", help="Subdirectory under qa/sigil-motion")
    parser.add_argument("--reference", type=Path, help="Optional original image, comparison only")
    parser.add_argument("--write-trim", nargs=2, type=int, metavar=("START_FRAME", "END_EXCLUSIVE"),
                        help="Explicit reviewed frame range; writes matched-trim.mp4 into QA only")
    args = parser.parse_args()
    video = args.video.resolve()
    out = (QA_ROOT / args.output).resolve()
    if not out.is_relative_to(QA_ROOT.resolve()):
        parser.error("Output must remain inside qa/sigil-motion")
    out.mkdir(parents=True, exist_ok=True)
    capture = cv2.VideoCapture(str(video))
    fps = capture.get(cv2.CAP_PROP_FPS)
    width, height = (round(capture.get(key)) for key in (cv2.CAP_PROP_FRAME_WIDTH, cv2.CAP_PROP_FRAME_HEIGHT))
    if not fps or not width or not height:
        raise RuntimeError(f"Cannot decode video: {video}")
    small_size = (384, max(1, round(384*height/width)))
    frames, metrics = [], []
    while True:
        ok, image = capture.read()
        if not ok:
            break
        small = cv2.resize(image, small_size, interpolation=cv2.INTER_AREA)
        frames.append(small)
        metrics.append(frame_metrics(small))
    capture.release()
    if len(frames) < 4:
        raise RuntimeError("At least four decoded frames required")
    adjacent = [distance(a, b) for a, b in zip(frames, frames[1:])]
    seam = distance(frames[-1], frames[0])
    median = float(np.median(adjacent))
    candidates = matched_candidates(frames, fps)
    samples = sorted(set(round(i) for i in np.linspace(0, len(frames)-1, 16)))
    seam_indices = list(range(max(0, len(frames)-4), len(frames))) + list(range(min(4, len(frames))))
    best = candidates[0] if candidates else None
    match_indices = ([best["end_frame_exclusive"]-2, best["end_frame_exclusive"]-1,
                      best["start_frame"], best["start_frame"]+1] if best else [])
    full = capture_selected(video, samples + seam_indices + match_indices)
    sheet(out/"contact-sheet.jpg", full, samples, fps)
    sheet(out/"original-seam.jpg", full, seam_indices, fps)
    if match_indices:
        sheet(out/"best-match-seam.jpg", full, match_indices, fps)
    clipping = [index for index, metric in enumerate(metrics) if metric["edge_lit_fraction"] > .015]
    report = {
        "video": str(video), "width": width, "height": height, "fps": fps,
        "decoded_frames": len(frames), "duration_seconds": len(frames)/fps,
        "measurement_size": small_size,
        "original_seam": {"foreground_difference": seam, "median_adjacent_difference": median,
                          "p95_adjacent_difference": float(np.percentile(adjacent, 95)),
                          "seam_over_median": seam/max(median, 1e-8)},
        "matched_trim_candidates": candidates,
        "review_flags": {
            "possible_clipping_frames": clipping,
            "maximum_border_mean_255": max(metric["border_mean_255"] for metric in metrics),
            "minimum_edge_clearance_fraction": min(metric["minimum_edge_clearance_fraction"] for metric in metrics),
            "largest_motion_steps": [{"from_frame":int(index), "difference":adjacent[index]}
                                     for index in np.argsort(adjacent)[-8:][::-1]],
        },
        "frame_metrics": metrics,
        "limits": ["Metrics require visual review; changing projected area is normal during rotation.",
                   "Black-background thresholding can miss dark silhouette clipping.",
                   "A matched endpoint alone does not prove angular speed continuity or rigid geometry.",
                   "No crossfade or blended orientations are introduced."],
    }
    if args.reference:
        reference = cv2.imread(str(args.reference))
        if reference is None:
            raise RuntimeError("Reference image cannot be read")
        reference = cv2.resize(reference, small_size, interpolation=cv2.INTER_AREA)
        report["reference"] = {"path":str(args.reference.resolve()),
                               "first_frame_difference":distance(reference, frames[0]),
                               "last_frame_difference":distance(reference, frames[-1]),
                               "note":"Whole-frame comparison; crop/scale differences affect the score."}
    if args.write_trim:
        start, end = args.write_trim
        if not 0 <= start < end <= len(frames):
            parser.error("Invalid trim frame range")
        output = out/"matched-trim.mp4"
        command = [imageio_ffmpeg.get_ffmpeg_exe(), "-hide_banner", "-loglevel", "warning", "-y",
                   "-i", str(video), "-vf", f"trim=start_frame={start}:end_frame={end},setpts=N/({fps:.12g}*TB)",
                   "-an", "-r", f"{fps:.12g}", "-fps_mode", "cfr", "-c:v", "libx264", "-preset", "slow", "-crf", "18", "-pix_fmt", "yuv420p",
                   "-movflags", "+faststart", str(output)]
        subprocess.run(command, check=True)
        report["reviewed_trim"] = {"start_frame":start,"end_frame_exclusive":end,"output":str(output)}
    (out/"report.json").write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps({"output":str(out),"resolution":[width,height],"fps":fps,"frames":len(frames),
                      "original_seam":report["original_seam"],"best_match":best,
                      "possible_clipping_frames":len(clipping)}, indent=2))


if __name__ == "__main__":
    main()
