const fs = require('node:fs'), path = require('node:path');
const root = path.resolve(__dirname, '..');
const data = require('../docs/source-assets/maps/china-outline.json');
const width = 540, height = 360, margin = 22, lonScale = Math.cos(35 * Math.PI / 180);
const rings = geometry => geometry.type === 'MultiPolygon' ? geometry.coordinates.flat() : geometry.coordinates;
const points = data.layers.flatMap(layer => rings(layer.geometry).flat());
const xs = points.map(p => p[0] * lonScale), ys = points.map(p => -p[1]);
const minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys);
const scale = Math.min((width - 2 * margin) / (maxX - minX), (height - 2 * margin) / (maxY - minY));
const xOffset = (width - (maxX - minX) * scale) / 2, yOffset = (height - (maxY - minY) * scale) / 2;
function project([lon, lat]) { return [xOffset + (lon * lonScale - minX) * scale, yOffset + (-lat - minY) * scale]; }
const paths = data.layers.map(layer => `<path id="${layer.id}" d="${rings(layer.geometry).map(ring => ring.map((point, i) => (i ? 'L' : 'M') + project(point).map(n => n.toFixed(3)).join(',')).join(' ') + ' Z').join(' ')}" fill="#487e90" fill-rule="evenodd"/>`).join('\n');
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="中国地图，含台湾省轮廓"><rect width="540" height="360" fill="#ffffff"/>\n${paths}\n</svg>\n`;
if (require.main === module) {
 fs.writeFileSync(path.join(root, 'docs/source-assets/maps/china-outline.svg'), svg);
 const sharp = require(process.env.SHARP_ROOT || 'sharp');
 sharp(Buffer.from(svg)).removeAlpha().png({palette:false}).toFile(path.join(root,'src/pkg-world/static/country-maps/china.png')).then(info => console.log(`China map generated: ${info.width} x ${info.height}, ${info.size} bytes; mainland, Hainan, Taiwan Province.`)).catch(e => { console.error(e);process.exitCode=1; });
}
module.exports = { project, width, height, rings };
