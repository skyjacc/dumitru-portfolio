from pathlib import Path
from PIL import Image, ImageDraw
import imageio_ffmpeg, subprocess, json
q=Path(__file__).resolve().parent
ff=imageio_ffmpeg.get_ffmpeg_exe()
src=q/'generated-unfold.mp4'
print(subprocess.run([ff,'-hide_banner','-i',str(src)],capture_output=True,text=True).stderr)
subprocess.run([ff,'-hide_banner','-loglevel','error','-y','-i',str(src),'-vf','setpts=PTS/1.5,fps=8,scale=1080:1080','-an','-c:v','libx264','-crf','19','-preset','medium','-pix_fmt','yuv420p','-movflags','+faststart',str(q/'paper-unfold-preview.mp4')],check=True)
frames=[]
for i,t in enumerate([0,.35,.7,1.05,1.4,1.75,2.1,2.5]):
 p=q/f'preview-{i}.png'
 subprocess.run([ff,'-hide_banner','-loglevel','error','-y','-ss',str(t),'-i',str(q/'paper-unfold-preview.mp4'),'-frames:v','1',str(p)],check=True)
 im=Image.open(p).convert('RGB').resize((280,280))
 ImageDraw.Draw(im).text((8,8),f'{t}s',fill='white')
 frames.append(im)
sheet=Image.new('RGB',(1120,560),'#080808')
for i,im in enumerate(frames):sheet.paste(im,((i%4)*280,(i//4)*280))
sheet.save(q/'contact-sheet.jpg',quality=93)
print('Preview bytes', (q/'paper-unfold-preview.mp4').stat().st_size)

