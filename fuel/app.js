// Conversion Constants
const MPG_TO_LKM = 235.214583; // Conversion factor for MPG to L/100km
const UK_to_US = 0.8327; // Conversion factor for UK mpg to US mpg
let finalResult = [];

function addToFinalResult(txt) {
  finalResult.push(txt);
}

function addDivToFinalResult() {
  var resultDiv = document.getElementById("result");
  for (let i = 0; i < finalResult.length; i++) {
    resultDiv.innerHTML += `<div id="${"id-00" + i}">${
      finalResult[i]
    }</div>`;
  }
}

function resetResult() {
  finalResult = [];

  for (let i = 0; i < 5; i++) {
    var innerDiv = document.getElementById("id-00" + i);
    if (innerDiv) innerDiv.parentNode.removeChild(innerDiv);
  }
}

function generalConvert() {
  resetResult();

  let convFrom = getConvertFrom();

  var consVal = parseFloat(document.getElementById("fuelInput").value);

  if (isNaN(consVal) || consVal <= 0) {
    document.getElementById("result").textContent =
      "Please enter a valid MPG value.";
    return;
  }

  if (convFrom === "mpg-us") {
    // Convert From MPG

    var lkm = MPG_TO_LKM / consVal;
    addToFinalResult(
      consVal.toFixed(2) + " MPG (US) is " + lkm.toFixed(2) + " L/100km."
    );

    var kmpl = 100 / lkm;
    addToFinalResult(
      consVal.toFixed(2) + " MPG (US) is " + kmpl.toFixed(2) + " km/L."
    );

    var ukMpg = consVal / UK_to_US;
    addToFinalResult(
      consVal.toFixed(2) +
        " MPG (US) is " +
        ukMpg.toFixed(2) +
        " MPG (UK)."
    );

    addDivToFinalResult();
  } else if (convFrom === "mpg-uk") {
    // Convert From MPG

    var lkm = MPG_TO_LKM / consVal;
    addToFinalResult(
      consVal.toFixed(2) + " MPG (UK) is " + lkm.toFixed(2) + " L/100km."
    );

    var kmpl = 100 / lkm;
    addToFinalResult(
      consVal.toFixed(2) + " MPG (UK) is " + kmpl.toFixed(2) + " km/L."
    );

    var usMpg = consVal * UK_to_US;
    addToFinalResult(
      consVal.toFixed(2) +
        " MPG (UK) is " +
        usMpg.toFixed(2) +
        " MPG (US)."
    );

    addDivToFinalResult();
  } else if (convFrom === "l100km") {
    // Convert From L/100km

    var mpg = MPG_TO_LKM / consVal;
    addToFinalResult(
      consVal.toFixed(2) + " L/100km is " + mpg.toFixed(2) + " MPG."
    );

    var kmpl = 100 / consVal;
    addToFinalResult(
      consVal.toFixed(2) + " L/100km is " + kmpl.toFixed(2) + " km/L."
    );

    addDivToFinalResult();
  } else if (convFrom === "kmpl") {
    // Convert From kmpL

    var lkm = 100 / consVal;
    addToFinalResult(
      consVal.toFixed(2) + " km/L is " + lkm.toFixed(2) + " L/100km."
    );

    var mpg = MPG_TO_LKM / lkm;
    addToFinalResult(
      consVal.toFixed(2) + " km/L is " + mpg.toFixed(2) + " MPG."
    );

    addDivToFinalResult();
  }
}

function getConvertFrom() {
  let dropDown = document.getElementById("pick-unit");
  let selectedOption = dropDown.options[dropDown.selectedIndex];
  return selectedOption.value;
}