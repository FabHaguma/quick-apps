// ─── API URLs ───
const url_euroBasedRatesFallback = "https://latest.currency-api.pages.dev/v1/currencies/eur.json";

// ─── State ───
let allCurrencies = null;
let euroBasedRates = null;
const QUICK_CURRENCIES = ["eur", "usd", "gbp", "rwf", "jpy", "cad", "chf", "aud", "inr", "cny"];
const HISTORY_KEY = "currencyConverterHistory";
const PREFS_KEY = "currencyConverterPrefs";

// ─── DOM refs ───
const amountInput = document.getElementById("amountInput");
const fromSelect = document.getElementById("fromCurrency");
const toSelect = document.getElementById("toCurrency");
const fromSearch = document.getElementById("fromSearch");
const toSearch = document.getElementById("toSearch");
const convertBtn = document.getElementById("convertBtn");
const swapBtn = document.getElementById("swapBtn");

const mainResult = document.getElementById("mainResult");
const resultAmount = document.getElementById("resultAmount");
const resultRate = document.getElementById("resultRate");
const resultReverse = document.getElementById("resultReverse");
const resultDate = document.getElementById("resultDate");
const copyBtn = document.getElementById("copyBtn");
const quickConversions = document.getElementById("quickConversions");
const quickList = document.getElementById("quickList");
const historySection = document.getElementById("historySection");
const historyList = document.getElementById("historyList");
const clearHistoryBtn = document.getElementById("clearHistoryBtn");

// ─── Helpers ───

function formUrlForToday() {
  const d = new Date();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@${d.getFullYear()}-${month}-${day}/v1/currencies/eur.json`;
}

async function fetchData(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("Fetch failed");
    return await res.json();
  } catch (e) {
    console.warn("Fetch error:", url, e);
    return null;
  }
}

async function ensureDataLoaded() {
  if (!allCurrencies) {
    allCurrencies = await fetchData("./currencies.json");
  }
  if (!euroBasedRates) {
    euroBasedRates = await fetchData(formUrlForToday());
  }
  if (!euroBasedRates) {
    euroBasedRates = await fetchData(url_euroBasedRatesFallback);
  }
}

function getRate(code) {
  if (!euroBasedRates || !euroBasedRates.eur) return null;
  if (code === "eur") return 1;
  return euroBasedRates.eur[code] ?? null;
}

function convert(amount, fromCode, toCode) {
  const fromRate = getRate(fromCode);
  const toRate = getRate(toCode);
  if (!fromRate || !toRate) return null;
  // amount in FROM → EUR → TO
  const euros = amount / fromRate;
  return euros * toRate;
}

function formatNumber(num) {
  if (Math.abs(num) >= 1) return num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  // For very small numbers, show more decimals
  return num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 });
}

function currencyLabel(code) {
  if (!allCurrencies) return code.toUpperCase();
  const name = allCurrencies[code];
  return name ? `${code.toUpperCase()} – ${name}` : code.toUpperCase();
}

// ─── Populate selects ───

function populateSelects(filter = "", targetSelect = null) {
  if (!allCurrencies) return;

  // Only populate real (fiat + major crypto) currencies that have names and rates
  const entries = Object.entries(allCurrencies)
    .filter(([code, name]) => name && name.length > 0 && getRate(code) !== null)
    .sort((a, b) => a[1].localeCompare(b[1]));

  const selects = targetSelect ? [targetSelect] : [fromSelect, toSelect];
  const searchTerm = filter.toLowerCase();

  selects.forEach((sel) => {
    const currentVal = sel.value;
    sel.innerHTML = "";

    entries.forEach(([code, name]) => {
      if (searchTerm && !code.includes(searchTerm) && !name.toLowerCase().includes(searchTerm)) return;
      const opt = document.createElement("option");
      opt.value = code;
      opt.textContent = `${code.toUpperCase()} – ${name}`;
      sel.appendChild(opt);
    });

    // Restore previous value if it still exists
    if (currentVal && sel.querySelector(`option[value="${currentVal}"]`)) {
      sel.value = currentVal;
    }
  });
}

// ─── Conversion ───

async function doConvert() {
  const amount = parseFloat(amountInput.value);
  if (isNaN(amount) || amount <= 0) {
    showError("Please enter a valid amount.");
    return;
  }

  const fromCode = fromSelect.value;
  const toCode = toSelect.value;
  if (!fromCode || !toCode) {
    showError("Please select currencies.");
    return;
  }

  mainResult.hidden = true;
  quickConversions.hidden = true;

  await ensureDataLoaded();

  const result = convert(amount, fromCode, toCode);

  if (result === null) {
    showError("Conversion rate not available.");
    return;
  }

  // Main result
  const fromLabel = fromCode.toUpperCase();
  const toLabel = toCode.toUpperCase();
  resultAmount.textContent = `${formatNumber(amount)} ${fromLabel} = ${formatNumber(result)} ${toLabel}`;

  // Rate info
  const unitRate = convert(1, fromCode, toCode);
  const reverseRate = convert(1, toCode, fromCode);
  resultRate.textContent = `1 ${fromLabel} = ${formatNumber(unitRate)} ${toLabel}`;
  resultReverse.textContent = `1 ${toLabel} = ${formatNumber(reverseRate)} ${fromLabel}`;

  // Date
  if (euroBasedRates && euroBasedRates.date) {
    resultDate.textContent = `Rates from: ${euroBasedRates.date}`;
  } else {
    resultDate.textContent = "";
  }

  mainResult.hidden = false;

  // Quick conversions to other popular currencies
  const others = QUICK_CURRENCIES.filter((c) => c !== fromCode && c !== toCode);
  quickList.innerHTML = "";
  others.forEach((c) => {
    const val = convert(amount, fromCode, c);
    if (val === null) return;
    const div = document.createElement("div");
    div.className = "quick-item";
    div.textContent = `${formatNumber(val)} ${c.toUpperCase()}`;
    div.title = `Click to set as target currency`;
    div.addEventListener("click", () => {
      toSelect.value = c;
      toSearch.value = "";
      doConvert();
    });
    quickList.appendChild(div);
  });
  quickConversions.hidden = false;

  // Save to history
  addToHistory(amount, fromCode, toCode, result);

  // Save preferences
  savePrefs(fromCode, toCode);
}

function showError(msg) {
  mainResult.hidden = false;
  quickConversions.hidden = true;
  resultAmount.textContent = msg;
  resultRate.textContent = "";
  resultReverse.textContent = "";
  resultDate.textContent = "";
}

// ─── History ───

function getHistory() {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];
  } catch {
    return [];
  }
}

function addToHistory(amount, from, to, result) {
  const history = getHistory();
  history.unshift({
    amount,
    from,
    to,
    result,
    time: new Date().toLocaleString(),
  });
  // Keep last 8
  if (history.length > 8) history.length = 8;
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  renderHistory();
}

function renderHistory() {
  const history = getHistory();
  if (history.length === 0) {
    historySection.hidden = true;
    return;
  }

  historySection.hidden = false;
  historyList.innerHTML = "";
  history.forEach((entry) => {
    const div = document.createElement("div");
    div.className = "history-item";
    div.innerHTML = `
      <span class="history-conversion">${formatNumber(entry.amount)} ${entry.from.toUpperCase()} &rarr; ${formatNumber(entry.result)} ${entry.to.toUpperCase()}</span>
      <span class="history-time">${entry.time}</span>
    `;
    div.addEventListener("click", () => {
      amountInput.value = entry.amount;
      fromSelect.value = entry.from;
      toSelect.value = entry.to;
      doConvert();
    });
    historyList.appendChild(div);
  });
}

// ─── Preferences ───

function savePrefs(from, to) {
  localStorage.setItem(PREFS_KEY, JSON.stringify({ from, to }));
}

function loadPrefs() {
  try {
    return JSON.parse(localStorage.getItem(PREFS_KEY));
  } catch {
    return null;
  }
}

// ─── Copy ───

function copyResult() {
  const text = resultAmount.textContent;
  if (!text) return;
  navigator.clipboard.writeText(text).then(() => {
    copyBtn.textContent = "Copied!";
    setTimeout(() => (copyBtn.textContent = "Copy"), 1500);
  });
}

// ─── Swap ───

function swapCurrencies() {
  const temp = fromSelect.value;
  fromSelect.value = toSelect.value;
  toSelect.value = temp;
  fromSearch.value = "";
  toSearch.value = "";
  // Auto-convert if there's already a result showing
  if (!mainResult.hidden) doConvert();
}

// ─── Quick pick chips ───

function setupChips() {
  document.querySelectorAll(".chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      const code = chip.dataset.currency;
      // Set as "To" currency (most common use case)
      toSelect.value = code;
      toSearch.value = "";
      // Highlight active chip
      document.querySelectorAll(".chip").forEach((c) => c.classList.remove("active"));
      chip.classList.add("active");
      if (!mainResult.hidden || amountInput.value) doConvert();
    });
  });
}

// ─── Search filtering for dropdowns ───

function setupSearchFilters() {
  fromSearch.addEventListener("input", () => {
    populateSelects(fromSearch.value, fromSelect);
  });
  toSearch.addEventListener("input", () => {
    populateSelects(toSearch.value, toSelect);
  });

  // Clear search on focus out to restore full list
  fromSearch.addEventListener("blur", () => {
    setTimeout(() => {
      if (!fromSearch.value) populateSelects("", fromSelect);
    }, 200);
  });
  toSearch.addEventListener("blur", () => {
    setTimeout(() => {
      if (!toSearch.value) populateSelects("", toSelect);
    }, 200);
  });
}

// ─── Init ───

async function init() {
  await ensureDataLoaded();
  populateSelects();

  // Set defaults
  const prefs = loadPrefs();
  if (prefs) {
    if (fromSelect.querySelector(`option[value="${prefs.from}"]`)) fromSelect.value = prefs.from;
    if (toSelect.querySelector(`option[value="${prefs.to}"]`)) toSelect.value = prefs.to;
  } else {
    fromSelect.value = "usd";
    toSelect.value = "eur";
  }

  // Highlight matching chip
  document.querySelectorAll(".chip").forEach((c) => {
    if (c.dataset.currency === toSelect.value) c.classList.add("active");
  });

  // Render history
  renderHistory();

  // Event listeners
  convertBtn.addEventListener("click", doConvert);
  swapBtn.addEventListener("click", swapCurrencies);
  copyBtn.addEventListener("click", copyResult);
  clearHistoryBtn.addEventListener("click", () => {
    localStorage.removeItem(HISTORY_KEY);
    renderHistory();
  });

  // Enter key
  amountInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") doConvert();
  });

  // Focus amount input
  amountInput.focus();

  setupChips();
  setupSearchFilters();
}

init();