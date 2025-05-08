let drinks = [];
const ALCOHOL_DENSITY = 0.789; // g/ml
const ELIMINATION_RATE = 0.015; // % per hour

function updateStepper(inputId, change, min = null, max = null, stepVal = 1) {
    const input = document.getElementById(inputId);
    let currentValue = parseFloat(input.value);
    if (isNaN(currentValue)) { currentValue = (min !== null && min > 0) ? min : 0; }
    
    let newValue = currentValue + change;
    
    if (min !== null) newValue = Math.max(min, newValue);
    if (max !== null) newValue = Math.min(max, newValue);
    
    if (stepVal.toString().includes('.')) { 
         newValue = parseFloat(newValue.toFixed(1)); 
    } else {
         newValue = Math.round(newValue / stepVal) * stepVal;
         if (min !== null) newValue = Math.max(min, newValue); // Re-check min/max after rounding
         if (max !== null) newValue = Math.min(max, newValue);
    }
    input.value = newValue;
}

function addSelectedPreset() {
    const presetSelect = document.getElementById('presetDrink');
    const presetQuantityInput = document.getElementById('presetQuantity');
    if (!presetSelect.value) {
        alert("Please select a preset drink from the list.");
        return;
    }
    const quantity = parseInt(presetQuantityInput.value);
    if (isNaN(quantity) || quantity <=0) {
        alert("Please enter a valid quantity for the preset drink.");
        return;
    }

    try {
        const presetData = JSON.parse(presetSelect.value);
        const totalSize = presetData.size * quantity;
        
        drinks.push({
            size: totalSize, // Aggregated size
            abv: presetData.abv,
            description: `${quantity} x ${presetData.name} (${totalSize}ml total @ ${presetData.abv}%)`
        });
        
        renderDrinkList();
        presetSelect.value = ""; 
        presetQuantityInput.value = "1"; // Reset quantity
    } catch (e) {
        console.error("Error parsing preset data:", e);
        alert("There was an error adding the preset drink.");
    }
}

function addManualDrink() {
    const numDrinksInput = document.getElementById('numDrinks');
    const glassSizeInput = document.getElementById('glassSize');
    const abvInput = document.getElementById('abv');

    const numDrinks = parseInt(numDrinksInput.value);
    const glassSize = parseFloat(glassSizeInput.value);
    const abv = parseFloat(abvInput.value);

    if (isNaN(numDrinks) || numDrinks <= 0 || isNaN(glassSize) || glassSize <= 0 || isNaN(abv) || abv < 0) {
        alert("Please enter valid positive numbers for all manual drink fields (ABV can be 0 or more).");
        return;
    }
    
    const totalVolumeForThisEntry = numDrinks * glassSize;
    drinks.push({ 
        size: totalVolumeForThisEntry, 
        abv: abv, 
        description: `${numDrinks} x ${glassSize}ml @ ${abv}% ABV (Manual)` 
    });
    
    renderDrinkList();
    // Optionally clear manual inputs
    numDrinksInput.value = 1;
    // glassSizeInput.value = "330"; // Or placeholder or ""
    // abvInput.value = "5"; // Or placeholder or ""
}

function removeDrink(index) {
    drinks.splice(index, 1);
    renderDrinkList();
}

function renderDrinkList() {
    const drinkListEl = document.getElementById('drinkList');
    const noDrinksText = document.getElementById('noDrinksText');
    const resultSectionContent = document.querySelector('.result-section-content');
    
    drinkListEl.innerHTML = ''; 
    
    if (drinks.length === 0) {
        noDrinksText.style.display = 'block';
    } else {
        noDrinksText.style.display = 'none';
        drinks.forEach((drink, index) => {
            const li = document.createElement('li');
            li.textContent = `${drink.description}`;
            
            const removeButton = document.createElement('button');
            removeButton.textContent = 'Remove';
            removeButton.className = 'remove-drink';
            removeButton.onclick = () => removeDrink(index);
            
            li.appendChild(removeButton);
            drinkListEl.appendChild(li);
        });
    }
    if (resultSectionContent) resultSectionContent.style.display = 'none';
}

function calculateBAC() {
    const weightKg = parseFloat(document.getElementById('weight').value);
    const timeHours = parseFloat(document.getElementById('time').value);
    const resultSectionContent = document.querySelector('.result-section-content');

    if (isNaN(weightKg) || weightKg <= 0) {
        alert("Please enter a valid weight.");
        if (resultSectionContent) resultSectionContent.style.display = 'none';
        return;
    }
    if (drinks.length === 0) {
        alert("Please add at least one drink.");
        if (resultSectionContent) resultSectionContent.style.display = 'none';
        return;
    }

    const weightGrams = weightKg * 1000;
    let totalAlcoholGrams = 0;
    drinks.forEach(drink => {
        const alcoholVolumeMl = drink.size * (drink.abv / 100);
        totalAlcoholGrams += alcoholVolumeMl * ALCOHOL_DENSITY;
    });

    const r_male = 0.68;
    const r_female = 0.55;

    let bacMale = (totalAlcoholGrams / (weightGrams * r_male)) * 100;
    bacMale -= (ELIMINATION_RATE * timeHours);
    bacMale = Math.max(0, bacMale); 

    let bacFemale = (totalAlcoholGrams / (weightGrams * r_female)) * 100;
    bacFemale -= (ELIMINATION_RATE * timeHours);
    bacFemale = Math.max(0, bacFemale); 

    displayDualResult(bacMale, bacFemale);
}

function displayDualResult(bacMale, bacFemale) {
    const resultSectionContent = document.querySelector('.result-section-content');
    if (!resultSectionContent) return; 
    resultSectionContent.style.display = 'block';

    // --- Male Result ---
    const bacDisplayMale = document.getElementById('bacResultDisplayMale');
    const messageDisplayMale = document.getElementById('bacMessageMale');
    const timeToSoberDisplayMale = document.getElementById('timeToSoberMale');
    
    bacDisplayMale.textContent = `${bacMale.toFixed(3)}%`;
    bacDisplayMale.className = 'bac-value-display'; // Reset classes
    if (bacMale === 0) { 
        bacDisplayMale.classList.add('bac-safe'); 
        messageDisplayMale.textContent = "Likely sober. If alcohol was consumed recently, effects might linger.";
    } else if (bacMale < 0.03) { 
        bacDisplayMale.classList.add('bac-safe'); 
        messageDisplayMale.textContent = "BAC is very low. Caution advised as any alcohol can affect coordination.";
    } else if (bacMale < 0.08) { 
        bacDisplayMale.classList.add('bac-caution'); 
        messageDisplayMale.textContent = "BAC in caution zone. Impairment is likely. DO NOT DRIVE.";
    } else { 
        bacDisplayMale.classList.add('bac-danger'); 
        messageDisplayMale.textContent = "BAC is high, likely over legal limit. DO NOT DRIVE."; 
    }
    if (bacMale > 0) {
        const hoursToSober = bacMale / ELIMINATION_RATE; 
        let hours = Math.floor(hoursToSober); 
        let minutes = Math.round((hoursToSober - hours) * 60);
        if (minutes === 60) { hours++; minutes = 0; }
        timeToSoberDisplayMale.textContent = `${hours} hr ${minutes} min (approx.)`;
    } else { 
        timeToSoberDisplayMale.textContent = "0 hr 0 min"; 
    }

    // --- Female Result ---
    const bacDisplayFemale = document.getElementById('bacResultDisplayFemale');
    const messageDisplayFemale = document.getElementById('bacMessageFemale');
    const timeToSoberDisplayFemale = document.getElementById('timeToSoberFemale');

    bacDisplayFemale.textContent = `${bacFemale.toFixed(3)}%`;
    bacDisplayFemale.className = 'bac-value-display'; // Reset classes
    if (bacFemale === 0) { 
        bacDisplayFemale.classList.add('bac-safe'); 
        messageDisplayFemale.textContent = "Likely sober. If alcohol was consumed recently, effects might linger.";
    } else if (bacFemale < 0.03) { 
        bacDisplayFemale.classList.add('bac-safe'); 
        messageDisplayFemale.textContent = "BAC is very low. Caution advised as any alcohol can affect coordination.";
    } else if (bacFemale < 0.08) { 
        bacDisplayFemale.classList.add('bac-caution'); 
        messageDisplayFemale.textContent = "BAC in caution zone. Impairment is likely. DO NOT DRIVE.";
    } else { 
        bacDisplayFemale.classList.add('bac-danger'); 
        messageDisplayFemale.textContent = "BAC is high, likely over legal limit. DO NOT DRIVE."; 
    }
    if (bacFemale > 0) {
        const hoursToSober = bacFemale / ELIMINATION_RATE; 
        let hours = Math.floor(hoursToSober); 
        let minutes = Math.round((hoursToSober - hours) * 60);
        if (minutes === 60) { hours++; minutes = 0; }
        timeToSoberDisplayFemale.textContent = `${hours} hr ${minutes} min (approx.)`;
    } else { 
        timeToSoberDisplayFemale.textContent = "0 hr 0 min"; 
    }
}
        
// Initialize display on page load
document.addEventListener('DOMContentLoaded', function() {
    renderDrinkList(); 
    const resultSectionContent = document.querySelector('.result-section-content');
    if (resultSectionContent) resultSectionContent.style.display = 'none';
});