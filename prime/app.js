// --- Helper Function ---
function _isPrime(num) {
  if (isNaN(num) || num <= 1 || num % 1 !== 0) {
    return false;
  }
  if (num <= 3) {
    return true; // 2 and 3 are prime
  }
  if (num % 2 === 0 || num % 3 === 0) {
    return false; // Divisible by 2 or 3
  }
  // Check from 5 up to sqrt(num)
  for (let i = 5, s = Math.sqrt(num); i <= s; i = i + 6) {
    if (num % i === 0 || num % (i + 2) === 0) {
      return false;
    }
  }
  return true;
}

// --- Feature Functions ---

// 1. Prime Number Checker
function checkPrime() {
  const numInput = document.getElementById("primeInput");
  const resultDiv = document.getElementById("result");
  const num = parseInt(numInput.value);

  resultDiv.textContent = "";
  numInput.classList.remove("error-input");

  if (isNaN(num) || num <= 1) {
    resultDiv.textContent = "Please enter a whole number greater than 1.";
    numInput.classList.add("error-input");
    return;
  }

  if (_isPrime(num)) {
    resultDiv.textContent = `${num} is a prime number.`;
  } else {
    resultDiv.textContent = `${num} is not a prime number.`;
  }
}

// 2. Prime Number Lister
function listPrimes() {
  const lowerBoundInput = document.getElementById("lowerBoundInput");
  const limitInput = document.getElementById("limitInput");
  const primeListDiv = document.getElementById("prime-list");

  let lowerBound = parseInt(lowerBoundInput.value);
  let limit = parseInt(limitInput.value);

  primeListDiv.innerHTML = "";
  lowerBoundInput.classList.remove("error-input");
  limitInput.classList.remove("error-input");

  if (isNaN(lowerBound) || lowerBound < 2) {
    lowerBound = 2;
    // lowerBoundInput.value = 2; // Optionally update input
  }

  if (isNaN(limit) || limit <= 1) {
    primeListDiv.textContent =
      "Please enter an upper limit (whole number > 1).";
    limitInput.classList.add("error-input");
    return;
  }

  if (lowerBound > limit) {
    primeListDiv.textContent =
      "Lower bound cannot be greater than the upper limit.";
    lowerBoundInput.classList.add("error-input");
    limitInput.classList.add("error-input");
    return;
  }

  let primeCount = 0;
  const primes = [];
  for (let num = lowerBound; num <= limit; num++) {
    if (_isPrime(num)) {
      primes.push(num);
      primeCount++;
    }
  }

  if (primes.length > 0) {
    primeListDiv.innerHTML = `<div>Found ${primeCount} prime numbers between ${lowerBound} and ${limit}:</div>`;
    primeListDiv.innerHTML += `<div class="prime-results">${primes.join(
      ", "
    )}</div>`;
  } else {
    primeListDiv.textContent = `No prime numbers found between ${lowerBound} and ${limit}.`;
  }
}

// 3. Prime Factorization
function factorizeNumber() {
  const numInput = document.getElementById("factorInput");
  const resultDiv = document.getElementById("factorResult");
  let num = parseInt(numInput.value);

  resultDiv.textContent = "";
  numInput.classList.remove("error-input");

  if (isNaN(num) || num <= 1) {
    resultDiv.textContent = "Please enter a whole number greater than 1.";
    numInput.classList.add("error-input");
    return;
  }

  const factors = [];
  let divisor = 2;
  let originalNum = num; // Keep original number for display

  while (num >= 2) {
    if (num % divisor === 0) {
      factors.push(divisor);
      num = num / divisor;
    } else {
      // Optimization: Only check odd divisors after 2
      divisor = (divisor === 2) ? 3 : divisor + 2;
      // Optimization: If divisor squared is greater than num, num must be prime
      if (divisor * divisor > num && num > 1) {
           factors.push(num); // Add the remaining prime factor
           break;
      }
    }
     // Safety break for very large numbers or unexpected issues
     if(divisor > originalNum / 2 && factors.length === 0 && originalNum !== 2 && originalNum !== 3) {
        factors.push(originalNum); // Number itself is prime
        break;
     }
  }


  if (factors.length === 0 && originalNum > 1) { // Should only happen for primes already handled
      resultDiv.textContent = `${originalNum} is prime, its only factor is itself.`;
  } else if (factors.length === 1 && factors[0] === originalNum) {
       resultDiv.textContent = `${originalNum} is a prime number.`;
  }
  else {
      resultDiv.textContent = `Prime factors of ${originalNum}: ${factors.join(" x ")}`;
  }
}


// 4. Find Next Prime
function findNextPrime() {
  const numInput = document.getElementById("findPrimeInput");
  const resultDiv = document.getElementById("findPrimeResult");
  let num = parseInt(numInput.value);

  resultDiv.textContent = "";
  numInput.classList.remove("error-input");

  if (isNaN(num)) {
    resultDiv.textContent = "Please enter a valid whole number.";
    numInput.classList.add("error-input");
    return;
  }

  let nextNum = num < 2 ? 2 : num + 1; // Start searching from 2 if input is < 2

  while (true) {
    if (_isPrime(nextNum)) {
      resultDiv.textContent = `The next prime number after ${num} is ${nextNum}.`;
      break;
    }
    nextNum++;
    // Safety break for potentially very long searches (optional)
    if (nextNum > num + 1000000) { // Adjust limit as needed
        resultDiv.textContent = `Search stopped: No prime found within a reasonable range after ${num}.`;
        break;
    }
  }
}

// 5. Find Previous Prime
function findPrevPrime() {
  const numInput = document.getElementById("findPrimeInput");
  const resultDiv = document.getElementById("findPrimeResult");
  let num = parseInt(numInput.value);

  resultDiv.textContent = "";
  numInput.classList.remove("error-input");

   if (isNaN(num)) {
    resultDiv.textContent = "Please enter a valid whole number.";
    numInput.classList.add("error-input");
    return;
  }

  if (num <= 2) {
    resultDiv.textContent = "There is no prime number less than 2.";
    return;
  }

  let prevNum = num - 1;
  while (prevNum >= 2) {
    if (_isPrime(prevNum)) {
      resultDiv.textContent = `The previous prime number before ${num} is ${prevNum}.`;
      break;
    }
    prevNum--;
  }
   // This case should technically be covered by num <= 2 check, but as a safeguard:
   if (prevNum < 2) {
        resultDiv.textContent = `No prime number found before ${num}.`;
   }
}

// 6. Generate First N Primes
function generateFirstNPrimes() {
  const nInput = document.getElementById("firstNInput");
  const resultDiv = document.getElementById("firstNResult");
  const n = parseInt(nInput.value);

  resultDiv.textContent = "";
  nInput.classList.remove("error-input");

  if (isNaN(n) || n <= 0) {
    resultDiv.textContent = "Please enter a positive whole number (N > 0).";
    nInput.classList.add("error-input");
    return;
  }

   // Add a limit to prevent browser freeze for huge N
   const MAX_N = 10000; // Adjust as needed
   if (n > MAX_N) {
       resultDiv.textContent = `Please enter a smaller N (<= ${MAX_N}) to avoid performance issues.`;
       nInput.classList.add("error-input");
       return;
   }


  const primes = [];
  let count = 0;
  let num = 2;

  while (count < n) {
    if (_isPrime(num)) {
      primes.push(num);
      count++;
    }
    num++;
  }

  resultDiv.innerHTML = `<div>First ${n} prime numbers:</div>`;
  resultDiv.innerHTML += `<div class="prime-results">${primes.join(", ")}</div>`;
}

// Add CSS for error highlighting dynamically
const style = document.createElement('style');
style.innerHTML = `
  .error-input {
    border-color: #dc3545 !important; /* Use !important to override other styles if needed */
    background-color: #f8d7da !important;
  }
  .prime-results {
      word-break: break-all; /* Help long lists wrap */
  }
`;
document.head.appendChild(style);
