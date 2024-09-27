
let drinksArray = [];

function getTimeValue() {
  let textHours = document.getElementById("time-display-hour").textContent;
  let textMinutes = document.getElementById("time-display-minute").textContent;

  let hours = parseInt(textHours.substring(0, textHours.length -1));
  let minutes = parseInt(textMinutes.substring(0, textMinutes.length -1));

  return minutes + (hours * 60);
}

function increaseWeightValue() {
  let weight = parseInt(document.getElementById("weight-value").textContent);
  if(weight >= 300) return weight;

  document.getElementById("weight-value").textContent = (weight + 5);
}

function decreaseWeightValue() {
  let weight = parseInt(document.getElementById("weight-value").textContent);
  if(weight <= 10) return weight;

  document.getElementById("weight-value").textContent = (weight - 5);
}

function setTimeValue(minutes) {
  if(minutes <= 0) minutes = 0;
  let minText = (minutes % 60 === 0) ? "00" : "30";
  document.getElementById("time-display-hour").textContent = Math.floor(minutes / 60) +"h";
  document.getElementById("time-display-minute").textContent = minText +"\"";
}

function getHours(minutes){
  return Math.floor(minutes / 60);
}
function getMinutesLeft(minutes){
  return Math.floor(minutes % 60);
}

function increaseTimeValue(){
  let time = getTimeValue();
  time += 30;
  
  setTimeValue(time);
}

function decreaseTimeValue(){
  let time = getTimeValue();
  time -= 30;
  setTimeValue(time);
}

function addDrink(){
  let txtAmount = document.getElementById("drink-amount").value;
  let txtSize = document.getElementById("drink-size").value;
  let txtAbv = document.getElementById("drink-abv").value;

  let amount = (txtAmount && !isNaN(txtAmount)) ? parseInt(txtAmount) : 0;
  let size = (txtSize && !isNaN(txtSize)) ? parseInt(txtSize) : 0;
  let abv = (txtAbv && !isNaN(txtAbv)) ? parseFloat(txtAbv) : 0;

  let txt = `{hm: ${amount}, gsz: ${size}, abv: ${abv}}`;
  let pseudo_id = amount +"-"+ size +"-"+ abv;

  drinksArray.push({id: pseudo_id, amount: amount, size: size, abv: abv});

  let addHere = document.getElementById("drinks-added-here");
  addHere.innerHTML += `<div class="drink-item fx-row fx-cntr" id="cl-${pseudo_id}"><span> ${txt} </span>
      <button id="${pseudo_id}" class="btn-remove" onclick="removeDrink(this.id)">x</button></div>`;
}

function removeDrink(clickedId){
  document.getElementById("cl-"+clickedId).remove();
  for (let i = 0; i < drinksArray.length; i++) {
    if(drinksArray[i].id === clickedId) drinksArray.splice(i, 1);    
  }

}

function calculateBAC(){
  let totalAlcoholInGrams = 0;

  for(let i = 0; i < drinksArray.length; i++){
    let drinksGram = getAlcoholGrams(drinksArray[i].amount, drinksArray[i].size, drinksArray[i].abv);
    totalAlcoholInGrams += drinksGram;
  }

  let time = getTimeValue();
  let metabolizedBAC = ((getHours(time) * 0.015) + ((0.015 / 2) * (getMinutesLeft(time) ? 1 : 0)));
  
  let bacMale = ((totalAlcoholInGrams / getBodyFactor('male')) * 100) - metabolizedBAC;
  let bacFemale = ((totalAlcoholInGrams / getBodyFactor('female')) * 100) - metabolizedBAC;

  console.log("bac male: "+ bacMale)
  console.log("bac female: "+ bacFemale)


  document.getElementById('male-final-result').textContent = "Your BAC is: "+ bacMale.toFixed(3) +"% Man!";
  document.getElementById('female-final-result').textContent = "Your BAC is: "+ bacFemale.toFixed(3) +"% Girl!";

}

function getAlcoholGrams(amount, size, abv){  
  return size * (abv / 100) * 0.789 * amount; 
}


function getBodyFactor(gender){
  let weight = parseInt(document.getElementById('weight-value').innerText);
  return weight * 1000 * ((gender === 'male') ? 0.68 : 0.55);
}


