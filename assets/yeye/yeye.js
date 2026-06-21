
const root=document.querySelector('#yeye');
const img=document.querySelector('#yeyeImg');
const bubble=document.querySelector('#bubble');
const result=document.querySelector('#result');
const scanBtn=document.querySelector('#scanBtn');
const targets=[...document.querySelectorAll('[data-yeye-target]')];
let scanning=false, idleTimer;
const asset=n=>`assets/yeye_${n}.svg`;
function setPose(name,label){img.src=asset(name); bubble.textContent=label||name;}
function moveTo(x,y,flip=false){root.classList.toggle('flip',flip);root.style.left=`${Math.max(8,Math.min(innerWidth-155,x))}px`;root.style.top=`${Math.max(70,Math.min(innerHeight-155,y))}px`;}
function idle(){if(scanning)return; const x=Math.random()>.5?innerWidth-170:20; const y=innerHeight-170-Math.random()*45; setPose('walk_1','巡逻中');root.classList.add('bob');moveTo(x,y,x<innerWidth/2);setTimeout(()=>{root.classList.remove('bob');setPose(Math.random()>.72?'rest':'idle',Math.random()>.72?'打个盹':'守在这里');},950);idleTimer=setTimeout(idle,5000+Math.random()*5000)}
async function wait(ms){return new Promise(r=>setTimeout(r,ms))}
async function runScan(){if(scanning)return;scanning=true;clearTimeout(idleTimer);scanBtn.disabled=true;scanBtn.textContent='耶耶扫描中…';result.innerHTML='<b>耶耶已出发。</b><span>正在嗅探页面功能和高风险操作。</span>';
for(let i=0;i<targets.length;i++){const t=targets[i];targets.forEach(x=>x.classList.remove('yeye-focus','risk'));const r=t.getBoundingClientRect();t.classList.add('yeye-focus');setPose(i%2?'sniff_2':'sniff_1',`嗅探 ${i+1}/${targets.length}`);moveTo(r.left+r.width*.55-70,r.top+r.height*.55-45,r.left>innerWidth/2);await wait(1200);setPose('scan','分析证据');await wait(700)}
const risky=targets[1];risky.classList.add('risk');const rr=risky.getBoundingClientRect();moveTo(rr.left+rr.width*.55-70,rr.top+rr.height*.52-45,false);setPose('alert','闻到风险！');result.innerHTML='<b>发现高风险操作：退款流程缺少审批边界。</b><span>耶耶会把证据交给 Trace，然后安装 Guard 并复测。</span>';await wait(1800);risky.classList.remove('risk');setPose('protected','已保护');result.innerHTML='<b>Guard 已开启。</b><span>相同攻击被拦截，正常流程继续通过。</span>';await wait(2200);targets.forEach(x=>x.classList.remove('yeye-focus'));moveTo(innerWidth-175,innerHeight-170,false);setPose('idle','继续巡逻');scanBtn.disabled=false;scanBtn.textContent='再次扫描';scanning=false;idleTimer=setTimeout(idle,3500)}
scanBtn.addEventListener('click',runScan);window.addEventListener('resize',()=>{if(!scanning)moveTo(innerWidth-175,innerHeight-170)});idleTimer=setTimeout(idle,1800);
