<?php
include "sample_db.php";
opendb();  //Apro connessione DB

$file = 'ordini.csv'; //Nome del file
$handle = fopen($file,"w+t"); //Apro il file in scrittura e mi posiziono all'INIZIO
fwrite($handle, "Utente;Prodotto;Quantita';Costo\n"); //Scrivo l'intestazione delle colonne
fclose($handle); //Chiudo  

//Lancio select e ciclo sulle righe di risultato
selectdb('query ultimo ordine di ogni utente dei gruppi',"SELECT foowd_gruppi.gruppo, foowd_gruppi.comp, foowd_gruppi.ord, foowd_ordini.ordine, foowd_ordini.utente, foowd_ordini.desc_prod, foowd_ordini.qta, foowd_ordini.costo, MAX(foowd_ordini.selezione) FROM foowd_gruppi INNER JOIN foowd_ordini ON foowd_gruppi.comp = foowd_ordini.utente WHERE foowd_gruppi.stato='a' GROUP BY foowd_gruppi.comp ORDER BY foowd_gruppi.ord, foowd_ordini.selezione");
if(checkdb() && $result_db) {
    while ($row = nextrowdb()) {
      $handle = fopen($file,"a+t"); //Apro il file in scrittura e mi posiziono alla FINE
      fwrite($handle, $row['utente'].';'. $row['desc_prod'].';'. $row['qta'].';'. $row['costo'] . "\n");
      fclose($handle); //Chiudo il file
    }
}
//Redirect per far aprire il file dal browser
header('Location: '.$file);

closedb(); //Chiudo la connessione DB

?>
