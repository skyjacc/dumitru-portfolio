/**
 * Adapt the supplied ntch runtime's DATA, preserving its renderer and camera.
 * Only runs against portfolio-ntch/site. The supplied mirror remains untouched.
 * The module edits are bounded so identity/behavior edits can coexist.
 */
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const aboutOnly = process.argv.includes('--about-only');

const projectRoot = path.resolve(__dirname, '..');
const site = path.join(projectRoot, 'site');
if (path.basename(projectRoot) !== 'portfolio-ntch' || path.basename(site) !== 'site') {
  throw new Error('This adapter only targets the portfolio-ntch/site working copy.');
}
const source = path.join(projectRoot, '..', 'portfolio-lab', 'projects.js');
const sourceText = fs.readFileSync(source, 'utf8');
const assignment = 'window.PORTFOLIO_PROJECTS = ';
const assignmentAt = sourceText.indexOf(assignment);
if (assignmentAt < 0) throw new Error('Own projects data assignment not found.');
const ownProjects = JSON.parse(sourceText.slice(assignmentAt + assignment.length).trim().replace(/;\s*$/, ''));
if (!Array.isArray(ownProjects) || !ownProjects.length) throw new Error('Expected a non-empty portfolio case array.');
const projectIds = new Set(['home', 'despre', 'process']);
for (const project of ownProjects) {
  if (!project || typeof project.id !== 'string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(project.id)) throw new Error('Each portfolio case needs a valid lowercase route id.');
  if (projectIds.has(project.id)) throw new Error(`Duplicate or reserved portfolio id: ${project.id}`);
  projectIds.add(project.id);
}

const xml = (value) => String(value).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' }[ch]));
// About and Process are authored separately. Each stays one native plane;
// portfolioSurfaces replaces its media without changing its camera or material.
const surfaceMedia = {
  despre: Object.fromEntries(['en', 'ro', 'ru'].map(lang => [lang, [
    `/assets/about/phone/profile-${lang}.svg`,
    ...[1, 2, 3, 4, 5, 6].map(index => `/assets/about/phone/photo-${index}-${lang}.svg`)
  ]])),
  process: Object.fromEntries(['en', 'ro', 'ru'].map(lang => [lang,
    Array.from({ length: 5 }, (_, index) => `/assets/process/step-${index}-${lang}.svg`)
  ]))
};

const materialImage = (project, material) => {
  const original = `/${material.src.replace(/^\/+/, '')}`;
  if (material.id !== 'mobile') return original;
  const sourcePath = path.resolve(site, material.src);
  if (!sourcePath.startsWith(`${site}${path.sep}`)) throw new Error('Mobile source outside working copy.');
  const image = fs.readFileSync(sourcePath).toString('base64');
  const preview = `/assets/projects/${project.id}/mobile-preview.svg`;
  // Retina captures are authored by qa/project-clarity/assets/encode-mobile.py.
  // Reapplying catalogue data must not replace them with the legacy 1x source.
  const previewPath = path.join(site, preview);
  if (fs.existsSync(previewPath) && /<svg\b[^>]*\bdata-preview-capture="retina-3x"/.test(fs.readFileSync(previewPath, 'utf8').slice(0, 600))) return preview;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="390" height="844" viewBox="0 0 390 844" overflow="hidden" role="img" aria-label="${xml(material.alt)}"><title>${xml(material.alt)}</title><image width="390" height="844" preserveAspectRatio="xMidYMin slice" href="data:image/webp;base64,${image}"/></svg>`;
  if (!aboutOnly) fs.writeFileSync(path.join(site, preview), svg);
  return preview;
};

const caseProjects = ownProjects.map(project => ({
  key: project.id,
  kind: 'screens',
  tier: 'regular',
  type: project.status,
  name: project.title,
  description: project.description,
  images: project.materials.map(material => materialImage(project, material)),
  materialSources: project.materials.map(material => `/${material.src.replace(/^\/+/, '')}`),
  // Extra provenance fields are ignored by the renderer and available to own controls.
  portfolioCase: true,
  externalUrl: project.url,
  materialLabels: project.materials.map(material => material.caption)
}));
const about = {
  key: 'despre',
  kind: 'screens',
  tier: 'regular',
  type: 'Despre mine',
  name: 'Dumitru',
  description: '',
  images: [surfaceMedia.despre.en[0]],
  surface: 'about',
  surfaceMedia: surfaceMedia.despre,
  portfolioCase: false,
  externalUrl: 'https://www.instagram.com/_obllako_/',
  externalAction: 'instagram',
  materialLabels: ['Despre']
};
const processSurface = {
  key: 'process',
  kind: 'screens',
  tier: 'regular',
  type: 'Process',
  name: 'Process',
  description: '',
  images: [surfaceMedia.process.en[0]],
  surface: 'process',
  surfaceMedia: surfaceMedia.process,
  portfolioCase: false,
  materialLabels: ['Process']
};
const boardProjects = [...caseProjects, about, processSurface];
const imagePaths = [...new Set(boardProjects.flatMap(project => [
  ...project.images.filter(url => !url.endsWith('.mp4')),
  ...Object.values(project.surfaceMedia || {}).flat()
]))];
const videos = ownProjects.flatMap(project => project.materials.filter(material => material.type === 'video').map(material => ({
  video: `/${material.src.replace(/^\/+/, '')}`,
  poster: `/${material.poster.replace(/^\/+/, '')}`,
  output: `/${material.src.replace(/^\/+/, '').replace(/\.mp4$/, '.jpg')}`
})));

// Pillow is used only for intrinsic dimensions and requested poster format conversion.
const mediaResult = spawnSync('python', ['-c', String.raw`
import json, sys
from pathlib import Path
from PIL import Image
import cv2
data=json.load(sys.stdin)
root=Path(data['site']).resolve()
def local(url):
 p=(root/url.lstrip('/')).resolve()
 if not p.is_relative_to(root): raise ValueError('Media outside site: '+url)
 return p
sizes={}
for url in data['images']:
 p=local(url)
 if not p.exists(): raise FileNotFoundError(p)
 if p.suffix=='.svg':
  import xml.etree.ElementTree as ET
  e=ET.parse(p).getroot()
  sizes[url]=[int(float(e.attrib['width'])),int(float(e.attrib['height']))]
 else:
  with Image.open(p) as im: sizes[url]=list(im.size)
for v in data['videos']:
 if not local(v['video']).exists(): raise FileNotFoundError(v['video'])
 with Image.open(local(v['poster'])) as im:
  rgb=im.convert('RGB')
  if not data['aboutOnly']: rgb.save(local(v['output']),quality=95,subsampling=0,optimize=True)
  sizes[v['output']]=list(im.size)
 cap=cv2.VideoCapture(str(local(v['video'])))
 width=int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
 height=int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
 cap.release()
 if width<=0 or height<=0: raise ValueError('Cannot read video dimensions: '+v['video'])
 sizes[v['video']]=[width,height]
print(json.dumps(sizes))
`], { input: JSON.stringify({ site, images: imagePaths, videos, aboutOnly }), encoding: 'utf8' });
if (mediaResult.status !== 0) throw new Error(mediaResult.stderr || 'Media metadata conversion failed.');
const dimensions = JSON.parse(mediaResult.stdout);
// Layout uses captured CSS frames; Retina source pixels only improve texture detail.
Object.assign(dimensions, require('./project-media-frames.json'));

const chunkPath = path.join(site, '_next', 'static', 'chunks', '1l2px902fb04m.js');
let chunk = fs.readFileSync(chunkPath, 'utf8');
const begin = '/* OWN_PORTFOLIO_DATA_BEGIN */';
const end = '/* OWN_PORTFOLIO_DATA_END */';
const moduleStart = chunk.indexOf('},8313,e=>{');
const moduleEnd = chunk.indexOf('],8313)', moduleStart);
if (moduleStart < 0 || moduleEnd < 0) throw new Error('Original catalogue module boundary not found.');
const oldBegin = chunk.indexOf(begin, moduleStart);
const dataStart = oldBegin >= 0 ? oldBegin : chunk.indexOf(',g=[{key:"1520-groceries"', moduleStart);
const dataEnd = oldBegin >= 0 ? chunk.indexOf(end, oldBegin) + end.length : chunk.indexOf(',S=v.filter(e=>e.locked)', dataStart);
if (dataStart < moduleStart || dataEnd <= dataStart || dataEnd >= moduleEnd) throw new Error('Catalogue data replacement boundaries invalid.');
const replacement = `${begin},g=${JSON.stringify(boardProjects)},E=s(g.length),v=g.map((e,t)=>({...e,shape:e.shape??d[e.kind].shape,pin:{...E[t]}}))${end}`;
chunk = chunk.slice(0, dataStart) + replacement + chunk.slice(dataEnd);
// Personal surfaces remain destinations, outside the expandable case catalogue.
chunk = chunk.replace('O=v.filter(e=>!e.story&&!e.locked)', 'O=v.filter(e=>!e.story&&!e.locked&&e.portfolioCase!==false)');

const sizesMarker = 'e.s(["BOARD_IMAGE_SIZES",0,';
const sizesStart = chunk.indexOf(sizesMarker) + sizesMarker.length;
const sizesEnd = chunk.indexOf('],6813)', sizesStart);
if (sizesStart < sizesMarker.length || sizesEnd < sizesStart) throw new Error('Intrinsic dimensions module boundary missing.');
JSON.parse(chunk.slice(sizesStart, sizesEnd));
chunk = chunk.slice(0, sizesStart) + JSON.stringify(dimensions) + chunk.slice(sizesEnd);
fs.writeFileSync(chunkPath, chunk);

// Stable own-content manifest for QA, controls, route generation, and provenance.
fs.writeFileSync(path.join(site, 'portfolio-data.json'), JSON.stringify({
  caseCount: caseProjects.length,
  aboutKey: about.key,
  processKey: processSurface.key,
  projects: boardProjects,
  dimensions,
  videoPosters: videos,
  routes: boardProjects.map(project => `/work/${project.key}`)
}, null, 2));

const check = spawnSync(process.execPath, ['--check', chunkPath], { encoding: 'utf8' });
if (check.status !== 0) throw new Error(check.stderr || 'Adapted chunk failed syntax validation.');
// Locale hooks are reapplied after bounded catalogue replacement.
if (fs.existsSync(path.join(site, 'portfolio-i18n.js'))) {
  const localized = spawnSync(process.execPath, [path.join(__dirname, 'adapt-i18n.cjs')], { encoding: 'utf8' });
  if (localized.status !== 0) throw new Error(localized.stderr || 'Locale adapter failed');
}
// Keep the authored Work positions and compact captions after catalogue refreshes.
require('./adapt-work-composition.cjs').apply();
console.log(JSON.stringify({
  caseCount: caseProjects.length,
  boardKeys: boardProjects.map(project => project.key),
  dimensionEntries: Object.keys(dimensions).length,
  videoPosters: videos.map(video => video.output),
  changedChunk: chunkPath,
  originalMirrorModified: false
}, null, 2));
