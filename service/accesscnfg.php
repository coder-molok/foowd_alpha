<?php
include "sample_db.php";
// controllo se ho la tabella
opendb();

$log="";
$chiave_ok=false;
$errore='Errore inatteso';
$chiave=(isset($_REQUEST['hash'])?$_REQUEST['hash']:'');
$email=(isset($_REQUEST['email'])?$_REQUEST['email']:'');
$cg=(isset($_REQUEST['cg'])?$_REQUEST['cg']:''); // solo un '.'
$log.="\n- hash da configurare: $chiave .";
if($chiave=='') {
    $errore='ERRORE: hash vuota';
}

if($chiave!='') {
    selectdb('check email presente',"SELECT email,hash,telefono FROM foowd_utenti WHERE email='$email'");
    if(checkdb() && $result_db) {
        while ($row = nextrowdb()) {
            if($row['email']==$email) {
                $errore="Attenzione: la mail &egrave; gi&agrave; presente con hash {$row['hash']}, ";
                if($row['telefono']=='') $errore.="non ancora registrato";
                else $errore.="gi&agrave; registrato";
                $chiave=''; // annullo l'esecuzione
                $log.="\n- email gia' usata - annullato.";
            }
        }
    }
}

if($chiave!='') {
    selectdb('check hash usato',"SELECT email,telefono FROM foowd_utenti WHERE hash='$chiave'");
    if(checkdb() && $result_db) {
        while ($row = nextrowdb()) {
            if($row['email']!='') {
                $errore="Attenzione: la hash &egrave; gi&agrave; presente per la mail {$row['email']}, ";
                if($row['telefono']=='') $errore.="non ancora registrato";
                else $errore.="gi&agrave; registrato";
                $chiave=''; // annullo l'esecuzione
                $log.="\n- hash gia' usata - annullato.";
            }
        }
    }
}

if(checkdb() && $chiave!=='') {
    // verifico chiave
    // prendo la parte seme
    $seed = substr($chiave, 0, 32);
    $log.="\n- ricalcolo lock, seme: $seed .";
    // ricalcolo il checksum
    $check=array(0,0,0,0,0,0,0,0); // sono 8 caratteri
    $checkchar="HlIaJmK0LnMbNoO1PpQcRqS2TrUdVsW3XtYeZu_4.vfw5xgy6zhA7BiC8DjE9FkG";
    for ($i=0; $i<strlen($checkchar)/2; $i++) {
      $i8 = $i % 8;
      $check[$i8]+=ord(substr($seed,$i,1));
      $log.="\n- somme ($i): s[$i8] ".$check[$i8]." .".substr($seed,$i,1);
    }
    for ($i=0; $i<count($check); $i++) {
      $seed.=substr($checkchar,($check[$i] % strlen($checkchar)),1);
      $log.="\n- ricostruzione: $seed .";
    }
    // se $seed corrisponde a chiave, ok, inserisco a DB
    if($seed==$chiave) {
        $chiave_ok=true;
        // inserisco assieme all'indirizzo email e ad un punto in indirizzo per i leader
        $log.="\n- Inserimento di $email,$cg,$chiave .";
        querydb("insert $chiave con $email", "INSERT INTO foowd_utenti (email, hash, indirizzo) VALUES ('$email','$chiave','$cg')");
    } else {
        $errore = "Lock non corrispondente <!-- $seed -->";
    }
}
// comunico la chiave e le altre chiavi libere
?><!doctype html>
<html lang="it">
<head>
    <meta charset="utf-8">
    <title>Configurazione Accesso Utenti Foowd-beta</title>
    <script type="text/javascript" src="js/hash.js"></script>
    <script type="text/javascript" >
    var is_email = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i;
    function creaHashDaEmail() {
      var email = document.getElementsByName('email')[0].value;
      var vhash = document.getElementsByName('hash')[0];
      //console.log('creo hash: '+email+', '+vhash.tagName);
      //console.log('controllo mail: '+is_email.test(email));
      if (is_email.test(email)) {
        vhash.value = hashLock(hashSeed(email));
        console.log('nuova hash: '+vhash.value);
        return true;
      } else {
        return false;
      }
    }
    function inserisciHash() {
      var is_hash = creaHashDaEmail();
      if (!is_hash) {
        alert("Attenzione! la mail non e' valida.");
        return false;
      }
    }
    function showLink(hash) {
      var eschash=encodeURIComponent(hash);
      var cont=document.getElementById('linkwd');
      // div>p>span.templ
      var reg=cont.getElementsByTagName('p')[0].lastChild;
      reg.innerHTML=reg.getAttribute('templ')+eschash;
      var acc=cont.getElementsByTagName('p')[1].lastChild;
      acc.innerHTML=acc.getAttribute('templ')+eschash;
      cont.style.top=(window.innerHeight/2 -70)+"px";
      cont.style.left=(window.innerWidth/2 -300)+"px";
      cont.style.display='block';
    }
    function getLink(from) {
/*      var spn=from.lastChild;
      // metto in clipboard
      copied = spn.createTextRange();
      copied.execCommand("Copy");
*/
      if (from) return false;
      var cont=document.getElementById('linkwd');
      cont.style.display='none';
    }
    </script>
</head>
<body>
<!-- LOG INTEGRATO IN COMMENTO HTML:
<?=$log ?>
-->
<? if($chiave_ok) { ?>
    <h3>Chiave Verificata per <?=$email ?></h3>
    <p><em><strong>Nuova hash : <?=$chiave ?></strong></em></p>
<? } else { ?>
    <h3>Chiave non valida</h3>
    <p><em><strong><?=$errore ?></strong></em></p>
<? } ?>

<div>
    <form onsubmit="return inserisciHash()">
        <table border="0">
            <input name="hash" type="hidden" value="" />
            <tr>
                <td>email</td>
                <td><input name="email" type="text" size="50" /></td>
            </tr>
            <tr>
                <td>capogruppo</td>
                <td><input name="cg" type="checkbox" value="." /></td>
            </tr>
            <tr>
                <td></td><td><input name="crea" type="submit" value="Crea Hash" /></td>
            </tr>
        </table>
    </form>
</div>

<h3>Hash attuali</h3>
<table style="border-collapse:collapse;" border="1">
    <tr>
        <th>email</th><th>hash</th><th>utenza</th><th></th>
    </tr>
    <tr>
        <th colspan="4" style="text-align: center;">non registrati</th>
    </tr>
<?
cleardb();
if(checkdb()) {
    selectdb('Lista-hash-attuali', "SELECT email, hash,
                                    CASE WHEN telefono IS NULL
                                    THEN 0 ELSE 1 END as registrato,
                                    CASE WHEN indirizzo IS NOT NULL
                                         and LENGTH(LTRIM(RTRIM(indirizzo)))>0
                                         THEN 0 ELSE 1 END as leader FROM foowd_utenti
                                         ORDER BY CASE WHEN telefono IS NULL THEN 0 ELSE 1 END,
                                    CASE WHEN indirizzo IS NOT NULL and LENGTH(LTRIM(RTRIM(indirizzo)))>0
                                    THEN 0 ELSE 1 END");
    if(checkdb() && $result_db) {
        $titoloRegistrati=false;
        while ($row = nextrowdb()) {
            if($row['registrato']==1 && !$titoloRegistrati) {
?>
    <tr>
        <td colspan="4" style="text-align: center;">gi&agrave; registrati</td>
    </tr>
<?
                $titoloRegistrati=true;
            }
?>
    <tr>
        <td><?=$row['email'] ?></td>
        <td><?=$row['hash'] ?></td>
        <td><?=($row['leader']==0?"CAPO GRUPPO":"partecipante") ?></td>
        <td><button onclick="showLink('<?=$row['hash'] ?>')">link</button></td>
    </tr>
<?
        }

    }
}
?>
</table>
<div style="color:red; background-color:yellow;">::<?=$error_db ?>::</div>
<div id="linkwd" style="font-size:10pt;color:blue; background-color:white;border:2px solid blue;position:absolute;display:none;">
<div onclick="getLink()" style="float:right;">X</div>
<p onclick="getLink(this)" style="cursor:pointer;">Registrazione:<span templ="http://alfa.foowd.it/registr.shtml?hash=">
</span></p>
<p onclick="getLink(this)" style="cursor:pointer;">Accesso:<span templ="http://alfa.foowd.it/landing.shtml?hash=">
</span></p>
</div>
</body>
</html>
<? closedb(); ?>
