<?php
include 'sample_common.php';
header('Content-type: application/json; charset=utf-8');
header("Access-Control-Allow-Origin: ".$_SERVER['HTTP_ORIGIN']);

$log = fopen("foowd.log", "a");
$_name = pathinfo( $_SERVER['SCRIPT_NAME'], PATHINFO_FILENAME );
fprintf($log, "%s:%s - %s\n", date("Ymd:His"),$_name,"Inizio chiamata =============== from ".$_SERVER['HTTP_ORIGIN']);

// valuto i dati passati
$hash=(isset($_REQUEST['hash'])?$_REQUEST['hash']:'');
$email=(isset($_REQUEST['email'])?$_REQUEST['email']:'');
$user=(isset($_REQUEST['user'])?$_REQUEST['user']:'');
$ordine=(isset($_REQUEST['ordine'])?(int)$_REQUEST['ordine']:-1);
$is_group=(isset($_REQUEST['isgr']) && $_REQUEST['isgr']=='true'?true:false);

$errors='';

$mail  ='invalid';
$rownum=0;

// distinguo il metodo
$metodo="POST";
if (isset($_GET["hash"])) $metodo="GET";

// leggo da db se la chiave è valida
fprintf($log, "%s:%s - %s\n", date("Ymd:His"),$_name,"hash: $hash , email: $email , user: $user , ordine: $ordine .");
if ($hash!='') {
    $chiave_ok=false;
    include 'sample_db.php';
    opendb();
    fprintf($log, "%s:%s - %s\n", date("Ymd:His"),$_name,"Connessione: ".($error_db==""?"ok":$error_db));
    if (checkdb()) {
        selectdb("select last order","SELECT CASE WHEN max(ordine) is null THEN 0 ELSE max(ordine) END as maxord FROM foowd_ordini WHERE utente='$email' ");
    }
    fprintf($log, "%s:%s - %s\n", date("Ymd:His"),$_name,"controllo: ".($error_db==""?"ok":$error_db));
    if (checkdb()) {
        $nextord=-1;
        $sameord=false;
        // prendo solo la prima riga
        if ($row = nextrowdb()) {
            if (checkdb() && isset($row['maxord']) && $row['maxord']>-1) {
           	    // ordine valido
                $nextord=$row['maxord']+1;
                fprintf($log, "%s:%s - %s\n", date("Ymd:His"),$_name,"Check, maxord: {$row['maxord']}, next order: $nextord .");
                if ($metodo=="POST") {
                    // !!!! ---- USO 'ordine' PER DETERMINARE SE ANDARE IN INSERT SECCA o insert/update
                    if ($ordine>-1 && $ordine==$row['maxord']) {
                        // devo sostituire l'ordine: elimino il precedente
                        querydb("update previous order","UPDATE foowd_ordini SET ordine=-ordine WHERE utente='$email' and ordine=$ordine ");
                        if(checkdb()) {
                            // ora il nextord prende il posto dell'eliminato
                            $nextord = $ordine;
                            $sameord = true;
                            fprintf($log, "%s:%s - %s\n", date("Ymd:His"),$_name,"ordine esistente $nextord .");
                        }
                    }

               	    $mail=$email;
                    $user=sqlescapedb($user);
                    $ord=$nextord;
               	    $idx="000";
               	    $phash=(isset($_REQUEST['phash'.$idx])?$_REQUEST['phash'.$idx]:'');
                    fprintf($log, "%s:%s - %s\n", date("Ymd:His"),$_name,"insert: ".'phash'.$idx." $phash");
               	    while($phash!='') {
                 	      if(strlen($phash)==40) {
                     	      // scrivo a db
                     	      $val="null"; //segnaposto per la chiave automatica
                            $val.=",'$mail',$ord ";
                            $prod=sqlescapedb($phash);
                            $val.=",'$prod'";
                            $pdesc=sqlescapedb($_REQUEST['pnome'.$idx]);
                            $qta  =sqlescapedb($_REQUEST['qta'.$idx]);
                            $costo=sqlescapedb($_REQUEST['costo'.$idx]);
                            $val.=",'$pdesc',$qta ,$costo ";
                            fprintf($log, "%s:%s - %s\n", date("Ymd:His"),$_name,"insert: $val");
                     	      $is_inserted=querydb("insert $idx selection for $user order #$ord ","INSERT INTO foowd_ordini VALUES ($val)");
                     	      if(!checkdb() || !$is_inserted) {
                       	        $errors="Errore in inserimento dati ( $idx ) $val , inserite: $is_inserted ";
                     	      } else {
                       	        $rownum++;
                     	      }
                     	      // successivo
                     	      $idx=substr('000'.($idx+1), -3);
                     	      $phash=(isset($_REQUEST['phash'.$idx])?$_REQUEST['phash'.$idx]:'');
                   	    } else {
                   	        $errors="Hash prodotto non corretta ( $idx ): $phash , $pdesc , $qta , $prezzo , $costo .";
                   	    }
                 	  }

                    // se ho zero inserimenti e almeno un errore, ripristino l'ordine precedente
                    if($sameord && $rownum==0 && $errors!='' && checkdb()) {
                        querydb("renew previous order","UPDATE foowd_ordini SET ordine=-ordine WHERE utente='$email' and ordine=-$ordine ");
                    }
                } elseif($metodo=="GET") {
                    if($is_group) {
                        // recupero il gruppo
                        $grp_id=-1;
                        // leggo l'id del gruppo tramite la mail dell'utente
                        selectdb("select group id","SELECT gruppo FROM foowd_gruppi WHERE comp='$email' and ord>0 ");
                        if (checkdb()) {
                            // prendo solo la prima riga
                            if ($row = nextrowdb()) {
                                if (checkdb() && isset($row['gruppo'])) {
                                    // gruppo valido
                                    $grp_id=$row['gruppo'];
                                    fprintf($log, "%s:%s - %s\n", date("Ymd:His"),$_name,"Check, gruppo di: $email , id: $grp_id .");
                                }
                            }
                            if($grp_id>-1) {
                                // recupero gli ordini di tutti i soggetti collegati al gruppo
                                // raggruppando già per prodotto
                                selectdb("select group chart","SELECT selezione, prodotto, desc_prod, qta, costo ".
                                    "FROM foowd_ordini, foowd_gruppi".
                                    "WHERE gruppo=$grp_id and utente=comp and ord>0 and ordine=".
                                    "(SELECT max(ordine) FROM foowd_ordini WHERE utente=comp)");
                            }
                        }
                    } else {
                        $user=sqlescapedb($user);
                        $ord=$row['maxord'];
                   	    // ordine valido
                   	    $cat=array();
                        selectdb("select current order $ord","SELECT selezione, utente, ordine, prodotto, desc_prod, qta, costo ".
                            "FROM foowd_ordini WHERE utente='$email' and ordine=$ord ");
                        if(checkdb()) {
                       	    $mail=$email;
                            while ($row = nextrowdb()) {
                                fprintf($log, "%s:%s - %s\n", date("Ymd:His"),$_name,"select: phash {$row['prodotto']} ; selez. {$row['selezione']}");
                                $cat[]=array(
                                    "sel_id" => $row["selezione"]
                                ,   "phash"  => $row["prodotto"]
                                ,   "pnome"  => $row["desc_prod"]
                                ,   "qta"    => $row["qta"]
                                ,   "costo"  => $row["costo"]
                                );
                       	        $rownum++;
                            }
                        }
                    }
                }
           	} else {
       	        $errors="Numero ordine non conforme.";
           	}
        }
    }
    closedb();
}
if ($error_db != '') {
    $errors.=" Errori a DB: $error_db .";
}
$status = ($errors=='' && $error_db==''?"ok":"ko");
$sep="";
fprintf($log, "%s:%s - %s\n", date("Ymd:His"),$_name,"fine elab. $metodo err:$errors $error_db, esito: $status x $rownum selezioni.");
fclose($log);
// esporto la tabella in JSON
?>{ "FoowdService":"v1.0"
, "status":"<?=$status ?>"
, "errors":"<?=$errors ?>"
, "email" :"<?=$mail   ?>"
, "user"  :"<?=$user   ?>"
<? if($metodo=="GET") { ?>
, "ordine":"<?=$ord    ?>"
, "selez" :[
<?   if(isset($cat))foreach($cat as $prd) { ?>
  <?=$sep ?>
  { "sel_id" :"<?=$prd["sel_id"] ?>"
  , "phash"  :"<?=$prd["phash"] ?>"
  , "pnome"  :"<?=$prd["pnome"] ?>"
  , "qta"    :"<?=$prd["qta"] ?>"
  , "costo"  :"<?=$prd["costo"] ?>"
  }
<? $sep=","; ?>
<?   } ?>
  ]
<? } ?>
}