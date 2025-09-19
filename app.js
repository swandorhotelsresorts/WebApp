const STORAGE_KEYS = {
  hotels: 'hotelData',
  markets: 'marketData',
  contracts: 'contractData',
  discounts: 'discountData',
  rates: 'exchangeRateData',
  settings: 'settingsData',
  changelog: 'changelogData',
  lastUpdated: 'lastUpdatedAt'
};

const state = {
  hotels: [],
  markets: [],
  contracts: [],
  discounts: [],
  rates: [],
  settings: null,
  changelog: [],
  mode: 'spread',
  changeMetric: 'dod',
  selectedMarkets: new Set(),
  chart: null
};

const COLORS = ['#2f80ed', '#f2994a', '#27ae60', '#bb6bd9', '#eb5757', '#56ccf2', '#f2c94c'];

const CHANGE_METRIC_ORDER = ['dod', 'wow', 'mom'];

const CHANGE_METRICS = {
  dod: {
    offset: 1,
    buttonLabel: 'Günlük',
    chartLabel: 'Günlük Değişim',
    tableLabel: 'DoD %'
  },
  wow: {
    offset: 7,
    buttonLabel: 'Haftalık',
    chartLabel: 'Haftalık Değişim',
    tableLabel: 'WoW %'
  },
  mom: {
    offset: 30,
    buttonLabel: 'Aylık',
    chartLabel: 'Aylık Değişim',
    tableLabel: 'MoM %'
  }
};

const DATE_OPTIONS = {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit'
};

document.addEventListener('DOMContentLoaded', () => {
  initializeData();
  bindNavigation();
  bindForms();
  bindFilters();
  bindActions();
  refreshUI();
});

function initializeData() {
  const existing = localStorage.getItem(STORAGE_KEYS.hotels);
  if (!existing) {
    loadSampleData();
  }
  loadStateFromStorage();
  ensureBaseMarketSelection();
  renderSelectOptions();
  renderMarketFilters();
  applySettingsToUI();
  updateLastUpdatedLabel();
}

function loadSampleData() {
  const sampleHotels = [
    { id: 'hotel-aurora', name: 'Hotel Aurora' },
    { id: 'hotel-meridian', name: 'Hotel Meridian' }
  ];

  const sampleMarkets = [
    { id: 'market-eur', name: 'Avrupa (EUR)', currency: 'EUR' },
    { id: 'market-gbp', name: 'Birleşik Krallık (GBP)', currency: 'GBP' },
    { id: 'market-try', name: 'Türkiye (TRY)', currency: 'TRY' }
  ];

  const today = Date.now();
  const sampleContracts = [
    {
      id: generateId('contract'),
      hotelId: 'hotel-aurora',
      marketId: 'market-eur',
      startDate: '2024-04-01',
      endDate: '2024-04-30',
      price: 140,
      commission: 10,
      createdAt: today - 1000
    },
    {
      id: generateId('contract'),
      hotelId: 'hotel-aurora',
      marketId: 'market-gbp',
      startDate: '2024-04-01',
      endDate: '2024-04-30',
      price: 110,
      commission: 12,
      createdAt: today - 900
    },
    {
      id: generateId('contract'),
      hotelId: 'hotel-aurora',
      marketId: 'market-try',
      startDate: '2024-04-01',
      endDate: '2024-04-30',
      price: 4200,
      commission: 8,
      createdAt: today - 800
    },
    {
      id: generateId('contract'),
      hotelId: 'hotel-meridian',
      marketId: 'market-eur',
      startDate: '2024-04-01',
      endDate: '2024-04-30',
      price: 160,
      commission: 9,
      createdAt: today - 700
    },
    {
      id: generateId('contract'),
      hotelId: 'hotel-meridian',
      marketId: 'market-gbp',
      startDate: '2024-04-01',
      endDate: '2024-04-30',
      price: 125,
      commission: 11,
      createdAt: today - 600
    },
    {
      id: generateId('contract'),
      hotelId: 'hotel-meridian',
      marketId: 'market-try',
      startDate: '2024-04-01',
      endDate: '2024-04-30',
      price: 4700,
      commission: 7,
      createdAt: today - 500
    },
    {
      id: generateId('contract'),
      hotelId: 'hotel-aurora',
      marketId: 'market-eur',
      startDate: '2024-04-15',
      endDate: '2024-04-30',
      price: 150,
      commission: 9,
      createdAt: today - 400
    },
    {
      id: generateId('contract'),
      hotelId: 'hotel-meridian',
      marketId: 'market-gbp',
      startDate: '2024-04-18',
      endDate: '2024-04-30',
      price: 130,
      commission: 10,
      createdAt: today - 300
    }
  ];

  const sampleDiscounts = [
    {
      id: generateId('discount'),
      hotelId: 'hotel-aurora',
      marketId: 'market-gbp',
      startDate: '2024-04-10',
      endDate: '2024-04-20',
      discount: 7,
      createdAt: today - 600
    },
    {
      id: generateId('discount'),
      hotelId: 'hotel-aurora',
      marketId: 'market-try',
      startDate: '2024-04-05',
      endDate: '2024-04-25',
      discount: 5,
      createdAt: today - 400
    },
    {
      id: generateId('discount'),
      hotelId: 'hotel-meridian',
      marketId: 'market-eur',
      startDate: '2024-04-12',
      endDate: '2024-04-22',
      discount: 6,
      createdAt: today - 350
    }
  ];

  const sampleRates = generateSampleRates(sampleMarkets);

  const defaultSettings = {
    baseMarket: 'market-eur',
    warningThreshold: 5,
    criticalThreshold: 10,
    theme: 'light'
  };

  const sampleChangelog = [
    createLogEntry('Sistem', 'Örnek veriler yüklendi')
  ];

  saveToStorage(STORAGE_KEYS.hotels, sampleHotels);
  saveToStorage(STORAGE_KEYS.markets, sampleMarkets);
  saveToStorage(STORAGE_KEYS.contracts, sampleContracts);
  saveToStorage(STORAGE_KEYS.discounts, sampleDiscounts);
  saveToStorage(STORAGE_KEYS.rates, sampleRates);
  saveToStorage(STORAGE_KEYS.settings, defaultSettings);
  saveToStorage(STORAGE_KEYS.changelog, sampleChangelog);
  saveLastUpdated();
}

function generateSampleRates(markets) {
  const rates = [];
  const start = new Date('2024-04-01');
  const days = 30;
  for (let i = 0; i < days; i++) {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    const dateKey = formatDate(date);
    markets.forEach(market => {
      if (market.currency === 'EUR') {
        rates.push({
          id: generateId('rate'),
          marketId: market.id,
          date: dateKey,
          rate: 1,
          createdAt: Date.now() - 200 + i
        });
        return;
      }
      const baseRate = market.currency === 'GBP' ? 1.15 : 0.028;
      const amplitude = market.currency === 'GBP' ? 0.02 : 0.0025;
      const noise = Math.sin((i + 1) / 4) * amplitude;
      const rate = +(baseRate + noise).toFixed(4);
      rates.push({
        id: generateId('rate'),
        marketId: market.id,
        date: dateKey,
        rate,
        createdAt: Date.now() - 200 + i
      });
    });
  }
  return rates;
}

function loadStateFromStorage() {
  state.hotels = loadFromStorage(STORAGE_KEYS.hotels, []);
  state.markets = loadFromStorage(STORAGE_KEYS.markets, []);
  state.contracts = loadFromStorage(STORAGE_KEYS.contracts, []);
  state.discounts = loadFromStorage(STORAGE_KEYS.discounts, []);
  state.rates = loadFromStorage(STORAGE_KEYS.rates, []);
  state.settings = loadFromStorage(STORAGE_KEYS.settings, {
    baseMarket: state.markets[0]?.id,
    warningThreshold: 5,
    criticalThreshold: 10,
    theme: 'light'
  });
  state.changelog = loadFromStorage(STORAGE_KEYS.changelog, []);
  const initialMarkets = state.markets.map(m => m.id);
  state.selectedMarkets = new Set(initialMarkets);
}

function ensureBaseMarketSelection() {
  if (!state.settings.baseMarket) {
    state.settings.baseMarket = state.markets[0]?.id || null;
    saveToStorage(STORAGE_KEYS.settings, state.settings);
  }
}

function bindNavigation() {
  document.querySelectorAll('.sidebar-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.sidebar-tab').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const target = btn.dataset.target;
      document.querySelectorAll('.view').forEach(view => {
        view.classList.toggle('active', view.id === target);
      });
    });
  });
}

function bindForms() {
  const contractForm = document.getElementById('contractForm');
  contractForm.addEventListener('submit', event => {
    event.preventDefault();
    const formData = new FormData(contractForm);
    const payload = Object.fromEntries(formData.entries());
    const contract = {
      id: generateId('contract'),
      hotelId: payload.hotelId,
      marketId: payload.marketId,
      startDate: payload.startDate,
      endDate: payload.endDate,
      price: parseFloat(payload.price),
      commission: parseFloat(payload.commission || '0'),
      createdAt: Date.now()
    };
    state.contracts.push(contract);
    saveToStorage(STORAGE_KEYS.contracts, state.contracts);
    addChangelog('Kontrat', `${getHotelName(contract.hotelId)} - ${getMarketName(contract.marketId)} kontratı eklendi (${contract.startDate} - ${contract.endDate})`);
    saveLastUpdated();
    renderDataLists();
    refreshDashboard();
    contractForm.reset();
  });

  const discountForm = document.getElementById('discountForm');
  discountForm.addEventListener('submit', event => {
    event.preventDefault();
    const formData = new FormData(discountForm);
    const payload = Object.fromEntries(formData.entries());
    const discount = {
      id: generateId('discount'),
      hotelId: payload.hotelId,
      marketId: payload.marketId,
      startDate: payload.startDate,
      endDate: payload.endDate,
      discount: parseFloat(payload.discount),
      createdAt: Date.now()
    };
    state.discounts.push(discount);
    saveToStorage(STORAGE_KEYS.discounts, state.discounts);
    addChangelog('İndirim', `${getHotelName(discount.hotelId)} - ${getMarketName(discount.marketId)} için indirim eklendi (${discount.discount}% ${discount.startDate} - ${discount.endDate})`);
    saveLastUpdated();
    renderDataLists();
    refreshDashboard();
    discountForm.reset();
  });

  const rateForm = document.getElementById('rateForm');
  rateForm.addEventListener('submit', event => {
    event.preventDefault();
    const formData = new FormData(rateForm);
    const payload = Object.fromEntries(formData.entries());
    const rate = {
      id: generateId('rate'),
      marketId: payload.marketId,
      date: payload.date,
      rate: parseFloat(payload.rate),
      createdAt: Date.now()
    };
    state.rates.push(rate);
    saveToStorage(STORAGE_KEYS.rates, state.rates);
    addChangelog('Kur', `${getMarketName(rate.marketId)} için ${rate.date} tarihli kur bilgisi (${rate.rate}) eklendi`);
    saveLastUpdated();
    renderDataLists();
    refreshDashboard();
    rateForm.reset();
  });

  const settingsForm = document.getElementById('settingsForm');
  settingsForm.addEventListener('submit', event => {
    event.preventDefault();
    const formData = new FormData(settingsForm);
    const payload = Object.fromEntries(formData.entries());
    state.settings = {
      baseMarket: payload.baseMarket,
      warningThreshold: parseFloat(payload.warningThreshold || '0'),
      criticalThreshold: parseFloat(payload.criticalThreshold || '0'),
      theme: payload.theme
    };
    saveToStorage(STORAGE_KEYS.settings, state.settings);
    applyTheme();
    addChangelog('Ayar', `Baz pazar ${getMarketName(state.settings.baseMarket)} olarak güncellendi, eşikler ${state.settings.warningThreshold}% / ${state.settings.criticalThreshold}%, tema ${state.settings.theme}`);
    saveLastUpdated();
    refreshDashboard();
  });
}

function bindFilters() {
  const hotelSelect = document.getElementById('hotelSelect');
  hotelSelect.addEventListener('change', refreshDashboard);

  document.getElementById('dateStart').addEventListener('change', refreshDashboard);
  document.getElementById('dateEnd').addEventListener('change', refreshDashboard);

  document.querySelectorAll('.mode-button').forEach(button => {
    button.addEventListener('click', () => {
      document.querySelectorAll('.mode-button').forEach(b => b.classList.remove('active'));
      button.classList.add('active');
      state.mode = button.dataset.mode;
      updateModeUI();
      refreshDashboard();
    });
  });

  document.querySelectorAll('.change-metric-button').forEach(button => {
    button.addEventListener('click', () => {
      if (state.changeMetric === button.dataset.metric) {
        return;
      }
      document.querySelectorAll('.change-metric-button').forEach(b => b.classList.remove('active'));
      button.classList.add('active');
      state.changeMetric = button.dataset.metric;
      refreshDashboard();
    });
  });
}

function bindActions() {
  document.getElementById('exportCsv').addEventListener('click', exportCsv);
  document.getElementById('resetData').addEventListener('click', () => {
    if (confirm('Tüm veriler silinecek ve örnek veriler yeniden yüklenecek. Devam etmek istiyor musunuz?')) {
      Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
      loadSampleData();
      loadStateFromStorage();
      ensureBaseMarketSelection();
      renderSelectOptions();
      renderMarketFilters();
      applySettingsToUI();
      renderDataLists();
      refreshDashboard();
    }
  });
}

function loadFromStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (error) {
    console.error('Storage load error', key, error);
    return fallback;
  }
}

function saveToStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function saveLastUpdated() {
  const timestamp = new Date().toISOString();
  localStorage.setItem(STORAGE_KEYS.lastUpdated, timestamp);
  updateLastUpdatedLabel();
}

function updateLastUpdatedLabel() {
  const element = document.getElementById('lastUpdated');
  if (!element) return;
  const timestamp = localStorage.getItem(STORAGE_KEYS.lastUpdated);
  element.textContent = timestamp ? new Date(timestamp).toLocaleString('tr-TR') : '-';
}

function renderSelectOptions() {
  const hotelOptions = state.hotels.map(hotel => `<option value="${hotel.id}">${hotel.name}</option>`).join('');
  document.getElementById('hotelSelect').innerHTML = hotelOptions;

  document.querySelectorAll('#contractForm select[name="hotelId"], #discountForm select[name="hotelId"]').forEach(select => {
    select.innerHTML = hotelOptions;
  });

  const marketOptions = state.markets.map(market => `<option value="${market.id}">${market.name}</option>`).join('');
  document.querySelectorAll('#contractForm select[name="marketId"], #discountForm select[name="marketId"], #rateForm select[name="marketId"], #settingsForm select[name="baseMarket"]').forEach(select => {
    select.innerHTML = marketOptions;
  });

  document.getElementById('settingsForm').elements.baseMarket.value = state.settings.baseMarket;
  document.getElementById('hotelSelect').value = state.hotels[0]?.id || '';
}

function renderMarketFilters() {
  const container = document.getElementById('marketFilters');
  container.innerHTML = '';
  state.markets.forEach((market, index) => {
    const id = `market-filter-${index}`;
    const label = document.createElement('label');
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.id = id;
    input.value = market.id;
    input.checked = state.selectedMarkets.has(market.id);
    input.addEventListener('change', () => {
      if (input.checked) {
        state.selectedMarkets.add(market.id);
      } else {
        state.selectedMarkets.delete(market.id);
      }
      refreshDashboard();
    });
    label.setAttribute('for', id);
    label.appendChild(input);
    label.append(` ${market.name}`);
    container.appendChild(label);
  });
}

function applySettingsToUI() {
  const settingsForm = document.getElementById('settingsForm');
  settingsForm.elements.baseMarket.value = state.settings.baseMarket;
  settingsForm.elements.warningThreshold.value = state.settings.warningThreshold;
  settingsForm.elements.criticalThreshold.value = state.settings.criticalThreshold;
  settingsForm.elements.theme.value = state.settings.theme;
  applyTheme();
}

function applyTheme() {
  document.documentElement.setAttribute('data-theme', state.settings.theme);
}

function updateModeUI() {
  const group = document.getElementById('changeMetricGroup');
  if (!group) {
    return;
  }
  const isChangeMode = state.mode === 'change';
  group.classList.toggle('is-hidden', !isChangeMode);
  if (isChangeMode) {
    document.querySelectorAll('.change-metric-button').forEach(button => {
      button.classList.toggle('active', button.dataset.metric === state.changeMetric);
    });
  }
}

function refreshUI() {
  renderDataLists();
  initializeFilters();
  updateModeUI();
  refreshDashboard();
  renderAuditLog();
}

function renderDataLists() {
  const contractList = document.getElementById('contractList');
  const discountList = document.getElementById('discountList');
  const rateList = document.getElementById('rateList');

  contractList.innerHTML = state.contracts
    .slice()
    .sort((a, b) => b.createdAt - a.createdAt)
    .map(contract => `
      <div class="list-item">
        <span><strong>${getHotelName(contract.hotelId)}</strong> / ${getMarketName(contract.marketId)}</span>
        <span>${contract.startDate} → ${contract.endDate}</span>
        <span>Kişi Başı: ${formatNumber(contract.price)} (${getMarketCurrency(contract.marketId)})</span>
        <span>Komisyon: %${formatNumber(contract.commission)}</span>
        <span>Eklenme: ${formatDateTime(contract.createdAt)}</span>
      </div>`)
    .join('');

  discountList.innerHTML = state.discounts
    .slice()
    .sort((a, b) => b.createdAt - a.createdAt)
    .map(discount => `
      <div class="list-item">
        <span><strong>${getHotelName(discount.hotelId)}</strong> / ${getMarketName(discount.marketId)}</span>
        <span>${discount.startDate} → ${discount.endDate}</span>
        <span>İndirim: %${formatNumber(discount.discount)}</span>
        <span>Eklenme: ${formatDateTime(discount.createdAt)}</span>
      </div>`)
    .join('');

  rateList.innerHTML = state.rates
    .slice()
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .map(rate => `
      <div class="list-item">
        <span><strong>${getMarketName(rate.marketId)}</strong></span>
        <span>${rate.date}</span>
        <span>EUR karşılığı: ${formatNumber(rate.rate)}</span>
      </div>`)
    .join('');
}

function initializeFilters() {
  const startInput = document.getElementById('dateStart');
  const endInput = document.getElementById('dateEnd');
  const allDates = state.contracts.flatMap(contract => [contract.startDate, contract.endDate]);
  const minDate = allDates.length ? allDates.reduce((min, current) => (current < min ? current : min)) : formatDate(new Date());
  const maxDate = allDates.length ? allDates.reduce((max, current) => (current > max ? current : max)) : formatDate(new Date());
  startInput.value = startInput.value || minDate;
  endInput.value = endInput.value || maxDate;
}

function refreshDashboard() {
  updateModeUI();
  const hotelId = document.getElementById('hotelSelect').value;
  const startDate = document.getElementById('dateStart').value;
  const endDate = document.getElementById('dateEnd').value;
  if (!hotelId || !startDate || !endDate) {
    return;
  }

  const dateRange = generateDateRange(startDate, endDate);
  const selectedMarkets = Array.from(state.selectedMarkets);
  if (selectedMarkets.length === 0) {
    return;
  }

  const datasets = calculateDatasets(hotelId, dateRange, selectedMarkets);
  updateSummaryCards(datasets);
  updateChart(dateRange, datasets);
  updateTable(dateRange, datasets);
}

function calculateDatasets(hotelId, dateRange, marketIds) {
  const baseMarketId = state.settings.baseMarket;
  const result = {};
  marketIds.forEach((marketId, index) => {
    const prices = dateRange.map(date => calculateNetPriceEUR(hotelId, marketId, date));
    const colorIndex = state.markets.findIndex(market => market.id === marketId);
    const color = colorIndex >= 0 ? COLORS[colorIndex % COLORS.length] : COLORS[index % COLORS.length];
    result[marketId] = {
      prices,
      color
    };
  });

  if (!result[baseMarketId]) {
    const prices = dateRange.map(date => calculateNetPriceEUR(hotelId, baseMarketId, date));
    const colorIndex = state.markets.findIndex(market => market.id === baseMarketId);
    const color = colorIndex >= 0
      ? COLORS[colorIndex % COLORS.length]
      : COLORS[marketIds.length % COLORS.length];
    result[baseMarketId] = {
      prices,
      color
    };
  }

  return result;
}

function calculateNetPriceEUR(hotelId, marketId, date) {
  const contract = findLatestRecord(state.contracts, record => record.hotelId === hotelId && record.marketId === marketId && isWithin(date, record.startDate, record.endDate));
  if (!contract) {
    return null;
  }

  const discount = findLatestRecord(state.discounts, record => record.hotelId === hotelId && record.marketId === marketId && isWithin(date, record.startDate, record.endDate));
  const commissionRate = isFinite(contract.commission) ? contract.commission : 0;
  const discountRate = discount ? discount.discount : 0;
  let netPrice = contract.price;
  netPrice *= (1 - commissionRate / 100);
  if (discountRate) {
    netPrice *= (1 - discountRate / 100);
  }
  const rate = findExchangeRate(marketId, date);
  if (!rate) {
    return null;
  }
  const priceEUR = netPrice * rate;
  return +priceEUR.toFixed(2);
}

function findLatestRecord(list, predicate) {
  return list
    .filter(predicate)
    .sort((a, b) => b.createdAt - a.createdAt)[0];
}

function findExchangeRate(marketId, date) {
  const market = state.markets.find(m => m.id === marketId);
  if (!market) return null;
  if (market.currency === 'EUR') return 1;
  const rates = state.rates
    .filter(rate => rate.marketId === marketId)
    .sort((a, b) => new Date(a.date) - new Date(b.date));
  if (rates.length === 0) return null;
  const targetDate = new Date(date);
  let closestRate = null;
  for (let i = 0; i < rates.length; i++) {
    const rateDate = new Date(rates[i].date);
    if (rateDate.getTime() === targetDate.getTime()) {
      closestRate = rates[i];
      break;
    }
    if (rateDate < targetDate) {
      closestRate = rates[i];
    }
    if (rateDate > targetDate) {
      break;
    }
  }
  return closestRate ? closestRate.rate : null;
}

function updateSummaryCards(datasets) {
  const container = document.getElementById('summaryCards');
  container.innerHTML = '';
  const baseMarketId = state.settings.baseMarket;
  const entries = getOrderedDatasetEntries(datasets);
  const metricConfig = CHANGE_METRICS[state.changeMetric] || CHANGE_METRICS.dod;

  entries.forEach(([marketId, dataset]) => {
    const card = document.createElement('article');
    card.className = 'summary-card';

    let bodyHtml = '';
    if (state.mode === 'spread') {
      const prices = dataset.prices.filter(value => value !== null);
      const stats = calculateStats(prices);
      bodyHtml = `
        <span>Ortalama Fiyat: <strong>${formatCurrency(stats.average)}</strong></span>
        <span>Minimum: <strong>${formatCurrency(stats.min)}</strong></span>
        <span>Maksimum: <strong>${formatCurrency(stats.max)}</strong></span>
        <span>Volatilite (σ): <strong>${formatCurrency(stats.volatility)}</strong></span>
      `;
    } else {
      const changes = calculateChangeSeries(dataset.prices, metricConfig.offset).filter(value => value !== null);
      const stats = calculateStats(changes);
      bodyHtml = `
        <span>Değişim Türü: <strong>${metricConfig.chartLabel}</strong></span>
        <span>Ortalama: <strong>${formatPercent(stats.average)}</strong></span>
        <span>Minimum: <strong>${formatPercent(stats.min)}</strong></span>
        <span>Maksimum: <strong>${formatPercent(stats.max)}</strong></span>
        <span>Volatilite (σ): <strong>${formatPercent(stats.volatility, { showSign: false })}</strong></span>
      `;
    }

    card.innerHTML = `
      <h3>${getMarketName(marketId)}${marketId === baseMarketId ? ' (Baz)' : ''}</h3>
      ${bodyHtml}
    `;
    container.appendChild(card);
  });
}

function updateChart(dateRange, datasets) {
  const ctx = document.getElementById('priceChart').getContext('2d');
  const labels = dateRange.map(date => new Date(date).toLocaleDateString('tr-TR'));
  const data = [];
  const baseMarketId = state.settings.baseMarket;
  const entries = getOrderedDatasetEntries(datasets);
  const activeMetricConfig = CHANGE_METRICS[state.changeMetric] || CHANGE_METRICS.dod;

  if (state.mode === 'spread') {
    const basePrices = datasets[baseMarketId]?.prices || [];
    entries.forEach(([marketId, dataset]) => {
      if (marketId === baseMarketId) return;
      const spreadValues = dataset.prices.map((value, index) => {
        const baseValue = basePrices[index];
        if (value === null || baseValue === null || baseValue === undefined) return null;
        return +(value - baseValue).toFixed(2);
      });
      data.push({
        label: `${getMarketName(marketId)} - Spread`,
        data: spreadValues,
        borderColor: dataset.color,
        backgroundColor: dataset.color,
        tension: 0.25
      });
    });
  } else {
    entries.forEach(([marketId, dataset]) => {
      const changeValues = calculateChangeSeries(dataset.prices, activeMetricConfig.offset);
      data.push({
        label: `${getMarketName(marketId)} ${activeMetricConfig.tableLabel}`,
        data: changeValues,
        borderColor: dataset.color,
        backgroundColor: dataset.color,
        tension: 0.25
      });
    });
  }

  if (state.chart) {
    state.chart.destroy();
  }

  state.chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: data
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      scales: {
        y: {
          ticks: {
            callback: value => state.mode === 'spread' ? `${value.toFixed(2)} €` : `${value.toFixed(2)}%`
          },
          title: {
            display: true,
            text: state.mode === 'spread'
              ? 'Spread (EUR)'
              : `${activeMetricConfig.chartLabel} (%)`
          }
        }
      },
      plugins: {
        legend: {
          position: 'bottom'
        },
        tooltip: {
          callbacks: {
            label: context => {
              const value = context.parsed.y;
              if (value === null || value === undefined) {
                return `${context.dataset.label}: veri yok`;
              }
              return state.mode === 'spread'
                ? `${context.dataset.label}: ${formatCurrency(value)}`
                : `${context.dataset.label}: ${formatPercent(value)}`;
            }
          }
        }
      }
    }
  });
}

function updateTable(dateRange, datasets) {
  const tableHead = document.querySelector('#resultTable thead');
  const tableBody = document.querySelector('#resultTable tbody');
  tableHead.innerHTML = '';
  tableBody.innerHTML = '';
  const baseMarketId = state.settings.baseMarket;
  const entries = getOrderedDatasetEntries(datasets);
  const otherEntries = entries.filter(([marketId]) => marketId !== baseMarketId);

  if (state.mode === 'spread') {
    const headRow = document.createElement('tr');
    headRow.innerHTML = `
      <th>Tarih</th>
      <th>${getMarketName(baseMarketId)} (EUR)</th>
      ${otherEntries.map(([id]) => `<th>${getMarketName(id)} (EUR)</th><th>${getMarketName(id)} Spread</th>`).join('')}
    `;
    tableHead.appendChild(headRow);

    dateRange.forEach((date, index) => {
      const row = document.createElement('tr');
      const baseValue = datasets[baseMarketId]?.prices[index] ?? null;
      let rowHtml = `<td>${new Date(date).toLocaleDateString('tr-TR')}</td>`;
      rowHtml += `<td>${baseValue !== null ? formatCurrency(baseValue) : '-'}</td>`;
      otherEntries.forEach(([id]) => {
        const marketValue = datasets[id]?.prices[index] ?? null;
        const spreadValue = (marketValue !== null && baseValue !== null)
          ? +(marketValue - baseValue).toFixed(2)
          : null;
        rowHtml += `<td>${marketValue !== null ? formatCurrency(marketValue) : '-'}</td>`;
        rowHtml += `<td>${spreadValue !== null ? formatCurrency(spreadValue) : '-'}</td>`;
      });
      row.innerHTML = rowHtml;
      tableBody.appendChild(row);
    });
  } else {
    const headRow = document.createElement('tr');
    headRow.innerHTML = `
      <th>Tarih</th>
      ${entries.map(([id]) => CHANGE_METRIC_ORDER.map(metricKey => `<th>${getMarketName(id)} ${CHANGE_METRICS[metricKey].tableLabel}</th>`).join('')).join('')}
    `;
    tableHead.appendChild(headRow);

    const thresholds = {
      warning: state.settings.warningThreshold,
      critical: state.settings.criticalThreshold
    };

    dateRange.forEach((date, index) => {
      const row = document.createElement('tr');
      let rowHtml = `<td>${new Date(date).toLocaleDateString('tr-TR')}</td>`;
      entries.forEach(([marketId, dataset]) => {
        CHANGE_METRIC_ORDER.forEach(metricKey => {
          const metric = CHANGE_METRICS[metricKey];
          const change = calculateChangePercent(dataset.prices, index, metric.offset);
          rowHtml += formatChangeCell(change, thresholds);
        });
      });
      row.innerHTML = rowHtml;
      tableBody.appendChild(row);
    });
  }
}

function calculateChangePercent(series, index, offset) {
  if (index - offset < 0) return null;
  const current = series[index];
  const previous = series[index - offset];
  if (current === null || previous === null || previous === 0) return null;
  return +(((current - previous) / previous) * 100).toFixed(2);
}

function calculateChangeSeries(series, offset) {
  return series.map((_, index) => calculateChangePercent(series, index, offset));
}

function formatChangeCell(value, thresholds) {
  if (value === null) {
    return '<td>-</td>';
  }
  let cls = '';
  if (Math.abs(value) >= thresholds.critical) {
    cls = 'badge-critical';
  } else if (Math.abs(value) >= thresholds.warning) {
    cls = 'badge-warning';
  }
  return `<td class="${cls}">${formatPercent(value)}</td>`;
}

function exportCsv() {
  const hotelId = document.getElementById('hotelSelect').value;
  const startDate = document.getElementById('dateStart').value;
  const endDate = document.getElementById('dateEnd').value;
  if (!hotelId || !startDate || !endDate) return;
  const dateRange = generateDateRange(startDate, endDate);
  const selectedMarkets = Array.from(state.selectedMarkets);
  const datasets = calculateDatasets(hotelId, dateRange, selectedMarkets);
  const baseMarketId = state.settings.baseMarket;
  const entries = getOrderedDatasetEntries(datasets);
  let csv = '';

  if (state.mode === 'spread') {
    const headers = ['Tarih', `${getMarketName(baseMarketId)} (EUR)`];
    entries.forEach(([id]) => {
      if (id === baseMarketId) return;
      headers.push(`${getMarketName(id)} (EUR)`);
      headers.push(`${getMarketName(id)} Spread`);
    });
    csv += headers.join(',') + '\n';
    dateRange.forEach((date, index) => {
      const row = [date];
      const baseValue = datasets[baseMarketId]?.prices[index] ?? null;
      row.push(baseValue !== null ? baseValue.toFixed(2) : '');
      entries.forEach(([id]) => {
        if (id === baseMarketId) return;
        const marketValue = datasets[id]?.prices[index] ?? null;
        const spreadValue = (marketValue !== null && baseValue !== null)
          ? +(marketValue - baseValue).toFixed(2)
          : null;
        row.push(marketValue !== null ? marketValue.toFixed(2) : '');
        row.push(spreadValue !== null ? spreadValue.toFixed(2) : '');
      });
      csv += row.join(',') + '\n';
    });
  } else {
    const headers = ['Tarih'];
    entries.forEach(([id]) => {
      CHANGE_METRIC_ORDER.forEach(metricKey => {
        headers.push(`${getMarketName(id)} ${CHANGE_METRICS[metricKey].tableLabel}`);
      });
    });
    csv += headers.join(',') + '\n';
    dateRange.forEach((date, index) => {
      const row = [date];
      entries.forEach(([, dataset]) => {
        CHANGE_METRIC_ORDER.forEach(metricKey => {
          const metric = CHANGE_METRICS[metricKey];
          const change = calculateChangePercent(dataset.prices, index, metric.offset);
          row.push(change !== null ? change.toFixed(2) : '');
        });
      });
      csv += row.join(',') + '\n';
    });
  }

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `dashboard-${state.mode}-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

function renderAuditLog() {
  const list = document.getElementById('auditList');
  list.innerHTML = state.changelog
    .slice()
    .sort((a, b) => b.timestamp - a.timestamp)
    .map(entry => `
      <li class="audit-item">
        <strong>${entry.type}</strong>
        <span>${entry.message}</span>
        <time>${new Date(entry.timestamp).toLocaleString('tr-TR')}</time>
      </li>
    `)
    .join('');
}

function addChangelog(type, message) {
  const entry = createLogEntry(type, message);
  state.changelog.push(entry);
  saveToStorage(STORAGE_KEYS.changelog, state.changelog);
  renderAuditLog();
}

function createLogEntry(type, message) {
  return {
    id: generateId('log'),
    type,
    message,
    timestamp: Date.now()
  };
}

function generateId(prefix) {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}-${Date.now().toString(36)}`;
}

function getHotelName(id) {
  return state.hotels.find(hotel => hotel.id === id)?.name || 'Bilinmeyen Otel';
}

function getMarketName(id) {
  return state.markets.find(market => market.id === id)?.name || 'Bilinmeyen Pazar';
}

function getMarketCurrency(id) {
  return state.markets.find(market => market.id === id)?.currency || '-';
}

function calculateStats(values) {
  if (!values || values.length === 0) {
    return { average: null, min: null, max: null, volatility: null };
  }
  const sum = values.reduce((total, value) => total + value, 0);
  const average = sum / values.length;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const variance = values.reduce((total, value) => total + Math.pow(value - average, 2), 0) / values.length;
  const volatility = Math.sqrt(variance);
  return { average, min, max, volatility };
}

function formatCurrency(value) {
  if (value === null || value === undefined || isNaN(value)) return '-';
  return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 2 }).format(value);
}

function formatNumber(value) {
  if (value === null || value === undefined || isNaN(value)) return '-';
  return new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 2 }).format(value);
}

function formatPercent(value, options = {}) {
  if (value === null || value === undefined || isNaN(value)) return '-';
  const { showSign = true } = options;
  const fixed = value.toFixed(2);
  if (!showSign) {
    return `${fixed}%`;
  }
  return value > 0 ? `+${fixed}%` : `${fixed}%`;
}

function getOrderedDatasetEntries(datasets) {
  const orderMap = new Map(state.markets.map((market, index) => [market.id, index]));
  return Object.entries(datasets).sort((a, b) => {
    if (a[0] === state.settings.baseMarket) return -1;
    if (b[0] === state.settings.baseMarket) return 1;
    const orderA = orderMap.get(a[0]) ?? Number.MAX_SAFE_INTEGER;
    const orderB = orderMap.get(b[0]) ?? Number.MAX_SAFE_INTEGER;
    return orderA - orderB;
  });
}

function formatDate(date) {
  if (date instanceof Date) {
    return date.toISOString().slice(0, 10);
  }
  return date;
}

function formatDateTime(timestamp) {
  return new Date(timestamp).toLocaleString('tr-TR', DATE_OPTIONS);
}

function generateDateRange(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const range = [];
  for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
    range.push(formatDate(date));
  }
  return range;
}

function isWithin(date, start, end) {
  return date >= start && date <= end;
}
