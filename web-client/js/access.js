/** funzionalità foowd - controllo dell'accesso al cartonato
deve essere impostata prima di questo script la variabile 'accessHash'.
- controlla validità ed esistenza hash
- controlla attivazione hash
come preparazione al controllo accessi, le parti protette della pagina 
devono essere catalogate come class="accessControl".
Quelli riservati ai leader devono essere anche "accessLeader".

L'esecuzione di questa libreria produce l'oggetto access che avrà le seguenti proprietà:
- lock : true se la pagina è bloccata
altrimenti, se è sbloccata (false)
- active : true se l'utente si è già registrato
- superuser : true se l'utente è un capo-gruppo

responso atteso dal servizio:
{ AccessService: "v1.0"
, access: "granted|denied"
, status="unknown|new|registered"
, type="unknown|buyer|leader"
, email="user_mail_addr"}

Se esiste una funzione access_onend(par) viene richiamata alla risposta del server, prima dello sblocco eventuale.
*/

function accessError() {
  foowd_alerts("Attenzione! Non è stato possibile ottenere l'accesso alla pagina desiderata");
}

access = new Ajax(2);
access.lock=true;
access.onresponse = function () {}; // segnaposto per altre operazioni da effettuare al responso
access.unlock=function () {
  // la funzione unlock ha senso solo se la pagina è completa, 
  // quindi qui controllo ciò e se non pronta, lancio un timeout
  if (debug==3) console.log("access unlok: page "+document.readyState);
  if (document.readyState=='complete') {
    // lancio eventuale elab. esterna
    this.onresponse();

    // nel caso sblocco
    if (!this.lock) {
      // cerco tutti gli elementi di classe accessControl
      // quelli che hanno anche classe accessLeader vengono sbloccati solo se superuser
      // quelli che hanno anche classe accessHide vengono nascosti invece che mostrati quando sbloccati
      var locked=document.getElementsByClassName("accessControl");
      if (debug==3) console.log("UNLOCK "+locked.length+" elements");
      for (var i=0; i<locked.length; i++) {
        if (debug==3) console.log("unlock "+locked[i].tagName+" "+('id' in locked[i]?locked[i].id:"unnamed")+":"+locked[i].className);
        // sblocco se l'utente è leader o comunque se l'elemento non è ristretto ai leader
        if (this.superuser || locked[i].className.indexOf("accessLeader")==-1) {
          if (locked[i].className.indexOf("accessHide")==-1) {
            locked[i].style.display="block";
            if (locked[i].tagName=='TD') locked[i].style.display="table-cell";
            if (locked[i].tagName=='TR') locked[i].style.display="table-row";
          } else {
            locked[i].style.display="none";
          }
        }
      }
      // cerco di ripristinare il layout del contenitore dopo le modifiche
      //document.getElementsByClassName('contenitore_testo' )[0].style.bottom="0px";
    }
  } else {
    var me = this;
    setTimeout(function () {me.unlock();},100);
    if (debug==3) console.log("access unlok scheduled...");
  }
}

//* funzione di verifica del responso: se ok sblocca il contenuto della pagina
access.onsuccess = function (rText) {
  var resp=null;
  try {
    resp=JSON.parse(rText);
  } catch (exc) {
    accessError();
    return;
  }
  if ('AccessService' in resp && resp.AccessService=='v1.0') {
    if (resp.access=="granted") {
      this.lock=false;
      this.active=(resp.status=="registered");
      this.superuser=(resp.type=="leader");
      this.email=resp.email;
    }
    // elaboro il risultato
    this.unlock();
  } else {
    console.log("Access - Response is not a valid AccessService v1.0 result.");
    accessError();
  }

}

// effettuo la chiamata
access.open('POST', foowd.dbhost+'access.php', false);
access.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
access.setRequestHeader('Accept','application/json');
access.send("hash="+accessHash);
