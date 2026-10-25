<?php
declare(strict_types=1);
function hd_catalog(): array { return json_decode((string)file_get_contents(__DIR__.'/assets/data/hotel-demo-rooms.json'),true,512,JSON_THROW_ON_ERROR); }
function hd_dir(): string { $d=dirname(__DIR__).'/private/hotel-demo'; if(!is_dir($d)&&!mkdir($d,0700,true)&&!is_dir($d))throw new RuntimeException('Stockage indisponible'); return $d; }
function hd_write(string $path,array $data): void { $tmp=tempnam(dirname($path),'hd-');if(!$tmp)throw new RuntimeException('Écriture impossible');chmod($tmp,0600);if(file_put_contents($tmp,json_encode($data,JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES),LOCK_EX)===false||!rename($tmp,$path)){@unlink($tmp);throw new RuntimeException('Écriture impossible');} }
function hd_config(): array { $p=hd_dir().'/calendars.json';return is_file($p)?(json_decode((string)file_get_contents($p),true)?:[]):[]; }
function hd_valid_url(string $url): bool {$u=parse_url($url);return is_array($u)&&($u['scheme']??'')==='https'&&($u['host']??'')==='api.host.holidu.com'&&!isset($u['user'])&&!isset($u['pass'])&&(!isset($u['port'])||$u['port']===443);}
function hd_day(string $s): ?DateTimeImmutable { $d=DateTimeImmutable::createFromFormat('!Y-m-d',$s,new DateTimeZone('Europe/Paris'));return $d&&$d->format('Y-m-d')===$s?$d:null; }
function hd_event_day(string $value,string $params): string { if(preg_match('/^\d{8}$/',$value))return substr($value,0,4).'-'.substr($value,4,2).'-'.substr($value,6,2);$zone=new DateTimeZone('Europe/Paris');if(preg_match('/TZID=([^;:]+)/',$params,$m))$zone=new DateTimeZone(trim($m[1],'"'));$d=new DateTimeImmutable($value,$zone);return $d->setTimezone(new DateTimeZone('Europe/Paris'))->format('Y-m-d'); }
function hd_parse_ical(string $body): array {
 if(strpos($body,'BEGIN:VCALENDAR')===false||strpos($body,'END:VCALENDAR')===false)throw new RuntimeException('Calendrier incomplet');
 $body=preg_replace('/\r?\n[ \t]/','',$body);preg_match_all('/BEGIN:VEVENT\r?\n(.*?)\r?\nEND:VEVENT/s',$body,$events);$blocks=[];
 foreach($events[1] as $event){if(preg_match('/^STATUS:CANCELLED\s*$/mi',$event)||preg_match('/^TRANSP:TRANSPARENT\s*$/mi',$event))continue;if(preg_match('/^(RRULE|RDATE|EXDATE)[;:]/mi',$event))throw new RuntimeException('Récurrence non prise en charge');
  if(!preg_match('/^DTSTART([^:]*):([^\r\n]+)/mi',$event,$s))throw new RuntimeException('Date absente');$start=hd_event_day(trim($s[2]),$s[1]);
  $end=preg_match('/^DTEND([^:]*):([^\r\n]+)/mi',$event,$e)?hd_event_day(trim($e[2]),$e[1]):(new DateTimeImmutable($start))->modify('+1 day')->format('Y-m-d');
  if($end<=$start)$end=(new DateTimeImmutable($start))->modify('+1 day')->format('Y-m-d');$blocks[$start.'/'.$end]=['start'=>$start,'end'=>$end];
 }return array_values($blocks);
}
function hd_calendar(string $id,bool $force=false): array {
 $catalog=hd_catalog();if(!in_array($id,array_column($catalog['rooms'],'id'),true))throw new RuntimeException('Chambre inconnue');$config=hd_config();$url=$config[$id]??'';$path=hd_dir().'/cache-'.$id.'.json';
 $cached=is_file($path)?json_decode((string)file_get_contents($path),true):null;
 if(!$force&&is_array($cached)&&time()-($cached['timestamp']??0)<300)return $cached;
 if(!hd_valid_url($url))return ['ok'=>false,'message'=>'Calendrier non connecté','blocks'=>[]];
 try{
  if(!function_exists('curl_init'))throw new RuntimeException('Connexion indisponible');$ch=curl_init($url);$body='';
  curl_setopt_array($ch,[CURLOPT_FOLLOWLOCATION=>false,CURLOPT_CONNECTTIMEOUT=>5,CURLOPT_TIMEOUT=>15,CURLOPT_PROTOCOLS=>CURLPROTO_HTTPS,CURLOPT_USERAGENT=>'LeGrimaldi-HotelDemo/1.0',CURLOPT_WRITEFUNCTION=>static function($c,string $chunk)use(&$body){if(strlen($body)+strlen($chunk)>2097152)return 0;$body.=$chunk;return strlen($chunk);}]);
  $done=curl_exec($ch);$status=(int)curl_getinfo($ch,CURLINFO_HTTP_CODE);curl_close($ch);if($done===false||$status!==200)throw new RuntimeException('Lecture impossible');
  $blocks=hd_parse_ical($body);$result=['ok'=>true,'timestamp'=>time(),'syncedAt'=>gmdate('c'),'blocks'=>$blocks];hd_write($path,$result);return $result;
 }catch(Throwable $e){return ['ok'=>false,'message'=>'Disponibilités temporairement indisponibles. Réessayez plus tard.','blocks'=>is_array($cached)?($cached['blocks']??[]):[],'syncedAt'=>$cached['syncedAt']??null];}
}
function hd_quote(array $room,string $arrival,string $departure,int $guests,bool $breakfast,array $calendar,array $bookings=[]): array {
 $a=hd_day($arrival);$d=hd_day($departure);$today=new DateTimeImmutable('today',new DateTimeZone('Europe/Paris'));
 if(!$a||!$d||$a<$today||$d<=$a||$d>$today->modify('+366 days')||$a->diff($d)->days>30)throw new RuntimeException('Choisissez un séjour de 1 à 30 nuits, dans les 12 prochains mois.');
 if($guests<1||$guests>$room['capacity'])throw new RuntimeException('Capacité de la chambre dépassée.');
 if(!($calendar['ok']??false))throw new RuntimeException('Le calendrier doit être synchronisé pour poursuivre.');
 foreach(array_merge($calendar['blocks'],$bookings) as $b){if(isset($b['room'])&&$b['room']!==$room['id'])continue;if(($b['status']??'')==='cancelled')continue;if($arrival<$b['end']&&$departure>$b['start'])throw new RuntimeException('Ces dates comprennent au moins une nuit indisponible.');}
 $nightly=[];$stay=0;
 for($day=$a;$day<$d;$day=$day->modify('+1 day')){$date=$day->format('Y-m-d');$rate=null;foreach($room['rates'] as $r)if($date>=$r['start']&&$date<=$r['end'])$rate=$r;if(!$rate)throw new RuntimeException('Les tarifs de ces dates ne sont pas encore renseignés.');$p=(int)$rate['price'];$stay+=$p;$nightly[]=['date'=>$date,'price'=>$p];}
 $c=hd_catalog();$n=count($nightly);$extra=max(0,$guests-2)*(int)$room['extraGuest']*$n;$bf=$breakfast?$c['breakfast']*$guests*$n:0;
 return ['nights'=>$n,'nightly'=>$nightly,'stay'=>$stay,'cleaning'=>$c['cleaning'],'extra'=>$extra,'breakfast'=>$bf,'subtotal'=>$stay+$extra+$bf+$c['cleaning'],'taxNote'=>$c['taxNote']];
}
