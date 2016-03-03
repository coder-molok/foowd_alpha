//* switch.js - simple applier for manage an on/off behavior

Switch = {
  'on': function () {
    "use strict";
    //debug// console.log("document.status:"+(document?document.readyState:"no-document"));
    //debug// console.log("document.body:"+(document?document.body:"no-document"));
    var _s, s, myContr, _c, c, p;
    var switches = document.body.getElementsByClassName('switch');
    var controlled = document.body.getElementsByClassName('switchable');
    function switchControlled(_controlled) {
        "use strict";
        var _c, c, p;
        var disp_value="none";
        var disp_time=0;
        for (_c=0; _c<_controlled.length; _c++) {
          c = _controlled[_c];
          /* manca la gestione del tipo proprieta` gestita */
          p = window.getComputedStyle(c).display;
          if (c.switchTo==undefined) {
            //* la prima volta che viene switchato, salvo le proprieta` dello switch
            c.switchTo=p;
          }
          if (this.switchStatus) {
            disp_value = c.switchTo;
          }
          if ('switchAfterMillis' in c ) {
            disp_time = (this.switchStatus?c.switchAfterMillis.on:c.switchAfterMillis.off);
          }
          console.log("switchControlled "+this.getAttribute('switched')+" for "+c.getAttribute("id")+" time "+disp_time+" ("+c.getAttribute('switchAfter')+")")
          if (disp_time==0) {
            c.style.display=disp_value;
          } else {
            setTimeout(function () {
                c.style.display=disp_value;
              },       disp_time);
          }
        }
    }
    for (_s=0; _s<switches.length; _s++) {
      s = switches[_s];
      myContr = [];
      s.switchStatus=false;
      s.switchOnOff=true;
      if (s.tagName=='INPUT' && s.getAttribute('type')=='checkbox') {
        s.switchStatus=s.hasAttribute('checked');
      } else {
        // gli altri casi vanno gestiti a mano,
        // aggiungendo un nome event-listener che richiami this.switch() in switchon
        // es: switchon="click"
        s.switchStatus=false;
        if (!s.getAttribute('switchon')) {
            s.setAttribute('switchon',"click");
        }
      }
      // eventuale caso di controllo on/off con due eventi
      if (s.getAttribute('switchoff')) {
        s.switchOnOff=false;
      }
      // collego i controllati
      for (_c=0; _c<controlled.length; _c++) {
        c = controlled[_c];
        if (c.getAttribute('switch')==s.getAttribute('switched')) {
          myContr.push(c);
          if (s.getAttribute('initialSwitch')=="off" && s.switchStatus==false) {
            /* manca la gestione del tipo proprieta` gestita */
            p = window.getComputedStyle(c).display;
            if (c.switchTo==undefined) {
              //* la prima volta che viene switchato, salvo le proprieta` dello switch
              c.switchTo=p;
            }
            c.style.display='none';
          }
          // eventuale controllo di temporizzazione
          if (c.getAttribute('switchAfter')) {
            c.switchAfterMillis={on:0,off:0};
            // può contenere due valori per on off
            c.switchAfterMillis.on=parseInt(c.getAttribute('switchAfter'));
            if (c.getAttribute('switchAfter').indexOf(" ")>-1) {
              c.switchAfterMillis.off=parseInt(c.getAttribute('switchAfter').
                          substr(c.getAttribute('switchAfter').indexOf(" ")));
            } else {
              c.switchAfterMillis.off=c.switchAfterMillis.on;
            }
          }
        }
      }
      s.switchControlled = switchControlled;
      s.switch = function (controllate) {
        return function () {
            "use strict";
            //* se checkbox mantengo coerente lo stato
            if (this.tagName=='INPUT' && this.getAttribute('type')=='checkbox') {
              this.switchStatus=this.checked;
            } else {
              if (this.switchOnOff) {
                this.switchStatus=!this.switchStatus;
              } else {
                this.switchStatus=true;
              }
            }
            //debug// 
            console.log("switchOn "+this.getAttribute("switched")+" "+s.switchStatus);
            this.switchControlled(controllate);
        }
      }(myContr);
      s.switchOff = function (controllate) {
        return function () {
            "use strict";
            this.switchStatus=false;
            //debug//
            console.log("switchOff "+this.getAttribute("switched")+" ");
            this.switchControlled(controllate);
        }
      }(myContr);
      
      s.addEventListener(s.getAttribute('switchon'), s.switch);
      if (!s.switchOnOff) {
        s.addEventListener(s.getAttribute('switchoff'), s.switchOff);
      }
    }
  }
}
