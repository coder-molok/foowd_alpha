/** Creazione del mini-catalogo
!!! attenzione !!! Presume l'esistenza di Carrello!!!
*/

//* funzione di creazione del mini-catalogo
function impaginaProdotti(prodotti,DOMobjName) {
  var DOMobj = document.getElementById(DOMobjName);
  var carrello = window.carrello;
  if (carrello===undefined) {
    carrello=false;
    console.log("ERRORE BLOCCANTE: carrello non definito.");
    foowd_alerts("ERRORE BLOCCANTE: carrello non definito.");
  }
  for (var p=0; p<prodotti.length; p++) {
    var pro=prodotti[p];
    var rw,desc,lb,lb2,tb,img,im,qtad,disp;
    var add,rmv;
    var hh;
    
    if ('prodotto'   in pro 
    &&  'qualita'    in pro
    &&  'produttore' in pro
    &&  'porzione'   in pro
    &&  'qta_min'    in pro
    ) {
      // creo la hash del prodotto
      if (!("hash" in pro)) {
        hashThis(pro);
      }

      // creo una table 
      tb=document.createElement('table');
      tb.className="catalog";

      rw=tb.insertRow();
      img=rw.insertCell();
      im=document.createElement('img');
      if ('immagine' in pro && pro.immagine!="") {
        im.src="prodotti/"+pro.immagine;
      } else {
      	im.src="img/FOOWD_prod.png";
      }
      im.alt=pro.prodotto+" "+pro.qualita;

      desc=rw.insertCell();
      desc.appendChild(document.createTextNode(pro.prodotto+" "+pro.qualita));
      if (carrello) {
        //add
        add = document.createElement('button');
        add.className='add';
        if ("qta_disp" in pro && pro.qta_disp!=0) {
          qtad='qta-1';
          if (pro.qta_disp==-1) qtad="qta-max";
          if (pro.qta_disp>10) qtad="qta-disp";
          add.classList.add(qtad);
        }
        add.title="Aggiungi 1 pz al carrello";
        // add.prod=pro.hash;
        // add.desc=pro.prodotto+' '+pro.qualita+', '+pro.produttore+', '+pro.porzione;
        (function (pp) {
          var p = pp;
          add.addEventListener("click", function () {
              foowd_messgs("Aggiunto al carrello un "+p.prodotto);
              carrello.add(p);
            });
        }(pro));
        add.appendChild(document.createElement('span'));
        add.firstChild.appendChild(document.createTextNode("+"));
        desc.appendChild(add);
        //remove
        rmv = document.createElement('button');
        rmv.className='remove car-void';
        rmv.title="Rimuovi 1 pz dal carrello";
        (function (pp) {
          var p = pp;
          rmv.addEventListener("click", function () {
              foowd_messgs("Rimosso dal carrello un "+p.prodotto);
              carrello.remove(p);
            });
        }(pro));
        rmv.appendChild(document.createElement('span'));
        rmv.firstChild.appendChild(document.createTextNode("-"));
        desc.appendChild(rmv);
      }

      rw=tb.insertRow();
      desc=rw.insertCell();
      lb=document.createElement('span');
      lb.className="label";
      lb.appendChild(document.createTextNode("produttore: "));
      desc.appendChild(lb);
      desc.appendChild(document.createTextNode(pro.produttore));

      if ('produzione' in pro) {
        rw=tb.insertRow();
        desc=rw.insertCell();
        desc.innerHTML=pro.produzione.replace("\n","<br>");
      }

      rw=tb.insertRow();
      desc=rw.insertCell();
      lb=document.createElement('span');
      lb.className="label";
      lb.appendChild(document.createTextNode("porzionatura: "));
      desc.appendChild(lb);
      desc.appendChild(document.createTextNode(pro.porzione));

      lb=document.createElement('span');
      lb.className="prezzo";
      lb2=document.createElement('span');
      lb2.className="label";
      lb2.appendChild(document.createTextNode("costo: "));
      lb.appendChild(lb2);
      if ('prezzo' in pro) {
        lb.appendChild(document.createTextNode(euro(pro.prezzo)));
      } else {
        lb.appendChild(document.createTextNode("omaggio"));
      }
      desc.appendChild(lb);

      rw=tb.insertRow();
      desc=rw.insertCell();
      lb=document.createElement('span');
      lb.className="label";
      lb.appendChild(document.createTextNode("minimo prenotabile in porzioni: "));
      desc.appendChild(lb);
      desc.appendChild(document.createTextNode(pro.qta_min));

      rw=tb.insertRow();
      desc=rw.insertCell();
      qtad="Disponibile in quantità";
      if ('qta_disp' in pro && pro.qta_disp>-1) {
        qtad = "quantità disponibile (in porzioni): "+pro.qta_disp;
      }
      desc.appendChild(document.createTextNode(qtad));

      rw=tb.insertRow();
      desc=rw.insertCell();
      disp="Disponibile da subito";
      if ('disp_dal' in pro && pro.disp_dal!="") {
        disp = "Data di produzione/raccolta: "+pro.disp_dal;
      }
      desc.appendChild(document.createTextNode(disp));

      img.rowSpan=rw.rowIndex+1;
      img.appendChild(im);
      
      DOMobj.appendChild(tb);
    }
  }
}
