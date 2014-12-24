/** Definizione del carrello per il sito cartone Foowd.it
- Carrello definizione dell'oggetto carrello
*/

//* funzione di creazione hash deterministico prodotti
function hashThis(pro) {
  hashMapString(pro.prodotto+pro.qualita+pro.produttore+pro.porzione+pro.prezzo+pro.prodotto+pro.qualita);
  hh = hashLock(hashSeed(myAbr(pro.produttore)+myAbr(pro.porzione)+myAbr(pro.prodotto)+myAbr(pro.qualita)));
  pro.hash = hh;
}

function Carrello (catalogo) {
  "use strict";
  
  function pEq(p1, p2) {
    return ('hash' in p1 && 'hash' in p2 && p1.hash===p2.hash);
  }

  //* campo 'ordId' : se caricato da DB il carrello ha un codice -ordine-
  this.ordId=-1;
  /* campo 'saved' : quando carico da DB o dopo salvataggio valido il carrello è salvato.
   *                 quando aggiungo o tolgo elementi è da salvare.
   */
  this.saved=true;
  this.selezioni = [];
  this.catalogo = catalogo;
  
  this.init = function () {
    // controllo che il catalogo sia un catalogo
    if (catalogo && typeof catalogo == "object" && catalogo.constructor==Array && catalogo.length>0) {
      
      // ho bisogno delle hash, se il catalogo ancora non le ha le creo
      catalogo.forEach(function (elm, idx, arr) {
        if ('prodotto' in elm && !("hash" in elm)) {
          hashThis(elm);
        } 
      });
    
    } else {
      console.log("carrello: catalogo non valido");
      throw new Error("carrello: catalogo non valido");
    }
  };
  
  this.totale = function () {
    var p=0;
    for (var i=0; i<this.selezioni.length; i++) {
      p+=(this.selezioni[i].prezzo * 100 * this.selezioni[i].qta);
    }
    return parseInt(p)/100;
  };
  this.pezzi = function () {
    return this.selezioni.
            map(function (el) { return el.qta; }).
            reduce(function (pv, cv) { return pv+cv;},0);
  };
  this.prodotti = function () {
    return this.selezioni.
            map(function (el) { return el.qta>0?1:0; }).
            reduce(function (pv, cv) { return pv+cv;},0);
  };
  this.completa = function (selidx) {
    var sel = this.selezioni[selidx];
    if (!('prodotto' in sel)) {
      var pos;
      var found=false;
      for (pos=0; pos<catalogo.length; pos++) {
        if (pEq(catalogo[pos],sel)) {
          found=true;
          break;
        }
      }
      if (found) {
        for (var prop in catalogo[pos]) {
          if (catalogo[pos].hasOwnProperty(prop) && !sel.hasOwnProperty(prop)) {
            sel[prop]=catalogo[pos][prop];
          }
          // caso particolare per il prezzo che potrebbe risultare approssimato al caricamento da DB
          if (prop=='prezzo' && Math.abs(sel[prop]-catalogo[pos][prop])<0.001) {
            sel[prop]=catalogo[pos][prop];
          }
        }
      }
    }
    return sel;
  }

  this.add = function (prod, qta) {
    if (qta===undefined) qta=1;
    for (var i=0; i<this.selezioni.length; i++) {
      if (pEq(this.selezioni[i],prod)) {
        // ho già il prodotto selezionato
        if (prod.qta_disp==-1 || prod.qta_disp >= this.selezioni[i].qta+qta) {
          this.selezioni[i].qta+=qta;
          this.saved=false;
        } else {
          foowd_alerts("Disponibilità esaurita o non sufficiente per la richiesta.");
        }
        qta=0;
        break;
      }
    }
    if (qta>0) {
      // nuova selezione
      if (prod.qta_disp==-1 || prod.qta_disp >= qta) {
        var sel=Object.create(prod);
        sel.qta = qta;
        this.selezioni.push(sel);
        this.saved=false;
      } else {
        foowd_alerts("Disponibilità esaurita o non sufficiente per la richiesta.");
      }
    }
  };
  this.remove = function (prod, qta) {
    if (qta===undefined) qta=1;
    for (var i=0; i<this.selezioni.length; i++) {
      if (pEq(this.selezioni[i],prod)) {
        // ho il prodotto selezionato
        if (this.selezioni[i].qta>=qta) {
          this.selezioni[i].qta-=qta;
          this.saved=false;
        } else {
          foowd_alerts("Prodotto già rimosso dal carrello o presente in quantità non sufficiente per la richiesta.");
        }
        qta=0;
        break;
      }
    }
    if (qta>0) {
      // nuova selezione
      foowd_alerts("Prodotto non presente nel carrello.");
    }
  };

  this.fromPar = function (par_str) {
    this.selezioni.splice(0,this.selezioni.length);
    // traduco par_str in stringa leggibile e
    // carico i prodotti trovati in str
    var p=0;
    var lq,lp;
    var prd;
    while (p<par_str.length) {
      lq = parseInt(par_str.charAt(p),  16);
      lp = parseInt(par_str.charAt(p+1),16);
      prd= {
        hash  : par_str.substr(p+2,40)
      , prezzo: parseInt(par_str.substr(p+42,lp), 36)/1000
      , qta   : parseInt(par_str.substr(p+42+lp,lq), 36)
      };
      this.selezioni.push(prd);
      p+=42+lp+lq;
    }
  };
  this.toPar = function () {
    var par_str="";
    var sh, sp, sq;
    for (var i=0; i<this.selezioni.length; i++) {
      if (this.selezioni[i].qta==0) continue;
      sh=this.selezioni[i].hash;
      sp=parseInt(this.selezioni[i].prezzo*1000,10).toString(36);
      sq=parseInt(this.selezioni[i].qta,10).toString(36);
      par_str+=(sq.length).toString(16)+(sp.length).toString(16)+sh+sp+sq;
    }
    return par_str;
  };

  // modulo DB - valido solo in presenza di Ajax.js
  // richiede la disponibilità di order.php (funzione get)
  if (typeof Ajax == 'function') {
    this.fromDB = function (keyData, altro) {
      var self=this;
      var request, getx;
      if (typeof altro != 'function') altro = function () {};
      getx ="hash="+encodeURIComponent(keyData.hash);
      getx+="&email="+keyData.email;
      getx+="&user="+keyData.user;
      request = new Ajax(2);
      request.open('GET', foowd.dbhost+'order.php?'+getx, true);
      request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
      request.setRequestHeader('Accept','application/json');
      request.onsuccess = function (rText) {
        var resp=null;
        var ext_res='unknown';
        var i, selz,prd;
        try {
          resp=JSON.parse(rText);
        } catch (exc) {
          console.log("carrello - fromDB : unexpected error JSON-parsing response text");
          altro("unexpected");
          return;
        }
        if ('FoowdService' in resp && resp.FoowdService=='v1.0') {
          if (resp.status=="ok") {
            ext_res="ok";
            // trasformo il json 'resp' in carrello
            self.selezioni=[]; // ripulisco la selezione
            for (i=0; i<resp.selez.length; i++) {
              selz = resp.selez[i];
              prd  = {
                hash  : selz.phash
              , qta   : parseInt(selz.qta)
              , prezzo: (parseFloat(selz.costo)/parseInt(selz.qta))
              };
              self.selezioni.push(prd);
            }
            self.ordId = resp.ordine;
            self.saved=true;
          } else if (resp.errors.trim().length>0) {
            ext_res="error:"+resp.errors;
          } else {
            console.log("carrello - fromDB - unespected result: status="+resp.status+".");
            ext_res="unexpected";
          }
        } else {
          console.log("carrello - fromDB - Response is not a valid FoowdService v1.0 result.");
          ext_res="unexpected";
        }
        altro(ext_res);
      }
      request.onfail = function (err) {
        altro("ko");
      }
      return request;
    };
    this.toDB = function (keyData, altro) {
      var salva, idx, prd, c, i;
      var self=this;
      if (typeof altro != 'function') altro = function () {};
      salva = new Ajax(2);
      salva.open('POST', foowd.dbhost+'order.php', true);
      salva.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
      salva.setRequestHeader('Accept','application/json');
      salva.onsuccess = function (rText) {
        var resp=null;
        var ext_res='unknown';
        try {
          resp=JSON.parse(rText);
        } catch (exc) {
          console.log("carrello - toDB : unexpected error JSON-parsing response text");
          altro("unexpected");
          return;
        }
        if ('FoowdService' in resp && resp.FoowdService=='v1.0') {
          if (resp.status=="ok") {
            ext_res="ok";
            self.saved=true;
          } else if (resp.errors.trim().length>0) {
            ext_res="error:"+resp.errors;
          } else {
            console.log("carrello - toDB - unespected result: status="+resp.status+".");
            ext_res="unexpected";
          }
        } else {
          console.log("carrello - toDB - Response is not a valid FoowdService v1.0 result.");
          ext_res="unexpected";
        }
        altro(ext_res);
      }
      salva.onfail = function (err) {
        altro("ko");
      }
      // devo salvare tutti i dati carrello con la chiave hash+email+user+ordine
      salva.postData ="hash="+keyData.hash;
      salva.postData+="&email="+keyData.email;
      salva.postData+="&user="+keyData.user;
      salva.postData+="&ordine="+this.ordId;
      for (c=0, i=0; i<this.selezioni.length;i++) {
        if (this.selezioni[i].qta>0) {
          prd=carrello.completa(i);
          idx=('000'+(c).toString(10)).substr(-3);
          salva.postData+="&phash"+idx+"="+prd.hash;
          salva.postData+="&pnome"+idx+"="+[prd.prodotto,prd.qualita,prd.produttore,prd.porzione].join(" ");
          salva.postData+="&qta"+idx+"="+prd.qta;
          salva.postData+="&prezzo"+idx+"="+prd.prezzo;
          salva.postData+="&costo"+idx+"="+(prd.prezzo*prd.qta);
          c++;
        }
      }

      return salva;
    };
  } else {
    this.fromDB = function () { console.log("carrello.fromDB - ERROR : DB unreachable, Ajax module is absent.");};
    this.toDB   = function () { console.log("carrello.toDB - ERROR : DB unreachable, Ajax module is absent.");};
  }
  
}

// il carrello "singolo" può diventare un carrello di gruppo con questa trasformazione
function Ordine(catalogo) {
  "use strict";

  var ret=new Carrello(catalogo);
  
  ret.ordName=""; //* nome del responsabile dell'ordine (il leader)

  ret.spedizione= {costo: 10.00};

  // modulo DB - valido solo in presenza di Ajax.js
  // richiede la disponibilità di order.php (funzione get)
  if (typeof Ajax == 'function') {
    ret.fromDB = function (keyData, altro) {
      var self=this;
      var request, getx;
      if (typeof altro != 'function') altro = function () {};
      getx ="hash="+encodeURIComponent(keyData.hash);
      getx+="&email="+keyData.email;
      getx+="&user="+keyData.user;
      getx+="&isgr=true";
      request = new Ajax(2);
      request.open('GET', foowd.dbhost+'order.php?'+getx, true);
      request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
      request.setRequestHeader('Accept','application/json');
      request.onsuccess = function (rText) {
        var resp=null;
        var ext_res='unknown';
        var i, selz,prd;
        try {
          resp=JSON.parse(rText);
        } catch (exc) {
          console.log("carrello - fromDB : unexpected error JSON-parsing response text");
          altro("unexpected");
          return;
        }
        if ('FoowdService' in resp && resp.FoowdService=='v1.0') {
          if (resp.status=="ok") {
            ext_res="ok";
            // trasformo il json 'resp' in carrello
            self.selezioni=[]; // ripulisco la selezione
            for (i=0; i<resp.selez.length; i++) {
              selz = resp.selez[i];
              prd  = {
                hash  : selz.phash
              , qta   : parseInt(selz.qta)
              , prezzo: (parseFloat(selz.costo)/parseInt(selz.qta))
              };
              self.selezioni.push(prd);
            }
            self.ordName = resp.nomeOrdine;
            if (spedizione in resp) {
              self.spedizione.costo= resp.spedizione.costo;
            }
            self.saved=true;
          } else if (resp.errors.trim().length>0) {
            ext_res="error:"+resp.errors;
          } else {
            console.log("carrello - fromDB - unespected result: status="+resp.status+".");
            ext_res="unexpected";
          }
        } else {
          console.log("carrello - fromDB - Response is not a valid FoowdService v1.0 result.");
          ext_res="unexpected";
        }
        altro(ext_res);
      }
      request.onfail = function (err) {
        altro("ko");
      }
      return request;
    };
    this.toDB   = function () { console.log("oridne.toDB - ERROR : feature is not expected.");};

  } else {
    this.fromDB = function () { console.log("carrello.fromDB - ERROR : DB unreachable, Ajax module is absent.");};
    this.toDB   = function () { console.log("carrello.toDB - ERROR : DB unreachable, Ajax module is absent.");};
  }
  return ret;
}