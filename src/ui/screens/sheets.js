// 새 시트 — O2 메뉴 · F1 즐겨찾기 · SH1 공유 미리보기 · ST1-r 초기화 확인 (ux-enhancement 4·5·7-3·8장).
import { h } from '../dom.js';
import { sheet, outfitCard, toast, captionParts } from '../components.js';
import { icon } from '../icons.js';
import * as nav from '../nav.js';
import { get as getState, findCandidate, favLabel } from '../state.js';
import * as favorites from '../favorites.js';
import { isStandalone, isIOS, isAndroid } from '../install.js';
import { renderOutfit, serializeStandalone, colorValue } from '../silhouette.js';
import { buildShareImage, shareCapability, shareBlob, downloadBlob } from '../share.js';
import { clearAll, write, KEYS } from '../storage.js';
import { resetAll as resetCoach } from '../coach.js';
import { stagger } from '../motion.js';

/** O2 메뉴 시트: 저빈도 기능의 집. 4줄 이하 */
export function menuSheet() {
  const n = favorites.count();
  const rows = [];
  const row = (ic, text, onClick, right) => h('button', { class: 'mrow', type: 'button', onClick }, icon(ic, { size: 22 }), h('span', { class: 'mrow__t', text }), right ? h('span', { class: 'mrow__r', text: right }) : null);
  rows.push(row('heart', '즐겨찾기', () => nav.replace('/result/fav'), String(n)));
  rows.push(row('gear', '설정', () => nav.replace('/settings')));
  if (!isStandalone() && (isIOS() || isAndroid())) rows.push(row('download', '앱으로 두기', () => nav.replace('/result/install')));
  rows.push(row('help', '처음 안내 다시 보기', () => { write(KEYS.onboarded, null); resetCoach(); nav.replace('/'); }));
  return sheet({ title: '메뉴', body: h('div', { class: 'menu' }, ...rows) });
}

/** F1 즐겨찾기 시트 (72dvh): 최신순, 카드 탭 → S5(fav.<id>), ♥ 탭 → 해제·제거 */
export function favSheet() {
  const st = getState();
  const cat = st.catalog;
  const body = h('div', { class: 'fav' });
  const list = h('div', { class: 'cards cards--sheet', role: 'list', 'aria-label': '저장한 조합' });
  const titleOf = () => `저장한 조합 ${favorites.count()}`;
  function render() {
    list.replaceChildren();
    const items = favorites.list();
    if (!items.length) {
      list.append(h('div', { class: 'empty' }, h('p', { text: '아직 저장한 조합이 없어요' }), h('p', { class: 'caption', text: '카드의 ♥ 를 누르면 여기에 모여요' })));
      return;
    }
    for (const f of items) {
      const li = h('div', { role: 'listitem' });
      const found = findCandidate(`fav.${f.id}`);
      if (found) {
        li.append(outfitCard(found.candidate, { label: favLabel(f), ref: `fav.${f.id}`, season: f.season, base: f.base, reason: false }));
      } else {
        // 데이터 버전 변경으로 못 찾는 항목: 흐리게 + 해제만
        const card = h('div', { class: 'card card--missing' });
        card.append(h('div', { class: 'card__main card__main--static' },
          h('div', { class: 'card__ill plate', 'aria-hidden': 'true' }),
          h('div', { class: 'card__meta' }, h('div', { class: 'card__label', text: favLabel(f) }), h('div', { class: 'card__cap', text: '지금 버전엔 없는 조합이에요' }))));
        const btn = h('button', { class: 'card__fav is-on', type: 'button', 'aria-pressed': 'true', 'aria-label': `저장 해제, ${favLabel(f)}`, onClick: () => { favorites.remove(f.id); toast('저장을 해제했어요', 1600); } }, icon('heart', { filled: true }));
        card.append(btn);
        li.append(card);
      }
      list.append(li);
    }
    stagger(list.children);
    list.classList.add('is-enter');
  }
  render();
  body.append(list);
  const root = sheet({ title: titleOf(), body, className: 'sheet-root--tall' });
  const off = favorites.subscribe(() => {
    if (!root.isConnected) { off(); return; }
    root.querySelector('.sheet__title').textContent = titleOf();
    root.querySelector('.sheet')?.setAttribute('aria-label', titleOf());
    render();
  });
  return root;
}

/** SH1 공유 미리보기: 캔버스 PNG + [공유하기]/[이미지 저장]. 네트워크 없음 */
export function shareSheet(ref) {
  const st = getState();
  const cat = st.catalog;
  const found = findCandidate(ref);
  if (!found) return sheet({ title: '공유', body: h('p', { class: 'sheet__note', text: '이 조합을 찾을 수 없어요' }) });
  const { candidate, label } = found;
  const season = found.season || st.season;
  const items = candidate.outfit.items;
  const caption = captionParts(items).join(' · ');
  const labelText = `${typeof label === 'string' ? label : '조합'} · ${cat.label(`season.${season}`)}`;
  const deep = `${location.origin}${location.pathname}#/result/${(found.base || st.base).category}/${(found.base || st.base).color}/outfit/${ref.startsWith('fav.') ? 'classic.0' : ref}`;
  const text = `${caption} — 아침 코디`;

  const body = h('div', { class: 'share' });
  const preview = h('div', { class: 'share__img', 'aria-busy': 'true' });   // 그리는 동안 --bg-2 자리표시(밝은 색 없음)
  body.append(preview);
  const note = h('p', { class: 'caption share__note' });
  const actions = h('div', { class: 'share__actions' });
  body.append(actions, note);

  let blob = null;
  const iosStandalone = isStandalone() && isIOS();
  const goBtn = h('button', { class: 'btn btn--primary btn--block', type: 'button', text: '공유하기', disabled: true, onClick: async () => {
    if (!blob) return;
    try { await shareBlob(blob, { title: '아침 코디', text, url: deep }); } catch { toast('공유하지 못했어요'); }
  } });
  const saveBtn = h('button', { class: 'btn btn--block glass', type: 'button', text: '이미지 저장', disabled: true, onClick: () => { if (blob) downloadBlob(blob); } });
  const textBtn = h('button', { class: 'btn btn--block glass', type: 'button', text: '글로 공유', hidden: true, onClick: async () => {
    try { await navigator.share({ title: '아침 코디', text, url: deep }); } catch { /* 취소 */ }
  } });
  actions.append(goBtn); if (!iosStandalone) actions.append(saveBtn); actions.append(textBtn);
  if (iosStandalone) note.textContent = '이미지를 길게 눌러 저장할 수 있어요';

  // 미리보기는 시트가 열리는 동안 그린다 (렌더 ≈ 30–80ms)
  (async () => {
    try {
      const holder = h('div', { style: 'position:absolute;width:0;height:0;overflow:hidden', 'aria-hidden': 'true' });
      const svg = renderOutfit(items, { size: 920, season, hexOf: cat.hex, stage: true, accessories: candidate.accessories });
      holder.append(svg);
      document.body.append(holder);
      const markup = serializeStandalone(svg, { ink: '#F4F2ED' });
      holder.remove();
      const dotColors = cat.ordered(items).map((it) => colorValue(it.color, cat.hex(it.color)));
      blob = await buildShareImage({ svgMarkup: markup, caption, label: labelText, dotColors, iconUrl: new URL('icons/icon-192.png', document.baseURI).href });
      const url = URL.createObjectURL(blob);
      const img = h('img', { alt: `${caption} 공유 이미지`, src: url, width: 1080, height: 1350 });
      preview.replaceChildren(img);
      preview.removeAttribute('aria-busy');
      const cap = shareCapability(blob);
      if (cap === 'none') goBtn.hidden = true; else goBtn.disabled = false;
      saveBtn.disabled = false;
    } catch (e) {
      console.error(e);
      preview.replaceChildren(h('p', { class: 'sheet__note', text: '이미지를 만들지 못했어요' }));
      preview.removeAttribute('aria-busy');
      goBtn.hidden = true; saveBtn.hidden = true;
      if (typeof navigator.share === 'function') textBtn.hidden = false;
    }
  })();
  const root = sheet({ title: '공유', body });
  root.querySelector('.sheet')?.setAttribute('aria-label', '공유');
  return root;
}

/** ST1-r 초기화 확인 시트 */
export function resetSheet() {
  const n = favorites.count();
  const body = [
    h('p', { class: 'sheet__note', text: `즐겨찾기 ${n}개, 최근 선택, 계절, 화면 설정이 지워져요` }),
    h('button', { class: 'btn btn--block btn--danger', type: 'button', text: '지우기', onClick: () => {
      clearAll();
      favorites.resetCache();
      location.hash = '#/';
      location.reload();
    } }),
    h('button', { class: 'btn btn--block glass', type: 'button', text: '취소', onClick: () => nav.back('/settings') }),
  ];
  return sheet({ title: '모든 저장 지우기', body });
}

