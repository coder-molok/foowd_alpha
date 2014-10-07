/** Definizione di gruppo per il sito cartone foowd.it
- Gruppo definizione dell'oggetto gruppo
  + opzionale un carrello = carrello complessivo del gruppo

*/

function Gruppo (pordine) {
  "use strict";

  //* campo 'ordine' : il gruppo ha un carrello complessivo (caricato e aggiornato sempre da DB)
  this.ordine = pordine;
  
  this.grupId=-1;
  this.nome="";
  this.leader=null;
  //* campo componenti: viene usato solo se l'utente è leader
  this.componenti=[];
  //* campo comp: riporta i dati dell'ultimo componente inserito
  this.comp;
  
  //* campo opdb: operazione necessaria a db, valorizzata di volta in volta a seconda della modifica
  this.opdb='none';
  //* campo scrivi: se inizializzato è l'oggetto AJAX configurato per salvare a DB
  this.scrivi=null;
  //* funzione datiDaScrivere: prepara la stringa postData dell'oggetto scrivi in base ai dati correnti del gruppo
  this.datiDaScrivere=function (ajaxObj) {
    var key=ajaxObj.keyData;
    // devo salvare il dato inserito con la chiave hash+email+user
    // uso this.opdb che indica cosa fare
    ajaxObj.postData ="hash="+key.hash;
    ajaxObj.postData+="&email="+key.email;
    ajaxObj.postData+="&user="+key.user;
    if (this.opdb=='nome') {
      ajaxObj.postData+="&grp="+this.nome;
    } else if (this.opdb=='comp') {
      // prendo il nuovo componente
      ajaxObj.postData+="&comp="+this.comp.email;
      ajaxObj.postData+="&ord="+this.comp.ord;
      ajaxObj.postData+="&stt="+this.comp.stato;
    }
  }

  //* funzione init: inizializza il gruppo (se opera il leader) o cambia nome
  this.init=function (pnome, pleader) {
    if (pnome!='' && pnome!=this.nome) {
      this.nome=pnome;
    }
    if (!this.leader && pleader!=undefined) {
      this.leader=('email' in pleader?pleader:{email:pleader.toString()});
    }
    this.opdb='nome';
    if (this.scrivi) {
      this.datiDaScrivere(this.scrivi);
      this.scrivi.send(this.scrivi.postData);
    }
  }

  //* funzione add: aggiunge il componente se non già presente nel gruppo.
  this.add=function (pemail) {
    if(this.componenti.some(function (v) { return (v.email==pemail);})) {
      return false;
    }
    this.comp={email:pemail
              , ord:(this.componenti.reduce(function (p, v) {return (p>v.ord?p:v.ord)},2))
              , stato:'i'};
    this.componenti.push(this.comp);
    this.opdb='comp';
    if (this.scrivi) {
      this.datiDaScrivere(this.scrivi);
      this.scrivi.send(this.scrivi.postData);
    }
  };

  //* nei parametri viene passato solo il nome e il leader del gruppo
  this.fromPar = function (par_str) {
    // traduco par_str in stringa leggibile e
    // valorizzo nome e leader (email)
    var ln, id, pn;
    var p=0;
    do {
      pn=parseInt(par_str.charAt(p),  36);
      ln+=pn;
      p++;
    } while (pn==35);
    do {
      if (par_str.charAt(p)=='.') {
        id=-1;
        pn=0;
      } else {
        pn=parseInt(par_str.charAt(p),  36);
        id+=pn;
      }
      p++;
    } while (pn==35);
    this.nome=par_str.substr(p,ln).replace(/[a-zA-Z0-9]/g, myRot);
    this.leader={
      email: par_str.substr(p+ln).replace(/[a-zA-Z0-9]/g, myRot)
    };
  };
  this.toPar = function () {
    var par_str="";
    var nums=[this.nome.length, this.grupId]
    var ln,n;
    for (n=0; n<2; n++) {
      ln=nums[n];
      do {
        if (ln>35) {
          par_str+=(35).toString(36);
          ln-=35;
        } else if (ln==-1) {
          par_str+='.';
          ln=0;
        } else {
          par_str+=ln.toString(36);
          ln=0;
        }
      } while (ln>0);
    }
    par_str+=this.nome.replace(/[a-zA-Z0-9]/g, myRot);
    if (!this.leader) this.leader={email: ""};
    par_str+=this.leader.email.replace(/[a-zA-Z0-9]/g, myRot);

    return par_str;
  };

  // modulo DB - valido solo in presenza di Ajax.js
  // richiede la disponibilità di group.php (funzione get)
  if (typeof Ajax == 'function') {
    this.fromDB = function (keyData, altro) {
      var self=this;
      var request, getx;
      if (typeof altro != 'function') altro = function () {};
      getx ="hash="+encodeURIComponent(keyData.hash);
      getx+="&email="+keyData.email;
      getx+="&user="+keyData.user;
      request = new Ajax(2);
      request.open('GET', foowd.dbhost+'group.php?'+getx, true);
      request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
      request.setRequestHeader('Accept','application/json');
      request.onsuccess = function (rText) {
        var resp=null;
        var ext_res='unknown';
        var i, compon,cmp;
        try {
          resp=JSON.parse(rText);
        } catch (exc) {
          console.log("gruppo - fromDB : unexpected error JSON-parsing response text");
          altro("unexpected");
          return;
        }
        if ('FoowdService' in resp && resp.FoowdService=='v1.0') {
          if (resp.status=="ok") {
            ext_res="ok";
            // trasformo il json 'resp' in gruppo
            for (i=0; i<resp.comp.length; i++) {
              compon = resp.comp[i];
              cmp  = {
                email : compon.email
              , ord   : parseInt(compon.ord)
              , stato : compon.status
              };
              self.componenti.push(cmp);
            }
            self.grupId = resp.grupid;
            self.nome = resp.gruppo;
            self.leader = {email: resp.leader};
          } else if (resp.errors.trim().length>0) {
            ext_res="error:"+resp.errors;
          } else {
            console.log("gruppo - fromDB - unespected result: status="+resp.status+".");
            ext_res="unexpected";
          }
        } else {
          console.log("gruppo - fromDB - Response is not a valid FoowdService v1.0 result.");
          ext_res="unexpected";
        }
        altro(ext_res);
      };
      request.onfail = function (err) {
        altro("ko");
      };
      return request;
    };
    this.toDB = function (keyData, altro) {
      var salva, idx, prd, c, i;
      if (typeof altro != 'function') altro = function () {};
      salva = new Ajax(2);
      salva.open('POST', foowd.dbhost+'group.php', true);
      salva.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
      salva.setRequestHeader('Accept','application/json');
      salva.onsuccess = function (rText) {
        var resp=null;
        var ext_res='unknown';
        try {
          resp=JSON.parse(rText);
        } catch (exc) {
          console.log("gruppo - toDB : unexpected error JSON-parsing response text");
          altro("unexpected");
          return;
        }
        if ('FoowdService' in resp && resp.FoowdService=='v1.0') {
          if (resp.status=="ok") {
            ext_res="ok";
          } else if (resp.errors.trim().length>0) {
            ext_res="error:"+resp.errors;
          } else {
            console.log("gruppo - toDB - unespected result: status="+resp.status+".");
            ext_res="unexpected";
          }
        } else {
          console.log("gruppo - toDB - Response is not a valid FoowdService v1.0 result.");
          ext_res="unexpected";
        }
        altro(ext_res);
      };
      salva.onfail = function (err) {
        altro("ko");
      };
      
      // devo salvare il dato inserito con la chiave hash+email+user
      salva.keyData = keyData;
      salva.postData = this.datiDaScrivere(salva);

      this.scrivi=salva;
      return salva;
    };
  } else {
    this.fromDB = function () { console.log("gruppo.fromDB - ERROR : DB unreachable, Ajax module is absent.");};
    this.toDB   = function () { console.log("gruppo.toDB - ERROR : DB unreachable, Ajax module is absent.");};
  }
}