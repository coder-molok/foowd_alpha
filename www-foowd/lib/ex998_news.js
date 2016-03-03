/*

    Funzione di import dinamico della singola news.
    
  Le news sono scritte in files html nella cartella news/
  la URL della pagina deve riportare come hash #nome_notizia
  dove nome_notizia corrisponde al nome del file.
*/

function insertNews() {
    var n = location.hash;
    document.write('<iframe class="content-wrapper" style="border: 0;" src="news/'+(n.substr(1))+'.html" ></iframe>');
    
    // NON FUNZIONA non eredita il css
}
