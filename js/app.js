/**
 * TIME RECLAIM & ROUTINE MAXIMIZER - CORE APPLICATION ENGINE
 * Estetica Liquid Glass (Glassmorphism 2.0) con Supabase Auth & Vision Modal
 */

document.addEventListener('DOMContentLoaded', () => {

  // ==========================================================================
  // 1. DEFAULT STATE STORE & LOCALSTORAGE PERSISTENCE
  // ==========================================================================
  const DEFAULT_STATE = {
    user: {
      id: null,
      firstName: 'Alessandro',
      lastName: 'Foti',
      email: '',
      avatar: 'AF',
      motivation: 'Coltivare le mie relazioni ed eliminare il tempo perso sui social'
    },
    routine: {
      sleepHours: 8.0,
      wakeTime: '07:00',
      sleepTime: '23:00',
      workHours: 8.0,
      commuteHours: 1.0,
      choresHours: 2.5,
      socialWasteHours: 3.0,
      detoxPercent: 0.7
    },
    allocations: {
      productive: 1.5,
      fitness: 1.0,
      cinema: 1.5,
      relations: 1.5,
      boredom: 1.0
    },
    checklist: [
      { id: '1', title: 'Sessione di Studio / Lettura', duration: '1.5h', category: 'productive', completed: false },
      { id: '2', title: 'Allenamento o Corsa', duration: '1.0h', category: 'fitness', completed: true },
      { id: '3', title: 'Film / Serie TV senza sensi di colpa', duration: '1.5h', category: 'cinema', completed: false },
      { id: '4', title: 'Tempo di qualità con Amici / Partner', duration: '1.5h', category: 'relations', completed: false },
      { id: '5', title: 'Ozio & Noia Rigenerante (Mindfulness)', duration: '1.0h', category: 'boredom', completed: true }
    ],
    customActivities: [
      { id: 'act1', title: 'Lettura o Corso Online', category: 'productive', duration: 1.5, icon: 'fa-book' },
      { id: 'act2', title: 'Workout / Palestra', category: 'fitness', duration: 1.0, icon: 'fa-dumbbell' },
      { id: 'act3', title: 'Cinema / Serie TV', category: 'cinema', duration: 1.5, icon: 'fa-film' },
      { id: 'act4', title: 'Uscita con Amici / Cena', category: 'relations', duration: 2.0, icon: 'fa-user-group' },
      { id: 'act5', title: 'Noia Rigenerante / Passeggiata', category: 'boredom', duration: 1.0, icon: 'fa-couch' }
    ]
  };

  let state = loadState();

  function loadState() {
    try {
      const saved = localStorage.getItem('time_reclaim_state');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Could not parse saved state, using defaults.', e);
    }
    return JSON.parse(JSON.stringify(DEFAULT_STATE));
  }

  function saveState() {
    try {
      localStorage.setItem('time_reclaim_state', JSON.stringify(state));
      if (window.TimeReclaimSupabase && window.TimeReclaimSupabase.isConfigured() && state.user.id) {
        window.TimeReclaimSupabase.syncStateToCloud(state.user.id, state);
      }
    } catch (e) {
      console.error('Could not save state to localStorage.', e);
    }
    renderAll();
  }

  // ==========================================================================
  // 2. MATHEMATICAL ROUTINE AUDIT CALCULATIONS
  // ==========================================================================
  function calculateMetrics() {
    const r = state.routine;
    const a = state.allocations;

    const awakeHours = 24.0 - r.sleepHours;
    const lockedHours = r.workHours + r.commuteHours + r.choresHours;
    
    // Social waste & detox calculation
    const reclaimedSocialHours = r.socialWasteHours * r.detoxPercent;
    const socialWasteResidue = r.socialWasteHours * (1 - r.detoxPercent);

    // Total raw available time (awake - locked - social residue)
    const totalIntentionalBudget = Math.max(0, awakeHours - lockedHours - socialWasteResidue);

    // Allocated activities sum
    const totalAllocated = a.productive + a.fitness + a.cinema + a.relations + a.boredom;
    const unallocatedTime = Math.max(0, totalIntentionalBudget - totalAllocated);

    // Relationship Score Index (0 - 100%)
    const relationScore = Math.min(100, Math.round((a.relations / 2.0) * 100));

    return {
      awakeHours,
      lockedHours,
      reclaimedSocialHours,
      socialWasteResidue,
      totalIntentionalBudget,
      totalAllocated,
      unallocatedTime,
      relationScore
    };
  }

  // ==========================================================================
  // 3. TAB NAVIGATION SYSTEM
  // ==========================================================================
  const navBtns = document.querySelectorAll('.nav-btn');
  const viewSections = document.querySelectorAll('.view-section');

  navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.dataset.tab;
      switchTab(targetTab);
    });
  });

  function switchTab(tabId) {
    navBtns.forEach(b => b.classList.toggle('active', b.dataset.tab === tabId));
    viewSections.forEach(sec => sec.classList.toggle('active', sec.id === `view-${tabId}`));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ==========================================================================
  // 4. WIZARD STEP NAVIGATION & SLIDER EVENT BINDINGS
  // ==========================================================================
  let currentWizardStep = 1;
  const totalWizardSteps = 4;

  const stepIndicators = document.querySelectorAll('.step-indicator');
  const stepContents = document.querySelectorAll('.wizard-step-content');
  const wizardProgressFill = document.getElementById('wizardProgressFill');

  function updateWizardUI() {
    stepIndicators.forEach(ind => {
      const step = parseInt(ind.dataset.step);
      ind.classList.toggle('active', step === currentWizardStep);
      ind.classList.toggle('completed', step < currentWizardStep);
    });

    stepContents.forEach((cnt, idx) => {
      cnt.classList.toggle('active', (idx + 1) === currentWizardStep);
    });

    const progressPercent = ((currentWizardStep - 1) / (totalWizardSteps - 1)) * 100;
    if (wizardProgressFill) wizardProgressFill.style.width = `${progressPercent}%`;
  }

  // Wizard Step Buttons
  document.getElementById('btnStep1Next')?.addEventListener('click', () => { currentWizardStep = 2; updateWizardUI(); });
  document.getElementById('btnStep2Prev')?.addEventListener('click', () => { currentWizardStep = 1; updateWizardUI(); });
  document.getElementById('btnStep2Next')?.addEventListener('click', () => { currentWizardStep = 3; updateWizardUI(); });
  document.getElementById('btnStep3Prev')?.addEventListener('click', () => { currentWizardStep = 2; updateWizardUI(); });
  document.getElementById('btnStep3Next')?.addEventListener('click', () => { currentWizardStep = 4; updateWizardUI(); });
  document.getElementById('btnStep4Prev')?.addEventListener('click', () => { currentWizardStep = 3; updateWizardUI(); });
  
  document.getElementById('btnFinishWizard')?.addEventListener('click', () => {
    saveState();
    switchTab('dashboard');
  });

  document.getElementById('btnEditRoutine')?.addEventListener('click', () => {
    currentWizardStep = 1;
    updateWizardUI();
    switchTab('wizard');
  });

  document.getElementById('btnLaunchWizardFromDetox')?.addEventListener('click', () => {
    currentWizardStep = 3;
    updateWizardUI();
    switchTab('wizard');
  });

  // Step 1 Inputs
  const sleepHoursInput = document.getElementById('sleepHoursInput');
  const sleepHoursVal = document.getElementById('sleepHoursVal');
  const step1AwakeCalc = document.getElementById('step1AwakeCalc');

  sleepHoursInput?.addEventListener('input', (e) => {
    state.routine.sleepHours = parseFloat(e.target.value);
    if (sleepHoursVal) sleepHoursVal.textContent = `${state.routine.sleepHours.toFixed(1)} Ore`;
    const awake = 24.0 - state.routine.sleepHours;
    if (step1AwakeCalc) step1AwakeCalc.textContent = `${awake.toFixed(1)} Ore / Giorno`;
    saveState();
  });

  // Step 2 Inputs
  const workHoursInput = document.getElementById('workHoursInput');
  const commuteHoursInput = document.getElementById('commuteHoursInput');
  const choresHoursInput = document.getElementById('choresHoursInput');
  const step2RawCalc = document.getElementById('step2RawCalc');

  [workHoursInput, commuteHoursInput, choresHoursInput].forEach(inp => {
    inp?.addEventListener('input', () => {
      state.routine.workHours = parseFloat(workHoursInput.value);
      state.routine.commuteHours = parseFloat(commuteHoursInput.value);
      state.routine.choresHours = parseFloat(choresHoursInput.value);
      
      document.getElementById('workHoursVal').textContent = `${state.routine.workHours.toFixed(1)} Ore`;
      document.getElementById('commuteHoursVal').textContent = `${state.routine.commuteHours.toFixed(1)} Ore`;
      document.getElementById('choresHoursVal').textContent = `${state.routine.choresHours.toFixed(1)} Ore`;

      const metrics = calculateMetrics();
      if (step2RawCalc) step2RawCalc.textContent = `${metrics.totalIntentionalBudget.toFixed(1)} Ore / Giorno`;
      saveState();
    });
  });

  // Step 3 Social Detox Inputs
  const socialWasteInput = document.getElementById('socialWasteInput');
  const socialWasteVal = document.getElementById('socialWasteVal');
  const step3ReclaimedCalc = document.getElementById('step3ReclaimedCalc');
  const detoxCards = document.querySelectorAll('[data-detox-percent]');

  socialWasteInput?.addEventListener('input', (e) => {
    state.routine.socialWasteHours = parseFloat(e.target.value);
    if (socialWasteVal) socialWasteVal.textContent = `${state.routine.socialWasteHours.toFixed(1)} Ore/giorno`;
    const metrics = calculateMetrics();
    if (step3ReclaimedCalc) step3ReclaimedCalc.textContent = `+${metrics.reclaimedSocialHours.toFixed(1)} Ore Riconquistate!`;
    saveState();
  });

  detoxCards.forEach(card => {
    card.addEventListener('click', () => {
      detoxCards.forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      state.routine.detoxPercent = parseFloat(card.dataset.detoxPercent);
      const metrics = calculateMetrics();
      if (step3ReclaimedCalc) step3ReclaimedCalc.textContent = `+${metrics.reclaimedSocialHours.toFixed(1)} Ore Riconquistate!`;
      saveState();
    });
  });

  // Step 4 Allocations Sliders
  const allocInputs = {
    productive: document.getElementById('allocProductiveInput'),
    fitness: document.getElementById('allocFitnessInput'),
    cinema: document.getElementById('allocCinemaInput'),
    relations: document.getElementById('allocRelationsInput'),
    boredom: document.getElementById('allocBoredomInput')
  };

  Object.keys(allocInputs).forEach(key => {
    allocInputs[key]?.addEventListener('input', (e) => {
      state.allocations[key] = parseFloat(e.target.value);
      const displayEl = document.getElementById(`alloc${key.charAt(0).toUpperCase() + key.slice(1)}Val`);
      if (displayEl) displayEl.textContent = `${state.allocations[key].toFixed(2)} Ore`;
      saveState();
    });
  });

  // ==========================================================================
  // 5. 24-HOUR SVG DONUT WHEEL RENDERER
  // ==========================================================================
  function renderTimeWheelSVG() {
    const svg = document.getElementById('timeWheelSvg');
    if (!svg) return;

    const r = state.routine;
    const a = state.allocations;
    const metrics = calculateMetrics();

    // Data segments in 24 hours
    const segments = [
      { label: 'Sonno', hours: r.sleepHours, color: '#8e2de2' },
      { label: 'Impegni Fissi', hours: metrics.lockedHours, color: '#3b82f6' },
      { label: 'Social Residuo', hours: metrics.socialWasteResidue, color: '#ff007f' },
      { label: 'Studio & Crescita', hours: a.productive, color: '#00f2fe' },
      { label: 'Sport & Salute', hours: a.fitness, color: '#00f5d4' },
      { label: 'Cinema & Spettacolo', hours: a.cinema, color: '#9d4edd' },
      { label: 'Relazioni & Amici', hours: a.relations, color: '#ffb703' },
      { label: 'Sana Noia & Ozio', hours: a.boredom, color: '#70e000' },
      { label: 'Tempo Libero Residuo', hours: metrics.unallocatedTime, color: 'rgba(255, 255, 255, 0.15)' }
    ].filter(s => s.hours > 0);

    const radius = 80;
    const strokeWidth = 24;
    const center = 100;
    const circumference = 2 * Math.PI * radius;

    let currentAngle = -90; // Start at top 12 o'clock
    let svgContent = '';

    segments.forEach((seg) => {
      const percentage = seg.hours / 24.0;
      const strokeDasharray = `${percentage * circumference} ${circumference}`;
      const rotation = currentAngle;

      svgContent += `
        <circle
          cx="${center}"
          cy="${center}"
          r="${radius}"
          fill="transparent"
          stroke="${seg.color}"
          stroke-width="${strokeWidth}"
          stroke-dasharray="${strokeDasharray}"
          transform="rotate(${rotation} ${center} ${center})"
          style="transition: stroke-dasharray 0.5s ease, transform 0.5s ease;"
        >
          <title>${seg.label}: ${seg.hours.toFixed(1)}h</title>
        </circle>
      `;

      currentAngle += percentage * 360;
    });

    svg.innerHTML = svgContent;

    // Center Big Value Update
    const wheelFreeTimeDisplay = document.getElementById('wheelFreeTimeDisplay');
    if (wheelFreeTimeDisplay) {
      wheelFreeTimeDisplay.textContent = `${metrics.totalIntentionalBudget.toFixed(1)}h`;
    }

    // Categories Breakdown Legend Update
    const breakdownList = document.getElementById('categoriesBreakdownList');
    if (breakdownList) {
      breakdownList.innerHTML = segments.map(seg => `
        <div class="cat-item">
          <div class="cat-color-dot" style="background-color: ${seg.color}; color: ${seg.color};"></div>
          <div class="cat-details">
            <h5>${seg.label}</h5>
            <p>${seg.hours.toFixed(1)} h</p>
          </div>
        </div>
      `).join('');
    }
  }

  // ==========================================================================
  // 6. HARMONY BALANCE METER RENDERER
  // ==========================================================================
  function renderHarmonyBar() {
    const harmonyBar = document.getElementById('harmonyBar');
    if (!harmonyBar) return;

    const a = state.allocations;
    const totalAllocated = a.productive + a.fitness + a.cinema + a.relations + a.boredom;

    if (totalAllocated <= 0) {
      harmonyBar.innerHTML = `<div class="harmony-segment" style="width: 100%; background: rgba(255,255,255,0.1);"></div>`;
      return;
    }

    const pProd = (a.productive / totalAllocated) * 100;
    const pFit = (a.fitness / totalAllocated) * 100;
    const pCin = (a.cinema / totalAllocated) * 100;
    const pRel = (a.relations / totalAllocated) * 100;
    const pBor = (a.boredom / totalAllocated) * 100;

    harmonyBar.innerHTML = `
      <div class="harmony-segment" style="width: ${pProd + pFit}%; background: linear-gradient(90deg, #00f2fe, #00f5d4);" title="Produttivo & Sport: ${(pProd + pFit).toFixed(0)}%"></div>
      <div class="harmony-segment" style="width: ${pCin}%; background: #9d4edd;" title="Cinema & Svago: ${pCin.toFixed(0)}%"></div>
      <div class="harmony-segment" style="width: ${pRel}%; background: #ffb703;" title="Relazioni: ${pRel.toFixed(0)}%"></div>
      <div class="harmony-segment" style="width: ${pBor}%; background: #70e000;" title="Noia & Riposo: ${pBor.toFixed(0)}%"></div>
    `;

    const harmonyStatusBadge = document.getElementById('harmonyStatusBadge');
    if (harmonyStatusBadge) {
      if (a.relations >= 1.5 && a.boredom >= 0.5) {
        harmonyStatusBadge.className = 'badge badge-emerald';
        harmonyStatusBadge.textContent = 'Equilibrio Ottimale';
      } else if (a.relations < 1.0) {
        harmonyStatusBadge.className = 'badge badge-pink';
        harmonyStatusBadge.textContent = 'Aumenta Relazioni Reali';
      } else {
        harmonyStatusBadge.className = 'badge badge-amber';
        harmonyStatusBadge.textContent = 'Bilanciato';
      }
    }
  }

  // ==========================================================================
  // 7. DAILY ACTION CHECKLIST RENDERER
  // ==========================================================================
  function renderDailyChecklist() {
    const container = document.getElementById('dailyChecklist');
    if (!container) return;

    if (state.checklist.length === 0) {
      container.innerHTML = `<p style="font-size: 0.85rem; color: var(--text-muted);">Nessuna attività pianificata. Aggiungine una dalla Banca del Tempo!</p>`;
      return;
    }

    container.innerHTML = state.checklist.map(item => `
      <div class="check-item ${item.completed ? 'completed' : ''}" data-item-id="${item.id}">
        <div class="check-left">
          <div class="checkbox-custom">
            ${item.completed ? '<i class="fa-solid fa-check"></i>' : ''}
          </div>
          <span class="check-title">${item.title}</span>
        </div>
        <span class="check-duration">${item.duration}</span>
      </div>
    `).join('');

    container.querySelectorAll('.check-item').forEach(el => {
      el.addEventListener('click', () => {
        const id = el.dataset.itemId;
        const item = state.checklist.find(i => i.id === id);
        if (item) {
          item.completed = !item.completed;
          saveState();
        }
      });
    });
  }

  // ==========================================================================
  // 8. SOCIAL DETOX CALCULATOR SHOWCASE RENDERER
  // ==========================================================================
  function renderDetoxShowcase() {
    const metrics = calculateMetrics();

    const weeklyHours = metrics.reclaimedSocialHours * 7;
    const monthHours = metrics.reclaimedSocialHours * 30;
    const yearHours = metrics.reclaimedSocialHours * 365;

    const booksYear = Math.round(yearHours / 25);

    // Dashboard detox widget
    const detoxWeeklyHours = document.getElementById('detoxWeeklyHours');
    if (detoxWeeklyHours) detoxWeeklyHours.textContent = `${weeklyHours.toFixed(1)} h`;

    const detoxBooksEquiv = document.getElementById('detoxBooksEquiv');
    if (detoxBooksEquiv) detoxBooksEquiv.textContent = `~${(weeklyHours / 5).toFixed(1)} Libri/Mese`;

    const detoxWorkoutsEquiv = document.getElementById('detoxWorkoutsEquiv');
    if (detoxWorkoutsEquiv) detoxWorkoutsEquiv.textContent = `${Math.round(weeklyHours * 1.2)} Sessioni`;

    const detoxRelationsEquiv = document.getElementById('detoxRelationsEquiv');
    if (detoxRelationsEquiv) detoxRelationsEquiv.textContent = `+${weeklyHours.toFixed(0)} Ore Reali`;

    // Full Detox View
    const detoxMonthHours = document.getElementById('detoxMonthHours');
    if (detoxMonthHours) detoxMonthHours.textContent = `${monthHours.toFixed(0)} Ore`;

    const detoxYearHours = document.getElementById('detoxYearHours');
    if (detoxYearHours) detoxYearHours.textContent = `${yearHours.toFixed(0)} Ore (~${Math.round(yearHours / 24)} Giorni Interi)`;

    const detoxDecadeHours = document.getElementById('detoxDecadeHours');
    if (detoxDecadeHours) detoxDecadeHours.textContent = `${(yearHours * 10 / 8760).toFixed(1)} Anni di Vita Continua`;

    const detoxBooksYear = document.getElementById('detoxBooksYear');
    if (detoxBooksYear) detoxBooksYear.textContent = `~${booksYear} Libri Letti`;

    const detoxSocialYear = document.getElementById('detoxSocialYear');
    if (detoxSocialYear) detoxSocialYear.textContent = `+${Math.round(yearHours / 4)} Uscite Reali`;
  }

  // ==========================================================================
  // 9. TIME BANK & CUSTOM ACTIVITIES RENDERER
  // ==========================================================================
  function renderCustomActivities() {
    const grid = document.getElementById('customActivitiesGrid');
    if (!grid) return;

    grid.innerHTML = state.customActivities.map(act => `
      <div class="option-card">
        <div class="option-icon" style="background: var(--grad-${act.category || 'productive'});">
          <i class="fa-solid ${act.icon || 'fa-star'}"></i>
        </div>
        <div class="option-info">
          <h4>${act.title}</h4>
          <p>Durata consigliata: ${act.duration}h</p>
        </div>
        <button class="btn-glass btn-sm" style="margin-top: 0.5rem;" onclick="addActivityToToday('${act.title}', '${act.duration}h', '${act.category}')">
          <i class="fa-solid fa-plus"></i> Aggiungi ad Oggi
        </button>
      </div>
    `).join('');
  }

  window.addActivityToToday = function(title, duration, category) {
    state.checklist.push({
      id: Date.now().toString(),
      title,
      duration,
      category,
      completed: false
    });
    saveState();
    switchTab('dashboard');
  };

  // ==========================================================================
  // 10. VISION & MANIFESTO MODAL CONTROLLER
  // ==========================================================================
  const visionModal = document.getElementById('visionModal');
  const openVisionModal = document.getElementById('openVisionModal');
  const btnCloseVisionModal = document.getElementById('btnCloseVisionModal');

  openVisionModal?.addEventListener('click', () => visionModal.classList.add('open'));
  btnCloseVisionModal?.addEventListener('click', () => visionModal.classList.remove('open'));

  // ==========================================================================
  // 11. AUTHENTICATION & MODAL CONTROLLERS
  // ==========================================================================
  const authModal = document.getElementById('authModal');
  const openAuthModal = document.getElementById('openAuthModal');
  const btnCloseAuthModal = document.getElementById('btnCloseAuthModal');
  const authModalTitle = document.getElementById('authModalTitle');
  const authStatusBanner = document.getElementById('authStatusBanner');

  const tabAuthLogin = document.getElementById('tabAuthLogin');
  const tabAuthRegister = document.getElementById('tabAuthRegister');
  const formLogin = document.getElementById('formLogin');
  const formRegister = document.getElementById('formRegister');
  const formForgotPassword = document.getElementById('formForgotPassword');
  const linkForgotPassword = document.getElementById('linkForgotPassword');
  const btnBackToLogin = document.getElementById('btnBackToLogin');

  function showAuthStatus(msg, isError = false) {
    if (!authStatusBanner) return;
    authStatusBanner.style.display = 'block';
    authStatusBanner.style.background = isError ? 'rgba(255, 77, 109, 0.15)' : 'rgba(0, 245, 212, 0.15)';
    authStatusBanner.style.border = isError ? '1px solid rgba(255, 77, 109, 0.3)' : '1px solid rgba(0, 245, 212, 0.3)';
    authStatusBanner.style.color = isError ? 'var(--accent-red)' : 'var(--accent-emerald)';
    authStatusBanner.textContent = msg;
  }

  function hideAuthStatus() {
    if (authStatusBanner) authStatusBanner.style.display = 'none';
  }

  openAuthModal?.addEventListener('click', () => {
    hideAuthStatus();
    authModal.classList.add('open');
  });

  btnCloseAuthModal?.addEventListener('click', () => authModal.classList.remove('open'));

  // Switch Auth Tabs
  tabAuthLogin?.addEventListener('click', () => {
    hideAuthStatus();
    tabAuthLogin.classList.add('active');
    tabAuthRegister.classList.remove('active');
    authModalTitle.textContent = 'Accedi al tuo Account';
    formLogin.style.display = 'block';
    formRegister.style.display = 'none';
    formForgotPassword.style.display = 'none';
  });

  tabAuthRegister?.addEventListener('click', () => {
    hideAuthStatus();
    tabAuthRegister.classList.add('active');
    tabAuthLogin.classList.remove('active');
    authModalTitle.textContent = 'Crea il tuo Account';
    formLogin.style.display = 'none';
    formRegister.style.display = 'block';
    formForgotPassword.style.display = 'none';
  });

  linkForgotPassword?.addEventListener('click', (e) => {
    e.preventDefault();
    hideAuthStatus();
    authModalTitle.textContent = 'Recupero Password';
    formLogin.style.display = 'none';
    formRegister.style.display = 'none';
    formForgotPassword.style.display = 'block';
  });

  btnBackToLogin?.addEventListener('click', () => {
    hideAuthStatus();
    tabAuthLogin.click();
  });

  // SUBMIT 1: LOGIN
  formLogin?.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideAuthStatus();
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value.trim();

    try {
      showAuthStatus('Autenticazione in corso...', false);
      const data = await window.TimeReclaimSupabase.signInUser({ email, password });
      showAuthStatus('Accesso effettuato con successo!', false);
      
      const user = data.user;
      state.user.id = user.id;
      state.user.email = user.email;
      
      const profile = await window.TimeReclaimSupabase.fetchUserProfile(user.id);
      if (profile) {
        state.user.firstName = profile.first_name || 'Alessandro';
        state.user.lastName = profile.last_name || 'Foti';
        state.user.avatar = profile.avatar || (state.user.firstName[0] + state.user.lastName[0]);
      }

      saveState();
      setTimeout(() => authModal.classList.remove('open'), 1000);
    } catch (err) {
      showAuthStatus(err.message || 'Errore durante l\'accesso', true);
    }
  });

  // SUBMIT 2: REGISTRATION
  formRegister?.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideAuthStatus();
    const firstName = document.getElementById('regFirstName').value.trim();
    const lastName = document.getElementById('regLastName').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const password = document.getElementById('regPassword').value.trim();

    try {
      showAuthStatus('Creazione account in corso...', false);
      await window.TimeReclaimSupabase.signUpUser({ firstName, lastName, email, password });
      showAuthStatus('Registrazione completata! Controlla la tua email per confermare l\'account.', false);
      
      state.user.firstName = firstName;
      state.user.lastName = lastName;
      state.user.email = email;
      state.user.avatar = (firstName[0] + lastName[0]).toUpperCase();
      saveState();
    } catch (err) {
      showAuthStatus(err.message || 'Errore durante la registrazione', true);
    }
  });

  // SUBMIT 3: PASSWORD RECOVERY VIA EMAIL
  formForgotPassword?.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideAuthStatus();
    const email = document.getElementById('forgotEmail').value.trim();

    try {
      showAuthStatus('Invio email di reset in corso...', false);
      await window.TimeReclaimSupabase.sendPasswordReset(email);
      showAuthStatus(`Email per il reset della password inviata con successo alla tua casella postale (${email})!`, false);
    } catch (err) {
      showAuthStatus(err.message || 'Errore durante la richiesta di recupero password', true);
    }
  });

  // Save Credentials Config Button
  document.getElementById('btnSaveSbKeys')?.addEventListener('click', () => {
    const url = document.getElementById('sbUrlInput').value.trim();
    const key = document.getElementById('sbKeyInput').value.trim();

    if (url && key) {
      window.TimeReclaimSupabase.setCredentials(url, key);
      alert('Credenziali Supabase aggiornate!');
    }
  });

  // Listen to Supabase Auth Changes
  if (window.TimeReclaimSupabase) {
    window.TimeReclaimSupabase.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        state.user.id = session.user.id;
        state.user.email = session.user.email;
        saveState();
      }
    });
  }

  // Add Activity Modal
  const addActivityModal = document.getElementById('addActivityModal');
  const btnOpenAddActivity = document.getElementById('btnOpenAddActivity');
  const btnCloseAddActivityModal = document.getElementById('btnCloseAddActivityModal');
  const addActivityForm = document.getElementById('addActivityForm');

  btnOpenAddActivity?.addEventListener('click', () => addActivityModal.classList.add('open'));
  btnCloseAddActivityModal?.addEventListener('click', () => addActivityModal.classList.remove('open'));

  addActivityForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const title = document.getElementById('newActTitle').value;
    const category = document.getElementById('newActCategory').value;
    const duration = parseFloat(document.getElementById('newActDuration').value);

    state.customActivities.push({
      id: Date.now().toString(),
      title,
      category,
      duration,
      icon: category === 'cinema' ? 'fa-film' : category === 'fitness' ? 'fa-dumbbell' : category === 'relations' ? 'fa-heart' : category === 'boredom' ? 'fa-couch' : 'fa-graduation-cap'
    });

    saveState();
    addActivityModal.classList.remove('open');
    addActivityForm.reset();
  });

  // ==========================================================================
  // 12. GLOBAL RENDER ALL FUNCTION
  // ==========================================================================
  function renderAll() {
    // Nav Profile update
    const navAvatar = document.getElementById('navAvatar');
    const navUserName = document.getElementById('navUserName');
    if (navAvatar) navAvatar.textContent = state.user.avatar || 'TR';
    if (navUserName) navUserName.textContent = state.user.firstName ? `${state.user.firstName} ${state.user.lastName}` : 'Accedi / Registrati';

    // Metrics
    const metrics = calculateMetrics();
    const statAwakeHours = document.getElementById('statAwakeHours');
    if (statAwakeHours) statAwakeHours.textContent = `${metrics.awakeHours.toFixed(1)} h`;

    const statReclaimedHours = document.getElementById('statReclaimedHours');
    if (statReclaimedHours) statReclaimedHours.textContent = `${metrics.reclaimedSocialHours.toFixed(1)} h`;

    const statRelationScore = document.getElementById('statRelationScore');
    if (statRelationScore) statRelationScore.textContent = `${metrics.relationScore}%`;

    // Sliders sync
    if (sleepHoursInput) sleepHoursInput.value = state.routine.sleepHours;
    if (sleepHoursVal) sleepHoursVal.textContent = `${state.routine.sleepHours.toFixed(1)} Ore`;
    if (step1AwakeCalc) step1AwakeCalc.textContent = `${metrics.awakeHours.toFixed(1)} Ore / Giorno`;

    if (workHoursInput) workHoursInput.value = state.routine.workHours;
    if (commuteHoursInput) commuteHoursInput.value = state.routine.commuteHours;
    if (choresHoursInput) choresHoursInput.value = state.routine.choresHours;
    document.getElementById('workHoursVal').textContent = `${state.routine.workHours.toFixed(1)} Ore`;
    document.getElementById('commuteHoursVal').textContent = `${state.routine.commuteHours.toFixed(1)} Ore`;
    document.getElementById('choresHoursVal').textContent = `${state.routine.choresHours.toFixed(1)} Ore`;
    if (step2RawCalc) step2RawCalc.textContent = `${metrics.totalIntentionalBudget.toFixed(1)} Ore / Giorno`;

    if (socialWasteInput) socialWasteInput.value = state.routine.socialWasteHours;
    if (socialWasteVal) socialWasteVal.textContent = `${state.routine.socialWasteHours.toFixed(1)} Ore/giorno`;
    if (step3ReclaimedCalc) step3ReclaimedCalc.textContent = `+${metrics.reclaimedSocialHours.toFixed(1)} Ore Riconquistate!`;

    // Allocations sliders
    Object.keys(state.allocations).forEach(k => {
      const inp = document.getElementById(`alloc${k.charAt(0).toUpperCase() + k.slice(1)}Input`);
      const val = document.getElementById(`alloc${k.charAt(0).toUpperCase() + k.slice(1)}Val`);
      if (inp) inp.value = state.allocations[k];
      if (val) val.textContent = `${state.allocations[k].toFixed(2)} Ore`;
    });

    const step4TotalBudget = document.getElementById('step4TotalBudget');
    if (step4TotalBudget) step4TotalBudget.textContent = `${metrics.totalIntentionalBudget.toFixed(1)} Ore / Giorno`;

    // Component Renders
    renderTimeWheelSVG();
    renderHarmonyBar();
    renderDailyChecklist();
    renderDetoxShowcase();
    renderCustomActivities();
  }

  // Initial Boot Render
  renderAll();
  updateWizardUI();

});
