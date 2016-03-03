/*
    funzione di invio mail, pagina Partecipa.html
*/

function sendMail(container) {
    var cc = document.getElementById(container);

    var nome = document.getElementById("_nome").value;
    var mail = document.getElementById("_email").value;
    var objc = document.getElementById("_oggetto").value;
    var indr = document.getElementById("_indirizzo").value;
    var mesg = document.getElementById("_messaggio").value;
    
    var oggetto = objc.replace("{nome}",nome).replace("{email}",mail);
    var corpo = mesg+'\n\nIndirizzo: '+indr;

    console.log("mail da: "+nome+"<"+mail+">");
    console.log("oggetto: "+oggetto ) ;
    console.log("testo: "+corpo );

    var maillink = cc.lastChild;
    if (maillink.id!="maillink") {
        maillink = document.createElement('a');
        maillink.setAttribute('id','maillink');
        maillink.setAttribute('target','_newtab');
        maillink.style.display='none';
        cc.appendChild(maillink);
    }
    maillink.setAttribute('href','mailto:info@foowd.it?subject='+oggetto+'&body='+corpo);
    maillink.click();
}