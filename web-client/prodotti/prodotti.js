//**una decina di prodotti --- meglio se da file esterno --- per ora json
/**

prodotto: tipo di prodotto, come "vino rosso", "pane", "mozzarella", ecc.
qualita: nome specifico, come "grignolino", "di altamura", "di bufala", ecc. 
produttore: nome del produttore, dell'azienda agricola, della cantina, ecc.
produzione: descrizione della modalità particolare di lavorazione, p. es. "lavorato a mano"
porzione: descrizione di in cosa consista una porzione
qta_disp: numero di porzioni disponibili, se il dato non è disponibile o non è applicabile indicare -1
qta_min: numero di porzioni minime ordinabili, solitamente 1, p. es. in caso di vini potrebbe essere 6 (una cassa)
prezzo: prezzo della porzione singola
disp_dal: data in cui il prodotto sarà pronto per la spedizione, p. es. "2014-05-08"
immagine: se presente, nome del file-immagine (compresa l'estensione .gif, .png, ecc.)

*/

var prodotti= [


/** Masseria pezze galere
*/
{
  prodotto: "Olio Extravergine di Oliva"
, qualita: "Fruttato Medio e Fruttato Intenso"
, produttore: "Masseria Pezze Galere - Speziale di Fasiano (BR)"
, produzione: "Estrazione a freddo entro 24 ore dalla raccolta"
, porzione: "Latta da 5 litri"
, qta_disp: 600
, qta_min: 2
, prezzo: 35
, disp_dal: "06/06/2014"
, immagine: "PezzeGalereLatta5litri.png"
},
{
  prodotto: "Olio Extravergine di Oliva"
, qualita: "Fruttato Medio"
, produttore: "Masseria Pezze Galere - Speziale di Fasiano (BR)"
, produzione: "Estrazione a freddo entro 24 ore dalla raccolta\nordine minimo 10 cartoni da 12 bottiglie"
, porzione: "Bottiglia da 500ml"
, qta_disp: 6000
, qta_min: 120
, prezzo: 4.5
, disp_dal: "06/06/2014"
, immagine: "PezzeGalereBottiglia500ml.jpg"
},




/** Alimentari garofalo
*/
{
  prodotto: "Fagioli borlotti"
, qualita: "Secchi"
, produttore: "Garofalo Alimentari - Montella (AV)"
, produzione: "Canada"
, porzione: "500 g"
, qta_disp: -1
, qta_min: 1
, prezzo: 1.40
, disp_dal: "24/06/2014"
, immagine: "GarofaloLegumi.jpg"
},
{
  prodotto: "Fagioli borlotti pinto"
, qualita: "Secchi"
, produttore: "Garofalo Alimentari - Montella (AV)"
, produzione: "Canada"
, porzione: "500 g"
, qta_disp: -1
, qta_min: 1
, prezzo: 0.94
, disp_dal: "24/06/2014"
, immagine: "GarofaloLegumi.jpg"
},
{
  prodotto: "Fagioli cannellini"
, qualita: "Secchi"
, produttore: "Garofalo Alimentari - Montella (AV)"
, produzione: "Egitto"
, porzione: "500 g"
, qta_disp: -1
, qta_min: 1
, prezzo: 1.54
, disp_dal: "24/06/2014"
, immagine: "GarofaloLegumi.jpg"
},
{
  prodotto: "Fagioli cannellini"
, qualita: "Secchi"
, produttore: "Garofalo Alimentari - Montella (AV)"
, produzione: "Italia"
, porzione: "500 g"
, qta_disp: -1
, qta_min: 1
, prezzo: 1.37
, disp_dal: "24/06/2014"
, immagine: "GarofaloLegumi.jpg"
},


/** APLCefalù
*/
{
  prodotto: "Ginseno"
, qualita: "Naturale"
, produttore: "APL Cefalù - Cefalù (PA)"
, produzione: "Amaro digestivo alcolico prodotto per infusione"
, porzione: "Bottiglia 70 cl"
, qta_disp: -1
, qta_min: 6
, prezzo: 12.20
, disp_dal: "05/04/2014"
, immagine: "APLCefaluGinseno.jpg"
},
{
  prodotto: "Ginseno"
, qualita: "Amabile"
, produttore: "APL Cefalù - Cefalù (PA)"
, produzione: "Amaro digestivo alcolico prodotto per infusione"
, porzione: "Bottiglia 70 cl"
, qta_disp: -1
, qta_min: 6
, prezzo: 12.20
, disp_dal: "05/04/2014"
, immagine: "APLCefaluGinseno.jpg"
},
{
  prodotto: "Ginseno"
, qualita: "alla manna"
, produttore: "APL Cefalù - Cefalù (PA)"
, produzione: "Amaro digestivo alcolico prodotto per infusione"
, porzione: "Bottiglia 70 cl"
, qta_disp: -1
, qta_min: 6
, prezzo: 12.44
, disp_dal: "05/04/2014"
, immagine: "APLCefaluGinseno.jpg"
},
{
  prodotto: "Ginseno"
, qualita: "alla menta"
, produttore: "APL Cefalù - Cefalù (PA)"
, produzione: "Amaro digestivo alcolico prodotto per infusione"
, porzione: "Bottiglia 70 cl"
, qta_disp: -1
, qta_min: 6
, prezzo: 14.64
, disp_dal: "05/04/2014"
, immagine: "APLCefaluGinseno.jpg"
},
{
  prodotto: "Digergoj"
, qualita: "novità assoluta"
, produttore: "APL Cefalù - Cefalù (PA)"
, produzione: "Amaro digestivo alcolico prodotto per infusione"
, porzione: "Bottiglia 70 cl"
, qta_disp: -1
, qta_min: 6
, prezzo: 12.20
, disp_dal: "05/04/2014"
, immagine: "APLCefaluGinseno.jpg"
},
{
  prodotto: "Ligoj"
, qualita: "novitù assoluta"
, produttore: "APL Cefalù - Cefalù (PA)"
, produzione: "Amaro digestivo alcolico prodotto per infusione"
, porzione: "Bottiglia 50 cl"
, qta_disp: -1
, qta_min: 6
, prezzo: 9.28
, disp_dal: "05/04/2014"
, immagine: "APLCefaluLigoj.jpg"
},


/** Zipo
*/
{
  prodotto: "Riso "
, qualita: "Arborio"
, produttore: "Azienda Agricola Zipo - Zibido San Giacomo (MI)"
, produzione: "Prodotto senza l'utilizzo di sbiancanti"
, porzione: "Circa 1 kg"
, qta_disp: -1
, qta_min: 1
, prezzo: 3.30
, disp_dal: "04/04/2014"
, immagine: "ZipoRiso.png"
},
{
  prodotto: "Riso "
, qualita: "Carnaroli"
, produttore: "Azienda Agricola Zipo - Zibido San Giacomo (MI)"
, produzione: "Prodotto senza l'utilizzo di sbiancanti"
, porzione: "Circa 1 kg"
, qta_disp: -1
, qta_min: 1
, prezzo: 3.30
, disp_dal: "04/04/2014"
, immagine: "ZipoRiso.png"
},
{
  prodotto: "Kit per formaggi fatti in casa "
, qualita: ""
, produttore: "Azienda Agricola Zipo - Zibido San Giacomo (MI)"
, produzione: "Contiene caglio, termometro, formine e ricettario\nManca solo il latte!"
, porzione: "La confezione, sufficiente per circa 200 litri di latte"
, qta_disp: -1
, qta_min: 1
, prezzo: 25
, disp_dal: "04/04/2014"
, immagine: "ZipoKitFormaggi.jpg"
}

];