/** funzionalità per generare o verificare una hash

HASH 40 char - check true

Per aumentare la unicità di ogni hash, l'algoritmo utilizza un seed (max 32 char)
e una fonte di caratteri casuali (a completare i 32, ma anche per sostituire eventuali
caratteri non validi del seed).
Per avere hash rigenerabili a partire dai dati si può:
- fornire un seed di 32 char tutti validi (non vengono aggiunti caratteri a caso)
- fornire un seed minore di 32 char, ma fornire una fonte coerente al posto di quella 
casuale
Per alimentare la fonte di caratteri con una serie coerente usare la funzione
  hashMapString(String)
con un testo lungo a piacere.
(Assicurarsi che sia lungo a sufficienza verificando il numero restituito dalla funzione:
il numero di caratteri validi del seed più questo valore deve essere maggiore di 32,
se la fonte di caratteri si esaurisce, viene automaticamente riempita in modo casuale!)

*/
var hashInvalidChars = /[ "'&<>+%@=?\/\\\x00-\x1F\u0000-\u001F]/g;
var hashInvalidChar  = /[ "'&<>+%@=?\/\\\x00-\x1F\u0000-\u001F]/;
var hashSpring = [];

//* funzione che preleva un carattere dalla fonte e si occupa di alimentarla
function hashSpringDrop() {
  if (hashSpring.length==0) {
    while (hashSpring.length<50) {
      hashMapping(String.fromCharCode(((Math.random()*(127-33))+33)));
    }
  }
  return hashSpring.shift();
}

//* funzione che mappa un carattere nel bacino della fonte, solo se è un carattere valido
function hashMapping(ch) {  
  if (!hashInvalidChar.test(ch)) {
    var pch = ch.charCodeAt(0);
    var ppc = 0;
    if (hashSpring.length > 0) {
      ppc = hashSpring[(pch % hashSpring.length)].charCodeAt(0);
    }
    hashSpring.splice((ppc % (hashSpring.length+1)), 0, ch);
    return true;
  }
  return false;
}

//* funzione che mappa un testo nel bacino dalla fonte
function hashMapString(str) {
  hashSpring.splice(0,hashSpring.length);
  // elaboro il testo un carattere alla volta
  str.split('').forEach(hashMapping);
  return hashSpring.length;
}

//* funzione che verifica se la hash è valida
function hashCheck(hash) {
  var check = hashLock(hash.substring(0,32));
  return (check==hash);
}

//* funzione che aggiunge alla hash-seed il check
function hashLock(hashseed) {
  var check=[0,0,0,0,0,0,0,0]; // sono 8 caratteri
  var checkchar="HlIaJmK0LnMbNoO1PpQcRqS2TrUdVsW3XtYeZu_4.vfw5xgy6zhA7BiC8DjE9FkG";
  for (var i=0; i<checkchar.length/2; i++) {
    check[i%8]+=hashseed.charCodeAt(i);
  }
  for (var i=0; i<check.length; i++) {
    hashseed+=checkchar.charAt(check[i]%checkchar.length);
  }
  return hashseed;
}

/** funzione che controlla se ci sono caratteri non accettati da hash
nella stringa passata e restituisce la stessa corretta con caratteri sostitutivi.
*/
function hashEscape(text) {
  function hashChCh(m, p, s) {
    return hashSpringDrop();
  }
  return text.replace(hashInvalidChars, hashChCh);
}

//* funzione che crea un hash-seed
function hashSeed(seed) {
  var hs = hashEscape(String(seed));
  function hashRot(m,p,s) {
    // scambio carattere in rotazione saltando i char proibiti
    var c=m.charCodeAt(0);
    for (var i=0; i<p+1; i++) {
      c++;
      // evito i non validi
      if (c>126) c=33;
      if (c==34) c=35;
      if (c==37) c=40;
      if (c==43) c=44;
      if (c==47) c=48;
      if (c==60) c=65;
      if (c==92) c=93;
    }
    return String.fromCharCode(c);
  }
  if (hs.length==0) hs='_';
  else hs = hs.replace(/./g,hashRot);
  var sd = hs.charCodeAt(parseInt(hs.length/2));
  var nc = hashSpringDrop();
  hs = hs+nc;
  if (hs.length>31) {
    hs = hs.substr(0, 32);
  } else {
    hs = hashSeed(hs);
  }
  return hs;
}

//* funzione che permette di risalire al seme
function _hashBack(h,s) {
  function hashU(m,p,s) {
    // scambio carattere in rotazione saltando i char proibiti
    var c=m.charCodeAt(0);
    for (var i=0; i<p+1; i++) {
      c--;
      // evito i non validi
      if (c< 33) c=126;//      if (c>126) c=32;
      if (c==34) c= 33;//if (c==34) c=35;
      if (c==39) c= 36;//if (c==37) c=40;
      if (c==43) c= 42;//if (c==43) c=44;
      if (c==47) c= 46;//if (c==47) c=48;
      if (c==64) c= 59;//if (c==60) c=65;
      if (c==92) c= 91;//if (c==92) c=93;
    }
    return String.fromCharCode(c);
  }
  for (var i=0; i<32; i++) {
    h=h.replace(/./g,hashU);
    if (s.test(h)) return h;
  }
}