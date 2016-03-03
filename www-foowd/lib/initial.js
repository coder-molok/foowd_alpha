/*
            Funzione di Init comune
*/

function is_touch_device() {
    return (('ontouchstart' in window)
        || (navigator.MaxTouchPoints > 0)
        || (navigator.msMaxTouchPoints > 0));
}

function init() {
    if (is_touch_device()) {
        var erratacorrige = document.body.getElementsByClassName('switch');
        for (_e=0; _e<erratacorrige.length; _e++) {
            e = erratacorrige[_e];
            e.setAttribute('switchon',"apocalisse");
            e.setAttribute('switchoff',"apocalisse");
            e.setAttribute('initialSwitch',"on");
        }
        var errata2 = document.getElementById('menu');
        errata2.style.marginBottom="15%";
    }
    Switch.on();
    
    submenu_servizi = document.getElementById("submenu-servizi");
    cella_servizi = document.getElementById("menu").rows[0].cells[1];
    positer_relative(submenu_servizi, cella_servizi, null, 48);

    submenu_sudinoi = document.getElementById("submenu-sudinoi");
    cella_sudinoi = document.getElementById("menu").rows[0].cells[3];
    positer_relative(submenu_sudinoi, cella_sudinoi, null, 48);
}
