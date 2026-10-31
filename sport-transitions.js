// Full-screen sport intros that play when a shopper opens a sport, e.g. a ball meeting the bat for cricket.
// The page switches underneath the scene at the moment of impact, then the scene slides away.

const SWITCH_AT_MS = 700;
const LEAVE_AT_MS = 1350;
const LEAVE_MS = 400;

const shade = '<defs><radialGradient id="st-shade" cx=".35" cy=".3" r=".75"><stop offset="0" stop-color="#fff" stop-opacity=".45"/><stop offset=".55" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".35"/></radialGradient></defs>';

// A star-shaped flash centred on the point of contact.
function burst(cx, cy, outer = 58, inner = 24, points = 12) {
  const corners = [];
  for (let index = 0; index < points * 2; index++) {
    const radius = index % 2 ? inner : outer, angle = (Math.PI * index) / points;
    corners.push(`${(cx + radius * Math.sin(angle)).toFixed(1)},${(cy - radius * Math.cos(angle)).toFixed(1)}`);
  }
  return `<g class="st-impact st-anim"><polygon points="${corners.join(' ')}" fill="#fff"/><circle cx="${cx}" cy="${cy}" r="${outer + 10}" fill="none" stroke="#9be54b" stroke-width="6"/></g>`;
}

// The moving object, with two faint copies trailing behind it for a sense of speed.
function projectile(markup) {
  return `<g class="st-ball st-anim st-ghost g2">${markup}</g><g class="st-ball st-anim st-ghost">${markup}</g><g class="st-ball st-anim">${markup}</g>`;
}

function lines(from, to, step, draw) {
  let path = '';
  for (let value = from; value <= to; value += step) path += draw(value);
  return path;
}

const word = (text, x, y) => `<text class="st-word st-anim" x="${x}" y="${y}" text-anchor="middle">${text}</text>`;

const SCENES = {
  Cricket: {
    key: 'cricket', tagline: 'BAT · BALL · GLORY',
    pivot: [880, 290], swing: [-110, 15, 120],
    svg: () => `${shade}
      <polygon points="250,900 1350,900 1010,560 590,560" fill="#c8ab6e" opacity=".42"/>
      <line x1="470" y1="700" x2="1130" y2="700" stroke="#fff" stroke-width="4" opacity=".5"/>
      <g fill="#f3e7c9"><rect x="936" y="455" width="10" height="190" rx="4"/><rect x="961" y="455" width="10" height="190" rx="4"/><rect x="986" y="455" width="10" height="190" rx="4"/><rect x="933" y="446" width="34" height="7" rx="3"/><rect x="964" y="446" width="34" height="7" rx="3"/></g>
      <g class="st-striker st-anim">
        <rect x="870" y="290" width="20" height="165" rx="9" fill="#151515"/>
        <path d="M870 320l20 7M870 345l20 7M870 370l20 7M870 395l20 7M870 420l20 7" stroke="#df3c35" stroke-width="4"/>
        <path d="M854 445h52q8 0 8 10v280q0 38-34 42q-34-4-34-42v-280q0-10 8-10z" fill="#e8cf98" stroke="#9c7b45" stroke-width="4"/>
        <path d="M880 470v280" stroke="#c8a96a" stroke-width="10" stroke-linecap="round" opacity=".55"/>
        <rect x="858" y="490" width="44" height="64" rx="6" fill="#df3c35"/>
        <text class="st-bat-text" x="880" y="533" text-anchor="middle">SW</text>
      </g>
      ${burst(795, 609)}
      ${projectile('<circle r="22" fill="#c4231c"/><path d="M-20-8q20 10 40 0M-20 8q20-10 40 0" fill="none" stroke="#f6dcae" stroke-width="2.5" stroke-dasharray="3 4"/><circle r="22" fill="url(#st-shade)"/>')}
      ${word('CRACK!', 690, 500)}`
  },
  Football: {
    key: 'football', tagline: 'STRIKE · SCORE · REPEAT',
    pivot: [690, 290], swing: [55, -4, -55],
    svg: () => `${shade}
      <rect y="690" width="1600" height="210" fill="#9be54b" opacity=".16"/>
      <g fill="#fff" opacity=".04">${lines(0, 1600, 400, x => `<rect x="${x}" y="690" width="200" height="210"/>`)}</g>
      <line x1="0" y1="690" x2="1600" y2="690" stroke="#fff" stroke-width="4" opacity=".5"/>
      <g class="st-net st-anim"><path d="${lines(1032, 1320, 32, x => `M${x} 347V690`)}${lines(370, 680, 30, y => `M1007 ${y}H1333`)}" stroke="#fff" stroke-width="2" opacity=".35"/></g>
      <path d="M1000 690V340h340v350" fill="none" stroke="#fff" stroke-width="14" stroke-linejoin="round"/>
      <g class="st-striker st-anim">
        <rect x="662" y="290" width="56" height="350" rx="26" fill="#f4f4f0"/>
        <rect x="662" y="380" width="56" height="18" fill="#df3c35"/><rect x="662" y="410" width="56" height="10" fill="#df3c35"/>
        <path d="M655 625h75q62 0 78 42q4 24-20 28H655q-14 0-14-14z" fill="#141414"/>
        <path d="M700 650h62" stroke="#9be54b" stroke-width="6" stroke-linecap="round"/>
      </g>
      ${burst(836, 656, 52, 22)}
      ${projectile('<circle r="34" fill="#fafafa" stroke="#111" stroke-width="3"/><path d="M0-12l11 8-4 13H-7l-4-13z" fill="#111"/><path d="M0-12V-33M11-4l20-7M7 9l12 17M-7 9l-12 17M-11-4l-20-7" stroke="#111" stroke-width="3"/><circle r="34" fill="url(#st-shade)"/>')}
      ${word('GOAL!', 900, 250)}`
  },
  Basketball: {
    key: 'basketball', tagline: 'SHOOT · SWISH · WIN',
    svg: () => `${shade}
      <line x1="0" y1="820" x2="1600" y2="820" stroke="#fff" stroke-width="4" opacity=".35"/>
      <path d="M560 820a400 140 0 0 1 800 0" fill="none" stroke="#fff" stroke-width="4" opacity=".25"/>
      <rect x="830" y="150" width="260" height="170" rx="6" fill="#ffffff12" stroke="#fff" stroke-width="8"/>
      <rect x="915" y="230" width="90" height="70" fill="none" stroke="#fff" stroke-width="5"/>
      <rect x="954" y="320" width="12" height="78" fill="#d9d9d9"/>
      <path d="M890 400a70 14 0 0 1 140 0" stroke="#e8662a" stroke-width="7" fill="none"/>
      ${projectile('<circle r="36" fill="#e8662a"/><path d="M-36 0h72M0-36v72M-25-25q14 25 0 50M25-25q-14 25 0 50" stroke="#2a1205" stroke-width="3" fill="none"/><circle r="36" fill="url(#st-shade)"/>')}
      <g class="st-net st-anim"><path d="M892 402l18 100M915 405l12 100M940 407l6 98M965 407v98M990 407l-6 98M1012 405l-12 100M1028 402l-18 100M906 450h108M912 492h96" stroke="#fff" stroke-width="3" opacity=".85" fill="none"/></g>
      <path d="M890 400a70 14 0 0 0 140 0" stroke="#ff7a35" stroke-width="8" fill="none"/>
      ${burst(960, 430, 48, 20)}
      ${word('SWISH!', 700, 300)}`
  },
  Badminton: {
    key: 'badminton', tagline: 'RALLY · SMASH · RULE',
    pivot: [980, 820], swing: [70, -15, -80],
    svg: () => `<defs><clipPath id="st-head"><ellipse cx="980" cy="400" rx="62" ry="88"/></clipPath></defs>
      <rect y="700" width="1600" height="200" fill="#1d6b46" opacity=".5"/>
      <rect y="600" width="1600" height="10" fill="#f4f4f0" opacity=".8"/>
      <path d="${lines(0, 1600, 22, x => `M${x} 610V700`)}M0 635H1600M0 662H1600M0 688H1600" stroke="#fff" stroke-width="1.5" opacity=".25"/>
      <g class="st-striker st-anim">
        <rect x="972" y="650" width="16" height="170" rx="8" fill="#151515"/>
        <rect x="976" y="488" width="8" height="170" fill="#c9ccd1"/>
        <path d="${lines(925, 1035, 14, x => `M${x} 300V500`)}${lines(318, 486, 14, y => `M910 ${y}H1050`)}" stroke="#fff" stroke-width="1.6" opacity=".7" clip-path="url(#st-head)"/>
        <ellipse cx="980" cy="400" rx="66" ry="92" fill="none" stroke="#df3c35" stroke-width="10"/>
      </g>
      ${burst(871, 414)}
      ${projectile('<path d="M-6-14L-72-36-76 36-6 14z" fill="#f7f7f2" stroke="#cfd2d6" stroke-width="2"/><path d="M-32-24v48M-54-31v62" stroke="#cfd2d6" stroke-width="2"/><circle r="15" fill="#f0e2c0"/><path d="M-4-13v26" stroke="#df3c35" stroke-width="4"/>')}
      ${word('SMASH!', 640, 300)}`
  },
  Tennis: {
    key: 'tennis', tagline: 'SERVE · RALLY · ACE',
    pivot: [1000, 780], swing: [75, -10, -95],
    svg: () => `<defs><clipPath id="st-head"><ellipse cx="1000" cy="360" rx="74" ry="94"/></clipPath>${shade.replace('<defs>', '').replace('</defs>', '')}</defs>
      <polygon points="0,900 1600,900 1600,640 0,640" fill="#2b5e8c" opacity=".5"/>
      <path d="M280 900L600 640H1000L1320 900M440 770H1160M800 640V770" stroke="#fff" stroke-width="4" opacity=".55" fill="none"/>
      <g class="st-striker st-anim">
        <rect x="992" y="610" width="16" height="170" rx="8" fill="#151515"/>
        <path d="M1000 610L962 450M1000 610L1038 450" stroke="#9be54b" stroke-width="9" stroke-linecap="round"/>
        <path d="${lines(936, 1064, 16, x => `M${x} 250V470`)}${lines(274, 450, 16, y => `M920 ${y}H1080`)}" stroke="#fff" stroke-width="1.6" opacity=".7" clip-path="url(#st-head)"/>
        <ellipse cx="1000" cy="360" rx="80" ry="100" fill="none" stroke="#9be54b" stroke-width="11"/>
      </g>
      ${burst(927, 366)}
      ${projectile('<circle r="20" fill="#d7f34a"/><path d="M-14-14q12 14 0 28M14-14q-12 14 0 28" stroke="#fff" stroke-width="3" fill="none"/><circle r="20" fill="url(#st-shade)"/>')}
      ${word('ACE!', 650, 260)}`
  },
  Volleyball: {
    key: 'volleyball', tagline: 'BUMP · SET · SPIKE',
    pivot: [900, 470], swing: [45, -15, -100],
    svg: () => `${shade}
      <rect y="760" width="1600" height="140" fill="#c98a4b" opacity=".35"/>
      <rect y="560" width="1600" height="12" fill="#f4f4f0" opacity=".85"/>
      <path d="${lines(0, 1600, 24, x => `M${x} 572V662`)}M0 600H1600M0 630H1600M0 660H1600" stroke="#fff" stroke-width="1.5" opacity=".25"/>
      <g class="st-striker st-anim">
        <rect x="878" y="210" width="44" height="270" rx="22" fill="#c98e64"/>
        <rect x="872" y="390" width="56" height="90" rx="12" fill="#df3c35"/>
        <ellipse cx="900" cy="200" rx="34" ry="40" fill="#c98e64"/>
      </g>
      ${burst(812, 188, 52, 22)}
      ${projectile('<circle r="38" fill="#f7f7f2"/><path d="M-36-10q30 6 50 34M-10-37q14 30 4 74" stroke="#2f6fd6" stroke-width="7" fill="none"/><path d="M10-36q-6 30 26 50" stroke="#f2c94c" stroke-width="7" fill="none"/><circle r="38" fill="url(#st-shade)"/>')}
      ${word('SPIKE!', 620, 330)}`
  }
};

let playing = false;

export function playSportTransition(sport, origin, onSwitch) {
  const scene = SCENES[sport];
  if (!scene || playing || matchMedia('(prefers-reduced-motion: reduce)').matches) {
    if (!playing) onSwitch();
    return;
  }
  playing = true;
  const overlay = document.createElement('div');
  overlay.className = `sport-transition st-${scene.key}`;
  overlay.setAttribute('aria-hidden', 'true');
  const box = origin?.getBoundingClientRect();
  if (box) {
    overlay.style.setProperty('--cx', `${box.left + box.width / 2}px`);
    overlay.style.setProperty('--cy', `${box.top + box.height / 2}px`);
  }
  if (scene.pivot) {
    overlay.style.setProperty('--px', `${scene.pivot[0]}px`);
    overlay.style.setProperty('--py', `${scene.pivot[1]}px`);
    scene.swing.forEach((angle, index) => overlay.style.setProperty(`--r${index}`, `${angle}deg`));
  }
  overlay.innerHTML = `<svg class="st-scene" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice">${scene.svg()}</svg><div class="st-label"><span>${scene.tagline}</span><strong>${sport.toUpperCase()}</strong></div><span class="st-skip">TAP TO SKIP</span>`;
  document.body.append(overlay);

  let switched = false, leaving = false;
  const timers = [];
  const switchPage = () => { if (!switched) { switched = true; onSwitch(); } };
  const finish = () => { timers.forEach(clearTimeout); removeEventListener('keydown', onKey); overlay.remove(); playing = false; };
  const leave = () => {
    if (leaving) return;
    leaving = true;
    switchPage();
    overlay.classList.add('st-leave');
    timers.push(setTimeout(finish, LEAVE_MS));
  };
  const onKey = event => { if (event.key === 'Escape' || event.key === 'Enter' || event.key === ' ') leave(); };
  timers.push(setTimeout(switchPage, SWITCH_AT_MS), setTimeout(leave, LEAVE_AT_MS));
  overlay.addEventListener('click', leave);
  addEventListener('keydown', onKey);
}
