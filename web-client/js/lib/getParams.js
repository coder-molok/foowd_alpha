
//* trasformo i parametri GET in proprieta' di {par}
var par=location.search.substring(1);
var pars=par.split('&');
var par={};
for(p in pars) {
    var pp=pars[p].split('=');
    if (pp[0]) {
        console.log('parametro:'+pp[0]+', valore:'+(pp.length>1?pp[1]:pp[0]));
        par[pp[0]]=decodeURIComponent(pp.length>1?pp[1]:pp[0]);
    }
}

/** funzione che sostituisce tutti i {tag} dell oggetto del DOM passato con il valore del relativo parametro
se il parametro non c'è, a seconda del parametro -nd-, sostituisce con:
se -nd- è un oggetto, cerca nd.<tag>, altrimenti cerca nd.default, altrimenti non sostituisce;
se -nd- è una stringa, sostituisce con una costante o non sostituisce nel caso sia '!same', la costante
        può essere:
        'n.d.' se -nd- vale '!nd'
        ''     se -nd- vale '!blank'
        qualunque altro valore passato a -nd-.

!!! ATTENZIONE !!! per la ricerca dei {tag} percorre il testo html, non il dom, e dopo la sostituzione swappa 
il vecchio DOM con un nuovo DOM, quindi tutti i riferimenti ad oggetti DOM devono essere ricreati!!!
*/
function replacePar(DOMobj, nd) {
  function replaceParValue(match, p1, offset, str) {
    if (p1 && p1 in par) {
      return par[p1];
    } else {
      if (typeof nd === 'string' && nd!='!same') {
        if (nd=='!nd') {
          return "n.d.";
        } else if (nd=='!blank') {
          return "";
        } else {
          return nd;
        }
      } else if (typeof nd === 'object' && p1 in nd) {
        return nd[p1];
      } else if (typeof nd === 'object' && 'default' in nd) {
        return nd.default;
      } else {
        return match;
      }
    }
  }

  var text=DOMobj.innerHTML;
  var newtext=text.replace(/{(\w+)}/g, replaceParValue);
  DOMobj.innerHTML=newtext;
  // cerco i figli INPUT di DOMobj e cambio il value
  var dinp=DOMobj.getElementsByTagName('input');
  for (var i=0; i<dinp.length; i++) {
    console.log("inputs "+i+": "+dinp[i].tagName+", "+dinp[i].type+", "+dinp[i].name+"="+dinp[i].value);
    dinp[i].value = dinp[i].value.replace(/{(\w+)}/g, replaceParValue);
  }
}
