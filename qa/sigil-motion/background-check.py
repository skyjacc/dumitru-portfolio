import cv2,json,numpy as np
from pathlib import Path
base=Path(__file__).resolve().parent
c=cv2.VideoCapture(str(base/'source.mp4'))
thresholds=[2,4,8,16,24,32,48,64,96]
rows=[]
while True:
 ok,f=c.read()
 if not ok:break
 g=cv2.cvtColor(f,cv2.COLOR_BGR2GRAY);h,w=g.shape
 edge=np.concatenate([g[0],g[-1],g[:,0],g[:,-1]])
 corners=np.concatenate([g[:72,:72].ravel(),g[:72,-72:].ravel(),g[-72:,:72].ravel(),g[-72:,-72:].ravel()])
 bounds={}
 for t in thresholds:
  y,x=np.where(g>t)
  bounds[t]=min(int(x.min()),int(y.min()),w-1-int(x.max()),h-1-int(y.max())) if len(x) else None
 rows.append({'frame':len(rows),'edge_max':int(edge.max()),'edge_p95':float(np.percentile(edge,95)),'corner_max':int(corners.max()),'corner_mean':float(corners.mean()),'clearance_px_by_threshold':bounds})
c.release()
out={'maximum_edge_luma':max(r['edge_max'] for r in rows),'maximum_corner_luma':max(r['corner_max'] for r in rows),'minimum_clearance_by_threshold':{t:min(r['clearance_px_by_threshold'][t] for r in rows) for t in thresholds},'frames':rows}
(base/'background-metrics.json').write_text(json.dumps(out,indent=2));print({k:v for k,v in out.items() if k!='frames'})
