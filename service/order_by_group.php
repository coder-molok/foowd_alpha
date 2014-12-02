<?php
include "sample_db.php";
opendb(); //Apro connessione DB
echo('<html>
  <head>
    <meta charset="UTF-8">
    <meta name="ROBOTS" content="NOINDEX, NOFOLLOW">
  

	<title>f oo w d  - in progress - Ordini per utenti dei gruppi</title>

  </head>
  <body>
  <h1>Ordini per gruppo</h1><br><br>');
  
$gruppo = "";
$ordine = "";
//Effettuo la select e scorro il risultato
selectdb('query ultimo ordine di ogni utente dei gruppi',"SELECT foowd_gruppi.gruppo, foowd_gruppi.comp, foowd_gruppi.ord, foowd_ordini.ordine, foowd_ordini.utente, foowd_ordini.desc_prod, foowd_ordini.qta, foowd_ordini.costo, MAX(foowd_ordini.selezione) FROM foowd_gruppi INNER JOIN foowd_ordini ON foowd_gruppi.comp = foowd_ordini.utente WHERE foowd_gruppi.stato='a' GROUP BY foowd_gruppi.comp ORDER BY foowd_gruppi.ord, foowd_ordini.selezione");
if(checkdb() && $result_db) {
    while ($row = nextrowdb()) {
      if($gruppo == "" || $gruppo != $row['gruppo']){ //Per controllare se sono al primo giro o se cambia il gruppo
        if($gruppo != ""){
          echo('</table></div>');
        }
        $gruppo = $row['gruppo'];
        echo('<h1><b>Gruppo ' . $row['gruppo'] . '</b></h1>
        <div id="prodotti" class="accessControl" style="display: block;">');
      }
      if($ordine == "" || $ordine != $row['ordine']){ //Per controllare se sono al primo giro o se cambia l'ordine
        if($ordine != ""){
          echo('</table>');
        }
        $ordine = $row['ordine'];
        echo('<h2><u>Ordine ' . $row['ordine'] . '</u></h2>
        <table border="1px">
  		    <tr>   
            <td><b>Utente</b></td>
            <td><b>Prodotto</b></td>
            <td><b>Qta</b></td>            
            <td><b>Prezzo</b></td>
          </tr>'); 
      } 
      echo('		  <tr>   
        <td>' . $row['utente'] . '</td>
        <td>' . $row['desc_prod'] . '</td>            
        <td>' . $row['qta'] . '</td>
        <td>' . $row['costo'] . '</td>
      </tr>');

    }
}  
//Utilizzo la submit del form per chiamare il file che mi genera il CSV
  echo('</table></div><br><br><br>
  <form action="export_order_by_group.php">
    <input type="submit" name="Esporta" value="Esporta CSV">
  </form>
  </body>
</html>');

closedb(); //Chiudo la connessione DB

?>
