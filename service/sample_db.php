<?php // gestione DB
include_once("./sample_db.cfg");

$logdb = fopen("sample_db.log", "a");
fprintf($logdb, "%s:%s\n", date("Ymd:His"),"Inizio chiamata ====================================");

//global $sample_db,$result_db,$result_name,$error_db;
$sample_db="db";
$result_db=null;
$result_name=null;
$error_db='';

// in base alla variabile esterna $dbcfg agisco su mysql o sqlite
if (!isset($dbcfg)) {
    die("l'applicazione non è configurata per un db tra mysql e sqlite.");
} else {
    /*
    DEFINISCO:
    $sample_db ==> istanza di db
    $result_db ==> istanza di risultato (dopo selectdb())
    $error_db  ==> errori a db, se presenti
    opendb()   ==> inizializza la sessione
    closedb()  ==> chiude la sessione
    checkdb()  ==> controlla se la situazione del DB è ok.
    checkConn()==> controlla se la connessione è ok.
    cleardb()  ==> pulisce eventuali errori di esecuzione.
    querydb()  ==> esegue una query senza risultato
        + nome query (un identificativo della query)
        + sql        (il codice vero della query)
        = restituisce il numero di record modificati
    selectdb() ==> esegue una query con risultato
        + nome query (un identificativo della query)
        + sql        (il codice vero della query)
        * il risultato viene gestito anche internamente con nextrowdb()
    nextrowdb()==> legge la successiva riga del risultato come 
        - array associativo (restituito dalla funzione)
    */
    fprintf($logdb, "%s:%s\n", date("Ymd:His"),"definizione $dbcfg :::");

    function checkdb() {
        global $logdb, $error_db;

        fprintf($logdb, "%s:%s\n", date("Ymd:His"),"checkdb ".(checkConn()?"true":"false")." and ".($error_db==''?True:false).".");
        return checkConn() && $error_db=='';
    }
    function cleardb() {
        global $logdb, $error_db;

        if ( checkConn() && $error_db!='')
            if (strlen($error_db)<12 || substr($error_db, 0, 11)!='connessione')
                $error_db='';
        fprintf($logdb, "%s:%s\n", date("Ymd:His"),"cleardb ".(checkConn()?"true":"false")." ::: $error_db");
    }
    
    if ($dbcfg=="mysql") {
        function  checkConn() {
            global $sample_db;

            return ($sample_db instanceof mysqli) && $sample_db->ping();
        }
        function opendb() {
            global $logdb, $sample_db, $error_db, $dbhost, $dbuser, $dbpasw, $dbname;
            
            $error_db='';
            // "sql.melaricosa.eu", "melarico89602", "mela46532","melarico89602"
            $sample_db = @mysqli_connect($dbhost, $dbuser, $dbpasw, $dbname);
            if (mysqli_connect_errno($sample_db)) $error_db='connessione a $dbhost $dbname ($dbuser $dbpasw) '.mysqli_connect_error();
        }
        function closedb() {
            global $logdb, $sample_db, $error_db;
            
            if (isset($sample_db)) mysqli_close($sample_db);
        }
        function querydb($nome, $query) {
            global $logdb, $sample_db, $error_db;
            $numrows=0;

            if(checkdb()) {
                @mysqli_query($sample_db, $query);
                if (mysqli_errno($sample_db)) $error_db="Errore in querydb-$nome :".mysqli_error($sample_db).":$query:";
                else $numrows=mysqli_affected_rows($sample_db);
            }
            return $numrows;
        }
        function selectdb($nome, $query) {
            global $logdb, $sample_db, $error_db, $result_db, $result_name;

            if(isset($result_db)) mysqli_free_result($result_db);
            $result_db=null;
            $result_name = null;
            if(checkdb()) {
                $result_name = $nome;
                $result_db = @mysqli_query($sample_db, $query);
                if (mysqli_errno($sample_db)) {
                    $error_db="Errore in selectdb-$nome :".mysqli_error($sample_db).":$query:";
                    $result_db=null;
                    $result_name = null;
                }
            }
        }
        function nextrowdb() {
            global $logdb, $sample_db, $error_db, $result_db, $result_name;

            $row = null;
            if(isset($result_db)) {
                $row = mysqli_fetch_assoc($result_db);
                if (mysqli_errno($sample_db)) {
                    $error_db="Errore in nextrowdb-$result_name :".mysqli_error($sample_db).".";
                    $row = null;
                }
            }
            return $row;
        }
        function sqlescapedb($text) {
            global $sample_db;
            return $sample_db->real_escape_string($text);
        }

    } else if ($dbcfg=="sqlite") {
        function  checkConn() {
            global $sample_db;

            return ($sample_db instanceof SQLite3);
        }
        function opendb() {
            global $logdb, $sample_db, $error_db, $dbhost, $dbname;
            
            $error_db='';
            $sample_db=null;
            try {
                $sample_db = new SQLite3($dbhost.$dbname);
                //var_dump("SQLite3 object", $sample_db);
            } catch (Exception $ex) {
                $error_db='connessione '.$ex->getMessage();
                //var_dump("errore in connessione", $ex);
            }
            fprintf($logdb, "%s:%s\n", date("Ymd:His"),"opendb $dbhost $dbname ".get_class($sample_db)." ::: $error_db");
        }
        function closedb() {
            global $logdb, $sample_db, $error_db;
            
            if (checkConn()) try {
                $sample_db->close();
            } catch (Exception $ex) {
                // nothing to do
            }
            fprintf($logdb, "%s:%s\n", date("Ymd:His"),"closedb ::: $error_db");
        }
        function querydb($nome, $query) {
            global $logdb, $sample_db, $error_db;

            if(checkdb()) {
                if (!$sample_db->exec($query))
                    $error_db="Errore in querydb-$nome :".$sample_db->lastErrorMsg().":$query:";
            }
            fprintf($logdb, "%s:%s\n", date("Ymd:His"),"querydb $nome = $query /={$sample_db->changes()} ::: $error_db");
            return $sample_db->changes();
        }
        function selectdb($nome, $query) {
            global $logdb, $sample_db, $error_db, $result_db, $result_name;

            $result_db=null;
            $result_name = null;
            if(checkdb()) {
                $result_name = $nome;
                try {
                    $result_db = $sample_db->query($query);
                } catch (Exception $ex) {
                    $error_db="Errore in selectdb-$nome :".$sample_db->lastErrorMsg().":$query:";
                    $result_db=null;
                    $result_name = null;
                }
            }
            fprintf($logdb, "%s:%s\n", date("Ymd:His"),"selectdb $nome = $query = ".($result_db?$result_db->numColumns():"no-result")." / $result_name ::: $error_db");
        }
        function nextrowdb() {
            global $logdb, $sample_db, $error_db, $result_db, $result_name;

            $row = null;
            if(isset($result_db)) try {
                $row = $result_db->fetchArray(SQLITE3_ASSOC);
            } catch (Exception $ex) {
                $error_db="Errore in nextrowdb-$result_name :".$ex->getMessage().".";
                $row = null;
            }
            fprintf($logdb, "%s:%s\n", date("Ymd:His"),"nextrowdb $result_name = ".($result_db?$result_db->numColumns():"no-result")." = $row ::: $error_db");
            return $row;
        }
        function sqlescapedb($text) {
            return SQLite3::escapeString($text);
        }
        
    } else {
        die("l'applicazione è configurata per usare il db '$dbcfg' che non è implementato.");
    }
}