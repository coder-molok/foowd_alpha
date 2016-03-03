/*
      Posizionamento particolare per browser evoluti
*/

function positer(obj) {
    var curleft = curtop = 0;
    if (obj.offsetParent) {
        do {
            curleft += obj.offsetLeft;
            curtop += obj.offsetTop;
        } while (obj = obj.offsetParent);
    } else {
        expos = obj.style.position;
        obj.style.position = "absolute";
        exobj = window.getComputedStyle(obj);
        curleft = exobj.left;
        curtop = exobj.top;
        obj.style.position = expos;
    }
    console.log("calcolato "+curleft+" x "+curtop);
    return {x:curleft, y:curtop};
}


function positer_relative(tag, base, offset_x, offset_y) {
    
    // il tag deve essere posizionabile
    tag.style.position = "absolute";

    // determino il punto 0x0 del tag base
    orig = positer(base);
    
    if (typeof(offset_x) == 'number') tag.style.left = (orig.x + offset_x)+"px";
    if (typeof(offset_y) == 'number') tag.style.top  = (orig.y + offset_y)+"px";
}