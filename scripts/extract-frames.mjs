import { spawnSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
export function extractionPlan(duration, count = 36, width = 900) {
  if (!Number.isFinite(duration) || duration <= 0) throw new Error('Video duration must be positive.');
  if (![24,36,48].includes(count)) throw new Error('Frame count must be 24, 36, or 48.');
  if (!Number.isInteger(width) || width < 320 || width > 2000) throw new Error('Width must be an integer from 320 to 2000.');
  // Sample bin midpoints to avoid duplicating a full turn’s first/last pose.
  return Array.from({length:count}, (_,i) => ({ time:duration*(i+.5)/count, name:`frame-${String(i+1).padStart(3,'0')}.png`, width }));
}
if (process.argv[1] && resolve(process.argv[1]) === resolve(import.meta.filename)) {
  const [input, output='prepared-frames', countArg='36', widthArg='900'] = process.argv.slice(2);
  if (!input) { console.error('Usage: node scripts/extract-frames.mjs video.mp4 [output-directory] [24|36|48] [width]'); process.exit(1); }
  try {
    const probe = spawnSync('ffprobe',['-v','error','-show_entries','format=duration','-of','default=noprint_wrappers=1:nokey=1',resolve(input)],{encoding:'utf8'});
    if (probe.error || probe.status !== 0) throw new Error('ffprobe failed. Install FFmpeg and check the input file.');
    const plan = extractionPlan(Number(probe.stdout.trim()), Number(countArg), Number(widthArg));
    mkdirSync(output,{recursive:true});
    for (const frame of plan) {
      const result = spawnSync('ffmpeg',['-hide_banner','-loglevel','error','-y','-ss',String(frame.time),'-i',resolve(input),'-frames:v','1','-vf',`scale=${frame.width}:-2`,resolve(output,frame.name)],{stdio:'inherit'});
      if (result.error || result.status !== 0) throw new Error(`Extraction failed for ${frame.name}`);
    }
    console.log(`Extracted ${plan.length} PNGs to ${output}. Background removal is a separate step; see README.md.`);
  } catch(error) { console.error(error.message); process.exit(1); }
}
