<?php
// Operazioni e definizioni comuni ai servizi del progetto

/* * * *
 * $_SERVER['HTTP_ORIGIN'] in localhost non restituisce un valore corretto, 
 * passo attraverso questo controllo per normalizzare la situazione.
 * === DA RIMUOVERE IN PRODUZIONE ===
 * * * */
if(!isset($_SERVER['HTTP_ORIGIN'])) {
    $_SERVER['HTTP_ORIGIN']='localhost';
}