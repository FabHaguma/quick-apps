// Function to check if a number is prime
function checkPrime() {
    let num = parseInt(document.getElementById("primeInput").value);
    let resultDiv = document.getElementById("result");
    if (isNaN(num) || num <= 1) {
      resultDiv.textContent = "Please enter a number greater than 1.";
      return;
    }

    let isPrime = true;
    for (let i = 2; i <= Math.sqrt(num); i++) {
      if (num % i === 0) {
        isPrime = false;
        break;
      }
    }

    if (isPrime) {
      resultDiv.textContent = `${num} is a prime number.`;
    } else {
      resultDiv.textContent = `${num} is not a prime number.`;
    }
  }

  // Function to list all prime numbers within a range
  function listPrimes() {
    let lowerBound = parseInt(
      document.getElementById("lowerBoundInput").value
    );
    let limit = parseInt(document.getElementById("limitInput").value);
    let primeListDiv = document.getElementById("prime-list");
    primeListDiv.innerHTML = "";

    // Default the lower bound to 2 if left empty or less than 2
    if (isNaN(lowerBound) || lowerBound < 2) {
      lowerBound = 2;
    }

    if (isNaN(limit) || limit <= 1) {
      primeListDiv.textContent =
        "Please enter an upper limit greater than 1.";
      return;
    }

    if (lowerBound > limit) {
      primeListDiv.textContent =
        "Lower bound cannot be greater than upper limit.";
      return;
    }

    let primes = [];
    for (let num = lowerBound; num <= limit; num++) {
      let isPrime = true;
      for (let i = 2; i <= Math.sqrt(num); i++) {
        if (num % i === 0) {
          isPrime = false;
          break;
        }
      }
      if (isPrime) {
        primes.push(num);
      }
    }

    primeListDiv.innerHTML += `<div>Prime numbers between ${lowerBound} and ${limit}: </div>`;
    primeListDiv.innerHTML += `<div>${primes.join(", ")}</div>`;
  }