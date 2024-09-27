
     
      function getTimeValue() {
        let textHours = document.getElementById("time-display-hour").textContent;
        let textMinutes = document.getElementById("time-display-minute").textContent;

        let hours = parseInt(textHours.substring(0, textHours.length -1));
        let minutes = parseInt(textMinutes.substring(0, textMinutes.length -1));

        return minutes + (hours * 60);
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

      function increamentTimeValue(){
        let time = getTimeValue();
        time += 30;
        
        setTimeValue(time);
      }

      function decreamentTimeValue(){
        let time = getTimeValue();
        time -= 30;
        setTimeValue(time);
      }

      function calculateBAC() {

        let time = getTimeValue();

        let beer = getAlcoholGrams('beer');
        let wine = getAlcoholGrams('wine');
        let liquor = getAlcoholGrams('liquor');
        let other = getOthersAlcoholGram();

        // BAC = (alcoholGrams / bodyFactor) * 100;
        let bac = ((beer + wine + liquor + other) / getBodyFactor()) * 100;
        
        let leftBAC = bac - ((getHours(time) * 0.015) + ((0.015 / 2) * (getMinutesLeft(time) ? 1 : 0)));
        let textBAC = (leftBAC +"").substring(0, 5);
        if(leftBAC < 0.0005) textBAC = "0.00";

        document.getElementById('final-result').textContent = "Your BAC is: "+ textBAC +"%";
        // console.log("BAC: "+ bac);
        // console.log("Left BAC: "+ leftBAC);
        // console.log("=================================");

      }


      function getAlcoholGrams(drinkType){
        let amountText = document.getElementById(drinkType +'-amount').value;
        let amount = (amountText && !isNaN(amountText)) ? parseInt(amountText) : 0;

        let size = getSelectedValue(drinkType +'-size');

        let abv = getSelectedValue(drinkType +'-abv');
        
        return size * (abv / 100) * 0.789 * amount; 
      }

      function getOthersAlcoholGram(){
        let amountText = document.getElementById('other-amount').value;
        let sizeText = document.getElementById('other-size').value;
        let abvText = document.getElementById('other-abv').value;

        let amount = (amountText && !isNaN(amountText)) ? parseInt(amountText) : 0;
        let size = (sizeText && !isNaN(sizeText)) ? parseInt(sizeText) : 0;
        let abv = (abvText && !isNaN(abvText)) ? parseInt(abvText) : 0;
        
        return size * (abv / 100) * 0.789 * amount; 
      }

      function getSelectedValue(id) {
        let dropDown = document.getElementById(id);
        let selectedOption = dropDown.options[dropDown.selectedIndex];
        return selectedOption.value;
      }

      function getBodyFactor(){
        let genderElement = document.getElementsByName('gender');
        let weight = parseInt(document.getElementById('body-weight').value);

        let gender = "male";
        for (let i = 0; i < genderElement.length; i++) 
          if (genderElement[i].checked) gender = genderElement[i].value;

        return weight * 1000 * ((gender === 'male') ? 0.68 : 0.55);
      }

      
