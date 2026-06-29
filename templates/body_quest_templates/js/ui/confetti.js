// BODY QUEST — ui/confetti.js
function confetti() {
  const colors = ['#f39c12','#e74c3c','#27ae60','#3498db','#9b59b6','#1abc9c','#ffd700'];
  for (let i = 0; i < 70; i++) {
    const el = document.createElement('div');
    el.className = 'confetti-piece';
    el.style.cssText = `left:${Math.random()*100}vw;background:${colors[i%colors.length]};
      animation-delay:${Math.random()*.8}s;animation-duration:${1.5+Math.random()*1.5}s;
      width:${5+Math.random()*8}px;height:${5+Math.random()*8}px;
      border-radius:${Math.random()>.5?'50%':'2px'};transform:rotate(${Math.random()*360}deg)`;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 3000);
  }
}
