<?php
include 'sample_common.php';
header('Content-type: application/json; charset=utf-8');
header("Access-Control-Allow-Origin: ".$_SERVER['HTTP_ORIGIN']);

$dbcfg='mysql';

$log = fopen("access.log", "a");
fprintf($log, "%s:%s\n", date("Ymd:His"),"Inizio chiamata ====================================:".$_SERVER['HTTP_ORIGIN']);

// valuto i dati passati
$hash=(isset($_REQUEST['hash'])?$_REQUEST['hash']:'');

$errors='';

$access='denied';  //"granted|denied"
$status='unknown'; //"unknown|new|registered"
$type  ='unknown'; //"unknown|buyer|leader"
$mail  ='invalid';

// leggo da db se la chiave è valida
if($hash!='') {
    $chiave_ok=false;
    include 'sample_db.php';
    opendb();
    fprintf($log, "%s:%s\n", date("Ymd:His"),"Connessione: ".($error_db==""?"ok":$error_db));
    if(checkdb()) {
        selectdb("select $hash","SELECT hash, email, telefono, indirizzo FROM foowd_utenti WHERE hash='$hash'");
    }
    if(checkdb()) {
        $rownum=0;
        while ($row = nextrowdb()) {
            $rownum++;
            fprintf($log, "%s:%s\n", date("Ymd:His"),"Check, row: $rownum, ({$row['hash']},{$row['email']},{$row['telefono']},{$row['indirizzo']})");
          	if ($row['email']=='') {
                $error="Chiave di prova";
           	} else {
           	    $mail=$row['email'];
           	    // chiave valida
           	    $access='granted';
           	    if($row['telefono']=='') {
           	        $status='new';
           	    } else {
           	        $status='registered';
           	    }
           	    if($row['indirizzo']=='') {
           	        $type='buyer';
           	    } else {
           	        $type='leader';
           	    }
           	}
        }
    }
    closedb();
}
fprintf($log, "%s:%s\n", date("Ymd:His"),"fine elab. err:$errors $error_db, esito:$access, $status, $type.");
fclose($log);
// esporto la tabella in JSON
?>{ "AccessService":"v1.0"
, "access":"<?=$access ?>"
, "status":"<?=$status ?>"
, "type"  :"<?=$type   ?>"
, "email" :"<?=$mail   ?>"}