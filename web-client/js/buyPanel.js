
/**
  * Pannello a scomparsa con il riepilogo dell'ordine gruppo
  * (5,1 | 5,2)
  *
  *
  */

 //costruisce il pannello con l'ordine a partire dal gruppo
function BuyPanel (groupObject){
	"use strict";
	this.groupId = -1;
	/* Se l'oggeto 'groupObject' non ha il parametro groupId, non inizializzo l'oggetto 
	 *
	 */
	this.init = function(){
		if (groupObject) {
			if(groupObject.groupId){
				this.groupId = groupObject.groupId;
				return true;
			}else{
				console.log("Error: groupId is not defined");
				return false;
			}
		}else{
			console.log("Error: Panel initalized without a group");
			return false;
		}
	};
	this.setPanelList = function(products){
		//data la lista dei prodotti riempio la <ul> del pannello
		products.forEach(function(el){
			$("#panel-list").append("<li>"+el+"</li>");
		});
	};

	if(this.init()){
		/*
		 * Alcuni metodi potrbbero aver bisogno dell'oggeto Ajax.
		 * Nell' if la condizione è che l'oggetto sia presente
		 * altrimenti i metodi non vengono definiti
		 */
		 //TODO: capire come funziona l'oggetto Ajax e cambiare la condizione
		if(true){
			//la funzione fa una chiamata al db e ritorna la lista degli oggetti del gruppo d'acquisto
			this.getGroupProducts = function(){
				var q = "groupProducts"
				var request = new Ajax(3);
				request.open('GET', foowd.dbhost+'panelService.php?'+"q="+q, true);
		        request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
		        request.setRequestHeader('Accept','application/json');
		        request.onSuccess = function(res){
		        	alert(res);
		        };
		        request.onfail = function(err){
		        	alert(err);		        
		        };
		        request.send();
			};
		}else{
			//Non ho incluso ajax.js
			console.log("Warning: Ajax functions are off");
		}
	}else{
		//quando l'inizializzazione dell'oggetto fallisce l'errore è generico
		console.log("Error: Panel init failed, check your params");
		return false;
	}
};