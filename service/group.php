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

$errors='';

$mail  ='invalid';
$rownum=0;

// distinguo il metodo
$metodo="POST";
if (isset($_GET["hash"])) $metodo="GET";

// leggo da db se la chiave è valida
fprintf($log, "%s:%s - %s\n", date("Ymd:His"),$_name,"hash: $hash , email: $email , user: $user .");
if ($hash!='') {
    $is_leader=false;
    $chiave_ok=false;
    include 'sample_db.php';
    opendb();
    fprintf($log, "%s:%s - %s\n", date("Ymd:His"),$_name,"Connessione: ".($error_db==""?"ok":$error_db));
    if(checkdb()) {
        selectdb("check $hash","SELECT hash, email, indirizzo FROM foowd_utenti "
            ."WHERE hash='$hash' and email='$email'");
    }
    if(checkdb()) {
        while ($row = nextrowdb()) {
            $chiave_ok=true;
            if ($row['indirizzo']!='') {
                $is_leader=true;
            }
        }
    }
    // se la chiave è valida proseguo
    /* Posso avere letture GET o scritture POST diverse:
     * GET:
     *     - in base alla &email dell'utente viene recuperato il suo record
     *          e quindi con l'ID del gruppo anche nome e leader.
     *     - se la &email di request corrisponde a quella del leader viene letto tutto il gruppo
     * POST: (lo può effettuare solo il leader)
     *     - se non esiste un $grp_id per questo leader viene creato con nome &grp e leader &email
     *     - se esiste $grp_id e &grp non corrisponde al nome, viene aggiornato
     *   inoltre se esiste $grp_id e è indicato un &comp
     *     - se non esiste record ($grp_id, &comp), viene aggiunto un componente in stato 'iniziale'
     *          con &ord indicato o 99 altrimenti
     *     - se esiste tale record viene verificata la corrispondenza di &ord e/o &stt e quindi 
     *          viene aggiornato il record di conseguenza
     *   in ogni caso un &ord<2 viene corretto in 99, e &stt diverso da ('a','i','s') non viene considerato.
     */
    if($chiave_ok) {
        $grp_id=-1;
        $my_ord='99';
        // leggo l'id del gruppo tramite la mail dell'utente
        if (checkdb()) {
            selectdb("select group id","SELECT gruppo, ord FROM foowd_gruppi WHERE comp='$email' and ord>0 ");
            if (checkdb()) {
                // prendo solo la prima riga
                if ($row = nextrowdb()) {
                    if (checkdb() && isset($row['gruppo'])) {
                        // gruppo valido
                        $grp_id=$row['gruppo'];
                        fprintf($log, "%s:%s - %s\n", date("Ymd:His"),$_name,"Check, gruppo di: $email , id: $grp_id .");
                    }
                    $my_ord=$row['ord'];
                    if($is_leader && $my_ord!='1') {
                        $is_leader=false;
                    }
                }
            }
        }
        if($metodo=="GET") {
            $ord=" in (0,1,$my_ord) ";
            if($is_leader) {
                $ord=" is not null ";
            }
            $ogru=array("id"=>0, "nome"=>'', "comp"=>array());
            $gru=array();
            selectdb("select group $grp_id, $ord","SELECT gruppo,comp,ord,stato ".
                "FROM foowd_gruppi WHERE gruppo=$grp_id and ord$ord ");
            if(checkdb()) {
                $mail=$email;
                while ($row = nextrowdb()) {
                    fprintf($log, "%s:%s - %s\n", date("Ymd:His"),$_name,"select: comp {$row['comp']} ; ord. {$row['ord']}; stato {$row['stato']}");
                    $gru[]=array(
                        "grp_id" => $row["gruppo"]
                    ,   "comp"   => $row["comp"]
                    ,   "ord"    => $row["ord"]
                    ,   "stato"  => $row["stato"]
                    );
                    $rownum++;
                }
            }
            foreach($gru as $cgru) {
                if($cgru["ord"]==0) {
                    $ogru["id"]=$cgru["grp_id"];
                    $ogru["nome"]=$cgru["comp"];
                } else {
                    if($cgru["ord"]==1) {
                        $ogru["leader"]=$cgru["comp"];
                    }
                    $ogru["comp"][]=array(
                      "mail"=>$cgru["comp"]
                    , "ord" =>$cgru["ord"]
                    , "stat"=>$cgru["stato"]
                    );
                }
            }
            fprintf($log, "%s:%s - %s\n", date("Ymd:His"),$_name,
                "letto gruppo {$ogru['id']} {$ogru['nome']}, leader "
                .(isset($ogru['leader'])?$ogru['leader']:"not-present")
                .", comp. ".count($ogru['comp']));
        } elseif($metodo=="POST" && $is_leader) {
            // !!!! ---- USO 'gruppo'+'comp' PER DETERMINARE SE ANDARE IN insert o update
            $op_nuovo=false;
            if($grp_id==-1) {
                // leggo il numero max di gruppo e sommo 1
                if (checkdb()) {
                    selectdb("select last group","SELECT CASE WHEN max(gruppo) is null THEN 0 ELSE max(gruppo) END as maxgru FROM foowd_gruppi ");
                    if (checkdb()) {
                        // prendo solo la prima riga
                        if ($row = nextrowdb()) {
                            if (checkdb() && isset($row['maxgru']) && $row['maxgru']>-1) {
                                // gruppo valido
                                $grp_id=$row['maxgru']+1;
                                $op_nuovo=true;
                                fprintf($log, "%s:%s - %s\n", date("Ymd:His"),$_name,"Check, maxgru: {$row['maxgru']}, next group: $grp_id .");
                            }
                        }
                    }
                }
            }
            if($grp_id!=-1) {
                // ho un id valido, opero secondo op_nuovo
                $mail=$email;
                if($op_nuovo) {
                    // verifico se è indicato &grp, altrimenti è generato in automatico
                    $gruppo=(isset($_REQUEST['grp'])?$_REQUEST['grp']:"GRUPPO $grp_id");
                    fprintf($log, "%s:%s - %s\n", date("Ymd:His"),$_name,"insert: $grp_id - $gruppo + $mail");
                    // scrivo a db il primo record : gruppo
                    $sg =sqlescapedb($gruppo);
                    $val="$grp_id,'$sg', 0, 'a'";
                    fprintf($log, "%s:%s - %s\n", date("Ymd:His"),$_name,"insert: $val");
                    $is_inserted=querydb("insert group $gruppo ","INSERT INTO foowd_gruppi VALUES ($val)");
                    if(!checkdb() || !$is_inserted) {
                        $errors="Errore in inserimento dati ( $gruppo ) $val , inserite: $is_inserted ";
                    } else {
                        $rownum++;

                        // scrivo a db il secondo record : leader
                        $sm =sqlescapedb($email);
                        $val="$grp_id,'$sm', 1, 'a'";
                        fprintf($log, "%s:%s - %s\n", date("Ymd:His"),$_name,"insert: $val");
                        $is_inserted=querydb("insert leader $grp_id ","INSERT INTO foowd_gruppi VALUES ($val)");
                        if(!checkdb() || !$is_inserted) {
                            $errors="Errore in inserimento dati ( $email ) $val , inserite: $is_inserted ";
                        } else {
                            $rownum++;
                        }
                    }
                } else {
                    // in base ai dati a db e forniti da request valuto l'operazione da fare
                    $oper=""; // nessuna operazione
                    $ord=0;
                    $stt='a';
                    // verifico se è indicato &comp
                    $comp=(isset($_REQUEST['comp'])?$_REQUEST['comp']:'');
                    // se non è indicato lavoro sul record &ord=0
                    if($comp=='') {
                        // verifico che &grp sia indicato e diverso dal corrente
                        if(isset($_REQUEST['grp'])) {
                            $gruppo=$_REQUEST['grp'];
                            selectdb("select check group name '$grp_id,$guppo'","SELECT gruppo, comp FROM foowd_gruppi "
                                    ."WHERE gruppo=$grp_id and ord=0 ");
                            if (checkdb()) {
                                if ($row = nextrowdb()) {
                                    if($row['comp']!=$gruppo) {
                                        // nome da aggiornare
                                        $oper='update';
                                        $comp=$gruppo;
                                    }
                                }
                            }
                        }
                    } else {
                        // cerco il record 'gruppo','comp' per determinare INSERT o UPDATE
                        selectdb("select check row '$grp_id,$comp'","SELECT gruppo, comp, ord, stato FROM foowd_gruppi "
                                ."WHERE gruppo=$grp_id and comp='$comp' and ord>0 ");
                        if (checkdb()) {
                            if ($row = nextrowdb()) {
                                // riga esistente, aggiorno solo se ho dati diversi
                                $ord=(int)$row['ord'];
                                $stt=$row['stato'];
                                if(isset($_REQUEST['ord']) && $ord!=(int)$_REQUEST['ord']) {
                                    $ord=(int)$_REQUEST['ord'];
                                    $oper='update';
                                }
                                if(isset($_REQUEST['stato']) && $stt!=$_REQUEST['stato']) {
                                    $stt=$_REQUEST['stato'];
                                    $oper='update';
                                }
                            } else {
                                // riga non esistente
                                $oper='insert';
                                $ord=(isset($_REQUEST['ord'])?(int)$_REQUEST['ord']:99);
                                $stt=(isset($_REQUEST['stato'])?$_REQUEST['stato']:'i');
                            }
                        }
                    }
                    fprintf($log, "%s:%s - %s\n", date("Ymd:His"),$_name,"group $oper"
                            .": $grp_id - $comp, $ord, $stt");
                    if($oper='insert') {
                        // scrivo a db il record passato
                        $val="$grp_id,'$comp', $ord, '$stt'";
                        $is_inserted=querydb("insert row $val ","INSERT INTO foowd_gruppi VALUES ($val)");
                        if(!checkdb() || !$is_inserted) {
                            $errors="Errore in inserimento dati ($val) , inserite: $is_inserted ";
                        } else {
                            $rownum+=$is_inserted;
                        }
                    } elseif($oper='update') {
                        // aggiorno a db il record passato
                        $where="comp='$comp' and ord>0";
                        $val="ord=$ord, stato='$stt'";
                        if($ord==0) {
                            // aggiorno il record GRUPPO
                            $where="ord=0";
                            $val="comp='$comp'";
                        }
                        $is_inserted=querydb("update row $grp_id,$where,$val ","UPDATE foowd_gruppi SET $val "
                                            ."WHERE gruppo=$grp_id and $where ");
                        if(!checkdb() || !$is_inserted) {
                            $errors="Errore in aggiornamento dati $grp_id $where ( $val ), aggiornate: $is_inserted ";
                        } else {
                            $rownum+=$is_inserted;
                        }
                    }
                }
            } else {
                $errors="Id gruppo non creato per gruppo nuovo '$gruppo', email $email .";
            }
        } else {
            $errors="Operazione $metodo non consentita.";
        }
    }
    closedb();
}
if ($error_db != '') {
    $errors.=" Errori a DB: $error_db .";
}
$status = ($errors=='' && $error_db==''?"ok":"ko");
fprintf($log, "%s:%s - %s\n", date("Ymd:His"),$_name,"fine elab. $metodo err:$errors $error_db, esito: $status x $rownum record.");
fclose($log);
$sep="";
// esporto la tabella in JSON
?>{ "FoowdService":"v1.0"
, "status":"<?=$status ?>"
, "errors":"<?=$errors ?>"
, "email" :"<?=$mail   ?>"
, "user"  :"<?=$user   ?>"
<? if($metodo=="GET") { ?>
, "grupid":"<?=$ogru["id"] ?>"
, "gruppo":"<?=($ogru["id"]>0?$ogru["nome"]:"") ?>"
, "leader":"<?=($ogru["id"]>0?$ogru["leader"]:"") ?>"
, "comp" :[
<?   foreach($ogru["comp"] as $cmp) { ?><?=$sep ?>
  { "email" :"<?=$cmp["mail"] ?>"
  , "ord"   :"<?=$cmp["ord"] ?>"
  , "status":"<?=$cmp["stat"] ?>"
  }
<?     $sep=","; ?>
<?   } ?>
  ]
<? } ?>
}