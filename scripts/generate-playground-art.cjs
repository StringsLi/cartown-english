// Original vector illustrations; PNG output keeps WeChat rendering consistent.
const fs = require('node:fs');
const path = require('node:path');
const sharp = require(process.env.SHARP_ROOT || 'sharp');
const root = path.resolve(__dirname, '..');
const out = path.join(root, 'src/pkg-learning/static/playground/art');
const sources = path.join(root, 'docs/source-assets/playground-vectors');
const ink = '#3c4b50';
const eyes = (x = 160, y = 121, gap = 18) => `<circle cx="${x-gap}" cy="${y}" r="4.5" fill="${ink}"/><circle cx="${x+gap}" cy="${y}" r="4.5" fill="${ink}"/><path d="M${x-12} ${y+15} Q${x} ${y+27} ${x+12} ${y+15}" fill="none" stroke="${ink}" stroke-width="4" stroke-linecap="round"/>`;
const circle = (x,y,r,c) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${c}"/>`;
const star = (x,y,s,c) => `<path d="M0 -30 L9 -10 L30 -9 L14 7 L18 29 L0 18 L-18 29 L-14 7 L-30 -9 L-9 -10 Z" fill="${c}" transform="translate(${x} ${y}) scale(${s})"/>`;
const cloud = (x,y,s=1,c='#fff') => `<g transform="translate(${x} ${y}) scale(${s})" fill="${c}"><rect x="-62" y="-6" width="124" height="43" rx="22"/><circle cx="-32" cy="-5" r="29"/><circle cx="8" cy="-22" r="39"/><circle cx="42" cy="-5" r="24"/></g>`;
const sun = (x,y,s=1) => `<g transform="translate(${x} ${y}) scale(${s})"><g stroke="#eac35a" stroke-width="9" stroke-linecap="round">${Array.from({length:8},(_,i)=>`<path d="M0 -55 L0 -69" transform="rotate(${i*45})"/>`).join('')}</g>${circle(0,0,43,'#f3cd6a')}${eyes(0,-2,14)}</g>`;

function car(c) {
  return `<path d="M61 155 L75 108 Q84 77 121 77 L178 77 Q196 79 215 114 L256 128 Q265 133 265 160 L54 160 Q50 155 61 155Z" fill="${c}"/><path d="M89 110 L104 87 L148 87 L148 111Z M159 87 L178 87 Q187 87 203 111 L159 111Z" fill="#d8ecec"/><rect x="49" y="137" width="220" height="39" rx="15" fill="${c}"/>${circle(93,175,25,ink)}${circle(226,175,25,ink)}${circle(93,175,12,'#ddd8c9')}${circle(226,175,12,'#ddd8c9')}<rect x="248" y="140" width="15" height="12" rx="5" fill="#fff0b0"/><path d="M179 146 Q191 156 203 146" stroke="${ink}" stroke-width="4" fill="none" stroke-linecap="round"/>`;
}
function animal(id) {
  if(id==='lion') return `${circle(160,120,83,'#ce9354')}${Array.from({length:10},(_,i)=>circle(160+Math.cos(i*Math.PI/5)*65,120+Math.sin(i*Math.PI/5)*65,23,'#ce9354')).join('')}${circle(124,61,19,'#f7ce7e')}${circle(198,61,19,'#f7ce7e')}${circle(160,125,62,'#f7ce7e')}${eyes()}<ellipse cx="160" cy="143" rx="23" ry="16" fill="#ffe3a3"/>${circle(160,139,7,'#6d5948')}<path d="M159 146 L159 155" stroke="${ink}" stroke-width="3"/>`;
  if(id==='elephant') return `<ellipse cx="97" cy="124" rx="45" ry="60" fill="#a7c7cf"/><ellipse cx="223" cy="124" rx="45" ry="60" fill="#a7c7cf"/><ellipse cx="97" cy="126" rx="26" ry="37" fill="#c4dce1"/><ellipse cx="223" cy="126" rx="26" ry="37" fill="#c4dce1"/>${circle(160,115,64,'#a7c7cf')}${eyes(160,111,22)}<path d="M151 141 Q140 206 175 213 Q197 216 196 195" stroke="#a7c7cf" stroke-width="30" fill="none" stroke-linecap="round"/><path d="M184 188 L202 188" stroke="#7193a0" stroke-width="3"/>`;
  if(id==='monkey') return `${circle(92,117,30,'#a8795c')}${circle(228,117,30,'#a8795c')}${circle(92,117,17,'#efcaa7')}${circle(228,117,17,'#efcaa7')}${circle(160,120,69,'#a8795c')}<path d="M160 102 C130 72 103 110 110 143 Q115 184 160 185 Q205 184 210 143 C217 110 190 72 160 102Z" fill="#efcaa7"/>${eyes(160,124)}<path d="M143 60 Q162 37 176 60" stroke="#a8795c" stroke-width="10" fill="none" stroke-linecap="round"/>`;
  if(id==='penguin') return `<ellipse cx="160" cy="136" rx="61" ry="83" fill="#4d6572"/><ellipse cx="160" cy="155" rx="43" ry="55" fill="#fffdf1"/><ellipse cx="113" cy="157" rx="15" ry="48" fill="#4d6572" transform="rotate(26 113 157)"/><ellipse cx="208" cy="155" rx="15" ry="48" fill="#4d6572" transform="rotate(-26 208 155)"/>${circle(139,110,6,'#fffdf1')}${circle(181,110,6,'#fffdf1')}<path d="M147 128 L173 128 L160 144 Z" fill="#efb56b"/><ellipse cx="130" cy="214" rx="23" ry="9" fill="#efb56b"/><ellipse cx="190" cy="214" rx="23" ry="9" fill="#efb56b"/>`;
  return `<path d="M104 61 Q58 56 73 151 L105 138Z M216 61 Q262 56 247 151 L215 138Z" fill="#a67959"/><path d="M97 105 Q91 47 160 48 Q229 47 223 105 L229 155 Q215 205 160 205 Q105 205 91 155Z" fill="#e9c08b"/><ellipse cx="160" cy="155" rx="40" ry="34" fill="#fbe5c6"/>${eyes(160,116,27)}<path d="M146 146 Q160 135 174 146 Q176 158 160 164 Q144 158 146 146" fill="#5a4d47"/><path d="M160 164 Q145 179 136 164 M160 164 Q175 179 184 164" stroke="#5a4d47" stroke-width="3" fill="none"/>`;
}
function fruit(id) {
  if(id==='apple') return `<path d="M159 92 Q116 55 87 92 C44 144 94 206 136 211 Q156 212 164 203 Q184 218 208 205 C255 180 273 98 219 79 Q189 67 159 92Z" fill="#dd7966"/><path d="M159 84 L164 50" stroke="#83654b" stroke-width="9" stroke-linecap="round"/><path d="M168 62 Q173 27 212 39 Q201 72 168 62Z" fill="#82a871"/>${eyes(160,137)}<path d="M96 104 Q82 123 88 143" stroke="#f4b2a0" stroke-width="8" fill="none" stroke-linecap="round"/>`;
  if(id==='banana') return `<path d="M100 63 Q73 177 197 190 Q241 190 258 144 Q216 218 136 211 Q57 203 57 126 Q59 93 85 52Z" fill="#edc86b"/><path d="M91 67 Q68 173 193 189" stroke="#d9a947" stroke-width="5" fill="none"/><path d="M86 55 L93 41 L105 48 L100 63Z" fill="#847157"/>${eyes(162,176,16)}`;
  if(id==='grapes') return `<path d="M159 68 L171 36" stroke="#6b9061" stroke-width="9" stroke-linecap="round"/><path d="M169 53 Q179 27 209 48 Q194 69 169 53Z" fill="#90ad7d"/>${[[126,93],[177,91],[100,130],[151,129],[202,128],[123,168],[175,168],[150,204]].map(([x,y],i)=>circle(x,y,27,i%2?'#b8a1ce':'#9f87ba')).join('')}${eyes(152,139,15)}`;
  if(id==='watermelon') return `<path d="M63 88 A101 112 0 0 0 257 88Z" fill="#6b9f76"/><path d="M74 87 A89 102 0 0 0 246 87Z" fill="#cee0a1"/><path d="M84 87 A80 89 0 0 0 236 87Z" fill="#e99588"/>${eyes(161,122,21)}${[[113,110],[208,113],[147,170],[184,168]].map(([x,y])=>`<ellipse cx="${x}" cy="${y}" rx="3.5" ry="6" fill="#715d50"/>`).join('')}`;
  return `<path d="M85 93 Q88 51 130 65 Q160 49 191 65 Q235 55 237 100 C229 153 182 210 158 217 C132 203 94 161 85 93Z" fill="#df7e83"/><path d="M116 66 L99 41 L146 51 L160 27 L174 51 L222 42 L201 68 L169 84 L159 63 L143 82Z" fill="#86a775"/>${eyes(160,123,19)}${[[115,105],[199,98],[122,155],[183,158],[153,185]].map(([x,y])=>`<ellipse cx="${x}" cy="${y}" rx="3" ry="5" fill="#ffe4be"/>`).join('')}`;
}
function action(id) {
  const poses={clap:[130,92,188,92,131,204,191,204],wave:[85,65,229,158,138,214,182,214],jump:[88,63,232,63,113,207,206,207],stomp:[97,145,222,145,137,206,207,222],dance:[104,70,224,171,111,207,188,205]};
  const p=poses[id];
  return `<g stroke-linecap="round" stroke-linejoin="round"><path d="M136 125 L${p[0]} ${p[1]} M184 125 L${p[2]} ${p[3]}" stroke="#dbb491" stroke-width="16"/><path d="M147 168 L${p[4]} ${p[5]} M174 168 L${p[6]} ${p[7]}" stroke="#5e8194" stroke-width="19"/><path d="M128 112 Q160 99 192 112 L186 168 Q162 183 135 167Z" fill="#df9b70"/>${circle(160,71,33,'#edc8a5')}<path d="M131 56 Q134 31 165 34 Q186 35 191 54" fill="#786454"/>${eyes(160,71,12)}<path d="M${p[4]-7} ${p[5]+2} L${p[4]+10} ${p[5]+2} M${p[6]-5} ${p[7]+2} L${p[6]+12} ${p[7]+2}" stroke="#c4715b" stroke-width="10"/>${id==='dance'?'<path d="M235 68 L235 40 L257 35 L257 61" stroke="#9b87b5" stroke-width="5" fill="none"/><circle cx="230" cy="70" r="7" fill="#9b87b5"/><circle cx="252" cy="63" r="7" fill="#9b87b5"/>':''}${id==='stomp'?'<path d="M195 241 L220 241 M204 237 L204 227" stroke="#e2ac5d" stroke-width="4"/>':''}${id==='clap'?'<path d="M152 84 L159 71 M167 83 L174 72" stroke="#e2ac5d" stroke-width="4"/>':''}</g>`;
}
function number(n) {
  const positions={1:[[160,122]],2:[[119,122],[201,122]],3:[[160,75],[115,161],[205,161]],4:[[114,82],[206,82],[114,173],[206,173]],5:[[105,77],[215,77],[160,127],[105,182],[215,182]]};
  return positions[n].map(([x,y],i)=>star(x,y,0.94,['#d0b178','#b6a4ca','#d7bc81','#9ab7b0','#d5988d'][i%5])).join('');
}
function shape(id) {
  const paths={circle:circle(160,130,74,'#93b6c8'),square:'<rect x="91" y="60" width="138" height="138" rx="18" fill="#e4b879"/>',triangle:'<path d="M160 45 Q164 45 168 53 L247 186 Q251 195 239 197 L81 197 Q69 195 75 186 L151 53 Q155 45 160 45Z" fill="#92ac83"/>',star:star(160,129,2.75,'#edc76f'),heart:'<path d="M160 205 C135 192 64 138 76 96 C86 51 137 48 160 87 C184 48 235 51 245 96 C257 138 185 192 160 205Z" fill="#d7929c"/>'};
  return paths[id]+eyes(160,id==='triangle'?144:130,19);
}
function weather(id) {
  if(id==='sunny')return sun(160,130,1.08);
  if(id==='cloudy')return sun(195,87,0.68)+cloud(140,134,1.1,'#b6cddb')+eyes(143,139,20);
  if(id==='rainy')return cloud(159,104,1.18,'#a7b9cb')+eyes(159,105,20)+[105,155,205].map(x=>`<path d="M${x} 173 L${x-8} 197" stroke="#7ea7c5" stroke-width="9" stroke-linecap="round"/>`).join('');
  if(id==='snowy')return cloud(159,90,1.1,'#c0d5df')+eyes(159,92,20)+[107,160,213].map(x=>`<g transform="translate(${x} 178)" stroke="#89b0ca" stroke-width="4" stroke-linecap="round">${[0,60,120].map(a=>`<path d="M-14 0 L14 0" transform="rotate(${a})"/>`).join('')}</g>`).join('');
  return cloud(148,102,0.9,'#adc8d4')+eyes(148,104,18)+'<g stroke="#86aeb9" stroke-width="8" stroke-linecap="round" fill="none"><path d="M79 167 L225 167 Q252 167 247 143 Q245 128 232 131"/><path d="M64 191 L186 191 Q214 191 213 208 Q212 221 200 220"/></g>';
}
function feeling(id) {
  let face=circle(160,126,79,id==='sad'?'#b4cddb':id==='calm'?'#c5d8b6':'#f1cd86');
  if(id==='happy')return face+eyes(160,113,23)+'<ellipse cx="119" cy="138" rx="12" ry="7" fill="#eab296"/><ellipse cx="201" cy="138" rx="12" ry="7" fill="#eab296"/>';
  if(id==='sad')return face+'<path d="M131 105 L145 101 M178 101 L192 105 M139 164 Q160 146 181 164" stroke="#57677b" stroke-width="4" fill="none" stroke-linecap="round"/>'+circle(138,120,5,ink)+circle(182,120,5,ink)+'<path d="M198 131 Q184 153 198 158 Q211 153 198 131Z" fill="#7ca8c1"/>';
  if(id==='sleepy')return face+'<path d="M126 119 Q138 130 149 119 M172 119 Q184 130 196 119" stroke="#695b4d" stroke-width="4" fill="none" stroke-linecap="round"/><ellipse cx="161" cy="151" rx="9" ry="12" fill="#8b7057"/><text x="237" y="64" fill="#a48db8" font-family="sans-serif" font-size="30" font-weight="bold">z</text><text x="258" y="41" fill="#a48db8" font-family="sans-serif" font-size="21">z</text>';
  if(id==='excited')return face+star(135,115,0.42,'#ad8761')+star(185,115,0.42,'#ad8761')+'<path d="M137 145 Q161 184 185 145Z" fill="#9a7461"/><path d="M148 160 Q161 151 174 160" fill="#e8aa98"/>'+star(70,62,0.35,'#e0ac61')+star(256,185,0.32,'#e0ac61');
  return face+'<path d="M125 119 Q137 112 149 119 M173 119 Q185 112 197 119 M144 151 Q160 164 178 151" stroke="#6c8066" stroke-width="4" fill="none" stroke-linecap="round"/>';
}
const groups={colors:['red','blue','yellow','green','purple'],animals:['lion','elephant','monkey','penguin','dog'],food:['apple','banana','grapes','watermelon','strawberry'],actions:['clap','wave','jump','stomp','dance'],numbers:['one','two','three','four','five'],shapes:['circle','square','triangle','star','heart'],weather:['sunny','cloudy','rainy','snowy','windy'],feelings:['happy','sad','sleepy','excited','calm']};
const colors={red:'#d97863',blue:'#7ea9bf',yellow:'#eac56c',green:'#8cab85',purple:'#a48cbf'};
const draw=(group,id)=>group==='colors'?car(colors[id]):group==='animals'?animal(id):group==='food'?fruit(id):group==='actions'?action(id):group==='numbers'?number(groups.numbers.indexOf(id)+1):group==='shapes'?shape(id):group==='weather'?weather(id):feeling(id);
const wrap=(body,width=320,height=260)=>`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">${body}</svg>`;

(async()=>{
  fs.mkdirSync(out,{recursive:true});fs.mkdirSync(sources,{recursive:true});
  for(const [group,ids] of Object.entries(groups)) {
    for(const id of ids) {
      const svg=wrap(`<ellipse cx="160" cy="236" rx="82" ry="7" fill="#637b6d" opacity=".08"/>`+draw(group,id));
      fs.writeFileSync(path.join(sources,`${group}-${id}.svg`),svg);
      await sharp(Buffer.from(svg)).png({palette:true,quality:90,effort:10}).toFile(path.join(out,`${group}-${id}.png`));
    }
    const scene=wrap(`<ellipse cx="220" cy="260" rx="208" ry="51" fill="#fff" opacity=".38"/>${circle(50,55,8,'#fff')}${star(391,62,.34,'#fff')}<g transform="translate(39 10) scale(1.17)">${draw(group,ids[0])}</g><g transform="translate(260 101) scale(.46) rotate(8 160 130)">${draw(group,ids[group==='numbers'?4:2])}</g>`,440,300);
    fs.writeFileSync(path.join(sources,`scene-${group}.svg`),scene);
    await sharp(Buffer.from(scene)).png({palette:true,quality:90,effort:10}).toFile(path.join(out,`scene-${group}.png`));
  }
  fs.copyFileSync(path.join(out,'scene-colors.png'),path.join(root,'src/static/ui/playground-preview.png'));
  console.log('Generated 40 original word illustrations, 8 theme scenes, and the home preview.');
})().catch(error=>{console.error(error);process.exit(1);});
