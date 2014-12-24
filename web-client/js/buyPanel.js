
/**
  * Pannello a scomparsa con il riepilogo dell'ordine gruppo
  * (5,1 | 5,2)
  *       par -> parametri che vengono passati tra le pagine
	*
  *
  */

 //costruisce il pannello con l'ordine a partire dal gruppo
function BuyPanel (groupObject, htmlId){
	"use strict";
	this.groupId = -1; 			 //gruppo d'acquisto di riferimento
	this.tagId = "#"; 			 //tag dell'oggetto html associato al pannello
	this.contentTagId = "#"; //tag dell'oggetto html associato al contenuto del pannello
	this.state = true; 			 //stato del pannello, visibile oppure nascosto
	/*
	 * Se l'oggeto 'groupObject' non ha il parametro groupId, non inizializzo l'oggetto
	 */
	this.init = function(){
		if (groupObject) {
			if(groupObject.groupId){
				this.groupId = groupObject.groupId;
				this.tagId += htmlId;
				this.contentTagId += htmlId + "-content";
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
			return false;
		}
		//Metodi a cui non serve Ajax


		/*
		* Listener(è in ascolto di un particolare evento)
		* in questo caso il click su l'elemento #panel
		*/
		var self = this;
		$(this.tagId).click(function(){
				//switch dei due casi in cui il pannello sia aperto o chiuso
				if (self.state){
					//pannello chiuso -> lo apro
					$(self.tagId).animate({
							width: 250
					},500, function(){
							//callback dell'effetto
					$(self.contentTagId).css("visibility","visible");
					});
				} else{
					//pannello aperto -> lo chiudo
					$(self.contentTagId).css("visibility","hidden");
					$(self.tagId).animate({
						width: 20
					},500);
				}
				//lo stato del pannello è cambiato
				self.state = !self.state;
		});


	}else{
		//quando l'inizializzazione dell'oggetto fallisce l'errore è generico
		console.log("Error: Panel init failed, check your params");
		return false;
	}


};
