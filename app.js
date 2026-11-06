(() => {
  const S = window.SURVEY, CFG = window.SURVEY_CONFIG || {};
  const KEY = 'todak-survey-v1';
  const $ = (id) => document.getElementById(id);
  const stage = $('stage'), nav = $('nav'), prev = $('prev'), next = $('next');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const wait = (ms) => new Promise((r) => setTimeout(r, reduce ? 0 : ms));
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const CHECK = '<svg viewBox="0 0 16 16" fill="none" stroke="#FBF7F0" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 8.5l3.2 3L13 4.5"/></svg>';

  const store = {
    get() { try { return JSON.parse(localStorage.getItem(KEY)) || null; } catch { return null; } },
    set(v) { try { localStorage.setItem(KEY, JSON.stringify(v)); } catch {} },
    clear() { try { localStorage.removeItem(KEY); } catch {} }
  };
  if (new URLSearchParams(location.search).has('reset')) store.clear();

  const saved = store.get();
  const st = saved || { i: 0, done: false, clientId: crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random()),
    a: { items: {}, contentExtra: '', design: '', designNote: '', likes: [], motion: '', photos: [], refs: '', avoid: '' } };
  const A = st.a;
  const save = () => store.set(st);

  const steps = [
    { type: 'intro' },
    ...S.pages.map((p, k) => ({ type: 'items', page: p, section: k === 0 ? { n: '01', t: '홈페이지에 넣을 내용', s: '페이지별로 넣고 싶은 항목을 골라 주세요' } : null })),
    { type: 'text', key: 'contentExtra', kicker: '홈페이지 내용', title: '그 밖에 넣고 싶은 내용이 있다면 적어 주세요', hint: '없으면 비워 두셔도 됩니다.' },
    { type: 'designs', section: { n: '02', t: '디자인 시안', s: '두 가지 시안 중 마음에 드는 쪽을 골라 주세요' } },
    { type: 'multi', key: 'likes', kicker: '디자인', title: '마음에 드는 요소를 모두 골라 주세요', list: S.likes },
    { type: 'single', key: 'motion', kicker: '디자인', title: '화면 움직임은 어느 정도가 좋으신가요?', list: S.motion },
    { type: 'multi', key: 'photos', kicker: '디자인', title: '지금 갖고 계신 사진을 골라 주세요', hint: '사진이 들어가면 홈페이지 완성도가 크게 올라갑니다.', list: S.photos },
    { type: 'text', key: 'refs', kicker: '디자인', title: '참고하고 싶은 사이트나 인스타 계정이 있나요?', hint: '주소나 계정 이름을 적어 주세요. 없으면 비워 두셔도 됩니다.' },
    { type: 'text', key: 'avoid', kicker: '디자인', title: '피하고 싶은 느낌이 있다면 적어 주세요', hint: '예: 너무 화려한 느낌, 차가운 느낌 등' },
    { type: 'review', section: { n: '03', t: '마지막 확인', s: '고르신 내용을 확인하고 보내 주세요' } }
  ];
  const total = steps.length;

  /* ---------- 렌더 ---------- */
  const lines = (t) => t.split('\n').map((x) => `<span class="line"><span data-m>${esc(x)}</span></span>`).join('');
  const head = (k, t, h) => `<p class="kicker" data-m>${esc(k)}</p><h1 class="title">${lines(t)}</h1>${h ? `<p class="hint" data-m>${esc(h)}</p>` : ''}`;

  function render(s) {
    switch (s.type) {
      case 'intro': return `
        <div class="intro-shapes" aria-hidden="true">
          <i class="ci pop" style="width:84px;height:84px;left:0;top:4px;background:var(--sun)"></i>
          <i class="hx pop" style="width:56px;height:64px;left:96px;top:24px;background:var(--sky);animation-delay:.12s"></i>
          <i class="sq pop" style="width:46px;height:46px;left:166px;top:40px;background:var(--coral);animation-delay:.24s"></i>
        </div>
        <h1 class="title">${lines('홈페이지에 담을 내용과\n디자인을 골라 주세요')}</h1>
        <div class="letter">
          <p data-m>안녕하세요, 대표님. 트라이댓 한진규입니다.</p>
          <p data-m>홈페이지 제작을 시작하기 전에, 넣을 내용과 디자인 방향을 정하려고 합니다. 항목을 고르기만 하시면 되고, 필요한 자료는 그다음에 따로 받겠습니다.</p>
          <p data-m>고르신 내용 중 글 · 사진 · 프로그램은 오픈 후에도 관리 화면에서 직접 바꾸실 수 있습니다.</p>
        </div>
        <div class="meta" data-m><div><b>구성</b>홈페이지 내용 · 디자인 시안</div><div><b>소요 시간</b>약 5분</div></div>
        <div style="margin-top:32px" data-m><button class="btn btn-primary" type="button" data-act="start">시작하기</button></div>`;

      case 'items': {
        const p = s.page, n = p.items.filter((it) => A.items[it.id]).length;
        return `${head('홈페이지 내용 · ' + p.name, p.name + '에 넣을 내용', '넣고 싶은 항목을 모두 골라 주세요. 아래 회색 글씨는 준비해 주실 자료입니다.')}
          <div class="tools" data-m><span><b id="cnt" style="color:var(--ink)">${n}</b> / ${p.items.length}개 선택</span><button class="btn-text" type="button" data-act="rec">추천 항목 모두 선택</button></div>
          <ul class="items">${p.items.map((it) => `
            <li class="item" data-m data-on="${A.items[it.id] ? 1 : 0}" data-id="${it.id}">
              <button type="button" aria-pressed="${!!A.items[it.id]}">
                <span class="box">${CHECK}</span>
                <span><span class="it-t">${esc(it.t)}</span><span class="it-d">${esc(it.d)}</span><span class="it-n">준비 자료 · <b>${esc(it.need)}</b></span></span>
                ${it.extra ? '<span class="tag extra">별도 작업</span>' : it.rec ? '<span class="tag rec">추천</span>' : '<span></span>'}
              </button>
            </li>`).join('')}</ul>`;
      }

      case 'designs': return `${head('디자인 시안', '마음에 드는 시안을 골라 주세요', '"전체 화면 보기"를 누르면 실제 페이지처럼 스크롤해 보실 수 있습니다.')}
        <div class="designs">${S.designs.map((d) => `
          <article class="dcard" data-m data-on="${A.design === d.id ? 1 : 0}" data-design="${d.id}">
            <img class="shot" src="${d.hero}" alt="${esc(d.name)} 첫 화면" loading="lazy">
            <div class="in"><h3>${esc(d.name)}</h3><p>${esc(d.d)}</p>
              <div class="acts">
                <button class="btn btn-ghost pick" type="button" data-pick="${d.id}">${A.design === d.id ? '선택됨' : '이 시안으로'}</button>
                <a href="${d.page}" target="_blank" rel="noopener">전체 화면 보기 ↗</a>
                <button class="btn-text" type="button" data-full="${d.id}">긴 캡처로 보기</button>
              </div></div>
          </article>`).join('')}</div>
        <div class="opts" style="margin-top:16px">
          ${['둘을 섞고 싶어요', '둘 다 아니에요'].map((v) => `<button class="opt radio" type="button" data-m data-pick="${v}" data-on="${A.design === v ? 1 : 0}"><span class="box">${CHECK}</span>${esc(v)}</button>`).join('')}
        </div>
        <textarea id="designNote" data-m placeholder="섞고 싶은 부분이나 바꾸고 싶은 점이 있으면 적어 주세요 (선택)">${esc(A.designNote)}</textarea>`;

      case 'multi': case 'single': {
        const on = (v) => (s.type === 'multi' ? A[s.key].includes(v) : A[s.key] === v);
        return `${head(s.kicker, s.title, s.hint || (s.type === 'multi' ? '여러 개 고르셔도 됩니다.' : ''))}
          <div class="opts">${s.list.map((v) => `<button class="opt ${s.type === 'single' ? 'radio' : ''}" type="button" data-m data-val="${esc(v)}" data-on="${on(v) ? 1 : 0}" aria-pressed="${on(v)}"><span class="box">${CHECK}</span>${esc(v)}</button>`).join('')}</div>`;
      }

      case 'text': return `${head(s.kicker, s.title, s.hint)}<textarea id="ta" data-m data-key="${s.key}" placeholder="여기에 적어 주세요">${esc(A[s.key])}</textarea>`;

      case 'review': {
        const picked = S.pages.map((p) => [p.name, p.items.filter((it) => A.items[it.id]).map((it) => it.t)]);
        const row = (k, v) => `<div class="rv-row" data-m><dt>${esc(k)}</dt><dd>${v ? esc(v) : '<span style="color:var(--muted)">없음</span>'}</dd></div>`;
        const dname = (S.designs.find((d) => d.id === A.design) || {}).name || A.design;
        return `${head('마지막 확인', '이대로 보내 드릴까요?', '고치고 싶은 부분은 이전 버튼으로 돌아가 수정하실 수 있습니다.')}
          <dl class="review">
            ${picked.map(([k, v]) => row(k, v.join(', '))).join('')}
            ${row('추가 내용', A.contentExtra)}
            ${row('디자인 시안', dname + (A.designNote ? ' — ' + A.designNote : ''))}
            ${row('좋은 요소', A.likes.join(', '))}
            ${row('움직임', A.motion)}
            ${row('보유 사진', A.photos.join(', '))}
            ${row('참고 사이트', A.refs)}
            ${row('피할 느낌', A.avoid)}
          </dl>
          <div id="err"></div>`;
      }

      case 'done': return `
        <div class="done-shapes" aria-hidden="true">
          <i class="ci pop bob" style="width:110px;height:110px;left:0;top:0;background:var(--sun)"></i>
          <i class="hx pop" style="width:64px;height:72px;left:124px;top:40px;background:var(--sky);animation-delay:.15s"></i>
          <i class="sq pop" style="width:52px;height:52px;left:200px;top:66px;background:var(--coral);animation-delay:.3s"></i>
        </div>
        <h1 class="title">${lines('감사합니다.\n잘 받았습니다.')}</h1>
        <p class="desc" data-m>고르신 내용을 바탕으로 필요한 자료 목록을 정리해 카카오톡으로 따로 보내 드리겠습니다.</p>`;
    }
  }

  /* ---------- 진행 ---------- */
  function canNext(s) {
    if (s.type === 'designs') return !!A.design;
    return true;
  }
  function chrome() {
    const s = steps[st.i];
    const show = !st.done && s.type !== 'intro';
    nav.hidden = !show;
    prev.disabled = st.i <= 1;
    prev.style.visibility = st.i <= 1 ? 'hidden' : 'visible';
    next.textContent = s.type === 'review' ? '보내기' : '다음';
    next.disabled = !canNext(s);
    $('counter').textContent = st.done ? '완료' : s.type === 'intro' ? '' : `${st.i} / ${total - 1}`;
    $('barFill').style.width = (st.done ? 100 : (st.i / (total - 1)) * 100) + '%';
  }

  function stagger(root) {
    root.querySelectorAll('[data-m]').forEach((el, k) => (el.style.transitionDelay = reduce ? '0s' : Math.min(k * 0.06, 0.9) + 's'));
  }

  async function overlay(sec) {
    const o = $('overlay');
    $('ovNum').textContent = sec.n; $('ovTitle').textContent = sec.t; $('ovSub').textContent = sec.s;
    o.classList.remove('hide'); void o.offsetWidth; o.classList.add('show');
    await wait(1500);
    o.classList.add('hide');
    await wait(150);
  }
  const resetOverlay = () => { const o = $('overlay'); o.classList.remove('show', 'hide'); };

  let busy = false;
  async function go(to, dir = 1) {
    if (busy) return; busy = true;
    stage.classList.remove('in'); stage.classList.add('out'); stage.classList.toggle('back', dir < 0);
    await wait(260);
    const s = steps[to];
    const withSec = dir > 0 && s.section;
    if (withSec) await overlay(s.section);
    st.i = to; save();
    paint();
    window.scrollTo({ top: 0, behavior: 'instant' });
    if (withSec) { await wait(700); resetOverlay(); }
    busy = false;
  }

  function paint() {
    const s = st.done ? { type: 'done' } : steps[st.i];
    stage.classList.remove('in', 'out', 'back');
    stage.innerHTML = render(s);
    stagger(stage);
    requestAnimationFrame(() => requestAnimationFrame(() => stage.classList.add('in')));
    chrome();
    bind(s);
  }

  /* ---------- 상호작용 ---------- */
  function bind(s) {
    stage.querySelector('[data-act=start]')?.addEventListener('click', () => go(1));

    if (s.type === 'items') {
      const upd = () => { $('cnt').textContent = s.page.items.filter((it) => A.items[it.id]).length; save(); };
      stage.querySelectorAll('.item').forEach((li) => li.querySelector('button').addEventListener('click', () => {
        const id = li.dataset.id, v = !A.items[id];
        A.items[id] = v; li.dataset.on = v ? 1 : 0; li.querySelector('button').setAttribute('aria-pressed', v); upd();
      }));
      stage.querySelector('[data-act=rec]').addEventListener('click', () => {
        s.page.items.forEach((it) => { if (it.rec) { A.items[it.id] = true; const li = stage.querySelector(`[data-id="${it.id}"]`); li.dataset.on = 1; li.querySelector('button').setAttribute('aria-pressed', true); } });
        upd();
      });
    }

    if (s.type === 'multi' || s.type === 'single') {
      stage.querySelectorAll('.opt').forEach((b) => b.addEventListener('click', () => {
        const v = b.dataset.val;
        if (s.type === 'multi') {
          const arr = A[s.key], k = arr.indexOf(v);
          k < 0 ? arr.push(v) : arr.splice(k, 1);
          b.dataset.on = k < 0 ? 1 : 0; b.setAttribute('aria-pressed', k < 0);
        } else {
          A[s.key] = v;
          stage.querySelectorAll('.opt').forEach((o) => { o.dataset.on = o === b ? 1 : 0; o.setAttribute('aria-pressed', o === b); });
        }
        save(); chrome();
      }));
    }

    if (s.type === 'designs') {
      const sync = () => {
        stage.querySelectorAll('[data-design]').forEach((c) => { const on = c.dataset.design === A.design; c.dataset.on = on ? 1 : 0; c.querySelector('.pick').textContent = on ? '선택됨' : '이 시안으로'; });
        stage.querySelectorAll('.opt[data-pick]').forEach((o) => (o.dataset.on = o.dataset.pick === A.design ? 1 : 0));
        save(); chrome();
      };
      stage.querySelectorAll('[data-pick]').forEach((b) => b.addEventListener('click', () => { A.design = b.dataset.pick; sync(); }));
      stage.querySelectorAll('[data-full]').forEach((b) => b.addEventListener('click', () => {
        const d = S.designs.find((x) => x.id === b.dataset.full);
        $('viewerTitle').textContent = d.name; $('viewerImg').src = d.full; $('viewerImg').alt = d.name + ' 전체 화면';
        $('viewer').hidden = false; document.body.style.overflow = 'hidden';
      }));
      $('designNote').addEventListener('input', (e) => { A.designNote = e.target.value; save(); });
    }

    if (s.type === 'text') $('ta').addEventListener('input', (e) => { A[s.key] = e.target.value; save(); });
  }

  $('viewerClose').addEventListener('click', () => { $('viewer').hidden = true; document.body.style.overflow = ''; });
  prev.addEventListener('click', () => st.i > 1 && go(st.i - 1, -1));
  next.addEventListener('click', async () => {
    const s = steps[st.i];
    if (!canNext(s)) return;
    if (s.type === 'review') return submit();
    go(st.i + 1, 1);
  });

  /* ---------- 제출 ---------- */
  async function submit() {
    const err = $('err');
    next.disabled = true; next.textContent = '보내는 중…'; err.innerHTML = '';
    const payload = {
      token: CFG.SUBMIT_TOKEN || '',
      clientId: st.clientId,
      submittedAt: new Date().toISOString(),
      ua: navigator.userAgent,
      answers: { ...A, items: undefined },
      items: S.pages.flatMap((p) => p.items.map((it) => ({ page: p.name, id: it.id, title: it.t, need: it.need, selected: !!A.items[it.id] })))
    };
    const local = /^(localhost|127\.0\.0\.1|)$/.test(location.hostname);
    try {
      if (!CFG.SUBMIT_URL) {
        if (!local) throw new Error('제출 주소가 설정되지 않았습니다.');
        console.log('[local] payload', payload);
      } else {
        const r = await fetch(CFG.SUBMIT_URL, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(payload) });
        const j = await r.json().catch(() => ({}));
        if (!r.ok || !j.ok) throw new Error(j.error || '응답을 저장하지 못했습니다.');
      }
      st.done = true; save();
      stage.classList.add('out'); await wait(260); paint();
    } catch (e) {
      err.innerHTML = `<div class="err">전송에 실패했습니다. 잠시 후 다시 시도해 주세요. (${esc(e.message)})</div>`;
      next.disabled = false; next.textContent = '다시 보내기';
    }
  }

  paint();
})();
