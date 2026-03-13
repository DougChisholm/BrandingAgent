/**
 * Swinton Go! Insurance – Application JavaScript
 * Handles: form navigation, title button selection,
 *          stubbed API calls, sessionStorage persistence,
 *          progress nav highlighting, tab switching,
 *          add-on toggles, payment method toggle
 */

(function () {
  'use strict';

  /* ============================================================
     SESSION STORAGE HELPERS
     ============================================================ */
  const store = {
    set: (key, value) => sessionStorage.setItem('swinton_' + key, JSON.stringify(value)),
    get: (key) => {
      try { return JSON.parse(sessionStorage.getItem('swinton_' + key)); } catch { return null; }
    },
    setForm: (data) => {
      const existing = store.get('formData') || {};
      store.set('formData', Object.assign({}, existing, data));
    },
    getForm: () => store.get('formData') || {}
  };

  /* ============================================================
     STUBBED API CALLS
     ============================================================ */
  const api = {
    /**
     * Stub vehicle lookup – returns dummy Ford Focus data
     * @param {string} reg
     * @returns {Promise<object>}
     */
    lookupVehicle: (reg) => new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          registration: reg.toUpperCase() || 'SG19 SWT',
          make: 'Ford',
          model: 'Focus',
          year: 2019,
          variant: '1.0T EcoBoost 125ps Titanium',
          fuelType: 'Petrol',
          engineSize: '999cc',
          colour: 'Silver',
          doors: 5,
          transmission: 'Manual'
        });
      }, 800);
    }),

    /**
     * Stub quote API – returns dummy pricing
     * @param {object} formData
     * @returns {Promise<object>}
     */
    getQuote: (formData) => new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          quoteNumber: 'P9Q461694',
          annual: {
            premium: 294.87,
            ipt: 26.81
          },
          monthly: {
            deposit: 55.03,
            instalments: 11,
            instalmentAmount: 23.24,
            totalPayable: 311.76,
            apr: 23.9,
            creditAmount: 214.94,
            interest: 30.25
          },
          cover: {
            type: 'Comprehensive',
            startDate: '20th November 2026',
            ncd: '9 years or more',
            voluntaryExcess: 300,
            compulsoryExcess: 150,
            totalExcess: 450
          }
        });
      }, 1200);
    }),

    /**
     * Stub address lookup
     * @param {string} postcode
     * @returns {Promise<Array>}
     */
    lookupAddress: (postcode) => new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          '12 Maple Street, Manchester, M1 1AA',
          '14 Maple Street, Manchester, M1 1AA',
          '16 Maple Street, Manchester, M1 1AA',
          '18 Maple Street, Manchester, M1 1AA'
        ]);
      }, 600);
    })
  };

  /* ============================================================
     TITLE BUTTON SELECTION
     ============================================================ */
  function initTitleButtons() {
    document.querySelectorAll('.title-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.title-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        store.setForm({ title: btn.dataset.value || btn.textContent.trim() });
      });
    });
  }

  /* ============================================================
     FORM PERSISTENCE (auto-save inputs to sessionStorage)
     ============================================================ */
  function initFormPersistence() {
    const inputs = document.querySelectorAll('input[name], select[name], textarea[name]');
    const formData = store.getForm();

    // Restore saved values
    inputs.forEach((el) => {
      const saved = formData[el.name];
      if (saved !== undefined) {
        if (el.type === 'checkbox' || el.type === 'radio') {
          el.checked = el.value === saved || saved === true;
        } else {
          el.value = saved;
        }
      }
    });

    // Save on change
    inputs.forEach((el) => {
      el.addEventListener('change', () => {
        const update = {};
        if (el.type === 'checkbox') {
          update[el.name] = el.checked;
        } else if (el.type === 'radio') {
          if (el.checked) update[el.name] = el.value;
        } else {
          update[el.name] = el.value;
        }
        store.setForm(update);
      });
    });
  }

  /* ============================================================
     VEHICLE LOOKUP FORM
     ============================================================ */
  function initVehicleLookup() {
    const form = document.getElementById('vehicleLookupForm');
    if (!form) return;

    const regInput = document.getElementById('regInput');
    const btn = document.getElementById('findCarBtn');
    const errorEl = document.getElementById('lookupError');
    const loadingEl = document.getElementById('lookupLoading');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const reg = regInput ? regInput.value.trim() : '';
      if (!reg) {
        if (errorEl) { errorEl.textContent = 'Please enter a registration number.'; errorEl.style.display = 'block'; }
        return;
      }
      if (errorEl) errorEl.style.display = 'none';
      if (loadingEl) loadingEl.style.display = 'block';
      if (btn) btn.disabled = true;

      try {
        const vehicle = await api.lookupVehicle(reg);
        store.set('vehicle', vehicle);
        window.location.href = 'vehicle-details.html';
      } catch (err) {
        if (errorEl) { errorEl.textContent = 'Could not look up vehicle. Please try again.'; errorEl.style.display = 'block'; }
      } finally {
        if (loadingEl) loadingEl.style.display = 'none';
        if (btn) btn.disabled = false;
      }
    });
  }

  /* ============================================================
     VEHICLE DETAILS PAGE – populate from store
     ============================================================ */
  function initVehicleDetails() {
    const container = document.getElementById('vehicleDetailsContent');
    if (!container) return;

    const vehicle = store.get('vehicle') || {
      registration: 'SG19 SWT',
      make: 'Ford',
      model: 'Focus',
      year: 2019,
      variant: '1.0T EcoBoost 125ps Titanium',
      fuelType: 'Petrol',
      engineSize: '999cc',
      colour: 'Silver',
      transmission: 'Manual'
    };

    // Populate display fields
    const setField = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    setField('vd-reg', vehicle.registration);
    setField('vd-make', vehicle.make);
    setField('vd-model', vehicle.model);
    setField('vd-year', vehicle.year);
    setField('vd-variant', vehicle.variant);
    setField('vd-fuel', vehicle.fuelType);
    setField('vd-engine', vehicle.engineSize);
    setField('vd-colour', vehicle.colour);
    setField('vd-transmission', vehicle.transmission);
    // Sync detail-table cells that mirror the header display values
    setField('vd-make-td', vehicle.make);
    setField('vd-model-td', vehicle.model);
    setField('vd-year-td', vehicle.year);
  }

  /* ============================================================
     QUOTE / PRICE PRESENTATION – populate from store
     ============================================================ */
  function initPriceDisplay() {
    const quoteData = store.get('quoteData') || {
      quoteNumber: 'P9Q461694',
      annual: { premium: 294.87 },
      monthly: { deposit: 55.03, instalments: 11, instalmentAmount: 23.24, totalPayable: 311.76, apr: 23.9, creditAmount: 214.94, interest: 30.25 },
      cover: { type: 'Comprehensive', startDate: '20th November 2026', ncd: '9 years or more', voluntaryExcess: 300, compulsoryExcess: 150, totalExcess: 450 }
    };

    const setField = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    setField('q-number', quoteData.quoteNumber);
    // q-monthly, q-monthly2 (price-presentation duplicate) and q-annual
    setField('q-monthly', '£' + quoteData.monthly.instalmentAmount.toFixed(2));
    setField('q-monthly2', '£' + quoteData.monthly.instalmentAmount.toFixed(2));
    setField('q-instalments', quoteData.monthly.instalments);
    setField('q-deposit', '£' + quoteData.monthly.deposit.toFixed(2));
    setField('q-total-payable', '£' + quoteData.monthly.totalPayable.toFixed(2));
    setField('q-apr', quoteData.monthly.apr);
    setField('q-credit', '£' + quoteData.monthly.creditAmount.toFixed(2));
    setField('q-interest', '£' + quoteData.monthly.interest.toFixed(2));
    setField('q-annual', '£' + quoteData.annual.premium.toFixed(2));
    setField('q-cover-type', quoteData.cover.type);
    setField('q-start-date', quoteData.cover.startDate);
    setField('q-ncd', quoteData.cover.ncd);
    setField('q-vol-excess', '£' + quoteData.cover.voluntaryExcess);
    setField('q-comp-excess', '£' + quoteData.cover.compulsoryExcess);
    setField('q-total-excess', '£' + quoteData.cover.totalExcess);
    setField('header-price-monthly', '£' + quoteData.monthly.instalmentAmount.toFixed(2));
    setField('header-quote-num', quoteData.quoteNumber);
  }

  /* ============================================================
     GENERATE QUOTE (on your-cover page transition / price-presentation)
     ============================================================ */
  async function generateQuote() {
    const formData = store.getForm();
    const quoteData = await api.getQuote(formData);
    store.set('quoteData', quoteData);
    return quoteData;
  }

  /* ============================================================
     POSTCODE / ADDRESS LOOKUP
     ============================================================ */
  function initAddressLookup() {
    const btn = document.getElementById('findAddressBtn');
    if (!btn) return;

    btn.addEventListener('click', async () => {
      const postcodeEl = document.getElementById('postcodeInput');
      if (!postcodeEl || !postcodeEl.value.trim()) {
        alert('Please enter a postcode.');
        return;
      }
      btn.textContent = 'Searching...';
      btn.disabled = true;

      try {
        const addresses = await api.lookupAddress(postcodeEl.value.trim());
        let select = document.getElementById('addressSelect');
        if (!select) {
          select = document.createElement('select');
          select.id = 'addressSelect';
          select.name = 'address';
          select.className = 'form-select mt-12';
          postcodeEl.parentElement.parentElement.appendChild(select);
        }
        select.innerHTML = '<option value="">Select your address...</option>' +
          addresses.map(a => `<option value="${a}">${a}</option>`).join('');
        select.style.display = 'block';
        select.addEventListener('change', () => store.setForm({ address: select.value }));
      } catch {
        alert('Address lookup failed. Please enter manually.');
      } finally {
        btn.textContent = 'Find address';
        btn.disabled = false;
      }
    });
  }

  /* ============================================================
     TABS (Review page)
     ============================================================ */
  function initTabs() {
    document.querySelectorAll('.tab-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const target = btn.dataset.tab;
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
        const pane = document.getElementById(target);
        if (pane) pane.classList.add('active');
      });
    });
  }

  /* ============================================================
     ADD-ON TOGGLES (Extras page)
     ============================================================ */
  function initAddonToggles() {
    document.querySelectorAll('.toggle-btn[data-addon]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const card = btn.closest('.addon-card');
        const addonKey = btn.dataset.addon;
        const addons = store.get('addons') || {};

        if (btn.classList.contains('added')) {
          btn.classList.remove('added');
          btn.textContent = 'Add';
          if (card) card.classList.remove('selected');
          addons[addonKey] = false;
        } else {
          btn.classList.add('added');
          btn.textContent = 'Remove';
          if (card) card.classList.add('selected');
          addons[addonKey] = true;
        }
        store.set('addons', addons);
      });
    });

    // Restore state
    const addons = store.get('addons') || {};
    document.querySelectorAll('.toggle-btn[data-addon]').forEach((btn) => {
      const addonKey = btn.dataset.addon;
      if (addons[addonKey]) {
        btn.classList.add('added');
        btn.textContent = 'Remove';
        const card = btn.closest('.addon-card');
        if (card) card.classList.add('selected');
      }
    });
  }

  /* ============================================================
     PAYMENT METHOD TOGGLE
     ============================================================ */
  function initPaymentToggle() {
    document.querySelectorAll('.payment-toggle-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.payment-toggle-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const method = btn.dataset.method;
        const monthlySection = document.getElementById('monthlyDetails');
        const annualSection = document.getElementById('annualDetails');

        if (method === 'monthly') {
          if (monthlySection) monthlySection.style.display = 'block';
          if (annualSection) annualSection.style.display = 'none';
        } else {
          if (monthlySection) monthlySection.style.display = 'none';
          if (annualSection) annualSection.style.display = 'block';
        }
        store.set('paymentMethod', method);
      });
    });
  }

  /* ============================================================
     FORM SUBMIT NAVIGATION
     ============================================================ */
  function initFormSubmit() {
    document.querySelectorAll('form[data-next]').forEach((form) => {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const nextPage = form.dataset.next;

        // Collect all form fields
        const data = {};
        new FormData(form).forEach((val, key) => { data[key] = val; });
        store.setForm(data);

        // If navigating to price presentation, generate quote first
        if (nextPage === 'your-cover.html' || nextPage === 'price-presentation.html') {
          const btn = form.querySelector('.btn-primary');
          if (btn) { btn.textContent = 'Getting your quote...'; btn.disabled = true; }
          await generateQuote();
          if (btn) { btn.textContent = 'Continue'; btn.disabled = false; }
        }

        window.location.href = nextPage;
      });
    });
  }

  /* ============================================================
     HIGHLIGHT ACTIVE PROGRESS NAV STEP
     ============================================================ */
  function highlightProgressNav() {
    const page = window.location.pathname.split('/').pop() || 'index.html';
    const stepMap = {
      'index.html':           'step-details',
      'your-details.html':    'step-details',
      'vehicle-lookup.html':  'step-car',
      'vehicle-details.html': 'step-car',
      'your-cover.html':      'step-cover',
      'price-presentation.html': 'step-quote',
      'extras.html':          'step-extras',
      'review.html':          'step-review',
      'payment.html':         'step-pay',
      'confirmation.html':    ''
    };
    const activeId = stepMap[page];
    if (activeId) {
      const el = document.getElementById(activeId);
      if (el) el.classList.add('active');
    }
  }

  /* ============================================================
     INITIALISE ALL
     ============================================================ */
  document.addEventListener('DOMContentLoaded', () => {
    initTitleButtons();
    initFormPersistence();
    initVehicleLookup();
    initVehicleDetails();
    initPriceDisplay();
    initAddressLookup();
    initTabs();
    initAddonToggles();
    initPaymentToggle();
    initFormSubmit();
    highlightProgressNav();
  });

})();
