// ==UserScript==
// @name         Reforger Workshop Power Browser
// @namespace    tytan.reforger
// @version      1.10
// @description  Dense, filterable, sortable browser for the Arma Reforger Workshop with hover summaries and server-config-compatible mod collections
// @match        https://reforger.armaplatform.com/workshop*
// @grant        none
// @run-at       document-idle
// ==/UserScript==
(function () {
  'use strict';
  if (window.__pbLoaded) return;
  window.__pbLoaded = true;

  const CATS = ['WEAPONS', 'VEHICLES', 'CHARACTERS', 'SYSTEMS', 'SCENARIOS_MP', 'SCENARIOS_SP', 'TERRAINS', 'EFFECTS',
    'PROPS', 'STRUCTURES', 'AI', 'COMPOSITIONS', 'GAMEMASTER', 'CREATURES', 'MISC', 'TESTDEV'];
  const PER_PAGE = 16;
  const LS = 'pb_settings_v1';
  const VERSION = (typeof GM_info !== 'undefined' && GM_info.script && GM_info.script.version) || '1.10';
  const COFFEE_URL = ''; // set to a "buy me a coffee" page later; while empty the button plays an easter egg
  const LSC = 'pb_collections_v1';
  const DESC_LINES = 5;

  const css = `
#pb-btn{position:fixed;right:18px;bottom:18px;z-index:2147483646;background:#1d6b3a;color:#fff;border:0;border-radius:8px;padding:10px 14px;font:600 14px system-ui;cursor:pointer;box-shadow:0 4px 14px #0008}
#pb{position:fixed;inset:0;z-index:2147483647;background:#111418;color:#e6e6e6;font:13px system-ui,sans-serif;display:none;flex-direction:column}
#pb.open{display:flex}
#pb header{padding:5px 10px;background:linear-gradient(#1d222a,#171b21);border-bottom:1px solid #2a2f37;display:flex;flex-wrap:wrap;gap:6px;align-items:center;box-shadow:0 2px 8px #0005;position:relative;z-index:2}
#pb .brand{font-weight:700;letter-spacing:.4px;color:#8fd3a3;padding:0 6px 0 0;white-space:nowrap;display:flex;align-items:center;gap:9px;cursor:default}
#pb .bttl{display:flex;flex-direction:column;justify-content:center;gap:1px;line-height:1.15}
#pb header .pwr{width:22px;height:22px;min-width:0;padding:0;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#9be05a;
  background:radial-gradient(circle at 50% 40%,#1e2b1f,#12161b);border:1px solid #3d7a2a;animation:pbGlow 3s ease-in-out infinite}
#pb header .pwr svg{width:13px;height:13px;filter:drop-shadow(0 0 3px #75b022)}
#pb header .pwr:hover{color:#ff8a7a;border-color:#a33a33;background:radial-gradient(circle at 50% 40%,#2b1c1c,#16110f);animation:none;box-shadow:0 0 10px #ff4d3d99}
#pb header .pwr:hover svg{filter:drop-shadow(0 0 4px #ff4d3d)}
#pb header .pwr.off{animation:pbOff .2s ease forwards}
@keyframes pbGlow{0%,100%{box-shadow:0 0 5px #75b02266}50%{box-shadow:0 0 11px #75b022bb}}
@keyframes pbOff{to{color:#3a424c;border-color:#313842;box-shadow:none}}
#pb .ver{font-size:9px;font-weight:600;color:#5f6873;letter-spacing:.3px;line-height:1}
#pb header .cof{width:30px;padding:0;display:flex;align-items:center;justify-content:center;color:#c8a27a}
#pb header .cof svg{width:17px;height:17px;overflow:visible}
#pb header .cof:hover{color:#e8c08f;border-color:#7a5a3a;background:#241e19}
#pb header .cof:hover .stm{animation:pbSteam 1.2s ease-in-out infinite}
@keyframes pbSteam{0%,100%{transform:translateY(0);opacity:1}50%{transform:translateY(-1.5px);opacity:.45}}
#pb .egg{display:flex;align-items:center;gap:0;height:28px;padding:0 4px;color:#5f6873;cursor:default;user-select:none}
#pb .egg .st{display:inline-block;font-size:13px;transition:color .3s,text-shadow .3s}
#pb .egg .mb{max-width:0;overflow:hidden;white-space:nowrap;opacity:0;font-size:11px;font-weight:600;letter-spacing:.5px;color:#f5d37a;transition:max-width .45s ease,opacity .35s ease .1s,margin .45s ease}
#pb .egg:hover .st{color:#f5d37a;text-shadow:0 0 8px #f5d37a;animation:pbTwinkle .7s ease}
#pb .egg:hover .mb{max-width:110px;opacity:1;margin-left:6px}
@keyframes pbTwinkle{0%{transform:rotate(0) scale(1)}50%{transform:rotate(180deg) scale(1.45)}100%{transform:rotate(360deg) scale(1)}}
.pb-bean{position:fixed;z-index:2147483647;width:7px;height:10px;border-radius:50%;background:#6b4426;box-shadow:inset -2px 0 0 #4a2e18;pointer-events:none;animation:pbBean .9s ease-out forwards}
@keyframes pbBean{from{transform:translate(0,0) rotate(0);opacity:1}to{transform:translate(var(--dx),-46px) rotate(var(--rot));opacity:0}}
.pb-cofmsg{position:fixed;z-index:2147483647;max-width:260px;background:#1d1712;color:#f0dcc2;border:1px solid #7a5a3a;border-radius:8px;padding:7px 10px;font:12px/1.4 system-ui,sans-serif;box-shadow:0 6px 18px #000a;pointer-events:none;animation:pbMsg 2.8s ease forwards}
@keyframes pbMsg{0%{opacity:0;transform:translateY(-4px)}10%,85%{opacity:1;transform:translateY(0)}100%{opacity:0;transform:translateY(-4px)}}
#pb .grp{display:flex;align-items:stretch;padding:3px 5px 3px 0;background:#13171c;border:1px solid #262c34;border-radius:9px;transition:padding .25s ease}
#pb .grp.min{padding-right:0}
#pb .gc{display:flex;align-items:center;flex-wrap:wrap;gap:5px;max-width:1400px;overflow:hidden;padding:2px 2px 2px 6px;margin:-2px 0;opacity:1;transition:max-width .3s ease,opacity .2s ease,padding .3s ease}
#pb .grp.min .gc{max-width:0;opacity:0;padding-left:0;padding-right:0;flex-wrap:nowrap;pointer-events:none}
#pb .gl{font-size:10px;font-weight:700;letter-spacing:1.3px;text-transform:uppercase;color:#5f6873;padding:0 8px 0 9px;border-right:1px solid #262c34;display:flex;align-items:center;gap:5px;cursor:pointer;user-select:none;outline:none;transition:color .2s,text-shadow .2s,border-color .25s}
#pb .grp:not(.min) .gl{color:#8fd3a3;text-shadow:0 0 6px #75b022aa,0 0 12px #75b02255}
#pb .gl::after{content:'‹';font-size:13px;line-height:1;letter-spacing:0;opacity:.55;transition:transform .25s}
#pb .grp.min .gl{border-right-color:transparent}
#pb .grp.min .gl::after{transform:rotate(180deg)}
#pb .gl:hover{color:#c9f0d3}
#pb .grp.min .gl:hover{color:#9aa3ad}
#pb .gl:focus-visible{box-shadow:inset 0 0 0 1px #2a8a4d;border-radius:8px}
#pb header input,#pb header select,#pb header button{height:28px;box-sizing:border-box;padding:0 9px;border-radius:6px;background:#1f252d;border:1px solid #313842;transition:border-color .12s,background .12s,box-shadow .12s}
#pb header input:hover,#pb header select:hover,#pb header button:hover{border-color:#4a5562}
#pb header input:focus,#pb header select:focus{outline:none;border-color:#2a8a4d;box-shadow:0 0 0 2px #2a8a4d40}
#pb header button.pri{background:linear-gradient(#26874c,#1b6a3a);border-color:#2a8a4d;color:#fff;font-weight:600}
#pb header button.pri:hover{filter:brightness(1.1)}
#pb header .num{gap:5px;font-size:12px;padding-left:2px;cursor:default}
#pb header .num input{width:60px;padding:0 6px}
#pb header .tgl{height:28px;box-sizing:border-box;padding:0 11px 0 9px;gap:7px;border:1px solid #313842;border-radius:14px;background:#1f252d;cursor:pointer;font-size:12px;user-select:none;transition:background .12s,border-color .12s}
#pb header .tgl:hover{border-color:#4a5562}
#pb header .tgl input{display:none}
#pb header .tgl::before{content:'';width:8px;height:8px;border-radius:50%;background:#3a424c;transition:background .12s,box-shadow .12s}
#pb header .tgl:has(input:checked){background:#183020;border-color:#2a8a4d;color:#d3f0dc}
#pb header .tgl:has(input:checked)::before{background:#75b022;box-shadow:0 0 6px #75b022}
#pb .seg{display:flex;border:1px solid #313842;border-radius:6px;overflow:hidden}
#pb header .seg button{border:0;border-radius:0;height:26px}
#pb header .seg button+button{border-left:1px solid #313842}
#pb header .seg button.on{background:linear-gradient(#26874c,#1b6a3a);color:#fff}
#pb header input[type=range]{height:auto;padding:0;background:none;border:0;width:90px;accent-color:#2a8a4d;box-shadow:none}
#pb header input[type=range]:disabled{opacity:.3}
#pb header .ico{min-width:56px;padding:0 8px}

#pb .tagbar{background:#15191e;border-bottom:1px solid #2a2f37}
#pb .thead{display:flex;align-items:center;gap:8px;padding:4px 12px}
#pb .tt{background:none!important;border:0!important;color:#9aa3ad;font-size:12px;font-weight:600;letter-spacing:.4px;padding:2px 4px!important;display:flex;align-items:center;gap:6px}
#pb .tt:hover{color:#e6e6e6}
#pb .car{display:inline-block;transition:transform .15s}
#pb .tagbar.closed .car{transform:rotate(-90deg)}
#pb #pb-tagsum{font-weight:400;color:#6b7480}
#pb .mini{padding:1px 9px!important;font-size:11px!important;border-radius:10px!important}
#pb label{display:flex;align-items:center;gap:4px;color:#9aa3ad}
#pb input,#pb select,#pb button,#pb textarea{background:#20252d;color:#e6e6e6;border:1px solid #333a44;border-radius:6px;padding:5px 8px;font:inherit}
#pb input[type=number]{width:70px}
#pb input[type=checkbox]{appearance:auto;-webkit-appearance:checkbox;background:none;border:0;padding:0;margin:0;width:15px;height:15px;accent-color:#2a8a4d;cursor:pointer;flex:none}
#pb button{cursor:pointer}
#pb button:disabled{opacity:.45;cursor:default}
#pb button.pri{background:#1d6b3a;border-color:#2a8a4d}
#pb button.dng{border-color:#8a2a2a;color:#f0a0a0}
#pb .sp{flex:1}
#pb .tags{display:flex;flex-wrap:wrap;gap:4px;padding:0 12px 8px;max-height:96px;overflow:auto}
#pb .tags:empty{display:none}
#pb .chip{padding:3px 8px;border-radius:12px;border:1px solid #333a44;background:#1b2027;cursor:pointer;user-select:none;font-size:12px}
#pb .chip.inc{background:#1d6b3a;border-color:#2a8a4d}
#pb .chip.exc{background:#6b1d1d;border-color:#8a2a2a;text-decoration:line-through}
#pb .status{padding:3px 14px;color:#9aa3ad;font-size:12px;border-bottom:1px solid #22272e;display:flex;align-items:center;gap:10px;min-height:22px}
#pb .status #pb-status{flex:1;min-width:0}
#pb .pager{display:flex;align-items:center;gap:4px;font-size:12px;color:#9aa3ad}
#pb .pager:empty{display:none}
#pb .pager button{height:22px;min-width:24px;padding:0 6px;font-size:12px;line-height:1;border-radius:5px}
#pb .pager input{width:56px;height:22px;box-sizing:border-box;padding:0 5px;text-align:center}
#pb .pager.bot{justify-content:center;padding:14px 0 6px}
#pb .body{flex:1;display:flex;min-height:0}
#pb main{flex:1;min-width:0;overflow:auto;padding:10px 14px}
#pb .grid{display:grid;gap:8px;grid-template-columns:repeat(auto-fill,minmax(var(--cw,200px),1fr))}
#pb .card{background:#1a1e24;border:1px solid #2a2f37;border-radius:6px;overflow:hidden;display:flex;flex-direction:column;text-decoration:none;color:inherit}
#pb .card:hover{border-color:#2a8a4d}
#pb .card.in{border-color:#75b022;box-shadow:inset 0 0 0 1px #75b022}
#pb .pic{position:relative}
#pb .card img{width:100%;aspect-ratio:16/9;object-fit:cover;background:#0c0e11;display:block}
#pb .card .b{padding:6px 8px;display:flex;flex-direction:column;gap:3px}
#pb .card .n{font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#pb .card .m{color:#9aa3ad;font-size:11px;display:flex;justify-content:space-between;gap:6px}
#pb .card .t{font-size:10px;color:#7fbf8f;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#pb .idb{padding:0 5px!important;font-size:10px!important}
#pb .addb{position:absolute;right:6px;bottom:6px;width:26px;height:26px;padding:0!important;border:0!important;border-radius:3px!important;background:linear-gradient(#75b022,#588a1b)!important;color:#fff!important;font:700 18px/26px system-ui!important;text-align:center;box-shadow:0 1px 4px #000c;cursor:pointer}
#pb .addb:hover{filter:brightness(1.18)}
#pb .addb.on{background:linear-gradient(#6a7079,#454a51)!important}
#pb .addb.sm{position:static;width:22px;height:22px;font-size:15px!important;line-height:22px!important}
#pb table{width:100%;border-collapse:collapse}
#pb th,#pb td{padding:4px 6px;border-bottom:1px solid #22272e;text-align:left;white-space:nowrap}
#pb th{position:sticky;top:-10px;background:#181c22;z-index:1}
#pb th[data-k]:not([data-k=""]){cursor:pointer}
#pb tr.in td{background:#17251a}
#pb td.s{max-width:380px;overflow:hidden;text-overflow:ellipsis;color:#9aa3ad}
#pb td.tg{max-width:260px;overflow:hidden;text-overflow:ellipsis;color:#7fbf8f;font-size:11px}
#pb a{color:#8fd3a3}
#pb .dep{background:#2a3a55;color:#9fc0ff;border-radius:3px;padding:0 4px;font-size:10px;margin-left:4px}
#pb .gone{background:#4a3a1a;color:#f0c070;border-radius:3px;padding:0 4px;font-size:10px;margin-left:4px}
#pb aside{width:340px;flex:none;border-left:1px solid #2a2f37;background:#15191e;display:flex;flex-direction:column;min-height:0}
#pb aside .cp{display:flex;flex-direction:column;min-height:0;flex:1}
#pb aside .cphead{flex:none;display:flex;flex-direction:column;gap:6px;padding:8px 10px 6px;border-bottom:1px solid #2a2f37;background:#171b21;box-shadow:0 2px 6px #0004;position:relative;z-index:1}
#pb aside .cpbody{flex:1;min-height:0;overflow:auto;display:flex;flex-direction:column;gap:6px;padding:8px 10px 12px}
#pb aside .lhead{position:sticky;top:-8px;z-index:1;background:#15191e;padding:6px 0;margin:-2px 0 -2px}
#pb aside .srv{display:flex;flex-direction:column;gap:5px;padding:7px;border:1px solid #2a2f37;border-radius:6px;background:#111418}
#pb aside .srv label{font-size:12px;margin-left:2px}
#pb aside .note{color:#7d8690;font-size:11px;line-height:1.45}
#pb aside .row{display:flex;gap:4px;align-items:center}
#pb aside .btns{flex-wrap:wrap}
#pb aside .btns button{padding:4px 7px;font-size:12px}
#pb aside h3{margin:6px 0 0;font-size:11px;letter-spacing:1px;color:#6b7480;font-weight:600}
#pb aside .cpbody h3:first-child{margin-top:0}
#pb #pb-csel{flex:1;min-width:0}
#pb aside .stats{color:#9aa3ad;font-size:12px}
#pb aside .msg{color:#8fd3a3;font-size:12px;min-height:16px;line-height:1.35}
#pb aside .list{display:flex;flex-direction:column;gap:3px}
#pb aside .empty{color:#6b7480;font-size:12px;padding:12px 4px;line-height:1.5}
#pb aside .it{display:flex;gap:6px;align-items:center;background:#1a1e24;border:1px solid #2a2f37;border-radius:5px;padding:3px}
#pb aside .it:hover{border-color:#2a8a4d}
#pb aside .it.miss{border-color:#8a6a2a}
#pb aside .it img{width:56px;height:32px;object-fit:cover;border-radius:3px;background:#0c0e11;flex:none}
#pb aside .it .nm{flex:1;min-width:0;display:flex;flex-direction:column}
#pb aside .it .nm a{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:#e6e6e6;text-decoration:none}
#pb aside .it .nm a:hover{color:#8fd3a3}
#pb aside .it small{color:#7d8690;font-size:11px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#pb aside .rm{padding:2px 8px!important;color:#e88!important}
#pb aside .imp{display:flex;flex-direction:column;gap:4px;padding:6px;border:1px solid #2a2f37;border-radius:6px;background:#111418}
#pb aside .imp textarea{width:100%;height:110px;box-sizing:border-box;background:#0f1215;font:12px ui-monospace,monospace}
#pb aside .rail{display:none}
#pb aside.collapsed{width:34px}
#pb aside.collapsed .cp{display:none}
#pb aside.collapsed .rail{display:flex;flex-direction:column;align-items:center;gap:10px;padding:12px 0;cursor:pointer;color:#9aa3ad;height:100%;box-sizing:border-box}
#pb aside.collapsed .rail:hover{background:#1a1e24;color:#e6e6e6}
#pb aside .rail span{writing-mode:vertical-rl;letter-spacing:3px;font-size:11px}
#pb aside .rail b{background:#1d6b3a;color:#fff;border-radius:10px;padding:1px 6px;font-size:11px}
#pb-tip{position:fixed;z-index:2147483647;max-width:420px;background:#0c0e11;color:#e6e6e6;border:1px solid #2a8a4d;border-radius:6px;padding:8px 10px;font:12px/1.45 system-ui,sans-serif;box-shadow:0 6px 20px #000a;pointer-events:none;display:none;white-space:pre-wrap;word-wrap:break-word}
#pb-tip b{display:block;margin-bottom:4px;color:#8fd3a3}
#pb-tip .src{display:block;margin-top:6px;color:#6b7480;font-size:10px}
#pb-tip.img{width:360px;max-width:calc(100vw - 24px);padding:6px;white-space:normal}
#pb-tip .tm{display:flex;flex-direction:column;font-size:11px;line-height:1.35;margin:0 2px 5px}
#pb-tip .tn{color:#e6e6e6;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#pb-tip .ta{color:#8a939d}
#pb-tip img{display:block;width:100%;aspect-ratio:16/9;object-fit:cover;border-radius:4px;background:#0c0e11}
#pb-tip .slide{position:relative}
#pb-tip .slide img{transition:opacity .25s ease}
#pb td.dp{cursor:pointer}
#pb td.dp:hover{background:#1d232b}
#pb .dpok{color:#8fd3a3}
#pb .dpw{color:#f0c070;font-weight:600;display:inline-flex;align-items:center}
#pb .dpw::before{content:'!';display:inline-flex;align-items:center;justify-content:center;width:14px;height:14px;border-radius:50%;background:#f0c070;color:#111;font-size:10px;font-weight:800;margin-right:5px}
#pb .dpn,#pb .dpq{color:#6b7480}
#pb-tip.dt{max-width:460px;white-space:normal;padding:8px 10px}
#pb-tip table{border-collapse:collapse;width:100%;font-size:11px;margin-top:2px}
#pb-tip th,#pb-tip td{padding:3px 8px 3px 0;border-bottom:1px solid #22272e;text-align:left;white-space:nowrap}
#pb-tip th{color:#8a939d;font-weight:600}
#pb-tip td.ok{color:#8fd3a3}
#pb-tip td.no{color:#f0c070}
#pb-modal{position:absolute;inset:0;z-index:10;background:#000a;display:flex;align-items:center;justify-content:center}
#pb-modal[hidden]{display:none}
#pb .pbm{width:min(660px,calc(100vw - 32px));max-height:calc(100vh - 64px);display:flex;flex-direction:column;background:#171b21;border:1px solid #2f3640;border-radius:10px;box-shadow:0 14px 44px #000d}
#pb .pbm-h{display:flex;align-items:center;gap:8px;padding:12px 14px;border-bottom:1px solid #2a2f37;font-size:14px}
#pb .pbm-h b{flex:1}
#pb .pbm-x{padding:2px 9px;font-size:16px;line-height:1}
#pb .pbm-b{padding:12px 14px;overflow:auto;display:flex;flex-direction:column;gap:10px}
#pb .pbm-f{display:flex;align-items:center;gap:8px;padding:10px 14px;border-top:1px solid #2a2f37;flex-wrap:wrap}
#pb .pbm table{width:100%;border-collapse:collapse}
#pb .pbm th,#pb .pbm td{padding:5px 8px;border-bottom:1px solid #22272e;text-align:left}
#pb .pbm th{position:static;background:none;color:#8a939d;font-size:12px;font-weight:600}
#pb .pbm td.c{width:22px}
#pb .pbm .lead{color:#9aa3ad;line-height:1.5}
#pb .pbm .ok{color:#8fd3a3}
#pb .pbm .no{color:#f0c070}
#pb .pbm .dnw{font-size:12px}
#pb-tip .cnt{position:absolute;right:6px;bottom:6px;background:#000b;color:#d6dbe0;font-size:10px;padding:1px 7px;border-radius:9px}
#pb-tip .noimg{width:100%;aspect-ratio:16/9;border-radius:4px;background:#0c0e11;color:#6b7480;font-size:12px;display:flex;align-items:center;justify-content:center}
`;

  // ---------- helpers ----------
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const fmtSize = b => !b ? '?' : b >= 1073741824 ? (b / 1073741824).toFixed(1) + ' GB' : b >= 1048576 ? (b / 1048576).toFixed(1) + ' MB' : Math.max(1, Math.round(b / 1024)) + ' KB';
  const fmtNum = n => n >= 10000 ? Math.round(n / 1000) + 'k' : n >= 1000 ? (n / 1000).toFixed(1) + 'k' : String(n || 0);
  const day = s => (s || '').slice(0, 10);
  const pct = r => Math.round((r.averageRating || 0) * 100) + '%';
  const tagNames = r => (r.tags || []).map(t => t.name);
  const thumb = r => {
    const t = r?.previews?.[0]?.thumbnails?.['image/jpeg'] || [];
    const p = t.find(x => x.width >= 500 && x.width <= 600) || t[t.length - 1] || r?.previews?.[0];
    return p?.url || '';
  };
  const buildId = () => window.__NEXT_DATA__?.buildId;
  const b64e = s => btoa(unescape(encodeURIComponent(s))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  const b64d = s => decodeURIComponent(escape(atob(s.replace(/-/g, '+').replace(/_/g, '/'))));
  const uid = () => 'c' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  async function pool(items, n, fn) {
    const q = [...items];
    await Promise.all(Array.from({ length: Math.min(n, q.length) }, async () => { while (q.length) await fn(q.shift()); }));
  }

  // ---------- browse state ----------
  const saved = (() => { try { return JSON.parse(localStorage.getItem(LS)) || {}; } catch { return {}; } })();
  const st = {
    rows: [], seen: new Set(), next: 1, total: null, loading: false, mode: 'browse',
    inc: new Set(saved.inc || []), exc: new Set(saved.exc || ['TESTDEV']),
    customTags: new Set(saved.customTags || []),
  };
  const assetCache = new Map(); // id -> row-shaped asset (from list pages or detail fetches)
  const detailCache = new Map(); // id -> Promise<detail asset>
  function fetchDetail(id) {
    if (!detailCache.has(id)) {
      detailCache.set(id, fetch(`/_next/data/${buildId()}/workshop/${id}.json?id=${id}`)
        .then(r => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
        .then(j => {
          const a = j.pageProps?.asset; if (!a) throw new Error('No asset');
          assetCache.set(id, { ...(assetCache.get(id) || {}), ...a });
          return a;
        })
        .catch(e => { detailCache.delete(id); throw e; }));
    }
    return detailCache.get(id);
  }

  // ---------- collection store ----------
  function freshStore() {
    const id = uid();
    return { active: id, panelOpen: true, pin: false, colls: { [id]: { name: 'My Collection', items: [], created: Date.now(), updated: Date.now() } } };
  }
  let store = (() => {
    try { const s = JSON.parse(localStorage.getItem(LSC)); if (s?.colls && Object.keys(s.colls).length) return s; } catch { }
    return freshStore();
  })();
  if (!store.colls[store.active]) store.active = Object.keys(store.colls)[0];
  const coll = () => store.colls[store.active];
  const inColl = id => coll().items.some(i => i.id === id);
  const undoStack = [];
  const snapshot = label => { undoStack.push({ label, data: JSON.stringify(store) }); if (undoStack.length > 25) undoStack.shift(); };
  function saveStore() {
    coll().updated = Date.now();
    try { localStorage.setItem(LSC, JSON.stringify(store)); } catch (e) { flash('Could not save collections: ' + e.message, true); }
  }
  const itemFromRow = (r, dep) => ({
    id: r.id, name: r.name || r.id, author: r.author?.username || '', size: r.currentVersionSize || 0,
    version: r.currentVersionNumber || '', thumb: thumb(r), addedAt: Date.now(), ...(dep ? { dep: true } : {}),
  });
  const rowFromItem = it => ({
    id: it.id, name: it.name || it.id, summary: '', author: { username: it.author || '' }, subscriberCount: 0, averageRating: 0,
    ratingCount: 0, currentVersionSize: it.size || 0, currentVersionNumber: it.version || '', updatedAt: '', createdAt: '',
    tags: [], previews: it.thumb ? [{ url: it.thumb }] : [], _stub: true,
  });
  const rowFor = id => assetCache.get(id) || (coll().items.find(i => i.id === id) && rowFromItem(coll().items.find(i => i.id === id)));

  // ---------- UI shell ----------
  const style = document.createElement('style'); style.textContent = css; document.head.appendChild(style);
  const btn = document.createElement('button'); btn.id = 'pb-btn'; btn.textContent = 'Power Browse'; document.body.appendChild(btn);
  const root = document.createElement('div'); root.id = 'pb';
  root.innerHTML = `
<header>
  <div class="brand">
    <button id="pb-close" class="pwr" aria-label="Power off" data-tip="Power off|Close Power Browser and return to the normal Workshop page. Shortcut: Esc."><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M12 2.5v8.5"/><path d="M6.34 7.34A8 8 0 1 0 17.66 7.34"/></svg></button>
    <div class="bttl" data-tip="Reforger Power Browser|Browse the Workshop in bulk. Hover any control to see what it does."><span class="bt">Power Browser</span><span class="ver" id="pb-ver"></span></div>
  </div>
  <div class="grp" data-g="fetch">
    <span class="gl" role="button" tabindex="0" aria-expanded="true" data-tip="Fetch|Click to minimize or expand this group. Open groups have a green label.">Fetch</span>
    <div class="gc">
    <input id="pb-search" placeholder="Search Workshop..." size="18" data-tip="Workshop search|Searches the entire Workshop on Bohemia's server. Press Enter to run it.">
    <select id="pb-sort" data-tip="Server sort|The order Bohemia returns mods in. This decides which mods get loaded, since only the first pages are fetched.">
      <option value="popularity">Popular</option><option value="subscribers">Most subscribed</option>
      <option value="newest">Newest</option><option value="rating">Top rated</option></select>
    <div class="seg" id="pb-fmode" data-tip="Loading mode|Batch loads a large set at once and More adds the next batch. Pages shows one page at a time with page controls."><button data-m="batch">Batch</button><button data-m="page">Pages</button></div>
    <select id="pb-psize" data-tip="Mods per page|How many mods each page shows in Pages mode.">
      <option value="25">25 / page</option><option value="50">50 / page</option><option value="100">100 / page</option><option value="500">500 / page</option></select>
    <select id="pb-pages" data-tip="Amount to fetch|How many mods to pull per load. Bohemia serves 16 per page, so larger amounts take longer.">
      <option value="5">80 mods</option><option value="10">160 mods</option><option value="25">400 mods</option>
      <option value="50">800 mods</option><option value="100">1,600 mods</option></select>
    <button id="pb-load" class="pri" data-tip="Load|Fetch a fresh set of mods using the search, server sort, required tags and amount.">Load</button>
    <button id="pb-more" data-tip="Load more|Fetch the next batch and add it to what is already shown.">More</button>
    </div>
  </div>
  <div class="grp" data-g="refine">
    <span class="gl" role="button" tabindex="0" aria-expanded="true" data-tip="Refine|Click to minimize or expand this group. Open groups have a green label.">Refine</span>
    <div class="gc">
    <input id="pb-filter" placeholder="Filter shown..." size="16" data-tip="Filter shown|Instantly narrows the loaded mods by name, summary or author. Does not fetch anything new.">
    <select id="pb-csort" data-tip="Sort shown|Re-orders the loaded mods on your side. Default keeps the server's order.">
      <option value="i">Default order</option><option value="subscriberCount">Subscribers</option>
      <option value="averageRating">Rating %</option><option value="ratingCount">Votes</option>
      <option value="currentVersionSize">Size</option><option value="updatedAt">Updated</option>
      <option value="createdAt">Created</option><option value="name">Name</option></select>
    <button id="pb-dir" class="ico" data-tip="Sort direction|Switch between descending and ascending.">Desc</button>
    <label class="num" data-tip="Minimum subscribers|Hide mods with fewer subscribers than this number.">Subs &ge;<input id="pb-minsubs" type="number" min="0" value="0"></label>
    <label class="num" data-tip="Minimum rating|Hide mods rated below this percentage.">Rating &ge;<input id="pb-minrating" type="number" min="0" max="100" value="0">%</label>
    <label class="tgl" data-tip="Match all tags|Only show mods that have every green tag. The server returns mods with any of them."><input id="pb-all" type="checkbox">All tags</label>
    <label class="tgl" data-tip="Hide collected|Hide mods that are already in the active collection."><input id="pb-hidecoll" type="checkbox">Hide collected</label>
    <label class="tgl" data-tip="Dependency warnings|When on, adding a mod that needs other mods pops up the missing dependencies so you can add them. Turn this back on here after choosing &quot;Do not warn me again&quot;."><input id="pb-depwarn" type="checkbox">Dep warnings</label>
    </div>
  </div>
  <div class="grp" data-g="view">
    <span class="gl" role="button" tabindex="0" aria-expanded="true" data-tip="View|Click to minimize or expand this group. Open groups have a green label.">View</span>
    <div class="gc">
    <div class="seg" id="pb-viewseg" data-tip="Layout|Grid shows pictures. Table fits far more mods on screen."><button data-v="grid">Grid</button><button data-v="table">Table</button></div>
    <select id="pb-view" hidden><option value="grid">Grid</option><option value="table">Table</option></select>
    <input id="pb-cw" type="range" min="140" max="340" value="200" data-tip="Card size|Smaller cards fit more mods per row. Grid layout only.">
    <button id="pb-mode" data-tip="Collection view|Show only the active collection in the main area. Click again to go back to browsing.">Collection view</button>
    </div>
  </div>
  <span class="sp"></span>
  <button id="pb-coffee" class="cof" aria-label="Buy me a coffee" data-tip="Buy me a coffee|Support Power Browser's development. (Coming soon)"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path class="stm" d="M8 2.5c-.8 1 .8 1.8 0 3M12 2.5c-.8 1 .8 1.8 0 3"/><path d="M4 8.5h12v5.5a5 5 0 0 1-5 5h-2a5 5 0 0 1-5-5z"/><path d="M16 10h1.5a2.5 2.5 0 0 1 0 5H16"/><path d="M3 21.5h14"/></svg></button>
  <span class="egg" aria-label="Made by Tytan"><span class="st">&#9733;</span><span class="mb">Made by Tytan</span></span>
</header>
<div class="tagbar" id="pb-tagbar">
  <div class="thead">
    <button id="pb-tagtog" class="tt" data-tip="Tags|Show or hide the full tag list. Click a tag once to require it (green), twice to exclude it (red), three times to clear it."><span class="car">&#9662;</span>Tags <span id="pb-tagsum"></span></button>
    <button id="pb-tagclr" class="mini" data-tip="Clear tags|Reset every tag to neutral and reload.">Clear</button>
  </div>
  <div class="tags" id="pb-tags"></div>
</div>
<div class="status"><span id="pb-status">Click a tag once to include (green), twice to exclude (red), three times to clear. Then Load.</span><div class="pager" id="pb-pager"></div></div>
<div class="body" id="pb-body">
  <main id="pb-main"></main>
  <aside id="pb-coll">
    <div class="rail" id="pb-rail" title="Show collection"><b id="pb-railn">0</b><span>COLLECTION</span></div>
    <div class="cp">
     <div class="cphead">
      <div class="row"><select id="pb-csel" title="Active collection"></select><button id="pb-chide" title="Collapse panel">&raquo;</button></div>
      <div class="row btns">
        <button id="pb-cnew">New</button><button id="pb-cren">Rename</button>
        <button id="pb-cdup">Duplicate</button><button id="pb-cdel" class="dng">Delete</button>
      </div>
      <div class="stats" id="pb-cstats"></div>
      <div class="msg" id="pb-cmsg"></div>
     </div>
     <div class="cpbody" id="pb-cpbody">
      <h3>MANAGE</h3>
      <div class="row btns">
        <button id="pb-cview" class="pri" title="Show the whole collection in the main view">View all</button>
        <button id="pb-cdeps" title="Find and add every required dependency (recursive)">Add dependencies</button>
        <button id="pb-cundeps" title="Remove auto-added dependencies no longer needed by anything">Prune deps</button>
        <button id="pb-cundo" title="Undo last change">Undo</button>
        <button id="pb-cclr" class="dng">Remove all</button>
      </div>
      <h3>SERVER MOD ENFORCEMENT</h3>
      <div class="srv">
        <div class="row">
          <select id="pb-srvfmt" style="flex:1;min-width:0" title="Output format">
            <option value="mods">config.json "mods" block</option>
            <option value="config">Full config.json template</option>
            <option value="list">Readable mod list (rules / Discord)</option>
          </select>
        </div>
        <div class="row btns">
          <button id="pb-ccfg" class="pri" title="Copy the selected output to the clipboard">Copy</button>
          <button id="pb-srvdl" title="Download the selected output as a file">Download</button>
          <label title="Adds each mod's current version. Clients must then match it exactly, but the server breaks when an author updates until you re-export."><input type="checkbox" id="pb-cpin"> Pin versions</label>
        </div>
        <div class="note" id="pb-srvnote"></div>
      </div>
      <h3>EXPORT / IMPORT</h3>
      <div class="row btns">
        <button id="pb-cids" title="Copy mod IDs, one per line">Copy IDs</button>
        <button id="pb-cexp" title="Download as a re-importable .json file">Export file</button>
        <button id="pb-cshare" title="Copy a link that opens this collection for anyone with this script">Share link</button>
        <button id="pb-cimp">Import</button>
      </div>
      <div class="imp" id="pb-cimpbox" hidden>
        <textarea id="pb-cimptxt" placeholder="Paste a server config.json, a mods array, Workshop URLs, or mod IDs"></textarea>
        <div class="row btns">
          <button id="pb-cimpadd" class="pri">Add to this</button><button id="pb-cimprep">Replace this</button>
          <button id="pb-cimpnew">As new</button><button id="pb-cimpfile">From file</button><button id="pb-cimpx">Cancel</button>
        </div>
        <input type="file" id="pb-cfile" accept=".json,.txt,application/json,text/plain" hidden>
      </div>
      <h3>MODS</h3>
      <div class="row lhead"><input id="pb-cfilter" placeholder="Filter collection" style="flex:1;min-width:0">
        <select id="pb-csort2" title="List order"><option value="">Added</option><option value="name">Name</option><option value="size">Size</option><option value="author">Author</option></select></div>
      <div class="list" id="pb-clist"></div>
     </div>
    </div>
  </aside>
</div>`;
  document.body.appendChild(root);
  const $ = id => root.querySelector('#pb-' + id);
  const el = {
    search: $('search'), sort: $('sort'), pages: $('pages'), psize: $('psize'), fmode: $('fmode'), pager: $('pager'), load: $('load'), more: $('more'), filter: $('filter'),
    csort: $('csort'), dir: $('dir'), minSubs: $('minsubs'), minRating: $('minrating'), all: $('all'), hideColl: $('hidecoll'),
    view: $('view'), cw: $('cw'), mode: $('mode'), close: $('close'), tags: $('tags'), status: $('status'), body: $('body'), main: $('main'),
    aside: $('coll'), rail: $('rail'), railN: $('railn'), csel: $('csel'), chide: $('chide'), cstats: $('cstats'), cpin: $('cpin'),
    cimpbox: $('cimpbox'), cimptxt: $('cimptxt'), cfile: $('cfile'), cfilter: $('cfilter'), csort2: $('csort2'), cmsg: $('cmsg'), clist: $('clist'),
    tagbar: $('tagbar'), tagtog: $('tagtog'), tagclr: $('tagclr'), tagsum: $('tagsum'), viewseg: $('viewseg'),
    cpbody: $('cpbody'), srvfmt: $('srvfmt'), srvdl: $('srvdl'), srvnote: $('srvnote'),
  };
  let desc = saved.desc !== false;
  let tagsOpen = saved.tagsOpen !== false;
  // Grid/Table segmented control drives the hidden select so existing view logic is unchanged
  function syncViewSeg() {
    el.viewseg.querySelectorAll('button').forEach(b => b.classList.toggle('on', b.dataset.v === el.view.value));
    el.cw.disabled = el.view.value === 'table';
  }

  const KEYS = ['search', 'sort', 'pages', 'psize', 'filter', 'csort', 'minSubs', 'minRating', 'view', 'cw'];
  for (const k of KEYS) if (saved[k] != null) el[k].value = saved[k];
  el.all.checked = !!saved.all;
  let fetchMode = saved.fetchMode === 'page' ? 'page' : 'batch';
  const pageMode = () => fetchMode === 'page';
  function syncFetchMode() {
    el.fmode.querySelectorAll('button').forEach(b => b.classList.toggle('on', b.dataset.m === fetchMode));
    el.pages.hidden = pageMode(); el.psize.hidden = !pageMode(); el.more.hidden = pageMode();
  }
  el.hideColl.checked = !!saved.hideColl;
  el.depWarn = $('depwarn');
  el.depWarn.checked = saved.depWarn !== false;
  el.dir.textContent = desc ? 'Desc' : 'Asc';
  el.main.style.setProperty('--cw', el.cw.value + 'px');
  el.cpin.checked = !!store.pin;

  const persist = () => {
    const o = { inc: [...st.inc], exc: [...st.exc], customTags: [...st.customTags], desc, all: el.all.checked, hideColl: el.hideColl.checked, tagsOpen, depWarn: el.depWarn.checked, fetchMode, groupsMin: [...root.querySelectorAll('header .grp.min')].map(g => g.dataset.g) };
    for (const k of KEYS) o[k] = el[k].value;
    try { localStorage.setItem(LS, JSON.stringify(o)); } catch { }
  };
  const status = t => { el.status.textContent = t; };
  let flashTimer;
  function flash(t, bad) {
    el.cmsg.textContent = t; el.cmsg.style.color = bad ? '#f0a0a0' : '#8fd3a3';
    clearTimeout(flashTimer); flashTimer = setTimeout(() => { el.cmsg.textContent = ''; }, 6000);
  }
  async function copy(text, label) {
    try { await navigator.clipboard.writeText(text); }
    catch {
      const t = document.createElement('textarea'); t.value = text; document.body.appendChild(t); t.select();
      document.execCommand('copy'); t.remove();
    }
    flash(label + ' copied to clipboard');
  }

  // ---------- tags ----------
  function renderTags() {
    const freq = {};
    st.rows.forEach(r => tagNames(r).forEach(t => { freq[t] = (freq[t] || 0) + 1; }));
    const extra = Object.entries(freq).filter(([t]) => !CATS.includes(t)).sort((a, b) => b[1] - a[1]).slice(0, 40).map(([t]) => t);
    // collapsed: only the active (green/red) tags stay visible
    const all = [...new Set([...CATS, ...st.inc, ...st.exc, ...st.customTags, ...extra])];
    const list = tagsOpen ? all : all.filter(t => st.inc.has(t) || st.exc.has(t));
    el.tagbar.classList.toggle('closed', !tagsOpen);
    const parts = [st.inc.size && `${st.inc.size} required`, st.exc.size && `${st.exc.size} excluded`].filter(Boolean);
    el.tagsum.textContent = parts.length ? `(${parts.join(', ')})` : '';
    el.tagclr.hidden = !st.inc.size && !st.exc.size;
    el.tags.innerHTML = list.map(t => {
      const c = st.inc.has(t) ? 'inc' : st.exc.has(t) ? 'exc' : '';
      return `<span class="chip ${c}" data-t="${esc(t)}">${esc(t)}${freq[t] ? ` <small style="opacity:.6">${freq[t]}</small>` : ''}</span>`;
    }).join('') + (tagsOpen ? `<input id="pb-addtag" placeholder="+ tag" size="8" style="padding:2px 6px;font-size:12px">` : '');
  }
  let reloadTimer;
  el.tags.addEventListener('click', e => {
    const c = e.target.closest('.chip'); if (!c) return;
    const t = c.dataset.t;
    const wasInc = st.inc.has(t);
    if (st.inc.has(t)) { st.inc.delete(t); st.exc.add(t); }
    else if (st.exc.has(t)) { st.exc.delete(t); }
    else { st.inc.add(t); }
    persist(); renderTags(); render();
    // only required (green) tags change the server query; excludes filter locally
    if (wasInc !== st.inc.has(t)) { clearTimeout(reloadTimer); reloadTimer = setTimeout(() => load(false), 700); }
  });
  el.tagtog.onclick = () => { tagsOpen = !tagsOpen; persist(); renderTags(); };
  el.tagclr.onclick = () => {
    const hadInc = st.inc.size > 0;
    st.inc.clear(); st.exc.clear(); persist(); renderTags();
    if (hadInc) load(false); else render();
  };
  el.tags.addEventListener('keydown', e => {
    if (e.target.id !== 'pb-addtag' || e.key !== 'Enter') return;
    const t = e.target.value.trim().toUpperCase(); if (!t) return;
    st.customTags.add(t); st.inc.add(t); persist(); renderTags(); load(false);
  });

  // ---------- data ----------
  async function fetchPage(p) {
    const q = new URLSearchParams({ page: p, sort: el.sort.value });
    const s = el.search.value.trim(); if (s) q.set('search', s);
    st.inc.forEach(t => q.append('tags', t));
    const r = await fetch(`/_next/data/${buildId()}/workshop.json?${q}`);
    if (!r.ok) throw new Error('HTTP ' + r.status);
    return (await r.json()).pageProps.assets;
  }
  // Pages mode: one page of N mods, built from Bohemia's 16-per-page responses (cached per query)
  st.page = 1;
  const pageCache = new Map(); // query|serverPage -> Promise<assets>
  const queryKey = () => JSON.stringify([el.sort.value, el.search.value.trim(), [...st.inc].sort()]);
  function fetchPageCached(p) {
    const k = queryKey() + '|' + p;
    if (!pageCache.has(k)) {
      if (pageCache.size > 400) pageCache.clear();
      pageCache.set(k, fetchPage(p).catch(e => { pageCache.delete(k); throw e; }));
    }
    return pageCache.get(k);
  }
  const pageCount = () => st.total == null ? null : Math.max(1, Math.ceil(st.total / +el.psize.value));
  let pageReq = 0;
  async function loadPage(n) {
    if (!buildId()) { status('Could not read site build id. Reload the Workshop page and try again.'); return; }
    setMode('browse', true);
    const size = +el.psize.value, pc = pageCount();
    n = Math.max(1, Math.floor(+n || 1)); if (pc) n = Math.min(n, pc);
    const req = ++pageReq; st.loading = true; persist();
    const first = Math.floor((n - 1) * size / PER_PAGE) + 1, last = Math.floor((n * size - 1) / PER_PAGE) + 1;
    const sp = []; for (let p = first; p <= last; p++) sp.push(p);
    const got = new Map(); let done = 0, errs = 0;
    status(`Loading page ${n}...`);
    await pool(sp, 6, async p => {
      try { const a = await fetchPageCached(p); got.set(p, a); if (req === pageReq) st.total = a.count; }
      catch (e) { errs++; console.warn('[PowerBrowse] page', p, e); }
      done++; if (req === pageReq && sp.length > 2) status(`Loading page ${n}... ${done}/${sp.length}`);
    });
    if (req !== pageReq) return; // a newer page request took over
    const rows = [];
    sp.forEach(p => (got.get(p)?.rows || []).forEach((r, i) => { r._i = (p - 1) * PER_PAGE + i; rows.push(r); }));
    const from = (n - 1) * size, seen = new Set();
    st.rows = rows.filter(r => r._i >= from && r._i < from + size && !seen.has(r.id) && seen.add(r.id));
    st.rows.forEach(r => { if (!assetCache.has(r.id)) assetCache.set(r.id, r); });
    st.seen = seen; st.page = n; st.loading = false;
    if (st.total != null && n > pageCount() && st.total > 0) return loadPage(pageCount()); // size changed past the end
    renderTags(); render(); el.main.scrollTop = 0;
    if (errs) status(el.status.textContent + ` (${errs} request(s) failed; try again or reload the Workshop page)`);
  }
  function pagerHTML(bottom) {
    const pc = pageCount() || 1, n = st.page;
    return `${bottom ? '<div class="pager bot">' : ''}<button data-pg="1"${n <= 1 ? ' disabled' : ''} title="First page">&laquo;</button><button data-pg="${n - 1}"${n <= 1 ? ' disabled' : ''} title="Previous page">&lsaquo;</button>
<span>Page</span><input class="pgin" type="number" min="1" max="${pc}" value="${n}" title="Type a page number and press Enter"><span>of ${pc.toLocaleString()}</span>
<button data-pg="${n + 1}"${n >= pc ? ' disabled' : ''} title="Next page">&rsaquo;</button><button data-pg="${pc}"${n >= pc ? ' disabled' : ''} title="Last page">&raquo;</button>${bottom ? '</div>' : ''}`;
  }

  async function load(append) {
    if (!append && pageMode()) return loadPage(1);
    if (st.loading) return;
    if (!buildId()) { status('Could not read site build id. Reload the Workshop page and try again.'); return; }
    setMode('browse', true);
    st.loading = true; persist();
    if (!append) { st.rows = []; st.seen = new Set(); st.next = 1; st.total = null; }
    const n = +el.pages.value, start = st.next, end = start + n - 1;
    const pages = []; for (let p = start; p <= end; p++) pages.push(p);
    let done = 0, errs = 0;
    await pool(pages, 6, async p => {
      if (!(st.total != null && (p - 1) * PER_PAGE >= st.total)) {
        try {
          const a = await fetchPage(p); st.total = a.count;
          a.rows.forEach((r, i) => {
            if (!assetCache.has(r.id)) assetCache.set(r.id, r);
            if (!st.seen.has(r.id)) { st.seen.add(r.id); r._i = (p - 1) * PER_PAGE + i; st.rows.push(r); }
          });
        } catch (e) { errs++; console.warn('[PowerBrowse] page', p, e); }
      }
      done++; status(`Loading ${done}/${n} pages... ${st.rows.length} mods`);
    });
    st.next = end + 1; st.loading = false;
    renderTags(); render();
    if (errs) status(el.status.textContent + ` (${errs} page(s) failed; if this persists, reload the Workshop page)`);
  }

  // ---------- filter / sort / render ----------
  function view() {
    const txt = el.filter.value.trim().toLowerCase();
    const isColl = st.mode === 'coll';
    const src = isColl ? coll().items.map((it, i) => ({ ...rowFor(it.id), _i: i })) : st.rows;
    const all = el.all.checked, minS = +el.minSubs.value || 0, minR = (+el.minRating.value || 0) / 100, hide = el.hideColl.checked;
    const ids = new Set(coll().items.map(i => i.id));
    const out = src.filter(r => {
      if (!isColl) { // tag / threshold filters only apply while browsing
        const tg = tagNames(r);
        for (const t of st.exc) if (tg.includes(t)) return false;
        if (all) for (const t of st.inc) if (!tg.includes(t)) return false;
        if ((r.subscriberCount || 0) < minS) return false;
        if (minR && (r.averageRating || 0) < minR) return false;
        if (hide && ids.has(r.id)) return false;
      }
      if (txt && !`${r.name} ${r.summary || ''} ${r.author?.username || ''}`.toLowerCase().includes(txt)) return false;
      return true;
    });
    const k = el.csort.value === 'i' ? '_i' : el.csort.value;
    const dir = el.csort.value === 'i' ? 1 : (desc ? -1 : 1);
    out.sort((a, b) => {
      const x = a[k] ?? '', y = b[k] ?? '';
      return (typeof x === 'string' ? x.localeCompare(y) : x - y) * dir;
    });
    return out;
  }
  const addBtn = (id, sm) => {
    const on = inColl(id);
    return `<button class="addb${sm ? ' sm' : ''}${on ? ' on' : ''}" data-id="${id}" title="${on ? 'Remove from' : 'Add to'} collection">${on ? '&minus;' : '+'}</button>`;
  };
  function render() {
    hideTip();
    const rows = view();
    const isColl = st.mode === 'coll';
    const more = !isColl && st.total != null && (st.next - 1) * PER_PAGE < st.total;
    if (isColl) status(`Collection view: "${coll().name}" | showing ${rows.length} of ${coll().items.length}`);
    else if (st.loading) { /* progress text is already showing */ }
    else if (pageMode()) {
      const size = +el.psize.value, from = st.total ? (st.page - 1) * size + 1 : 0;
      status(`Showing ${rows.length} of ${st.rows.length} on this page` + (st.total != null ? ` | mods ${from.toLocaleString()}-${(from + st.rows.length - 1).toLocaleString()} of ${st.total.toLocaleString()}` : ''));
    }
    else status(`Showing ${rows.length} of ${st.rows.length} loaded` + (st.total != null ? ` | ${st.total.toLocaleString()} match on server` : '') + (more ? ' | Load more for the next batch' : ''));
    el.more.disabled = !more;
    const showPager = !isColl && pageMode() && st.total != null;
    el.pager.innerHTML = showPager ? pagerHTML(false) : '';
    if (isColl && !rows.length) {
      el.main.innerHTML = `<div style="color:#6b7480;padding:30px;text-align:center">${coll().items.length ? 'No collection mods match the filter.' : 'This collection is empty. Use the green + on any mod to add it.'}</div>`;
      return;
    }
    if (el.view.value === 'table') {
      const depCol = isColl; // dependency check column only while editing a collection
      const cols = [['', ''], ['name', 'Name'], ['', 'Summary'], ['', 'Author'], ...(depCol ? [['', 'Deps']] : []), ['subscriberCount', 'Subs'], ['averageRating', 'Rating'], ['ratingCount', 'Votes'], ['currentVersionSize', 'Size'], ['updatedAt', 'Updated'], ['createdAt', 'Created'], ['', 'Tags'], ['', 'ID']];
      el.main.innerHTML = `<table><thead><tr>${cols.map(([k, l]) => `<th data-k="${k}">${l}${k && el.csort.value === k ? (desc ? ' ▼' : ' ▲') : ''}</th>`).join('')}</tr></thead><tbody>${rows.map(r => `
<tr data-id="${r.id}" class="${inColl(r.id) ? 'in' : ''}"><td>${addBtn(r.id, true)}</td><td><a href="/workshop/${r.id}" target="_blank">${esc(r.name)}</a></td><td class="s">${esc(r.summary)}</td>
<td>${esc(r.author?.username)}</td>${depCol ? `<td class="dp" data-dep="${r.id}">${depCell(r.id)}</td>` : ''}<td>${r._stub ? '' : fmtNum(r.subscriberCount)}</td><td>${r._stub ? '' : pct(r)}</td><td>${r._stub ? '' : r.ratingCount}</td>
<td>${fmtSize(r.currentVersionSize)}</td><td>${day(r.updatedAt)}</td><td>${day(r.createdAt)}</td>
<td class="tg">${esc(tagNames(r).join(' '))}</td><td><button class="idb" data-id="${r.id}">${r.id}</button></td></tr>`).join('')}</tbody></table>`;
      if (depCol) ensureDepInfo();
    } else {
      el.main.innerHTML = `<div class="grid">${rows.map(r => `
<a class="card${inColl(r.id) ? ' in' : ''}" href="/workshop/${r.id}" target="_blank" data-id="${r.id}">
  <div class="pic"><img loading="lazy" src="${esc(thumb(r))}" alt="">${addBtn(r.id)}</div>
  <div class="b"><div class="n">${esc(r.name)}</div>
  <div class="m"><span>${esc(r.author?.username)}</span><span>${fmtSize(r.currentVersionSize)}</span></div>
  <div class="m">${r._stub ? '<span>Loading details...</span>' : `<span>${fmtNum(r.subscriberCount)} subs</span><span>${pct(r)} (${r.ratingCount})</span><span>${day(r.updatedAt)}</span>`}</div>
  <div class="m"><span class="t">${esc(tagNames(r).join(' '))}</span><button class="idb" data-id="${r.id}" title="Copy mod ID">ID</button></div></div>
</a>`).join('')}</div>`;
    }
    if (showPager && st.rows.length) el.main.insertAdjacentHTML('beforeend', pagerHTML(true));
  }
  // Update +/- states without a full re-render (keeps scroll position)
  function updateAddStates() {
    root.querySelectorAll('.addb').forEach(b => {
      const on = inColl(b.dataset.id);
      b.classList.toggle('on', on); b.innerHTML = on ? '&minus;' : '+';
      b.title = (on ? 'Remove from' : 'Add to') + ' collection';
      b.closest('.card, tr')?.classList.toggle('in', on);
    });
  }
  function setMode(m, silent) {
    st.mode = m;
    el.mode.textContent = m === 'coll' ? 'Back to browse' : 'Collection view';
    el.mode.classList.toggle('pri', m === 'coll');
    if (silent) return;
    render();
    if (m === 'coll') hydrateItems(coll().items, true);
  }

  // ---------- collection actions ----------
  function refreshAll() {
    el.cpin.checked = !!store.pin;
    renderColl();
    if (st.mode === 'coll' || el.hideColl.checked) render(); else updateAddStates();
  }
  function toggleMod(id) {
    const c = coll();
    const i = c.items.findIndex(x => x.id === id);
    if (i >= 0) { snapshot(`Remove ${c.items[i].name}`); c.items.splice(i, 1); }
    else {
      const r = assetCache.get(id);
      c.items.push(r ? itemFromRow(r) : { id, name: id, author: '', size: 0, version: '', thumb: '', addedAt: Date.now() });
      if (!r) hydrateItems(c.items.filter(x => x.id === id));
      warnDeps(id);
    }
    saveStore(); refreshAll();
  }
  function removeMod(id) {
    const c = coll(), i = c.items.findIndex(x => x.id === id); if (i < 0) return;
    snapshot(`Remove ${c.items[i].name}`); c.items.splice(i, 1); saveStore(); refreshAll();
    flash(`Removed. Undo is available.`);
  }
  // Fill in names, sizes, thumbnails, and cache full details for items that lack them
  let hydrating = false, hydrateAgain = false;
  async function hydrateItems(items, forView) {
    const targets = items.filter(i => !i.missing && (!assetCache.has(i.id) || !i.thumb || !i.name || i.name === i.id || !i.size));
    if (!targets.length) return;
    if (hydrating) { hydrateAgain = true; return; }
    hydrating = true;
    let done = 0;
    await pool(targets, 6, async it => {
      try {
        const a = await fetchDetail(it.id);
        if (!it.name || it.name === it.id) it.name = a.name || it.id;
        if (!it.author) it.author = a.author?.username || '';
        if (!it.size) it.size = a.currentVersionSize || 0;
        if (!it.version) it.version = a.currentVersionNumber || '';
        if (!it.thumb) it.thumb = thumb(a);
        delete it.missing;
      } catch { it.missing = true; }
      done++; if (targets.length > 3) flash(`Loading mod details... ${done}/${targets.length}`);
    });
    hydrating = false;
    saveStore(); renderColl();
    if (forView || st.mode === 'coll') render();
    const gone = targets.filter(t => t.missing).length;
    if (gone) flash(`${gone} mod(s) could not be found (deleted or private). They are marked in the list.`, true);
    else if (targets.length > 3) flash(`Loaded details for ${targets.length} mods`);
    if (hydrateAgain) { hydrateAgain = false; hydrateItems(coll().items, st.mode === 'coll'); }
  }
  // Walk the dependency trees of every mod and add anything missing (recursive)
  async function addDeps() {
    const c = coll(); if (!c.items.length) return flash('Collection is empty', true);
    snapshot('Add dependencies');
    const have = new Set(c.items.map(i => i.id)), visited = new Set(), queue = [...have];
    let added = 0, failed = 0;
    const walk = list => (list || []).forEach(d => {
      const id = d.asset?.id; if (!id) return;
      if (!have.has(id)) {
        have.add(id); added++; queue.push(id);
        c.items.push({ id, name: d.asset.name || id, author: '', size: d.totalFileSize || 0, version: d.version || '', thumb: '', addedAt: Date.now(), dep: true });
      }
      walk(d.dependencies);
    });
    while (queue.length) {
      const batch = queue.splice(0, queue.length).filter(id => !visited.has(id));
      batch.forEach(id => visited.add(id));
      flash(`Checking dependencies... ${visited.size} mods scanned`);
      await pool(batch, 6, id => fetchDetail(id).then(a => walk(a.dependencies)).catch(() => { failed++; }));
    }
    saveStore(); refreshAll();
    flash(added ? `Added ${added} missing dependenc${added === 1 ? 'y' : 'ies'}${failed ? ` (${failed} could not be checked)` : ''}` : `No missing dependencies${failed ? ` (${failed} could not be checked)` : ''}`, !!failed);
    if (added) hydrateItems(c.items.filter(i => i.dep));
  }
  // Remove auto-added dependencies that nothing in the collection still requires
  async function pruneDeps() {
    const c = coll(); const deps = c.items.filter(i => i.dep);
    if (!deps.length) return flash('No auto-added dependencies to prune');
    const needed = new Set(), failed = [];
    const walk = list => (list || []).forEach(d => { if (d.asset?.id) needed.add(d.asset.id); walk(d.dependencies); });
    flash('Checking which dependencies are still needed...');
    await pool(c.items.filter(i => !i.dep), 6, it => fetchDetail(it.id).then(a => walk(a.dependencies)).catch(() => failed.push(it)));
    if (failed.length) return flash(`Could not check ${failed.length} mod(s), so nothing was pruned to be safe.`, true);
    // deps required by other still-needed deps
    let grew = true;
    while (grew) {
      grew = false;
      for (const d of deps) if (needed.has(d.id)) {
        try { const a = await fetchDetail(d.id); const before = needed.size; walk(a.dependencies); if (needed.size > before) grew = true; } catch { }
      }
    }
    const drop = deps.filter(d => !needed.has(d.id));
    if (!drop.length) return flash('All dependencies are still needed');
    snapshot('Prune dependencies');
    c.items = c.items.filter(i => !drop.includes(i));
    saveStore(); refreshAll(); flash(`Pruned ${drop.length} unneeded dependenc${drop.length === 1 ? 'y' : 'ies'}`);
  }
  const modsArray = () => coll().items.map(i => {
    const o = { modId: i.id, name: i.name || i.id };
    if (store.pin && i.version) o.version = i.version;
    return o;
  });
  const slug = () => coll().name.replace(/[^\w\- ]+/g, '').trim().replace(/\s+/g, '_') || 'collection';
  function downloadText(name, text, type) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([text], { type }));
    a.download = name;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    flash('Downloaded ' + name);
  }
  function exportFile() {
    const c = coll();
    downloadText(slug() + '.json', JSON.stringify({ name: c.name, exported: new Date().toISOString(), mods: modsArray() }, null, 2), 'application/json');
  }

  // ---------- server mod enforcement output ----------
  // Reforger has no .bikey signing: the server config's "mods" list is the enforcement.
  // Clients must download and load exactly those mods (and exact versions, if pinned) to join.
  function serverOutput(fmt) {
    const c = coll(), mods = modsArray();
    if (fmt === 'config') {
      return JSON.stringify({
        bindAddress: '', bindPort: 2001, publicAddress: '', publicPort: 2001,
        a2s: { address: '0.0.0.0', port: 17777 },
        game: {
          name: c.name, password: '', passwordAdmin: 'CHANGE_ME', admins: [], scenarioId: '', maxPlayers: 32,
          visible: true, crossPlatform: false, supportedPlatforms: ['PLATFORM_PC'],
          gameProperties: {
            serverMaxViewDistance: 2500, serverMinGrassDistance: 50, networkViewDistance: 1500, disableThirdPerson: false,
            fastValidation: true, battlEye: true, VONDisableUI: false, VONDisableDirectSpeechUI: false,
          },
          mods,
        },
        operating: { lobbyPlayerSynchronise: true },
      }, null, 2);
    }
    if (fmt === 'list') {
      const total = c.items.reduce((t, i) => t + (i.size || 0), 0);
      return [`${c.name}: ${c.items.length} required mods (${fmtSize(total)})`,
        'These download automatically when you join the server.', '',
        ...c.items.map((i, n) => `${n + 1}. ${i.name || i.id}${store.pin && i.version ? ` (v${i.version})` : ''}${i.dep ? ' [dependency]' : ''}\n   https://reforger.armaplatform.com/workshop/${i.id}`),
      ].join('\n');
    }
    return `"mods": ${JSON.stringify(mods, null, 2)}`;
  }
  const SRV_NOTES = {
    mods: 'Paste inside the "game" section of your server config.json. Players are forced to download and load exactly these mods to join; Reforger has no .bikey files, so this list is the enforcement.',
    config: 'Ready-to-run server config with BattlEye on and this collection as its mod list. Set scenarioId, passwordAdmin and your addresses before starting.',
    list: 'For server rules or a Discord post, with a Workshop link for every mod.',
  };
  function renderSrvNote() {
    const gone = coll().items.filter(i => i.missing).length;
    el.srvnote.innerHTML = esc(SRV_NOTES[el.srvfmt.value]) +
      (store.pin ? ' <b style="color:#c9cfd6">Versions pinned:</b> players must match exactly; re-export after mod updates.' : '') +
      (gone ? ` <span style="color:#f0c070">${gone} mod(s) can no longer be found and will fail to download. Remove them first.</span>` : '');
  }
  function srvCopy() {
    const f = el.srvfmt.value;
    copy(serverOutput(f), f === 'config' ? 'Server config.json' : f === 'list' ? 'Mod list' : 'Server config "mods" block');
  }
  function srvDownload() {
    const f = el.srvfmt.value;
    if (f === 'config') downloadText('config.json', serverOutput('config'), 'application/json');
    else if (f === 'list') downloadText(slug() + '_modlist.txt', serverOutput('list'), 'text/plain');
    else downloadText(slug() + '_mods.json', JSON.stringify({ mods: modsArray() }, null, 2), 'application/json');
  }
  function parseImport(text) {
    const out = new Map(); let name = null;
    const add = (id, nm, ver) => {
      id = String(id || '').toUpperCase();
      if (/^[0-9A-F]{16}$/.test(id) && !out.has(id)) out.set(id, { id, name: nm || '', version: ver || '' });
    };
    try {
      const j = JSON.parse(text);
      const arr = Array.isArray(j) ? j : j?.game?.mods || j?.mods || null;
      if (j && !Array.isArray(j) && typeof j.name === 'string') name = j.name;
      if (Array.isArray(arr)) arr.forEach(m => typeof m === 'string' ? add(m) : add(m?.modId || m?.id, m?.name, m?.version));
    } catch { /* not JSON, fall through to ID scan */ }
    if (!out.size) {
      // allow a bare `"mods": [...]` block as copied from a config
      const block = text.match(/"mods"\s*:\s*(\[[\s\S]*\])/);
      if (block) { try { JSON.parse(block[1]).forEach(m => add(m?.modId, m?.name, m?.version)); } catch { } }
    }
    if (!out.size) (text.match(/\b[0-9A-Fa-f]{16}\b/g) || []).forEach(id => add(id));
    return { name, mods: [...out.values()] };
  }
  function applyImport(parsed, how, fallbackName) {
    if (!parsed.mods.length) return flash('No mod IDs found in that text', true);
    const mk = m => {
      const r = assetCache.get(m.id);
      const it = r ? itemFromRow(r) : { id: m.id, name: m.name || m.id, author: '', size: 0, version: '', thumb: '', addedAt: Date.now() };
      if (m.version) it.version = m.version;
      return it;
    };
    snapshot('Import');
    let c, added = 0;
    if (how === 'new') {
      const id = uid();
      store.colls[id] = { name: parsed.name || fallbackName || 'Imported collection', items: [], created: Date.now(), updated: Date.now() };
      store.active = id;
    }
    c = coll();
    if (how === 'replace') c.items = [];
    const have = new Set(c.items.map(i => i.id));
    parsed.mods.forEach(m => { if (!have.has(m.id)) { c.items.push(mk(m)); have.add(m.id); added++; } });
    saveStore(); refreshAll();
    flash(`Imported ${added} mod(s)${parsed.mods.length > added ? ` (${parsed.mods.length - added} already present)` : ''}`);
    el.cimpbox.hidden = true; el.cimptxt.value = '';
    hydrateItems(c.items);
  }
  function shareLink() {
    const c = coll(); if (!c.items.length) return flash('Collection is empty', true);
    const payload = b64e(JSON.stringify({ n: c.name, i: c.items.map(i => i.id).join('') }));
    copy(`${location.origin}/workshop#pbc=${payload}`, 'Share link');
    setTimeout(() => flash('Share link copied. Recipients need this script; use Copy config for anyone else.'), 1200);
  }
  function checkShareHash() {
    const m = location.hash.match(/pbc=([\w-]+)/); if (!m) return;
    try {
      const d = JSON.parse(b64d(m[1]));
      const ids = (String(d.i || '').match(/.{16}/g) || []);
      history.replaceState(null, '', location.pathname + location.search);
      if (!ids.length) return;
      openUI();
      if (confirm(`Import shared collection "${d.n || 'Shared'}" (${ids.length} mods) as a new collection?`))
        applyImport({ name: d.n || 'Shared collection', mods: ids.map(id => ({ id, name: '', version: '' })) }, 'new');
    } catch (e) { console.warn('[PowerBrowse] bad share link', e); }
  }

  // ---------- collection panel render ----------
  function renderColl() {
    const c = coll();
    el.aside.classList.toggle('collapsed', !store.panelOpen);
    el.railN.textContent = c.items.length;
    el.csel.innerHTML = Object.entries(store.colls)
      .sort((a, b) => a[1].name.localeCompare(b[1].name))
      .map(([id, x]) => `<option value="${id}"${id === store.active ? ' selected' : ''}>${esc(x.name)} (${x.items.length})</option>`).join('');
    const total = c.items.reduce((s, i) => s + (i.size || 0), 0);
    const unknown = c.items.filter(i => !i.size).length, deps = c.items.filter(i => i.dep).length, gone = c.items.filter(i => i.missing).length;
    el.cstats.innerHTML = `<b>${c.items.length}</b> mods &middot; ${total ? fmtSize(total) : '0 KB'}${unknown ? ` + ${unknown} unknown` : ''}` +
      `${deps ? ` &middot; ${deps} auto-deps` : ''}${gone ? ` &middot; <span style="color:#f0c070">${gone} not found</span>` : ''}`;
    $('cundo').disabled = !undoStack.length;
    $('cundo').title = undoStack.length ? 'Undo: ' + undoStack[undoStack.length - 1].label : 'Nothing to undo';
    ['cclr', 'ccfg', 'srvdl', 'cids', 'cexp', 'cshare', 'cdeps'].forEach(k => { $(k).disabled = !c.items.length; });
    renderSrvNote();
    $('cundeps').disabled = !deps;
    const txt = el.cfilter.value.trim().toLowerCase(), srt = el.csort2.value;
    let items = c.items.filter(i => !txt || `${i.name} ${i.author} ${i.id}`.toLowerCase().includes(txt));
    if (srt === 'name') items = [...items].sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    else if (srt === 'size') items = [...items].sort((a, b) => (b.size || 0) - (a.size || 0));
    else if (srt === 'author') items = [...items].sort((a, b) => (a.author || '').localeCompare(b.author || ''));
    el.clist.innerHTML = !c.items.length
      ? `<div class="empty">Empty collection.<br>Click the green <b>+</b> on any mod picture to add it, or use <b>Import</b> to paste a server config or list of IDs.</div>`
      : !items.length ? `<div class="empty">No mods match the filter.</div>`
        : items.map(i => `
<div class="it${i.missing ? ' miss' : ''}" data-id="${i.id}">
  <img loading="lazy" src="${esc(i.thumb)}" alt="">
  <div class="nm"><a href="/workshop/${i.id}" target="_blank">${esc(i.name || i.id)}</a>
  <small>${esc(i.author || '?')} &middot; ${fmtSize(i.size)}${i.version ? ' &middot; v' + esc(i.version) : ''}${i.dep ? '<span class="dep">dep</span>' : ''}${i.missing ? '<span class="gone">not found</span>' : ''}</small></div>
  <button class="rm" data-id="${i.id}" title="Remove from collection">&times;</button>
</div>`).join('');
  }

  // ---------- collection panel events ----------
  el.rail.onclick = () => { store.panelOpen = true; saveStore(); renderColl(); };
  el.chide.onclick = () => { store.panelOpen = false; saveStore(); renderColl(); };
  el.csel.onchange = () => { store.active = el.csel.value; saveStore(); refreshAll(); if (st.mode === 'coll') hydrateItems(coll().items, true); };
  $('cnew').onclick = () => {
    const n = prompt('Name for the new collection:', 'New collection'); if (!n || !n.trim()) return;
    snapshot('New collection'); const id = uid();
    store.colls[id] = { name: n.trim(), items: [], created: Date.now(), updated: Date.now() }; store.active = id;
    saveStore(); refreshAll(); flash(`Created "${n.trim()}"`);
  };
  $('cren').onclick = () => {
    const n = prompt('Rename collection:', coll().name); if (!n || !n.trim() || n.trim() === coll().name) return;
    snapshot('Rename'); coll().name = n.trim(); saveStore(); refreshAll();
  };
  $('cdup').onclick = () => {
    snapshot('Duplicate'); const src = coll(), id = uid();
    store.colls[id] = { name: src.name + ' (copy)', items: JSON.parse(JSON.stringify(src.items)), created: Date.now(), updated: Date.now() };
    store.active = id; saveStore(); refreshAll(); flash('Duplicated');
  };
  $('cdel').onclick = () => {
    const c = coll();
    if (!confirm(`Delete collection "${c.name}" (${c.items.length} mods)? You can undo this.`)) return;
    snapshot(`Delete "${c.name}"`);
    delete store.colls[store.active];
    if (!Object.keys(store.colls).length) { const f = freshStore(); store.colls = f.colls; store.active = f.active; }
    else store.active = Object.keys(store.colls)[0];
    saveStore(); refreshAll(); flash(`Deleted "${c.name}"`);
  };
  $('cview').onclick = () => setMode(st.mode === 'coll' ? 'browse' : 'coll');
  $('cdeps').onclick = addDeps;
  $('cundeps').onclick = pruneDeps;
  $('cundo').onclick = () => {
    const u = undoStack.pop(); if (!u) return;
    store = JSON.parse(u.data); localStorage.setItem(LSC, JSON.stringify(store)); refreshAll(); flash('Undid: ' + u.label);
  };
  $('cclr').onclick = () => {
    const c = coll(); if (!c.items.length) return;
    if (!confirm(`Remove all ${c.items.length} mods from "${c.name}"? You can undo this.`)) return;
    snapshot('Remove all'); c.items = []; saveStore(); refreshAll(); flash('Collection cleared. Undo is available.');
  };
  $('ccfg').onclick = srvCopy;
  el.srvdl.onclick = srvDownload;
  if (store.srvFmt) el.srvfmt.value = store.srvFmt;
  el.srvfmt.onchange = () => { store.srvFmt = el.srvfmt.value; saveStore(); renderSrvNote(); };
  $('cids').onclick = () => copy(coll().items.map(i => i.id).join('\n'), `${coll().items.length} mod IDs`);
  $('cexp').onclick = exportFile;
  $('cshare').onclick = shareLink;
  el.cpin.onchange = () => { store.pin = el.cpin.checked; saveStore(); renderSrvNote(); };
  $('cimp').onclick = () => { el.cimpbox.hidden = !el.cimpbox.hidden; if (!el.cimpbox.hidden) el.cimptxt.focus(); };
  $('cimpx').onclick = () => { el.cimpbox.hidden = true; el.cimptxt.value = ''; };
  $('cimpadd').onclick = () => applyImport(parseImport(el.cimptxt.value), 'add');
  $('cimprep').onclick = () => {
    if (coll().items.length && !confirm(`Replace all ${coll().items.length} mods in "${coll().name}"? You can undo this.`)) return;
    applyImport(parseImport(el.cimptxt.value), 'replace');
  };
  $('cimpnew').onclick = () => applyImport(parseImport(el.cimptxt.value), 'new');
  $('cimpfile').onclick = () => el.cfile.click();
  el.cfile.onchange = async () => {
    const f = el.cfile.files[0]; if (!f) return;
    const txt = await f.text(); el.cfile.value = '';
    applyImport(parseImport(txt), 'new', f.name.replace(/\.[^.]+$/, ''));
  };
  el.cfilter.addEventListener('input', renderColl);
  el.csort2.addEventListener('change', renderColl);
  el.clist.addEventListener('click', e => {
    const b = e.target.closest('.rm'); if (b) { e.preventDefault(); removeMod(b.dataset.id); }
  });

  // ---------- main area clicks ----------
  el.main.addEventListener('click', e => {
    const dp = e.target.closest('td.dp');
    if (dp) { e.preventDefault(); openDepWindow(dp.dataset.dep); return; }
    const a = e.target.closest('.addb');
    if (a) { e.preventDefault(); e.stopPropagation(); toggleMod(a.dataset.id); return; }
    const b = e.target.closest('.idb');
    if (b) {
      e.preventDefault(); e.stopPropagation();
      navigator.clipboard?.writeText(b.dataset.id);
      const o = b.textContent; b.textContent = 'Copied'; setTimeout(() => { b.textContent = o; }, 900);
      return;
    }
    const th = e.target.closest('th');
    if (th && th.dataset.k) {
      if (el.csort.value === th.dataset.k) desc = !desc; else { el.csort.value = th.dataset.k; desc = true; }
      el.dir.textContent = desc ? 'Desc' : 'Asc'; persist(); render();
    }
  });

  // ---------- hover tooltip (summary, else first 5 lines of description) ----------
  const tip = document.createElement('div'); tip.id = 'pb-tip'; document.body.appendChild(tip);
  const firstLines = (s, n) => {
    const lines = String(s).replace(/\r/g, '').split('\n').map(l => l.trimEnd()).filter(l => l.trim());
    return lines.slice(0, n).join('\n') + (lines.length > n ? '\n...' : '');
  };
  let tipTarget = null, tipTimer = null, mx = 0, my = 0;
  function placeTip() {
    const pad = 14, w = tip.offsetWidth, h = tip.offsetHeight;
    let x = mx + pad, y = my + pad;
    if (x + w > innerWidth - 8) x = Math.max(8, mx - w - pad);
    if (y + h > innerHeight - 8) y = Math.max(8, my - h - pad);
    tip.style.left = x + 'px'; tip.style.top = y + 'px';
  }
  function showTip(name, body, src) {
    tip.className = '';
    tip.innerHTML = `<b>${esc(name)}</b>${esc(body)}${src ? `<span class="src">${esc(src)}</span>` : ''}`;
    tip.style.display = 'block'; placeTip();
  }
  // Table rows: author's preview image with title and author in small text above
  function showImageTip(r, url) {
    tip.className = 'img';
    tip.innerHTML = `<div class="tm"><span class="tn">${esc(r.name)}</span><span class="ta">by ${esc(r.author?.username || 'unknown')}</span></div>` +
      (url ? `<div class="slide"><img src="${esc(url)}" alt=""><span class="cnt" hidden></span></div>`
        : `<div class="noimg">${url === null ? 'Loading preview...' : 'No preview image'}</div>`);
    tip.style.display = 'block'; placeTip();
    const img = tip.querySelector('img');
    if (img && !img.complete) img.onload = () => { if (tip.style.display === 'block') placeTip(); };
  }
  // Slideshow of a mod's pictures (main preview + screenshots) in the table tooltip
  const SLIDE_START = 750, SLIDE_FADE = 250, SLIDE_HOLD = 1000; // start after 3/4s hover; 0.25s out + 0.25s in; 1s on each photo
  const slide = { token: 0, timers: [] };
  function stopSlides() { slide.token++; slide.timers.forEach(clearTimeout); slide.timers = []; }
  const later = (fn, ms) => { slide.timers.push(setTimeout(fn, ms)); };
  const imgUrl = p => {
    const t = [...(p?.thumbnails?.['image/jpeg'] || [])].sort((a, b) => a.width - b.width);
    return (t.find(x => x.width >= 500) || t[t.length - 1] || p)?.url || '';
  };
  const galleryOf = a => {
    const seen = new Set();
    return [...(a.previews || []), ...(a.screenshots || [])].map(imgUrl).filter(u => u && !seen.has(u) && seen.add(u));
  };
  function runSlides(t, imgs, token) {
    if (imgs.length < 2 || token !== slide.token || tipTarget !== t) return;
    let idx = 0;
    const counter = tip.querySelector('.cnt');
    if (counter) { counter.textContent = `1 / ${imgs.length}`; counter.hidden = false; }
    const step = () => {
      if (token !== slide.token || tipTarget !== t) return;
      const next = (idx + 1) % imgs.length;
      let done = false;
      const go = () => { // preloaded (or timed out): fade out, swap, fade in, hold
        if (done || token !== slide.token) return; done = true;
        const img = tip.querySelector('.slide img'); if (!img) return;
        img.style.opacity = '0';
        later(() => {
          img.src = imgs[next]; idx = next;
          if (counter) counter.textContent = `${idx + 1} / ${imgs.length}`;
          img.style.opacity = '1';
          later(step, SLIDE_FADE + SLIDE_HOLD);
        }, SLIDE_FADE);
      };
      const pre = new Image(); pre.onload = pre.onerror = go; pre.src = imgs[next];
      later(go, 3000);
    };
    step();
  }
  function hideTip() { stopSlides(); clearTimeout(tipTimer); tipTarget = null; tip.style.display = 'none'; }
  el.body.addEventListener('mouseover', e => {
    const t = e.target.closest('td.dp') || e.target.closest('.card, tr[data-id], .it');
    if (!t || t === tipTarget) return;
    hideTip(); tipTarget = t;
    const id = t.dataset.id || t.dataset.dep, hoverStart = Date.now();
    tipTimer = setTimeout(async () => {
      if (t.matches('td.dp')) { showDepTip(id, t); return; }
      const r = rowFor(id); if (!r) return;
      if (t.matches('tr[data-id]')) {
        const token = slide.token, startAt = hoverStart + SLIDE_START;
        const url = thumb(r);
        showImageTip(r, url || (r._stub ? null : '')); // stub from an imported collection: picture comes with details
        try {
          const a = await fetchDetail(id); // screenshots only come with the per-mod details
          if (tipTarget !== t || token !== slide.token) return;
          const imgs = galleryOf(a);
          if (!tip.querySelector('.slide img')) showImageTip({ ...r, ...a }, imgs[0] || '');
          later(() => runSlides(t, imgs, token), Math.max(0, startAt - Date.now()));
        } catch { if (tipTarget === t && !url) showImageTip(r, ''); }
        return;
      }
      const sum = (r.summary || '').trim();
      // Workshop requires a summary, so treat placeholders ("s", "-", or the name repeated) as missing
      const norm = s => s.toLowerCase().replace(/[^\p{L}\p{N}]/gu, '');
      const weak = sum.length < 4 || norm(sum) === norm(r.name || '');
      if (!weak) { showTip(r.name, sum); return; }
      showTip(r.name, 'Loading description...');
      try {
        const a = await fetchDetail(id);
        const s2 = (a.summary || '').trim(), d = (a.description || '').trim();
        if (tipTarget !== t) return;
        const weak2 = s2.length < 4 || norm(s2) === norm(a.name || '');
        if (!weak2) showTip(a.name, s2);
        else showTip(a.name || r.name, d ? firstLines(d, DESC_LINES) : (s2 || 'No summary or description.'), d ? 'From description' : '');
      } catch { if (tipTarget === t) showTip(r.name, sum || 'Could not load description.'); }
    }, 250);
  });
  el.body.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; if (tip.style.display === 'block') placeTip(); });
  el.body.addEventListener('mouseout', e => { if (tipTarget && !tipTarget.contains(e.relatedTarget)) hideTip(); });
  el.main.addEventListener('scroll', hideTip);
  el.cpbody.addEventListener('scroll', hideTip);

  // ---------- dependencies: lookup, table column, tooltip ----------
  const depCache = new Map(); // mod id -> [{id, name, size, version, via}] (direct + nested, unique)
  const depErr = new Set();
  function flattenDeps(list, via, out = new Map()) {
    (list || []).forEach(d => {
      const id = d.asset?.id; if (!id) return;
      if (!out.has(id)) out.set(id, { id, name: d.asset.name || id, size: d.totalFileSize || 0, version: d.version || '', via });
      flattenDeps(d.dependencies, d.asset.name || id, out);
    });
    return out;
  }
  async function depsOf(id) {
    if (depCache.has(id)) return depCache.get(id);
    const a = await fetchDetail(id);
    const v = [...flattenDeps(a.dependencies, null).values()];
    depCache.set(id, v); depErr.delete(id);
    return v;
  }
  function depCell(id) {
    const deps = depCache.get(id);
    if (!deps) return depErr.has(id) || coll().items.find(i => i.id === id)?.missing ? '<span class="dpn">Unknown</span>' : '<span class="dpq">Checking...</span>';
    if (!deps.length) return '<span class="dpn">None</span>';
    const miss = deps.filter(d => !inColl(d.id)).length;
    return miss ? `<span class="dpw">${miss} missing</span>` : `<span class="dpok">&#10003; All ${deps.length}</span>`;
  }
  function updateDepCells() { root.querySelectorAll('#pb-main td.dp').forEach(td => { td.innerHTML = depCell(td.dataset.dep); }); }
  let depFetching = false;
  async function ensureDepInfo() {
    const need = coll().items.filter(i => !depCache.has(i.id) && !depErr.has(i.id) && !i.missing).map(i => i.id);
    if (!need.length || depFetching) return;
    depFetching = true;
    await pool(need, 6, id => depsOf(id).catch(() => { depErr.add(id); }).then(updateDepCells));
    depFetching = false;
    updateDepCells();
  }
  function depTable(deps, compact) {
    return `<table><thead><tr>${compact ? '' : '<th></th>'}<th>Mod</th>${compact ? '' : '<th>Required by</th>'}<th>Size</th><th>Status</th></tr></thead><tbody>${deps.map(d => {
      const on = inColl(d.id);
      return `<tr>${compact ? '' : `<td class="c"><input type="checkbox" data-dc="${d.id}"${on ? ' checked' : ''}></td>`}<td>${compact ? esc(d.name) : `<a href="/workshop/${d.id}" target="_blank">${esc(d.name)}</a>`}</td>${compact ? '' : `<td>${esc(d.via || 'this mod')}</td>`}<td>${fmtSize(d.size)}</td><td class="${on ? 'ok' : 'no'}">${on ? 'In collection' : 'Missing'}</td></tr>`;
    }).join('')}</tbody></table>`;
  }
  async function showDepTip(id, t) {
    const name = rowFor(id)?.name || id;
    const paint = html => { if (tipTarget !== t) return; tip.className = 'dt'; tip.innerHTML = html; tip.style.display = 'block'; placeTip(); };
    if (!depCache.has(id)) {
      paint(`<b>${esc(name)}: dependencies</b>Checking...`);
      try { await depsOf(id); } catch { paint(`<b>${esc(name)}: dependencies</b>Could not load dependencies.`); return; }
    }
    const deps = depCache.get(id);
    paint(`<b>${esc(name)}: dependencies</b>` + (deps.length ? depTable(deps, true) : 'No dependencies.') + '<span class="src">Click to open the dependency checklist</span>');
  }

  // ---------- dialog window (dependency warning + dependency checklist) ----------
  const modal = document.createElement('div'); modal.id = 'pb-modal'; modal.hidden = true;
  modal.innerHTML = `<div class="pbm" role="dialog" aria-modal="true"><div class="pbm-h"><b id="pb-mtitle"></b><button class="pbm-x" id="pb-mx" title="Close">&times;</button></div><div class="pbm-b" id="pb-mbody"></div><div class="pbm-f" id="pb-mfoot"></div></div>`;
  root.appendChild(modal);
  let modalKind = null, modalOnClose = null;
  function openModal(kind, title, onClose) {
    modalKind = kind; modalOnClose = onClose; $('mtitle').textContent = title; modal.hidden = false; hideTip();
  }
  function closeModal() {
    if (modal.hidden) return;
    const kind = modalKind, f = modalOnClose;
    modal.hidden = true; modalKind = null; modalOnClose = null;
    if (f) f();
    if (kind !== 'warn' && depWarnPending.size) showDepWarn(); // a warning that arrived while another window was open
  }
  $('mx').onclick = closeModal;
  modal.addEventListener('mousedown', e => { if (e.target === modal) closeModal(); });

  // Popup when a newly added mod needs mods that are not in the collection
  const depWarnPending = new Map(); // dep id -> {..., neededBy:Set, checked}
  async function warnDeps(modId) {
    if (!el.depWarn.checked) return;
    let deps; try { deps = await depsOf(modId); } catch { return; }
    if (!inColl(modId) || !el.depWarn.checked) return; // removed again, or warnings switched off meanwhile
    const need = deps.filter(d => !inColl(d.id));
    if (!need.length) return;
    const modName = rowFor(modId)?.name || modId;
    need.forEach(d => {
      const p = depWarnPending.get(d.id) || { ...d, neededBy: new Set(), checked: true };
      p.neededBy.add(modName); depWarnPending.set(d.id, p);
    });
    showDepWarn();
  }
  function showDepWarn() {
    if (!depWarnPending.size || (modalKind && modalKind !== 'warn')) return;
    const keepDnw = modalKind === 'warn' && $('dnw')?.checked;
    const list = [...depWarnPending.values()];
    const mods = new Set(list.flatMap(d => [...d.neededBy]));
    openModal('warn', 'Dependencies needed', () => depWarnPending.clear());
    $('mbody').innerHTML = `<div class="lead">The following dependencies are needed for ${mods.size === 1 ? `<b>${esc([...mods][0])}</b>` : `the ${mods.size} mods you added`}:</div>
<table><thead><tr><th></th><th>Mod</th><th>Size</th><th>Needed by</th></tr></thead><tbody>${list.map(d => `
<tr><td class="c"><input type="checkbox" data-dw="${d.id}"${d.checked ? ' checked' : ''}></td><td><a href="/workshop/${d.id}" target="_blank">${esc(d.name)}</a></td><td>${fmtSize(d.size)}</td><td>${esc([...d.neededBy].join(', '))}</td></tr>`).join('')}</tbody></table>`;
    $('mfoot').innerHTML = `<label class="dnw"><input type="checkbox" id="pb-dnw"${keepDnw ? ' checked' : ''}> Do not warn me again. (Can be re-enabled at the top ribbon)</label><span class="sp"></span><button id="pb-dwskip">Skip</button><button id="pb-dwadd" class="pri">Add selected (<span id="pb-dwn">0</span>)</button>`;
    updateDwCount();
  }
  function updateDwCount() {
    const n = [...depWarnPending.values()].filter(d => d.checked).length;
    $('dwn').textContent = n; $('dwadd').disabled = !n;
  }
  function addDepItems(list) {
    const c = coll(), have = new Set(c.items.map(i => i.id));
    const add = list.filter(d => !have.has(d.id));
    add.forEach(d => c.items.push({ id: d.id, name: d.name || d.id, author: '', size: d.size || 0, version: d.version || '', thumb: '', addedAt: Date.now(), dep: true }));
    return add.length;
  }
  function finishWarn(doAdd) {
    if ($('dnw')?.checked) {
      el.depWarn.checked = false; persist();
      setTimeout(() => flash('Dependency warnings are off. Turn them back on with "Dep warnings" in the top ribbon.'), 0);
    }
    const sel = doAdd ? [...depWarnPending.values()].filter(d => d.checked) : [];
    closeModal();
    if (sel.length) {
      snapshot('Add dependencies');
      const n = addDepItems(sel);
      saveStore(); refreshAll(); hydrateItems(coll().items.filter(i => i.dep));
      flash(`Added ${n} dependenc${n === 1 ? 'y' : 'ies'}`);
    }
  }

  // Checklist window for one mod's dependencies (opened from the Deps column)
  let depWinMod = null;
  async function openDepWindow(modId) {
    depWinMod = modId;
    openModal('deps', `Dependencies of ${rowFor(modId)?.name || modId}`, () => { depWinMod = null; });
    $('mbody').innerHTML = '<div class="lead">Checking dependencies...</div>'; $('mfoot').innerHTML = '';
    try { await depsOf(modId); } catch {
      if (depWinMod === modId) $('mbody').innerHTML = '<div class="lead no">Could not load dependencies for this mod.</div>';
      return;
    }
    if (depWinMod === modId) renderDepWindow();
  }
  function renderDepWindow() {
    const deps = depCache.get(depWinMod) || [];
    const miss = deps.filter(d => !inColl(d.id)).length;
    $('mbody').innerHTML = !deps.length ? '<div class="lead">This mod has no dependencies.</div>'
      : `<div class="lead">${miss ? `<span class="no">${miss} of ${deps.length} missing from "${esc(coll().name)}".</span>` : `<span class="ok">All ${deps.length} dependencies are in "${esc(coll().name)}".</span>`} Check a dependency to add it to the collection, uncheck it to remove it.</div>${depTable(deps, false)}`;
    $('mfoot').innerHTML = `<span class="sp"></span>${miss ? `<button id="pb-dcall" class="pri">Add all missing (${miss})</button>` : ''}<button id="pb-dcclose">Close</button>`;
  }
  modal.addEventListener('change', e => {
    const w = e.target.closest('[data-dw]');
    if (w) { const p = depWarnPending.get(w.dataset.dw); if (p) p.checked = w.checked; updateDwCount(); return; }
    const c = e.target.closest('[data-dc]');
    if (c && depWinMod) {
      const d = (depCache.get(depWinMod) || []).find(x => x.id === c.dataset.dc); if (!d) return;
      const col = coll();
      if (c.checked) { snapshot(`Add ${d.name}`); addDepItems([d]); hydrateItems(col.items.filter(i => i.id === d.id)); }
      else { snapshot(`Remove ${d.name}`); col.items = col.items.filter(i => i.id !== d.id); }
      saveStore(); refreshAll(); renderDepWindow();
    }
  });
  modal.addEventListener('click', e => {
    const id = e.target.closest('button')?.id;
    if (id === 'pb-dwskip') finishWarn(false);
    else if (id === 'pb-dwadd') finishWarn(true);
    else if (id === 'pb-dcclose') closeModal();
    else if (id === 'pb-dcall' && depWinMod) {
      const missing = (depCache.get(depWinMod) || []).filter(d => !inColl(d.id));
      snapshot('Add dependencies'); const n = addDepItems(missing);
      saveStore(); refreshAll(); hydrateItems(coll().items.filter(i => i.dep)); renderDepWindow();
      flash(`Added ${n} dependenc${n === 1 ? 'y' : 'ies'}`);
    }
  });

  // ---------- global events ----------
  let debounce;
  const rerender = () => { clearTimeout(debounce); debounce = setTimeout(() => { persist(); render(); }, 150); };
  function openUI() { root.classList.add('open'); document.documentElement.style.overflow = 'hidden'; }
  btn.onclick = () => { openUI(); if (!st.rows.length && st.mode === 'browse') load(false); };
  const close = () => { hideTip(); root.classList.remove('open'); document.documentElement.style.overflow = ''; };
  $('ver').textContent = 'v' + VERSION;
  // Collapsible ribbon groups: click a group label to shrink the group into it
  function setGroupMin(g, min) {
    g.classList.toggle('min', min);
    g.querySelector('.gl').setAttribute('aria-expanded', String(!min));
    if (min && g.contains(document.activeElement) && !document.activeElement.classList.contains('gl')) document.activeElement.blur();
  }
  root.querySelectorAll('header .grp').forEach(g => {
    if ((saved.groupsMin || []).includes(g.dataset.g)) setGroupMin(g, true);
    const gl = g.querySelector('.gl');
    const toggle = () => { hideRibbonTip(); setGroupMin(g, !g.classList.contains('min')); persist(); };
    gl.addEventListener('click', toggle);
    gl.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); } });
  });
  syncFetchMode();
  el.close.onclick = () => { // quick power-down fade, then close
    el.close.classList.add('off'); hideRibbonTip();
    setTimeout(() => { el.close.classList.remove('off'); close(); }, 200);
  };
  // Buy me a coffee: opens COFFEE_URL once set; until then, an easter egg
  const COFFEE_LINES = [
    'Brewing... the coffee fund is still in Workshop review.',
    'Missing dependency: Caffeine. Add to collection?',
    'Resupply request received. ETA: two business days.',
    'Error 418: I\'m a teapot.',
    'Thanks for the thought! The real link is coming soon.',
  ];
  let coffeeN = 0;
  $('coffee').onclick = () => {
    if (COFFEE_URL) { window.open(COFFEE_URL, '_blank', 'noopener'); return; }
    hideRibbonTip();
    const r = $('coffee').getBoundingClientRect(), cx = r.left + r.width / 2;
    for (let i = 0; i < 7; i++) {
      const b = document.createElement('span'); b.className = 'pb-bean';
      b.style.left = (cx - 3) + 'px'; b.style.top = (r.top + 4) + 'px';
      b.style.setProperty('--dx', ((Math.random() - .5) * 60).toFixed(0) + 'px');
      b.style.setProperty('--rot', ((Math.random() - .5) * 540).toFixed(0) + 'deg');
      b.style.animationDelay = (i * 35) + 'ms';
      document.body.appendChild(b); setTimeout(() => b.remove(), 1300);
    }
    document.querySelectorAll('.pb-cofmsg').forEach(m => m.remove());
    const m = document.createElement('div'); m.className = 'pb-cofmsg';
    m.textContent = COFFEE_LINES[coffeeN++ % COFFEE_LINES.length];
    document.body.appendChild(m);
    m.style.top = (r.bottom + 8) + 'px';
    m.style.left = Math.max(8, Math.min(r.right - m.offsetWidth, innerWidth - m.offsetWidth - 8)) + 'px';
    setTimeout(() => m.remove(), 2900);
  };
  document.addEventListener('keydown', e => {
    if (e.key !== 'Escape' || !root.classList.contains('open')) return;
    if (!modal.hidden) { closeModal(); return; }
    if (!el.cimpbox.hidden) { el.cimpbox.hidden = true; return; }
    close();
  });
  el.load.onclick = () => load(false);
  el.fmode.addEventListener('click', e => {
    const b = e.target.closest('button[data-m]'); if (!b || b.dataset.m === fetchMode) return;
    fetchMode = b.dataset.m; syncFetchMode(); persist(); load(false);
  });
  el.psize.onchange = () => {
    const firstMod = (st.page - 1) * (+el.psize.dataset.prev || +el.psize.value); // keep roughly the same spot
    el.psize.dataset.prev = el.psize.value; persist();
    loadPage(Math.floor(firstMod / +el.psize.value) + 1);
  };
  el.psize.dataset.prev = el.psize.value;
  root.addEventListener('click', e => {
    const b = e.target.closest('.pager button[data-pg]'); if (!b || b.disabled) return;
    loadPage(+b.dataset.pg);
  });
  root.addEventListener('keydown', e => {
    if (e.key === 'Enter' && e.target.classList?.contains('pgin')) { e.preventDefault(); e.target.blur(); } // blur commits via 'change'
  });
  root.addEventListener('change', e => { if (e.target.classList?.contains('pgin')) loadPage(e.target.value); });
  el.more.onclick = () => load(true);
  el.mode.onclick = () => setMode(st.mode === 'coll' ? 'browse' : 'coll');
  el.search.addEventListener('keydown', e => { if (e.key === 'Enter') load(false); });
  el.sort.onchange = () => load(false);
  el.dir.onclick = () => { desc = !desc; el.dir.textContent = desc ? 'Desc' : 'Asc'; rerender(); };
  [el.filter, el.minSubs, el.minRating].forEach(i => i.addEventListener('input', rerender));
  [el.csort, el.all, el.view, el.hideColl].forEach(i => i.addEventListener('change', rerender));
  el.depWarn.addEventListener('change', () => { persist(); flash(el.depWarn.checked ? 'Dependency warnings on' : 'Dependency warnings off'); });
  el.cw.addEventListener('input', () => { el.main.style.setProperty('--cw', el.cw.value + 'px'); persist(); });
  el.viewseg.addEventListener('click', e => {
    const b = e.target.closest('button[data-v]'); if (!b || b.dataset.v === el.view.value) return;
    el.view.value = b.dataset.v; syncViewSeg(); el.view.dispatchEvent(new Event('change'));
  });

  // ---------- ribbon tooltips (title|description from data-tip, anchored under the control) ----------
  let rtTimer = null, rtEl = null;
  function hideRibbonTip() { clearTimeout(rtTimer); if (rtEl) { rtEl = null; if (!tipTarget) tip.style.display = 'none'; } }
  root.addEventListener('mouseover', e => {
    const t = e.target.closest('header [data-tip], .thead [data-tip]');
    if (t === rtEl) return;
    hideRibbonTip();
    if (!t) return;
    rtEl = t;
    rtTimer = setTimeout(() => {
      if (rtEl !== t) return;
      const [head, body] = t.dataset.tip.split('|');
      tip.className = '';
      tip.innerHTML = `<b>${esc(head)}</b>${esc(body || '')}`;
      tip.style.display = 'block';
      const r = t.getBoundingClientRect();
      const x = Math.max(8, Math.min(r.left, innerWidth - tip.offsetWidth - 8));
      let y = r.bottom + 6;
      if (y + tip.offsetHeight > innerHeight - 8) y = Math.max(8, r.top - tip.offsetHeight - 6);
      tip.style.left = x + 'px'; tip.style.top = y + 'px';
    }, 400);
  });
  root.addEventListener('mousedown', hideRibbonTip); // don't cover an opening dropdown
  root.addEventListener('mouseleave', hideRibbonTip);
  // keep collections in sync if edited in another tab
  window.addEventListener('storage', e => {
    if (e.key !== LSC || !e.newValue) return;
    try { store = JSON.parse(e.newValue); if (!store.colls[store.active]) store.active = Object.keys(store.colls)[0]; refreshAll(); } catch { }
  });

  syncViewSeg();
  renderTags();
  renderColl();
  checkShareHash();
})();
