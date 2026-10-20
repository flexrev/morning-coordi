// ST1 설정 — 화면(다크·라이트·자동) · 움직임(시스템 따름·줄이기) · 계절(자동으로 되돌리기 한 줄) · 처음 안내 · 모든 저장 지우기 · 정보.
// U6-15: 계절 세그먼트(S3 와 중복)·앱 행(O2 "앱으로 두기"와 중복) 제거.
import { h } from '../dom.js';
import { topbar, segment } from '../components.js';
import * as nav from '../nav.js';
import { get as getState, setTheme, setMotion, resetSeason, seasonForMonth } from '../state.js';
import { applyMotionPref } from '../motion.js';
import { write, KEYS, available } from '../storage.js';
import { resetAll as resetCoach } from '../coach.js';

const VERSION = '1.1.0';

export function applyThemeAttr(theme) {
  document.documentElement.dataset.theme = ['dark', 'light', 'auto'].includes(theme) ? theme : 'dark';
}

export function settingsScreen() {
  const st = getState();
  const cat = st.catalog;
  const screen = h('main', { class: 'screen', id: 'st1' });
  screen.append(topbar({ title: '설정', back: () => nav.back('/result') }));
  const body = h('div', { class: 'screen__body screen__body--scroll set' });

  const row = (k, control, note) => h('div', { class: 'srow' }, h('div', { class: 'srow__k', text: k }), control, note ? h('p', { class: 'caption srow__note', text: note }) : null);

  // 화면 — 전환 모션 없음(색이 한 프레임에 바뀐다, P5)
  body.append(row('화면', segment({ label: '화면', value: st.theme, name: 'theme', options: [['dark', '다크'], ['light', '라이트'], ['auto', '자동']], onChange: (t) => { setTheme(t); applyThemeAttr(t); } })));

  // 움직임
  let osReduce = false;
  try { osReduce = matchMedia('(prefers-reduced-motion: reduce)').matches; } catch { /* noop */ }
  body.append(row('움직임', segment({ label: '움직임', value: st.motion, name: 'motion', options: [['auto', '시스템 따름'], ['reduce', '줄이기']], onChange: (m) => { setMotion(m); applyMotionPref(m); } }),
    `시스템은 ${osReduce ? '줄이기' : '줄이지 않음'}`));

  // 계절 — 세그먼트는 S3 상단에 이미 있다. 남는 가치는 "자동으로 되돌리기" 한 줄뿐 (U6-15)
  const seasonNote = h('p', { class: 'caption srow__note' });
  const autoBtn = h('button', { class: 'btn btn--block glass', type: 'button', text: '계절 자동으로 되돌리기' });
  const paintSeason = () => {
    const s = getState();
    const auto = s.seasonIsAuto || s.season === seasonForMonth();
    seasonNote.textContent = `지금 ${cat.label(`season.${s.season}`)}${auto ? ' · 이번 달 기준' : ''}`;
    autoBtn.disabled = auto;
    autoBtn.setAttribute('aria-disabled', String(auto));
  };
  autoBtn.addEventListener('click', () => { resetSeason(); paintSeason(); });
  paintSeason();
  body.append(row('계절', autoBtn, ''));
  autoBtn.after(seasonNote);

  // 처음 안내
  body.append(row('안내', h('button', { class: 'btn btn--block glass', type: 'button', text: '처음 안내 다시 보기', onClick: () => { write(KEYS.onboarded, null); resetCoach(); nav.replace('/'); } })));

  // 저장
  body.append(row('저장', h('button', { class: 'btn btn--block btn--danger-text glass', type: 'button', 'data-focus-key': 'st1:reset', text: '모든 저장 지우기', onClick: () => nav.go('/settings/reset') }),
    available() ? null : '이 기기에선 저장이 안 돼요'));

  body.append(h('div', { class: 'spacer' }));
  body.append(h('p', { class: 'caption set__info', text: `버전 ${VERSION} · 오프라인에서도 열려요` }));
  body.append(h('p', { class: 'caption set__info', text: '공유는 기기 안에서 만들어져요. 서버로 보내지 않아요' }));
  body.append(h('div', { style: 'height:max(var(--safe-bottom), var(--sp-5))' }));
  screen.append(body);
  screen.__update = () => {};
  return screen;
}
