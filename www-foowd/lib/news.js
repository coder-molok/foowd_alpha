/*

    Funzione di import dinamico della singola news.
    
  Le news sono scritte in files html nella cartella news/
  la URL della pagina deve riportare come hash #nome_notizia
  dove nome_notizia corrisponde al nome del file.
  
  richiede ajax.js
*/

function insertNews() {
    var n = location.hash.substr(1);
    var b = location.href;
    b = b.substring(0, b.lastIndexOf("/"));
    var news="";
    
    request = new Ajax();
//    request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
//    request.setRequestHeader('Accept','text/html');
    request.onsuccess = function (rText) {
        var resp=null;
        var i, selz,prd;
        try {
            news=rText;
        } catch (exc) {
            console.log("insertNews - unexpected error parsing response text");
            return;
        }
    }
    request.onfail = function (err) {
        console.log("insertNews - request fail.");
    }

    request.open('GET', b+"/news/"+n+".html", false);
    request.send();
    
    // console.log("result: "+news);
    document.write(news);
}
