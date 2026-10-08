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
// The booking interaction should never replace the whole panel on a section change.
const booking=fs.readFileSync(path.join(root,'assets/js/demo-reservation.js'),'utf8');
const animationCSS=fs.readFileSync(path.join(root,'assets/css/demo-reservation-experience.css'),'utf8');
assert.match(booking,/function syncBookingView\(\)/);
assert.match(booking,/content\.addEventListener\('click',/);
assert.match(booking,/function setBookingSection\(section\)/);
assert.match(booking,/function closeBooking\(\)/);
assert.doesNotMatch(booking,/function transitionBooking\(change\)/,'Do not redraw on each click');
assert.match(animationCSS,/lv-booking-spring-in 480ms/);
assert.match(animationCSS,/grid-template-rows:0fr/);
assert.match(animationCSS,/grid-template-rows:1fr/);
assert.match(animationCSS,/\.demo-calendar-shell\.is-visible/);
assert.match(animationCSS,/\.demo-service-row\.is-open \.demo-service-times/);
// Ramen-inspired Village weekly planner: ordered days, nested services and hourly limits.
const scheduleJS=fs.readFileSync(path.join(root,'assets/js/demo-backoffice-core.js'),'utf8');
const scheduleCSS=fs.readFileSync(path.join(root,'assets/css/demo-village-schedule.css'),'utf8');
assert.match(scheduleJS,/target\.innerHTML=\[1,2,3,4,5,6,0\]\.map/);
assert.match(scheduleJS,/data-field="active"/);
assert.match(scheduleJS,/data-field="maxParty"/);
assert.match(scheduleJS,/data-slot-field="capacity"/);
assert.match(scheduleJS,/data-slot-field="maxParty"/);
assert.match(scheduleJS,/Première arrivée/);
assert.match(scheduleJS,/Dernière arrivée/);
assert.match(scheduleJS,/Sur place/);
assert.match(scheduleJS,/Réservations habituelles/);
assert.match(scheduleJS,/getMaxParty:/);
assert.match(booking,/effectiveMaxParty\(date,service,time\)/);
assert.doesNotMatch(scheduleJS,/À emporter|Livraison/);
assert.match(scheduleCSS,/\.lv-rts-day/);
console.log('PASS weekly reservation schedule, restaurant service editors and per-slot limits');
console.log('PASS persistent animated booking sections and compact opening');
console.log('PASS protected demo page, assets and offline-only configuration');
