'use client';
import { useEffect, useRef, useState } from 'react';
import { Canvas } from './canvas';
import { parseLogoImage } from './parse-logo-image';
import { defaultParams } from './params';

const presets = {
  saitama: { highlight: '#FAF7F2', metal: '#F5C400', shadow: '#C52828', speed: 0.15, refraction: 0.012, background: '#FAF7F2' },
  garou: { highlight: '#C4B5FD', metal: '#5B21B6', shadow: '#0F0D17', speed: 0.12, refraction: 0.018, background: '#0F0D17' },
};
export default function PortfolioLab() {
  const [mode, setMode] = useState<keyof typeof presets>('saitama');
  const [settings, setSettings] = useState({ ...defaultParams, ...presets.saitama });
  const [image, setImage] = useState<ImageData | null>(null);
  const [status, setStatus] = useState('Original sample monogram. Load your transparent PNG to replace it.');
  const [recording, setRecording] = useState(false);
  const [alpha, setAlpha] = useState(true);
  const [format, setFormat] = useState('video/webm;codecs=vp9');
  const stage = useRef<HTMLDivElement>(null);
  const busy = useRef(false);
  useEffect(() => { parseLogoImage('/portfolio-sample.svg').then(result => setImage(result.imageData)).catch(() => setStatus('Choose a local transparent PNG to start.')); }, []);
  function download(blob: Blob, name: string) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a'); link.href = url; link.download = name; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  function record() {
    if (busy.current) return;
    const canvas = stage.current?.querySelector('canvas');
    if (!canvas || !window.MediaRecorder || !MediaRecorder.isTypeSupported(format)) { setStatus('Recording format unavailable. Try WebM VP9 in Chrome or Edge.'); return; }
    busy.current = true;
    let stream: MediaStream | undefined;
    let capture: ReturnType<typeof setInterval> | undefined;
    const finish = () => { if (capture) clearInterval(capture); stream?.getTracks().forEach(track => track.stop()); busy.current = false; setRecording(false); };
    try {
      const output = document.createElement('canvas'); output.width = 1080; output.height = 1080;
      const context = output.getContext('2d', { alpha: true });
      if (!context) throw new Error('2D canvas unavailable');
      const draw = () => { context.clearRect(0, 0, 1080, 1080); if (!alpha) { context.fillStyle = settings.background; context.fillRect(0, 0, 1080, 1080); } context.drawImage(canvas, 0, 0, 1080, 1080); };
      draw(); capture = setInterval(draw, 1000 / 30); stream = output.captureStream(30);
      const media = new MediaRecorder(stream, { mimeType: format, videoBitsPerSecond: 5_000_000 });
      const chunks: Blob[] = [];
      media.ondataavailable = event => { if (event.data.size) chunks.push(event.data); };
      media.onstop = () => { finish(); download(new Blob(chunks, { type: media.mimeType }), `sanjey-${mode}-${alpha ? 'alpha-requested' : 'opaque'}.${format.includes('mp4') ? 'mp4' : 'webm'}`); setStatus('Downloaded an 8-second loop candidate. Check the join and alpha in your target player before publishing.'); };
      media.onerror = () => { finish(); setStatus('Recording failed. Try another format.'); };
      media.start(); setRecording(true); setStatus('Recording 8 seconds at 1080×1080 / 30 fps. Keep this tab visible.');
      setTimeout(() => { if (media.state === 'recording') media.stop(); }, 8000);
    } catch (error) { finish(); setStatus(error instanceof Error ? error.message : 'Recording failed'); }
  }
  return <main style={{ maxWidth: 1100, margin: '40px auto', padding: 24, fontFamily: 'system-ui', color: '#FAF7F2' }}>
    <h1 style={{ fontSize: 32 }}>Sanjey / Liquid Metal Lab</h1>
    <p>Local logo processing. No uploads, accounts, or cloud sharing.</p>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 28, marginTop: 24 }}>
      <div ref={stage} style={{ aspectRatio: '1', background: settings.background, border: `2px solid ${settings.metal}` }}>
        {image && <Canvas imageData={image} params={settings} processing={false} />}
      </div>
      <fieldset disabled={recording} style={{ display: 'grid', gap: 16, border: 0 }}>
        <label>Transparent PNG / SVG <input type="file" accept="image/png,image/svg+xml" onChange={async event => { const file = event.target.files?.[0]; if (!file) return; setStatus('Processing locally…'); try { const result = await parseLogoImage(file); setImage(result.imageData); setStatus(`Loaded ${file.name} locally.`); } catch { setStatus('Could not process image. Try a transparent PNG.'); } }} /></label>
        <label>Theme <select value={mode} onChange={event => { const next = event.target.value as keyof typeof presets; setMode(next); setSettings({ ...defaultParams, ...presets[next] }); }}><option value="saitama">Saitama / warm chrome</option><option value="garou">Garou / cosmic titanium</option></select></label>
        {(['highlight', 'metal', 'shadow'] as const).map(key => <label key={key}>{key} <input aria-label={key} type="color" value={settings[key]} onChange={event => setSettings(value => ({ ...value, [key]: event.target.value }))} /> {settings[key]}</label>)}
        <label>Speed {settings.speed.toFixed(2)} <input aria-label="Speed" type="range" min="0" max="0.5" step="0.01" value={settings.speed} onChange={event => setSettings(value => ({ ...value, speed: +event.target.value }))} /></label>
        <label>Refraction / dispersion {settings.refraction.toFixed(3)} <input aria-label="Refraction" type="range" min="0" max="0.06" step="0.001" value={settings.refraction} onChange={event => setSettings(value => ({ ...value, refraction: +event.target.value }))} /></label>
        <label><input type="checkbox" checked={alpha} onChange={event => setAlpha(event.target.checked)} /> Request transparent background (WebM; browser dependent)</label>
        <select aria-label="Export format" value={format} onChange={event => setFormat(event.target.value)}><option value="video/webm;codecs=vp9">WebM VP9</option><option value="video/mp4">MP4 (if supported; choose opaque background)</option></select>
        <button onClick={record}>Record 8-second loop candidate</button>
        <button onClick={() => download(new Blob([JSON.stringify({ mode, ...settings }, null, 2)], { type: 'application/json' }), `sanjey-${mode}-metal.json`)}>Download exact settings</button>
      </fieldset>
    </div>
    <p role="status" style={{ marginTop: 24 }}>{status}</p>
    <p>Motion follows a periodic 8-second path. Check alpha and the loop join on the final export; MP4 usually flattens transparency.</p>
    <style>{`button,select,input[type=file]{padding:10px;border:1px solid #C4B5FD;border-radius:4px;background:#161224;color:#FAF7F2}label{display:block}input[type=range]{width:100%}button{cursor:pointer}fieldset:disabled{opacity:.6}`}</style>
  </main>;
}
