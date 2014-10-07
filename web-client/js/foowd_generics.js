/** funzionalità generali per il sito foowd-beta
- foowd oggetto con alcuni dati generali di configurazione
- waitingSilk oggetto che crea e controlla un velo con barra di attesa
- hideAlerts () nasconde i paragrafi visibili di "alerts"
- foowd_alerts (messaggio) inserisce un avviso per l'utente.
- foowd_messgs (messaggio) inserisce un messaggio per l'utente.
- euro (importo) restituisce una stringa formattata come prezzo.
*/
var foowd = {
  'dbhost': 'http://www.melaricosa.eu/' //http://localhost:8080/melaricosa.eu/
};

/** oggetto di controllo della maschera di attesa
Non lo aggancio al body perchè il document non è completo,
la funzione waitingSilk.run viene appesa come handler di
document->'load'.
*/
var waitingSilk = document.createElement('div');
  // creo il velo subito
  waitingSilk.className="waiting-silk";
  waitingSilk.appendChild(document.createElement('div')).className="silk";
  waitingSilk.firstChild.appendChild(document.createElement('p')).
      appendChild(document.createTextNode("Attendi un attimo ..."));
  waitingSilk.wbar=document.createElement('pre');
  waitingSilk.wbar.appendChild(document.createTextNode("[                              ]"));
  waitingSilk.firstChild.appendChild(document.createElement('p')).id="wbarHook";
  
  // proprietà
  waitingSilk.running=false;
  waitingSilk.showed=false;
  waitingSilk.hiding=null; // timeout di nascondimento
  waitingSilk.max_counter=30;
  waitingSilk.counter=0;
  waitingSilk.isCounting=false;
  /** proprietà che indica se il velo deve essere attivato appena caricata la pagina.
    valori: false|intero
    un valore intero viene inteso come "vero" e indica quanto deve rimanere il velo,
    un valore pari a 0 indica di lasciarlo al controllo della pagina.
  */
  waitingSilk.neededOnLoad=false;

  //* metodo che attiva il velo, se indicato il tempo registra un timeout per nasconderlo
  waitingSilk.show = function (time) {
    if (!isNaN(time = parseInt(time, 10))) {
      this.hide(time);
    }
    if (this.running) {
      if (this.isCounting) {
        this.wbar.style.display='block';
      } else {
        this.wbar.style.display='none';
      }
      this.style.display='block';
      this.showed=true;
    }
  };

  //* metodo che nasconde il velo, si può indicare il ritardo di esecuzione del comando
  waitingSilk.hide = function (delay) {
    if (this.running) {
      delay=parseInt(delay);
      if (this.hiding!==null) {
        clearTimeout(this.hiding);
        this.hiding=null;
      }
      if (isNaN(delay)) {
        // nascondo
        this.style.display='none';
        this.showed=false;
      } else {
        this.hiding=setTimeout(function (){waitingSilk.hide();}, delay);
      }
    }
  };
  
  //* metodo che completa la creazione mostrando inizialmente il velo
  waitingSilk.run = function () {
    this.style.display='none';
    document.body.appendChild(this);
    document.getElementById("wbarHook").appendChild(waitingSilk.wbar);

    this.running=true;
    if (this.neededOnLoad) {
      if (this.neededOnLoad==0) {
        this.show();
      } else {
        this.show(this.neededOnLoad);
      }
    }
  };
    
// lancio waiting-silk quando il documento è pronto
window.addEventListener("load", function () {waitingSilk.run();});

/** controllo degli avvisi all'utente.
Le seguenti funzionalità gestiscono l'apparizione e scomparsa dell'avviso.
*/

//* variabile che indica (true) se è in corso un processo di sbiadimento degli avvisi
var hidingAlerts=false;

function hideAlerts() {
  if (hidingAlerts) return;
  hideAlertsGo();
}
function hideAlertsGo() {
  hidingAlerts=true;
  var container = document.getElementById("main_alerts");
  var alerts = container.childNodes;
  var hasAlerts=false;
  for (var c=0; c<alerts.length; c++) {
    var p=alerts[c];
    if (!p.style) p.style = new CSSStyleSheet();
    if (p.style.opacity==='') p.style.opacity=window.getComputedStyle(p).getPropertyValue('opacity');
    if (p.style.opacity>0) {
      hasAlerts=true;
      //* l'avviso scompare in 20 passaggi
      p.style.opacity=(p.style.opacity-0.05);
    }
  }
  if (hasAlerts) {
    setTimeout(hideAlertsGo, 200);
  } else {
    hidingAlerts=false;
  }
}

function foowd_alerts(message) {
  var container = document.getElementById("main_alerts");
  var nuovo = document.createElement('p');
  nuovo.classList.add("alert");
  nuovo.addEventListener("mouseenter", function () {
    if (this.style.opacity==0) {
      this.style.opacity=1;
    }
  });
  nuovo.addEventListener("mouseleave", function () {
    if (!hidingAlerts) {
      hidingAlerts=true;
      hideAlerts();
    }
  });
  nuovo.appendChild(document.createTextNode(message));

  // appendo il nuovo messaggio quando finisce l'eventuale dissolvenza in corso
  var tim=1;
  if (hidingAlerts) tim=5500;
  setTimeout(function () {
    container.insertBefore(nuovo,container.firstChild);
    setTimeout(hideAlerts, 20000);
  }, tim);
}
function foowd_messgs(message) {
  var container = document.getElementById("main_alerts");
  var nuovo = document.createElement('p');
  nuovo.classList.add("message");
  nuovo.addEventListener("mouseenter", function () {
    if (this.style.opacity==0) {
      this.style.opacity=1;
    }
  });
  nuovo.addEventListener("mouseleave", function () {
    if (!hidingAlerts) {
      hidingAlerts=true;
      hideAlerts();
    }
  });
  nuovo.appendChild(document.createTextNode(message));

  // appendo il nuovo messaggio quando finisce l'eventuale dissolvenza in corso
  var tim=1;
  if (hidingAlerts) tim=5500;
  setTimeout(function () {
    container.insertBefore(nuovo,container.firstChild);
    setTimeout(hideAlerts, 20000);
  }, tim);
}

/** funzioni minime di comodo di uso comune sulla piattaforma.
*/

//* funzione di ripetizione di funzione su collezione. modifica la collezione se gli elementi sono Object.
function foreach(coll, func) {
  for (var i=0; i<coll.length; i++) {
    func(coll[i]);
  }
}

//* funzione che formatta un numero in un prezzo.
function euro(prezzo) {
  var p=(parseInt(prezzo*100)).toString(10);
  while (p.length<3) p='0'+p;
  return p.replace(/(\d\d)$/,",$1 \u20ac");
}

//* funzione che restituisce il carattere speculare di quello passato.
function myRot(m) {
  var mc=m.charCodeAt(0);
  var caps=(mc<65?48+57:(mc<97?65+90:97+122));
  return String.fromCharCode(caps-mc);
}

/** funzione di abbreviazione di un testo.
 opera la sostituzione ove possibile di stringhe con abbreviazioni
 (per es.: per=>x, ch=>k, cu=>q, acca=>h, sei=>6, ...)
 e quindi la rimozione delle vocali e spazi.
*/
var myAbrvzn=[
 {'search': /(per|ch|cu|acca|ott[aeoi])/
 ,'replac': [
   {'found': /per/g, 'with': 'x'}
  ,{'found': /ch/g, 'with': 'k'}
  ,{'found': /cu/g, 'with': 'q'}
  ,{'found': /acca/g, 'with': 'H'}
  ,{'found': /ott[aeio]/g, 'with': '8'}
  ]
 }
,{'search': /[aeiou\s]/
 ,'replac': [{'found': /[aeiou\s]/g, 'with': ''}] 
 }];
function myAbrChng(what, where) {
  var strn=where;
  if (what.search.test(where)) {
    foreach(what.replac, function (rep) {strn=strn.replace(rep.found,rep.with)});
  }
  return strn;
}
function myAbr(word) {
  var str=word;
  foreach(myAbrvzn, function (chng) {str=myAbrChng(chng, str)});
  return str;
}

/** funzione di controllo per input da tastiera.
 genera una funzione che esegue un task se il carattere premuto corrisponde.
 supporta una lista di caratteri, espressi come codice UNICODE o come
 espressione letterale: [64, 'p', 13]
 oppure un singolo carattere, numerico o letterale.
*/
function keyPressed(keys, func, params, objThis) {
  var attk=keys;
  // singolo valore letterale
  if (typeof attk === 'string') attk=[attk.charCodeAt(0)];
  // singolo valore numerico
  if (typeof attk === 'number') attk=[attk];
  // lista
  if (Array.isArray(attk)) attk=attk.map(function (el) {return (typeof el ==='string'?el.charCodeAt(0):el)});

  return function (ev) {
    var k=ev.keyCode || ev.which;
    if (attk.indexOf(k)>=0) func.apply(objThis, params);
  }
}