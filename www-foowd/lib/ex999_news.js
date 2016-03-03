/*

    Funzioni di import e completamento dinamico delle news.
    
  occorre ajax.js

  Le news sono scritte in files html nella cartella news/
*/

function insertNews() {
    var list = "";

    request = new Ajax(2);
    request.open('GET', location.href+"/../news/", true);
//    request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
//    request.setRequestHeader('Accept','text/html');
    request.onsuccess = function (rText) {
        var resp=null;
        var i, selz,prd;
        try {
            list=rText;
        } catch (exc) {
            console.log("insertNews - unexpected error parsing response text");
            return;
        }
    }
    request.onfail = function (err) {
        console.log("insertNews - request fail.");
    }

    request.send();
    
    console.log("result: "+list);
    // non funziona se non è abilitato il directory listing
}

function completeNews() {
}
