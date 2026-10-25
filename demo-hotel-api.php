<?php
declare(strict_types=1);
session_start();header('Content-Type: application/json; charset=utf-8');header('Cache-Control: no-store, private');header('X-Robots-Tag: noindex, nofollow, noarchive');header('X-Content-Type-Options: nosniff');
require __DIR__.'/hotel-demo-lib.php';
function reply(array $data,int $code=200): void {http_response_code($code);echo json_encode($data,JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES);exit;}
if(empty($_SESSION['lv_demo_ok']))reply(['error'=>'Accès privé requis.'],401);
if(empty($_SESSION['hd_csrf']))$_SESSION['hd_csrf']=bin2hex(random_bytes(24));
$catalog=hd_catalog();$action=(string)($_GET['action']??'bootstrap');
try {
 if($_SERVER['REQUEST_METHOD']==='GET'){
  if($action==='bootstrap')reply(['catalog'=>$catalog,'csrf'=>$_SESSION['hd_csrf'],'bookings'=>array_values($_SESSION['hd_bookings']??[])]);
  if($action==='calendar'){$id=(string)($_GET['room']??'');session_write_close();reply(hd_calendar($id));}
  reply(['error'=>'Action inconnue.'],404);
 }
 if($_SERVER['REQUEST_METHOD']!=='POST')reply(['error'=>'Méthode refusée.'],405);
 if((int)($_SERVER['CONTENT_LENGTH']??0)>16384)reply(['error'=>'Requête trop volumineuse.'],413);
 $input=json_decode((string)file_get_contents('php://input'),true);if(!is_array($input)||!hash_equals($_SESSION['hd_csrf'],(string)($input['csrf']??'')))reply(['error'=>'Rechargez la page avant de réessayer.'],403);
 if($action==='cancel'){$id=(string)($input['id']??'');if(!isset($_SESSION['hd_bookings'][$id]))reply(['error'=>'Essai introuvable.'],404);$_SESSION['hd_bookings'][$id]['status']='cancelled';reply(['ok'=>true]);}
 if(!in_array($action,['quote','book'],true))reply(['error'=>'Action inconnue.'],404);
 $room=null;foreach($catalog['rooms'] as $r)if($r['id']===($input['room']??''))$room=$r;if(!$room)throw new RuntimeException('Chambre inconnue.');
 $arrival=(string)($input['arrival']??'');$departure=(string)($input['departure']??'');$guests=(int)($input['guests']??0);$breakfast=($input['breakfast']??false)===true;
 // A fresh server read at submission, before a simulated booking is recorded.
 $calendar=hd_calendar($room['id'],$action==='book');
 $quote=hd_quote($room,$arrival,$departure,$guests,$breakfast,$calendar,array_values($_SESSION['hd_bookings']??[]));
 if($action==='quote')reply(['quote'=>$quote,'syncedAt'=>$calendar['syncedAt']??null]);
 if(empty($input['accept']))throw new RuntimeException('Veuillez accepter les conditions de la démonstration.');
 $name=trim((string)($input['name']??''));$email=trim((string)($input['email']??''));$phone=trim((string)($input['phone']??''));
 if(strlen($name)<2||strlen($name)>120||!filter_var($email,FILTER_VALIDATE_EMAIL)||strlen($email)>254||strlen($phone)>40)throw new RuntimeException('Vérifiez les coordonnées saisies.');
 if(count($_SESSION['hd_bookings']??[])>=50)throw new RuntimeException('Limite de 50 essais atteinte pour cette session.');
 $id='ESSAI-'.strtoupper(bin2hex(random_bytes(4)));$booking=['id'=>$id,'room'=>$room['id'],'roomName'=>$room['name'],'start'=>$arrival,'end'=>$departure,'guests'=>$guests,'breakfast'=>$breakfast,'name'=>$name,'email'=>$email,'phone'=>$phone,'quote'=>$quote,'status'=>'simulation','createdAt'=>gmdate('c')];
 $_SESSION['hd_bookings'][$id]=$booking;reply(['booking'=>$booking]);
}catch(RuntimeException $e){reply(['error'=>$e->getMessage()],422);}catch(Throwable $e){reply(['error'=>'Service temporairement indisponible. Réessayez.'],503);}
