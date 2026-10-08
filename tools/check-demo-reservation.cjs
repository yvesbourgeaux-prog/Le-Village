// Run with: node tools/check-demo-reservation.cjs
// Regression guard: a single DOM element must not be treated like an array.
'use strict';
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const scripts=[
 'assets/js/demo-reservation.js',
 'assets/js/demo-backoffice-core.js',
 'assets/js/demo-backoffice-comms.js',
 'assets/js/demo-booking-launcher.js'
];
for(const file of scripts){
 const src=fs.readFileSync(path.join(root,file),'utf8');
 new vm.Script(src,{filename:file});
 const unsafe=[...src.matchAll(/(?<!\$)\$\([^)]*\)\.(?:forEach|map|filter)\s*\(/g)];
 assert.equal(unsafe.length,0,'Found invalid single-element selector in '+file+': '+unsafe.map(x=>x[0]).join(', '));
 console.log('PASS',file,'syntax and DOM selector loops');
}
const page=fs.readFileSync(path.join(root,'demo-reservation.php'),'utf8');
assert.match(page,/password_verify/);
assert.match(page,/noindex,nofollow,noarchive/);
for(const name of ['demo-reservation.js','demo-backoffice-core.js','demo-backoffice-comms.js','demo-booking-launcher.js','demo-village-friendly.css']){
 assert(page.includes(name),'Demo missing linked asset: '+name);
}
console.log('PASS protected demo page, assets and offline-only configuration');
