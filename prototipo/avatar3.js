/* PROTÓTIPO: avatar vetorial v3. Camadas paramétricas por estágio (1 a 4), pose e personalização. */
const SKINS = { Clara: "#f3cfb0", Média: "#e8b48a", Morena: "#c68c5e", Escura: "#8a5a3b" };
const HAIRS = { Castanho: "#2b1d14", Preto: "#111111", Loiro: "#d9a441", Ruivo: "#a4421f" };
const SUITS = { Azul: "#3a86ff", Verde: "#1fa187", Roxo: "#8338ec", Grafite: "#3d405b" };
const STYLES = ["Topete", "Curto", "Careca"];
const AV = { skin: SKINS.Média, hair: HAIRS.Castanho, suit: SUITS.Azul, style: "Topete" };
function shade(hex, k) {
  const n = parseInt(hex.slice(1), 16);
  return `rgb(${Math.round((n >> 16) * k)},${Math.round(((n >> 8) & 255) * k)},${Math.round((n & 255) * k)})`;
}
function avatar(st, pose) {
  const O = "#15122e", m = [0, 0.35, 0.7, 1][st - 1], hero = st >= 2, cx = 120;
  pose = pose || (hero ? "hips" : "civil");
  const S = 30 + m * 24, C = 27 + m * 19, W = 21 + m * 5, H = 23 + m * 5, A = 8 + m * 8, U = A + m * 8, T = 13 + m * 10, K = 11 + m * 6, N = 13 + m * 10;
  const base = hero ? AV.suit : "#8b89a8", suit = base, sd = shade(base, 0.7), skin = AV.skin, skd = shade(AV.skin, 0.82);
  const legc = hero ? suit : "#4a4866", glove = hero ? "#ffd60a" : skin, armc = hero ? suit : skin;
  const sw = (pts, w, c, op) => `<polyline points="${pts}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"${op ? ` opacity="${op}"` : ""}/>`;
  const P = (...a) => a.map((p) => p.map((v) => +v.toFixed(1)).join(",")).join(" ");
  const mx = (p) => [2 * cx - p[0], p[1]], lerp = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
  const sh = [cx - S, 110];
  let el, fi;
  if (pose === "flex") { el = [cx - S - 22 - m * 4, 108]; fi = [cx - S - 15, 70 - m * 4]; }
  else if (pose === "civil") { el = [cx - S - 4, 152]; fi = [cx - S - 2, 192]; }
  else { el = [cx - S - 15 - m * 7, 152]; fi = [cx - H - 4, 190]; }
  const hip = [cx - 12 - m * 2, 204], knee = [cx - 20 - m * 3, 252], foot = [cx - 24 - m * 3, 294], boot = lerp(knee, foot, 0.3);
  const side = (f) => {
    const a = f(sh), b = f(el), c = f(fi), g = lerp(b, c, 0.42);
    return {
      out: sw(P(a, b), U + 8, O) + sw(P(b, c), A + 8, O),
      fill: sw(P(a, b), U, armc) + sw(P(b, c), A, armc) + (hero ? sw(P(g, c), A, glove) : "")
        + (st >= 3 ? sw(P(lerp(a, b, 0.25), lerp(a, b, 0.7)), 3, "#fff", 0.35) : "")
        + `<circle cx="${c[0]}" cy="${c[1]}" r="${A / 2 + 4.5}" fill="${glove}" stroke="${O}" stroke-width="3.5"/>`
        + `<circle cx="${a[0]}" cy="${a[1]}" r="${U / 2 + 4 + m * 3}" fill="${suit}" stroke="${O}" stroke-width="3.5"/>`
        + (st >= 3 ? `<path d="M${a[0] - 6} ${a[1] - 5} q6 -6 12 -1" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".4"/>` : ""),
    };
  };
  const L = side((p) => p), R = side(mx);
  const leg = (f) => {
    const a = f(hip), b = f(knee), c = f(foot), bt = f(boot);
    return {
      out: sw(P(a, b), T + 8, O) + sw(P(b, c), K + 8, O),
      fill: sw(P(a, b), T, legc) + sw(P(b, c), K, legc)
        + (hero ? sw(P(bt, c), K + 2, "#ffd60a") : sw(P(lerp(b, c, 0.92), c), K + 2, "#2a2840")),
    };
  };
  const LL = leg((p) => p), LR = leg(mx);
  const torso = `M${cx - N / 2} 90 Q${cx - S * 0.55} 92 ${cx - S} 108 L${cx - C} 138 Q${cx - W - 3} 162 ${cx - W} 184 L${cx - H} 206 L${cx + H} 206 L${cx + W} 184 Q${cx + W + 3} 162 ${cx + C} 138 L${cx + S} 108 Q${cx + S * 0.55} 92 ${cx + N / 2} 90Z`;
  const shadow = `M${cx + C * 0.5} 96 L${cx + S} 108 L${cx + C} 138 Q${cx + W + 3} 162 ${cx + W} 184 L${cx + H} 206 L${cx + H * 0.45} 206 Q${cx + W} 150 ${cx + C * 0.5} 96Z`;
  const py = 136 + m * 5;
  const cape = st === 2 ? `<path d="M${cx - S + 4} 104 Q${cx - S - 24} 150 ${cx - S - 12} 214 L${cx + S + 12} 214 Q${cx + S + 24} 150 ${cx + S - 4} 104Z" fill="#e63946" stroke="${O}" stroke-width="4" stroke-linejoin="round"/>`
    : st === 3 ? `<path d="M${cx - S + 4} 104 Q${cx - S - 34} 180 ${cx - S - 24} 290 L${cx + S + 24} 290 Q${cx + S + 34} 180 ${cx + S - 4} 104Z" fill="#e63946" stroke="${O}" stroke-width="4" stroke-linejoin="round"/><path d="M${cx - S - 14} 200 q-4 40 0 84M${cx + S + 14} 200 q4 40 0 84" fill="none" stroke="${O}" stroke-width="2.5" opacity=".5"/>`
    : st === 4 ? `<path d="M${cx - S + 4} 102 Q${cx - S - 58} 140 ${cx - S - 60} 236 Q${cx - S - 38} 250 ${cx - S - 34} 292 L${cx + S + 22} 292 Q${cx + S + 44} 200 ${cx + S - 4} 102Z" fill="#e63946" stroke="${O}" stroke-width="4" stroke-linejoin="round"/><path d="M${cx - S - 30} 150 q-18 50 -10 92M${cx - S - 12} 190 q-10 50 -4 96M${cx + S + 18} 190 q8 50 2 96" fill="none" stroke="${O}" stroke-width="2.5" opacity=".5"/>` : "";
  const bolt = (k, y, fill) => `<polygon points="${[[4, -13], [-7, 2], [0, 2], [-4, 13], [8, -3], [1, -3]].map(([x, yy]) => `${cx + x * k},${y + yy * k}`).join(" ")}" fill="${fill}" stroke="${O}" stroke-width="2.5" stroke-linejoin="round"/>`;
  const emblem = st === 2 ? bolt(0.85, 122, "#ffd60a")
    : st === 3 ? `<circle cx="${cx}" cy="122" r="14" fill="#ffd60a" stroke="${O}" stroke-width="3"/>${bolt(0.75, 122, "#e63946")}`
    : st === 4 ? `<path d="M${cx} 102 L${cx + 21} 118 L${cx} 146 L${cx - 21} 118Z" fill="#e63946" stroke="${O}" stroke-width="3.5" stroke-linejoin="round"/>${bolt(1, 122, "#ffd60a")}` : "";
  const rays = st === 4 ? Array.from({ length: 14 }, (_, i) => { const a = (i / 14) * Math.PI * 2, b = a + 0.2; return `<path d="M${cx} 150 L${cx + Math.cos(a) * 260} ${150 + Math.sin(a) * 260} L${cx + Math.cos(b) * 260} ${150 + Math.sin(b) * 260}Z" fill="#fff" opacity=".45"/>`; }).join("")
    : st === 3 ? `<circle cx="${cx}" cy="140" r="104" fill="#fff" opacity=".35"/>` : "";
  const hair = AV.style === "Careca" ? "" : AV.style === "Curto"
    ? `<path d="M${cx - 24} 44 Q${cx - 28} 14 ${cx} 14 Q${cx + 28} 14 ${cx + 24} 44 Q${cx + 20} 30 ${cx} 30 Q${cx - 20} 30 ${cx - 24} 44Z" fill="${AV.hair}" stroke="${O}" stroke-width="3.5" stroke-linejoin="round"/>`
    : `<path d="M${cx - 25} 46 Q${cx - 31} 12 ${cx - 4} 11 Q${cx + 10} 1 ${cx + 23} 12 Q${cx + 31} 22 ${cx + 25} 46 Q${cx + 21} 30 ${cx + 6} 31 Q${cx - 13} 32 ${cx - 25} 46Z" fill="${AV.hair}" stroke="${O}" stroke-width="3.5" stroke-linejoin="round"/><path d="M${cx - 6} 17 Q${cx + 8} 10 ${cx + 17} 17" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".35"/>`;
  const eye = (x) => `<ellipse cx="${x}" cy="48" rx="5" ry="3.8" fill="#fff" stroke="${O}" stroke-width="2"/><circle cx="${x + 0.5}" cy="48.5" r="2.2" fill="${O}"/>`;
  const face = st >= 3
    ? `<path d="M${cx - 23} 38 H${cx + 23} L${cx + 21} 55 Q${cx + 11} 61 ${cx} 54 Q${cx - 11} 61 ${cx - 21} 55Z" fill="${st === 4 ? shade(AV.suit, 0.45) : O}" stroke="${O}" stroke-width="2.5" stroke-linejoin="round"/><path d="M${cx - 16} 47 q6 -6 11 1 q-6 3 -11 -1ZM${cx + 16} 47 q-6 -6 -11 1 q6 3 11 -1Z" fill="#fff"/>`
    : eye(cx - 10) + eye(cx + 10) + (hero ? `<path d="M${cx - 17} 39 l11 3M${cx + 17} 39 l-11 3" stroke="${O}" stroke-width="3.2" stroke-linecap="round"/>` : `<path d="M${cx - 16} 41 l10 -3M${cx + 16} 41 l-10 -3" stroke="${O}" stroke-width="3" stroke-linecap="round"/>`);
  const mouth = st === 1 ? `<path d="M${cx - 6} 71 Q${cx} 68 ${cx + 6} 71" fill="none" stroke="${O}" stroke-width="2.8" stroke-linecap="round"/>`
    : st === 2 ? `<path d="M${cx - 8} 68 Q${cx} 76 ${cx + 8} 68" fill="none" stroke="${O}" stroke-width="2.8" stroke-linecap="round"/>`
    : st === 3 ? `<path d="M${cx - 8} 70 Q${cx + 2} 76 ${cx + 10} 67" fill="none" stroke="${O}" stroke-width="2.8" stroke-linecap="round"/>`
    : `<path d="M${cx - 10} 67 Q${cx} 80 ${cx + 10} 67Z" fill="#fff" stroke="${O}" stroke-width="2.5" stroke-linejoin="round"/>`;
  return `<svg viewBox="0 0 240 304" role="img" aria-label="Seu herói, estágio ${st} de 4">
  ${rays}${cape}${LL.out}${LR.out}${LL.fill}${LR.fill}
  <path d="${torso}" fill="${suit}" stroke="${O}" stroke-width="4" stroke-linejoin="round"/><path d="${shadow}" fill="${sd}"/>
  ${st >= 3 ? `<path d="M${cx - N / 2} 90 L${cx - S * 0.62} 97 L${cx - N / 2 + 2} 100ZM${cx + N / 2} 90 L${cx + S * 0.62} 97 L${cx + N / 2 - 2} 100Z" fill="${sd}" stroke="${O}" stroke-width="2.5" stroke-linejoin="round"/>` : ""}
  ${hero ? `<path d="M${cx - 2} ${py} Q${cx - C * 0.5} ${py + 9} ${cx - C + 5} ${py - 6}M${cx + 2} ${py} Q${cx + C * 0.5} ${py + 9} ${cx + C - 5} ${py - 6}" fill="none" stroke="${O}" stroke-width="3" stroke-linecap="round"/>` : `<path d="M${cx - 9} 92 Q${cx} 102 ${cx + 9} 92" fill="none" stroke="${O}" stroke-width="3" stroke-linecap="round"/>`}
  ${st >= 3 ? `<path d="M${cx} ${py + 4} V186M${cx - 11} 156 H${cx + 11}M${cx - 11} 167 H${cx + 11}M${cx - 10} 178 H${cx + 10}" fill="none" stroke="${O}" stroke-width="2.6" stroke-linecap="round"/>` : ""}
  ${st === 4 ? `<path d="M${cx - W - 4} 156 l7 6M${cx - W - 2} 168 l7 6M${cx + W + 4} 156 l-7 6M${cx + W + 2} 168 l-7 6" fill="none" stroke="${O}" stroke-width="2.6" stroke-linecap="round"/>` : ""}
  <path d="${torso}" fill="none" stroke="${O}" stroke-width="4" stroke-linejoin="round"/>
  ${hero ? `<path d="M${cx - H} 204 L${cx + H} 204 L${cx + 8} 226 L${cx - 8} 226Z" fill="#e63946" stroke="${O}" stroke-width="3.5" stroke-linejoin="round"/><rect x="${cx - H - 2}" y="190" width="${2 * H + 4}" height="13" fill="#ffd60a" stroke="${O}" stroke-width="3.5"/><rect x="${cx - 8}" y="188" width="16" height="17" fill="#fff8e7" stroke="${O}" stroke-width="3"/>` : ""}
  ${emblem}${L.out}${R.out}${L.fill}${R.fill}
  ${st >= 3 ? `<circle cx="${cx - S * 0.62}" cy="100" r="5" fill="#ffd60a" stroke="${O}" stroke-width="2.5"/><circle cx="${cx + S * 0.62}" cy="100" r="5" fill="#ffd60a" stroke="${O}" stroke-width="2.5"/>` : ""}
  <rect x="${cx - N / 2}" y="74" width="${N}" height="20" fill="${skd}" stroke="${O}" stroke-width="3.5"/>
  <circle cx="${cx - 23}" cy="52" r="5.5" fill="${skin}" stroke="${O}" stroke-width="3"/><circle cx="${cx + 23}" cy="52" r="5.5" fill="${skin}" stroke="${O}" stroke-width="3"/>
  <path d="M${cx - 22} 42 Q${cx - 22} 20 ${cx} 20 Q${cx + 22} 20 ${cx + 22} 42 L${cx + 20} 62 Q${cx + 13} 82 ${cx} 84 Q${cx - 13} 82 ${cx - 20} 62Z" fill="${skin}" stroke="${O}" stroke-width="4" stroke-linejoin="round"/>
  <path d="M${cx + 12} 26 Q${cx + 22} 30 ${cx + 22} 42 L${cx + 20} 62 Q${cx + 15} 76 ${cx + 6} 82 Q${cx + 14} 60 ${cx + 12} 26Z" fill="${skd}"/>
  ${hair}${face}<path d="M${cx} 55 l-3 8 h5" fill="none" stroke="${O}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>${mouth}</svg>`;
}
