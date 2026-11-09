(() => {
 const canvas=document.getElementById('scene'), ctx=canvas.getContext('2d');
 const el=id=>document.getElementById(id);
 const params={mass:2,force:4,initial:1,gravity:9.81,mode:'horizontal'};
 let t=0,x=0,y=0,vx=1,vy=0,running=false,trailOn=true,last=0,raf=0,trail=[];
 const scale=70, origin={x:85,y:410};
 function readParams(){
  for(const k of ['mass','force','initial','gravity']) params[k]=Number(el(k).value);
  params.mode=el('mode').value;
  el('massVal').textContent=params.mass.toFixed(1)+' kg';
  el('forceVal').textContent=params.force.toFixed(1)+' N';
  el('initialVal').textContent=params.initial.toFixed(1)+' m/s';
  el('gravityVal').textContent=params.gravity.toFixed(2)+' m/s²';
  updateMetrics();
 }
 function reset(){ stop();t=0;x=0;y=0;vx=params.initial;vy=0;trail=[];draw();updateMetrics(); }
 function stop(){running=false;cancelAnimationFrame(raf);el('play').textContent='▶ Run simulation';el('simState').textContent='PAUSED';}
 function updateMetrics(){
  const a=params.force/params.mass;
  el('time').textContent=t.toFixed(2)+' s';
  el('position').textContent=x.toFixed(2)+' m';
  el('velocity').textContent=(params.mode==='projectile'?Math.hypot(vx,vy):vx).toFixed(2)+' m/s';
  el('accel').textContent=a.toFixed(2)+' m/s²';
  el('netforce').textContent=params.force.toFixed(2)+' N';
  el('disp').textContent=x.toFixed(2)+' m';
  el('height').textContent=y.toFixed(2)+' m';
 }
 function physics(dt){
  const a=params.force/params.mass;
  if(params.mode==='projectile'){
   x+=vx*dt+.5*a*dt*dt; vx+=a*dt;
   y+=vy*dt-.5*params.gravity*dt*dt; vy-=params.gravity*dt;
   if(y<=0 && t>0){y=0;vy=0;stop();}
  } else { x+=vx*dt+.5*a*dt*dt;vx+=a*dt; }
  t+=dt;
  if(trailOn){trail.push({x,y});if(trail.length>240)trail.shift();}
  updateMetrics();
 }
 function draw(){
  const W=canvas.width,H=canvas.height;
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle='#F8FCFD';ctx.fillRect(0,0,W,H);
  ctx.strokeStyle='#E3EEF0';ctx.lineWidth=1;
  for(let gx=0;gx<W;gx+=scale){ctx.beginPath();ctx.moveTo(gx,0);ctx.lineTo(gx,H);ctx.stroke();}
  for(let gy=0;gy<H;gy+=scale){ctx.beginPath();ctx.moveTo(0,gy);ctx.lineTo(W,gy);ctx.stroke();}
  const floor=origin.y;
  ctx.strokeStyle='#526D75';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(35,floor);ctx.lineTo(W-30,floor);ctx.stroke();
  ctx.fillStyle='#78939A';ctx.font='13px system-ui';ctx.fillText('0 m',origin.x-28,floor+24);
  ctx.fillText('x (m)',W-65,floor+28);
  ctx.fillText('y (m)',18,28);
  if(trailOn&&trail.length>1){
   ctx.beginPath();trail.forEach((p,i)=>{const px=origin.x+p.x*scale,py=floor-p.y*scale;if(i===0)ctx.moveTo(px,py);else ctx.lineTo(px,py);});
   ctx.strokeStyle='#79B7C5';ctx.lineWidth=2;ctx.stroke();
  }
  const px=origin.x+x*scale,py=floor-y*scale;
  if(params.mode==='projectile'){
   ctx.setLineDash([6,6]);ctx.strokeStyle='#B7C9CE';ctx.beginPath();ctx.moveTo(px,py);ctx.lineTo(px,floor);ctx.stroke();ctx.setLineDash([]);
  }
  ctx.beginPath();ctx.arc(px,py,17,0,Math.PI*2);ctx.fillStyle='#176B87';ctx.fill();
  ctx.lineWidth=3;ctx.strokeStyle='#FFFFFF';ctx.stroke();
  ctx.beginPath();ctx.moveTo(px,py);ctx.lineTo(px+Math.sign(params.force||1)*Math.min(65,Math.abs(params.force)*5),py);ctx.strokeStyle='#E28A37';ctx.lineWidth=4;ctx.stroke();
  ctx.fillStyle='#A95F1F';ctx.font='bold 12px system-ui';ctx.fillText('F',px+Math.sign(params.force||1)*Math.min(65,Math.abs(params.force)*5)+5,py-7);
  if(px>W-30||px<20||py<20){ctx.fillStyle='#A95F1F';ctx.fillText('Object outside view — reset or reduce values',W/2-140,35);}
 }
 function frame(now){
  if(!running)return;
  const dt=Math.min((now-last)/1000,.04);last=now;
  let remaining=dt;while(remaining>0){const h=Math.min(remaining,.01);physics(h);remaining-=h;}
  draw();raf=requestAnimationFrame(frame);
 }
 function play(){if(running){stop();return;}running=true;last=performance.now();el('play').textContent='Ⅱ Pause';el('simState').textContent='RUNNING';raf=requestAnimationFrame(frame);}
 ['mass','force','initial','gravity','mode'].forEach(id=>el(id).addEventListener('input',()=>{readParams();if(id==='initial'||id==='mode')reset();else draw();}));
 el('play').addEventListener('click',play);
 el('step').addEventListener('click',()=>{if(running)return;for(let i=0;i<10;i++)physics(.01);draw();});
 el('reset').addEventListener('click',reset);
 el('trail').addEventListener('click',()=>{trailOn=!trailOn;el('trail').textContent='Trail: '+(trailOn?'On':'Off');if(!trailOn)trail=[];draw();});
 readParams();reset();
})();
