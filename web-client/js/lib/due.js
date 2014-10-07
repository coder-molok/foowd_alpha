/** funzionalità di controllo di validità di dati di un form


*/

function elabDue(dueRule, value, context) {
  if (!dueRule || dueRule=='') return true;
  var esito=false;
  var rule=/^(?:\?(\w+):)?(!)?([xan])$/i;
  var types={'x':/^[\w \t,.''àèéìòù]*$/i, 'a':/^[a-z]*$/i, 'n':/^[0-9]*$/};
  var rules=dueRule.split(',');
  for (var r=0; r<rules.length && !esito; r++) {
    var relm;
    if ((relm=rule.exec(rules[r]))!==null) {
      if (relm[1]) {
        //* condizione
        if (relm[1] in context) {
          // se la condizione è verificata, proseguo con la valutazione
          if (!context[relm[1]].checked) {
            // se la condiizone non è verificata il campo è valido
            esito=true;
            continue;
          }
        } else {
          console.log("elabDue : condizione in regola ["+rules[r]+"] non esiste!");
        }
      }
      //* valutazione
      if (relm[2]=='!' && (!value || value=='')) {
        continue;
      }
      if (types[relm[3]].test(value)) {
        esito=true;
      }
    } else {
      console.log("elabDue : regola ["+rules[r]+"] non valida!");
    }
  }
  return esito;
}

function checkDue(form) {
  var dati=form.elements;
  var ret=true;
  for (var i=0; i<dati.length; i++) {
    if ("is_due" in dati[i] || (dati[i].hasAttribute('is_due') && (dati[i].is_due=dati[i].getAttribute('is_due')))) {
      var isdue = dati[i].is_due;
      //* elaboro la verifica
      var is_ok = elabDue(isdue, dati[i].value, dati);
      if (!is_ok) {
        dati[i].classList.add('dueError');
        ret=false;
      } else {
        dati[i].classList.remove('dueError');
      }
    }
  }
  return ret;
}