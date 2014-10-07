<?php
include 'sample_common.php';
header('Content-type: application/json; charset=utf-8');
header("Access-Control-Allow-Origin: ".$_SERVER['HTTP_ORIGIN']);

$log = fopen("registr.log", "a");
fprintf($log, "%s:%s\n", date("Ymd:His"),"Inizio chiamata ====================================:".$_SERVER['HTTP_ORIGIN']);

// valuto i dati passati
$hash=(isset($_REQUEST['hash'])?$_REQUEST['hash']:'');

$errors='';

$mail  ='invalid';

// leggo da db se la chiave è valida
fprintf($log, "%s:%s\n", date("Ymd:His"),"hash: $hash");
if($hash!='') {
    $chiave_ok=false;
    include 'sample_db.php';
    opendb();
    fprintf($log, "%s:%s\n", date("Ymd:His"),"Connessione: ".($error_db==""?"ok":$error_db));
    if(checkdb()) {
        selectdb("select $hash","SELECT hash, email FROM foowd_utenti WHERE hash='$hash'");
    }
    fprintf($log, "%s:%s\n", date("Ymd:His"),"controllo: ".($error_db==""?"ok":$error_db));
    if(checkdb()) {
        $rownum=0;
        while ($row = nextrowdb()) {
            $rownum++;
            fprintf($log, "%s:%s\n", date("Ymd:His"),"Check, row: $rownum, ({$row['hash']},{$row['email']}={$_REQUEST['email']})");
          	if ($row['email']=='') {
                $errors="Chiave di prova";
           	} else {
           	    $mail=$row['email'];
           	    // chiave valida
           	    if($mail==$_REQUEST['email']) {
           	      // scrivo a db
           	      $set="";
                  $user=sqlescapedb($_REQUEST['user']);
                  $set.=" user='$user'";
                  $nome=sqlescapedb($_REQUEST['nome']);
                  $set.=",nome='$nome'";
                  $cognome=sqlescapedb($_REQUEST['cognome']);
                  $set.=",cognome='$cognome'";
                  $telefono=sqlescapedb($_REQUEST['telefono']);
                  $set.=",telefono='$telefono'";
                  if(isset($_REQUEST['indirizzo'])) {
                    $indirizzo=sqlescapedb($_REQUEST['indirizzo']);
                    $set.=",indirizzo='$indirizzo'";
                    $nciv=sqlescapedb($_REQUEST['nciv']);
                    $set.=",nciv='$nciv'";
                    $comune=sqlescapedb($_REQUEST['comune']);
                    $set.=",comune='$comune'";
                    $cap=sqlescapedb($_REQUEST['cap']);
                    $set.=",cap='$cap'";
                    $provincia=sqlescapedb($_REQUEST['provincia']);
                    $set.=",provincia='$provincia'";
                  }
                  fprintf($log, "%s:%s\n", date("Ymd:His"),"update: $set");
           	      querydb("update $mail data for $user","UPDATE foowd_utenti SET $set WHERE email='$mail'");
           	      if(!checkdb()) {
           	        $errors="Errore in inserimento dati";
           	      }
           	    } else {
           	        $errors="Mail non corretta.";
           	    }
           	}
        }
    }
    closedb();
}
fprintf($log, "%s:%s\n", date("Ymd:His"),"fine elab. err:$errors $error_db, esito:".($errors==''?"ok":"ko").".");
fclose($log);
// esporto la tabella in JSON
?>{ "FoowdService":"v1.0"
, "status":"<?=($errors==''?"ok":"ko") ?>"
, "errors":"<?=$errors ?>"
, "email" :"<?=$mail   ?>"}