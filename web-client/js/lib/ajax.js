/** Funzione per chiamate Ajax
chiamata con l'oggetto ao creato:
    ao.open('GET', 'http://url.net/service'+search_data, true);
    ao.send(null);
oppure
    ao.open('POST', 'http://url.net/service', true);
    ao.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    ao.send(data);
*/
// Initialize the Ajax request
Ajax = function (debug) {
  var ajaxObj;
  if (!debug) debug=0; // 0=ERROR, 1, 2, 3=DEBUG
  if (window.XMLHttpRequest) { // Mozilla, Safari, ...
    ajaxObj = new XMLHttpRequest();
  } else if (window.ActiveXObject) { // IE
    try {
      ajaxObj = new ActiveXObject("Msxml2.XMLHTTP");
    } 
    catch (e) {
      try {
        ajaxObj = new ActiveXObject("Microsoft.XMLHTTP");
      } 
      catch (e) {}
    }
  }
  if (!ajaxObj) {
    console.log('Ajax in ajax.js error: Cannot create an XMLHTTP instance!');
    return false;
  } else {
    // verifico la versione x CORS
    if (!("withCredentials" in ajaxObj)) console.log("Browser don't support CORS."); 
    if (debug==3) console.log("Ajax support for CORS: "+("withCredentials" in ajaxObj));
    try {
      if(ajaxObj.withCredentials) ajaxObj.withCredentials=false;
    } catch (ex) {
      console.log("JS Error "+ex.name+" in checking Ajax support for CORS:"+ex.message);
    }
  }

  ajaxObj.onsuccess = function (responseText) {};

  ajaxObj.onfail = function (errorStatus) {};

  // Track the state changes of the request
  ajaxObj.onreadystatechange=function(){
      if (debug==3) console.log('State change : '+this.readyState+', status : '+this.status);
      // Ready state 4 means the request is done
      if(this.readyState === 4){
          // 200 is a successful return
          if(this.status === 200){
              if (debug>1) console.log("ajax.text:"+this.responseText); // 'This is the returned text.'
              this.onsuccess(this.responseText);
          }else{
              // An error occurred during the request
              console.log('ajax Error: '+this.status);
              this.onfail(this.status);
          }
      }
  }
  return ajaxObj;
}