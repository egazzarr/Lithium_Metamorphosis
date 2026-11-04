const interviewParams = new URLSearchParams(location.search);

if (interviewParams.get('from') === 'dataviz') {
  document.body.classList.add('from-dataviz');
}

document.querySelectorAll('.voice-hotspot').forEach((hotspot) => {
  const glow = document.querySelector(`.voice-glow[data-voice="${hotspot.dataset.voice}"]`);
  if (!glow) return;
  const setGlow = (active) => glow.classList.toggle('active', active);
  const setIdle = (active) => {
    hotspot.classList.toggle('idle', active);
    glow.classList.toggle('idle', active);
  };
  hotspot.addEventListener('pointerenter', () => {
    setIdle(false);
    setGlow(true);
  });
  hotspot.addEventListener('pointerleave', () => setGlow(false));
  hotspot.addEventListener('focus', () => {
    setIdle(false);
    setGlow(true);
  });
  hotspot.addEventListener('blur', () => setGlow(false));
});

const voiceHotspots = [...document.querySelectorAll('.voice-hotspot')];
const voiceCoreGlow = document.getElementById('voice-core-glow');
const voiceArt = document.getElementById('voice-art');
voiceArt.classList.add('idle');
voiceCoreGlow.classList.add('active');

function stopIdle() {
  voiceArt.classList.remove('idle');
  voiceArt.classList.add('interacted');
}

voiceHotspots.forEach((hotspot) => {
  hotspot.addEventListener('pointerenter', stopIdle);
  hotspot.addEventListener('focus', stopIdle);
});
