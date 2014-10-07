//* switch.js - simple applier for manage an on/off behavior

Switch = {
  'on': function () {
    //console.log("document.status:"+(document?document.readyState:"no-document"));
    //console.log("document.body:"+(document?document.body:"no-document"));
    var switches = document.body.getElementsByClassName('switch');
    var controlled = document.body.getElementsByClassName('switchable');
    for (var _s=0; _s<switches.length; _s++) {
      var s = switches[_s];
      var myContr = [];
      s.switchStatus=false;
      if (s.tagName=='INPUT' && s.getAttribute('type')=='checkbox') {
        s.switchStatus=s.hasAttribute('checked');
      }
      for (var _c=0; _c<controlled.length; _c++) {
        var c = controlled[_c];
        if (c.getAttribute('switch')==s.getAttribute('switched')) {
          myContr.push(c);
          if (s.getAttribute('initialSwitch')=="off" && s.switchStatus==false) {
            /* manca la gestione del tipo proprieta` gestita */
            var p = window.getComputedStyle(c).display;
            if (c.switchOn==undefined) {
              //* la prima volta che viene switchato, salvo le proprieta` dello switch
              c.switchOn=p;
            }
            c.style.display='none';
          }
        }
      }
      s.switch = function () {
        //* se checkbox mantengo coerente lo stato
        if (s.tagName=='INPUT' && s.getAttribute('type')=='checkbox') {
          s.switchStatus=s.checked;
        } else {
          s.switchStatus=!s.switchStatus;
        }
        console.log(s.switchStatus);
        for (var _c=0; _c<myContr.length; _c++) {
          var c = myContr[_c];
          /* manca la gestione del tipo proprieta` gestita */
          var p = window.getComputedStyle(c).display;
          if (c.switchOn==undefined) {
            //* la prima volta che viene switchato, salvo le proprieta` dello switch
            c.switchOn=p;
          }
          if (s.switchStatus==false) {
            c.style.display='none';
          } else {
            c.style.display=c.switchOn;
          }
        }
      }
      s.addEventListener('click', s.switch);
    }
  }
}

// window.addEventListener("load", Switch.on);