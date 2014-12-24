//**una decina di prodotti --- meglio se da file esterno --- per ora json
/**

prodotto: tipo di prodotto, come "vino rosso", "pane", "mozzarella", ecc.
qualita: nome specifico, come "grignolino", "di altamura", "di bufala", ecc. 
produttore: nome del produttore, dell'azienda agricola, della cantina, ecc.
produzione: descrizione della modalità particolare di lavorazione, p. es. "lavorato a mano"
porzione: descrizione di cosa consista una porzione
qta_disp: numero di porzioni disponibili, se il dato non è disponibile o non è applicabile indicare -1
qta_min: numero di porzioni minime ordinabili, solitamente 1, p. es. in caso di vini potrebbe essere 6 (una cassa)
disp_dal: data in cui il prodotto sarà pronto per la spedizione, p. es. "2014-05-08"
immagine: se presente, nome del file-immagine (compresa l'estensione .gif, .png, ecc.)

*/
var prodotti= [
{
  prodotto: "pane"
, qualita: "di altamura"
, produttore: "Aldo Mura"
, produzione: "Impastato a mano con farina e olio locali.\nProdotto all'ordine."
, porzione: "un pane pesa circa 1 kg"
, qta_disp: -1
, qta_min: 1
, disp_dal: "2014-05-08"
, immagine: ""
, prezzo: 1
},
{
  prodotto: "mozzarella"
, qualita: "di bufala"
, produttore: "Visco Lonzo"
, produzione: "Impastata a mano con la calma che ci <b>contraddistingue</b>"
, porzione: "due mozzarelle, 250g in tutto"
, qta_disp: 100
, qta_min: 1
, disp_dal: "2014-05-08"
, immagine: ""
, prezzo: 2.2
},
{}];
