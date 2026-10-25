<?php
require dirname(__DIR__).'/hotel-demo-lib.php';
function check(bool $ok,string $label):void{if(!$ok)throw new Exception($label);echo "PASS $label\n";}
function rejects(callable $fn,string $label):void{try{$fn();}catch(RuntimeException $e){check(true,$label);return;}check(false,$label);}
$ical="BEGIN:VCALENDAR\r\nVERSION:2.0\r\nBEGIN:VEVENT\r\nDTSTART;VALUE=DATE:20261105\r\nDTEND;VALUE=DATE:20261108\r\nSUMMARY:Private guest\r\nEND:VEVENT\r\nBEGIN:VEVENT\r\nDTSTART;VALUE=DATE:20261109\r\nSTATUS:CANCELLED\r\nEND:VEVENT\r\nEND:VCALENDAR\r\n";
$b=hd_parse_ical($ical);check($b===[['start'=>'2026-11-05','end'=>'2026-11-08']],'exclusive departure and cancelled events');
check(!str_contains(json_encode($b),'Private'),'no guest information in parsed result');
rejects(fn()=>hd_parse_ical(str_replace('SUMMARY:Private guest','RRULE:FREQ=DAILY',$ical)),'unknown recurrence fails closed');
rejects(fn()=>hd_parse_ical('error HTML'),'invalid calendar fails closed');
check(hd_event_day('20261105T140000Z','')==='2026-11-05','UTC event date');
$room=hd_catalog()['rooms'][0];$cal=['ok'=>true,'blocks'=>$b];
$q=hd_quote($room,'2026-11-03','2026-11-05',2,true,$cal);check($q['subtotal']===363,'room plus cleaning and breakfast');
check(hd_quote($room,'2026-11-08','2026-11-09',2,false,$cal)['subtotal']===168,'arrival on occupied stay checkout permitted');
rejects(fn()=>hd_quote($room,'2026-11-04','2026-11-06',2,false,$cal),'occupied night rejected');
rejects(fn()=>hd_quote($room,'2026-11-08','2026-11-09',2,false,['ok'=>false,'blocks'=>[]]),'disconnected calendar rejected');
rejects(fn()=>hd_quote($room,'2027-02-01','2027-02-02',2,false,$cal),'unpriced stay rejected');
rejects(fn()=>hd_quote($room,'2026-11-08','2026-11-09',3,false,$cal),'overcapacity rejected');
$booking=['room'=>$room['id'],'start'=>'2026-11-08','end'=>'2026-11-09','status'=>'simulation'];
rejects(fn()=>hd_quote($room,'2026-11-08','2026-11-09',2,false,$cal,[$booking]),'session duplicate rejected');
$booking['status']='cancelled';check(hd_quote($room,'2026-11-08','2026-11-09',2,false,$cal,[$booking])['subtotal']===168,'cancelled simulation released');
$suite=hd_catalog()['rooms'][4];check(hd_quote($suite,'2026-11-08','2026-11-10',3,true,$cal)['subtotal']===551,'suite third guest and breakfast');
check(!hd_valid_url('https://evil.test/calendar')&&!hd_valid_url('https://api.host.holidu.com@evil.test/'),'calendar host allowlist');
$_SESSION=['lv_demo_ok'=>true]; // rendering handled separately by the route harness
