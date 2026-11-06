(function(){
  const SRC = window.QUIZ, root = document.getElementById('quiz');
  let i = 0, score = 0, answers = [], Q = [];
  function shuffle(){ Q = SRC.map(q=>{ const o=q.a.map((t,k)=>({t,k})); for(let j=o.length-1;j>0;j--){const r=Math.floor(Math.random()*(j+1));[o[j],o[r]]=[o[r],o[j]];} return {...q,a:o.map(x=>x.t),c:o.findIndex(x=>x.k===q.c)}; }); }
  shuffle();
  const L = 'ABCD';
  function el(h){ const d=document.createElement('div'); d.innerHTML=h.trim(); return d.firstChild; }
  function render(){
    if(i >= Q.length) return finish();
    const q = Q[i];
    root.innerHTML = `
      <div class="progress"><span>Câu ${i+1}/${Q.length}</span><div class="bar"><span style="width:${i/Q.length*100}%"></span></div><span>${score} đúng</span></div>
      <div class="card">
        <h2>${q.q}</h2>
        <div class="opts">${q.a.map((t,k)=>`<button class="opt" id="opt-${i}-${k}" data-k="${k}"><b>${L[k]}</b><span>${t}</span></button>`).join('')}</div>
        <div id="after"></div>
      </div>`;
    root.querySelectorAll('.opt').forEach(b=>b.addEventListener('click',()=>pick(+b.dataset.k)));
    root.querySelector('.opt').focus({preventScroll:true});
  }
  function pick(k){
    const q = Q[i], ok = k === q.c, btns = root.querySelectorAll('.opt');
    btns.forEach(b=>b.disabled=true);
    btns[q.c].classList.add('ok'); if(!ok) btns[k].classList.add('bad');
    if(ok) score++; answers.push(ok);
    const after = root.querySelector('#after');
    after.innerHTML = `<p class="explain"><strong>${ok?'Chính xác!':'Chưa đúng. Đáp án: '+L[q.c]}</strong>${q.e}</p>
      <div class="actions"><button class="btn" id="next">${i+1<Q.length?'Câu tiếp theo →':'Xem kết quả'}</button></div>`;
    const n = after.querySelector('#next'); n.addEventListener('click',()=>{i++;render();window.scrollTo({top:0})}); n.focus();
  }
  function finish(){
    const r = score/Q.length, msg = r>=.8 ? 'Bạn hiểu rất sâu về chủ đề này.' : r>=.5 ? 'Nền tảng tốt, vẫn còn vài điều bất ngờ.' : 'Nhiều điều mới để khám phá. Xem lại phần giải thích bên dưới nhé.';
    root.innerHTML = `
      <div class="card">
        <p class="eyebrow">Kết quả</p>
        <div class="score">${score}/${Q.length}</div>
        <p class="lead">${msg}</p>
        <ul class="review">${Q.map((q,k)=>`<li class="${answers[k]?'ok':'bad'}">${q.q}<small>${answers[k]?'Đúng':'Sai'} · Đáp án: ${q.a[q.c]}</small></li>`).join('')}</ul>
        <div class="actions" style="gap:10px;flex-wrap:wrap"><a class="btn ghost" href="${window.OTHER.href}">${window.OTHER.label}</a><button class="btn" id="again">Làm lại</button></div>
      </div>`;
    root.querySelector('#again').addEventListener('click',()=>{i=0;score=0;answers=[];shuffle();render()});
  }
  render();
})();
