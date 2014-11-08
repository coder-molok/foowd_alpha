<?php
/*
 * -- Struttura --
 *  - Connessione ad database
 *  - In attessa di una query
 *   - La query restituisce l'elenco dei prodotti legati ad un gruppo da'acquisto relativi ad un ordine
 */

include_once('sample_db.php');
/*
 * Query -> gruppo, ordine -> prodotti
 */
if(isset($_POST['q'])) echo $_POST['q'];
?>