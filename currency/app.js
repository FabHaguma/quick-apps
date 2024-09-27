

const url_allCurrencies = "https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies.json";
const url_euroBasedRates = "https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/eur.json";
const url_euroBasedRatesFallback = "https://latest.currency-api.pages.dev/v1/currencies/eur.json";

let allCurrencies, euroBasedRates, dateOfRate;

function formUrlForToday() {
    const date = new Date();
    let day = date.getDate();
    let month = date.getMonth() + 1;
    if(month < 10) month = "0"+ month;
    let year = date.getFullYear();

    return `https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@${year}-${month}-${day}/v1/currencies/eur.json`;
}

async function fetchCurrencyRates() {
    const amount = parseFloat(document.getElementById("amountInput").value);
    const fromCurrency = document.getElementById("fromCurrency").value.toLowerCase().trim();
    const resultDiv = document.getElementById("conversionResult1");

    if (isNaN(amount) || amount <= 0) {
      resultDiv.textContent = "Please enter a valid amount.";
      return;
    }

    if (!fromCurrency || !isNaN(fromCurrency) || fromCurrency.length === 0) {
        resultDiv.textContent = "Please enter a valid currency.";
        return;
      }

    if(!allCurrencies || Object.keys(allCurrencies).length === 0){
        allCurrencies = await fetchData('./currencies.json');
        // console.log("CURRENCY NAMES: "+ JSON.stringify(allCurrencies));
    }

    if(!euroBasedRates || Object.keys(euroBasedRates).length === 0){
        euroBasedRates = await fetchData(formUrlForToday());
        // console.log("FIRST ATTEMPT: "+ JSON.stringify(euroBasedRates));
        // console.log("the date is "+ euroBasedRates.date);
    }

    if(!euroBasedRates || Object.keys(euroBasedRates).length === 0){
        euroBasedRates = await fetchData(url_euroBasedRatesFallback);
        // console.log("SECOND ATTEMPT: "+ JSON.stringify(euroBasedRates));
    }

    let short = getCurrencyShort(fromCurrency);
    let rate = getRate(short);

    let euros = amount / rate;
    let otherRates = quickRates();

    let usd = euros * otherRates[0];
    let rwf = euros * otherRates[1];

    
    // resultDiv.textContent = `${amount} ${short} =  ${euros.toFixed(2)} EUR   or   ${usd.toFixed(2)} USD   or   ${rwf.toFixed(2)} RWF`;
    document.getElementById("conversionResult1").textContent = `${amount} ${short} =  ${euros.toFixed(2)} EUR`;
    document.getElementById("conversionResult2").textContent = `${amount} ${short} =  ${usd.toFixed(2)} USD`;
    document.getElementById("conversionResult3").textContent = `${amount} ${short} =  ${rwf.toFixed(2)} RWF`;
}

function getRate(currencyShortName){
    let newObj = euroBasedRates.eur;
    for (const [key, value] of Object.entries(newObj)) {
        if(key === currencyShortName) return value;
    }
}

function quickRates(){
    let newObj = euroBasedRates.eur;
    let usd, rwf;
    for (const [key, value] of Object.entries(newObj)) {
        if(key === 'usd') usd = value;
        else if(key === 'rwf') rwf = value;
    }
    return [usd, rwf];
}

function getCurrencyShort(currName){
    let lcCurrName = currName.toLowerCase();

    for (const [key, value] of Object.entries(allCurrencies)) {
        if(lcCurrName === key) return key;
    }
    for (const [key, value] of Object.entries(allCurrencies)) {
        if((value.toLowerCase()).includes(lcCurrName)) return key;
    }
}

async function fetchData(url) {
    try {
        const response = await fetch(url);

        if(!response.ok) throw new Error("Could not fetch resource (NOT OK)");

        const data = await response.json();
        return data;
  
        
      } catch (error) {
        console.log("An error occurred while fetching data: "+ error);
      }
}