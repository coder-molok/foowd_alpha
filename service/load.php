<?php
include 'sample_common.php';
header('Content-type: application/json; charset=utf-8');
header("Access-Control-Allow-Origin: ".$_SERVER['HTTP_ORIGIN']);

$log = fopen("foowd.log", "a");
fprintf($log, "%s:%s\n", date("Ymd:His"),"Load - Inizio chiamata ====================================:".$_SERVER['HTTP_ORIGIN']);

// valuto i dati passati
$hash=(isset($_REQUEST['hash'])?$_REQUEST['hash']:'');

$errors='';

$mail  ='invalid';
$user  = '';
$status="ko";

// leggo da db se la chiave è valida
fprintf($log, "%s:%s\n", date("Ymd:His"),"Load - hash: $hash");
if($hash!='') {
    $chiave_ok=false;
    include 'sample_db.php';
    opendb();
    fprintf($log, "%s:%s\n", date("Ymd:His"),"Load - Connessione: ".($error_db==""?"ok":$error_db));
    if(checkdb()) {
        selectdb("select $hash","SELECT hash, email, user FROM foowd_utenti WHERE hash='$hash'");
    }
    fprintf($log, "%s:%s\n", date("Ymd:His"),"Load - controllo: ".($error_db==""?"ok":$error_db));
    if(checkdb()) {
        $rownum=0;
        while ($row = nextrowdb()) {
            $rownum++;
            fprintf($log, "%s:%s\n", date("Ymd:His"),"Load - Check, row: $rownum, ({$row['hash']},{$row['email']},{$row['user']})");
       	    $mail=$row['email'];
           	// chiave valida
            $user=$row['user'];
            /*
            $nome=sqlescapedb($_REQUEST['nome']);
            $cognome=sqlescapedb($_REQUEST['cognome']);
            $telefono=sqlescapedb($_REQUEST['telefono']);
            $indirizzo=sqlescapedb($_REQUEST['indirizzo']);
            if($indirizzo!="") {
              $nciv=sqlescapedb($_REQUEST['nciv']);
              $comune=sqlescapedb($_REQUEST['comune']);
              $cap=sqlescapedb($_REQUEST['cap']);
              $provincia=sqlescapedb($_REQUEST['provincia']);
            }
            */
        }
    } else {
      $errors.='Errori a DB:'.$error_db;
    }
    closedb();
}
$status = ($errors=='' && $error_db==''?"ok":"ko");
fprintf($log, "%s:%s\n", date("Ymd:His"),"Load - fine elab. err:$errors $error_db, esito:$status - $mail - $user.");
fclose($log);
// esporto la tabella in JSON
?>{ "FoowdService":"v1.0"
, "status":"<?=$status ?>"
, "errors":"<?=$errors ?>"
, "email" :"<?=$mail   ?>"
, "user"  :"<?=$user   ?>"}