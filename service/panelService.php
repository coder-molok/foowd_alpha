<?php
/*
 * -- Struttura --
 *  - Connessione ad database
 *  - In attessa di una query
 *   - La query restituisce l'elenco dei prodotti legati ad un gruppo da'acquisto relativi ad un ordine
 */
include 'sample_common.php';
header('Content-type: application/json; charset=utf-8');
header("Access-Control-Allow-Origin: ".$_SERVER['HTTP_ORIGIN']);
/*
 * Query -> gruppo, ordine -> prodotti
 */
if(isset($_POST['q'])) echo "{'q' : ".$_POST['q']."}";
?>
