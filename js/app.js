/**
 * TIME RECLAIM & ROUTINE MAXIMIZER - NATIVE MOBILE APP ENGINE
 * Estetica Mobile App (PWA feel) con Bottom Navbar e Schermata Profilo
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
      email: 'alessandro@esempio.com',
      avatar: 'AF',
      motivation: 'Eliminare lo scroll compulsivo sui social media e coltivare le mie relazioni personali'
    },
    routine: {
      sleepHours: 8.0,
      wakeTime: '07:00',
      sleepTime: '23:00',
      workHours: 8.0,
      choresHours: 3.5,
      socialWasteHours: 3.0,
      detoxPercent: 0.7
    },
    allocations: {
      productive: 1.5,
      fitness: 1.0,
      cinema: 1.0,
      relations: 0.0,
      boredom: 1.0
    },
    checklist: [
      { id: '1', title: 'Studio / Lettura', duration: '1.5h', category: 'productive', completed: false },
      { id: '2', title: 'Allenamento o Corsa', duration: '1.0h', category: 'fitness', completed: true },
      { id: '3', title: 'Film / Serie TV', duration: '1.0h', category: 'cinema', completed: false },
      { id: '4', title: 'Mindfulness & Relax', duration: '1.0h', category: 'boredom', completed: true }
    ],
    customActivities: [
      { id: 'act1', title: 'Lettura o Corso Online', category: 'productive', duration: 1.5, icon: 'fa-book' },
      { id: 'act2', title: 'Workout / Palestra', category: 'fitness', duration: 1.0, icon: 'fa-dumbbell' },
      { id: 'act3', title: 'Cinema / Serie TV', category: 'cinema', duration: 1.5, icon: 'fa-film' },
      { id: 'act4', title: 'Passeggiata / Relax', category: 'boredom', duration: 1.0, icon: 'fa-couch' }
    ]
  };

  let state = loadState();

  function loadState() {
    try {
      const saved = localStorage.getItem('time_reclaim_state');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Could not parse saved state:', e);
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
  // 2. TOAST NOTIFICATION UTILITY
  // ==========================================================================
  function showToast(message) {
    const toastContainer = document.getElementById('toastContainer');
    if (!toastContainer) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<i class="fa-solid fa-circle-check"></i> ${message}`;
    
    toastContainer.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  }

  // ==========================================================================
  // 3. MATHEMATICAL ROUTINE CALCULATIONS
  // ==========================================================================
  function calculateMetrics() {
    const r = state.routine;
    const a = state.allocations;

    const awakeHours = 24.0 - r.sleepHours;
    const lockedHours = r.workHours + r.choresHours;
    
    const reclaimedSocialHours = r.socialWasteHours * r.detoxPercent;
    const socialWasteResidue = r.socialWasteHours * (1 - r.detoxPercent);

    const totalIntentionalBudget = Math.max(0, awakeHours - lockedHours - socialWasteResidue);

    const totalAllocated = a.productive + a.fitness + a.cinema + a.boredom;
    const unallocatedTime = Math.max(0, totalIntentionalBudget - totalAllocated);

    const relationScore = Math.min(100, Math.round(((totalAllocated + reclaimedSocialHours) / 6.0) * 100));

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
  // 4. MOBILE BOTTOM NAVBAR NAVIGATION SYSTEM
  // ==========================================================================
  const navItems = document.querySelectorAll('.nav-item');
  const viewSections = document.querySelectorAll('.view-section');

  navItems.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.dataset.tab;
      switchTab(targetTab);
    });
  });

  function switchTab(tabId) {
    navItems.forEach(b => b.classList.toggle('active', b.dataset.tab === tabId));
    viewSections.forEach(sec => sec.classList.toggle('active', sec.id === `view-${tabId}`));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Header Avatar button opens profile tab directly
  document.getElementById('headerAvatarBtn')?.addEventListener('click', () => {
    switchTab('profile');
  });

  // ==========================================================================
  // 5. WIZARD STEP NAVIGATION & SLIDERS
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
    showToast('Routine salvata con successo!');
    switchTab('dashboard');
  });

  document.getElementById('btnEditRoutine')?.addEventListener('click', () => {
    currentWizardStep = 1;
    updateWizardUI();
    switchTab('wizard');
  });

  // Step 1 Inputs
  const sleepHoursInput = document.getElementById('sleepHoursInput');
  const sleepHoursVal = document.getElementById('sleepHoursVal');

  sleepHoursInput?.addEventListener('input', (e) => {
    state.routine.sleepHours = parseFloat(e.target.value);
    if (sleepHoursVal) sleepHoursVal.textContent = `${state.routine.sleepHours.toFixed(1)} Ore`;
    saveState();
  });

  // Step 2 Inputs
  const workHoursInput = document.getElementById('workHoursInput');
  const choresHoursInput = document.getElementById('choresHoursInput');

  [workHoursInput, choresHoursInput].forEach(inp => {
    inp?.addEventListener('input', () => {
      state.routine.workHours = parseFloat(workHoursInput.value);
      state.routine.choresHours = parseFloat(choresHoursInput.value);
      
      document.getElementById('workHoursVal').textContent = `${state.routine.workHours.toFixed(1)} Ore`;
      document.getElementById('choresHoursVal').textContent = `${state.routine.choresHours.toFixed(1)} Ore`;
      saveState();
    });
  });

  // Step 3 Social Detox Inputs
  const socialWasteInput = document.getElementById('socialWasteInput');
  const socialWasteVal = document.getElementById('socialWasteVal');
  const detoxCards = document.querySelectorAll('[data-detox-percent]');

  socialWasteInput?.addEventListener('input', (e) => {
    state.routine.socialWasteHours = parseFloat(e.target.value);
    if (socialWasteVal) socialWasteVal.textContent = `${state.routine.socialWasteHours.toFixed(1)} Ore`;
    saveState();
  });

  detoxCards.forEach(card => {
    card.addEventListener('click', () => {
      detoxCards.forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      state.routine.detoxPercent = parseFloat(card.dataset.detoxPercent);
      saveState();
    });
  });

  // Step 4 Allocations Sliders
  const allocInputs = {
    productive: document.getElementById('allocProductiveInput'),
    fitness: document.getElementById('allocFitnessInput'),
    cinema: document.getElementById('allocCinemaInput'),
    boredom: document.getElementById('allocBoredomInput')
  };

  Object.keys(allocInputs).forEach(key => {
    allocInputs[key]?.addEventListener('input', (e) => {
      state.allocations[key] = parseFloat(e.target.value);
      const displayEl = document.getElementById(`alloc${key.charAt(0).toUpperCase() + key.slice(1)}Val`);
      if (displayEl) displayEl.textContent = `${state.allocations[key].toFixed(1)} Ore`;
      saveState();
    });
  });

  // ==========================================================================
  // 6. 24-HOUR SVG DONUT WHEEL RENDERER
  // ==========================================================================
  function renderTimeWheelSVG() {
    const svg = document.getElementById('timeWheelSvg');
    if (!svg) return;

    const r = state.routine;
    const a = state.allocations;
    const metrics = calculateMetrics();

    const segments = [
      { label: 'Sonno', hours: r.sleepHours, color: '#8e2de2' },
      { label: 'Impegni Fissi', hours: metrics.lockedHours, color: '#3b82f6' },
      { label: 'Social Residuo', hours: metrics.socialWasteResidue, color: '#ff007f' },
      { label: 'Studio & Crescita', hours: a.productive, color: '#00f2fe' },
      { label: 'Sport & Salute', hours: a.fitness, color: '#00f5d4' },
      { label: 'Cinema & Svago', hours: a.cinema, color: '#9d4edd' },
      { label: 'Noia & Relax', hours: a.boredom, color: '#70e000' },
      { label: 'Tempo Libero Residuo', hours: metrics.unallocatedTime, color: 'rgba(255, 255, 255, 0.15)' }
    ].filter(s => s.hours > 0);

    const radius = 80;
    const strokeWidth = 22;
    const center = 100;
    const circumference = 2 * Math.PI * radius;

    let currentAngle = -90;
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
        >
          <title>${seg.label}: ${seg.hours.toFixed(1)}h</title>
        </circle>
      `;

      currentAngle += percentage * 360;
    });

    svg.innerHTML = svgContent;

    const wheelFreeTimeDisplay = document.getElementById('wheelFreeTimeDisplay');
    if (wheelFreeTimeDisplay) {
      wheelFreeTimeDisplay.textContent = `${metrics.totalIntentionalBudget.toFixed(1)}h`;
    }

    const breakdownList = document.getElementById('categoriesBreakdownList');
    if (breakdownList) {
      breakdownList.innerHTML = segments.map(seg => `
        <div class="cat-item">
          <div class="cat-color-dot" style="background-color: ${seg.color};"></div>
          <div class="cat-details">
            <h5>${seg.label}</h5>
            <p>${seg.hours.toFixed(1)} h</p>
          </div>
        </div>
      `).join('');
    }
  }

  // ==========================================================================
  // 7. 24-HOUR HOURLY TIMELINE RENDERER
  // ==========================================================================
  function renderHourlyTimeline(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    let slotsHTML = '';
    for (let h = 0; h < 24; h++) {
      let slotClass = 'time-slot-free';
      let title = `Fascia ${h}:00 - ${h+1}:00 -> ✨ TEMPO LIBERO INTENZIONALE`;

      if (h < 7 || h >= 23) {
        slotClass = 'time-slot-sleep';
        title = `Fascia ${h}:00 - ${h+1}:00 -> 🌙 Sonno & Riposo`;
      } else if (h >= 8 && h < 17) {
        slotClass = 'time-slot-locked';
        title = `Fascia ${h}:00 - ${h+1}:00 -> 💼 Lavoro & Impegni`;
      } else if (h === 17) {
        slotClass = 'time-slot-social';
        title = `Fascia ${h}:00 - ${h+1}:00 -> 📱 Social Media`;
      }

      slotsHTML += `<div class="time-slot-hour ${slotClass}" title="${title}"></div>`;
    }

    container.innerHTML = slotsHTML;
  }

  // ==========================================================================
  // 8. DAILY CHECKLIST RENDERER
  // ==========================================================================
  function renderDailyChecklist() {
    const container = document.getElementById('dailyChecklist');
    if (!container) return;

    if (state.checklist.length === 0) {
      container.innerHTML = `<p style="font-size: 0.8rem; color: var(--text-muted);">Nessuna attività pianificata oggi. Aggiungine una dalla Banca Attività!</p>`;
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
  // 9. TIME BANK & CUSTOM ACTIVITIES
  // ==========================================================================
  function renderCustomActivities() {
    const grid = document.getElementById('customActivitiesGrid');
    if (!grid) return;

    grid.innerHTML = state.customActivities.map(act => `
      <div class="option-card">
        <div class="option-icon" style="background: var(--accent-cyan);">
          <i class="fa-solid ${act.icon || 'fa-star'}"></i>
        </div>
        <div class="option-info">
          <h4 style="font-size: 0.95rem; font-weight: 700; color: #fff;">${act.title}</h4>
          <p style="font-size: 0.75rem; color: var(--text-muted);">Durata: ${act.duration}h</p>
        </div>
        <button class="btn-glass btn-sm" style="margin-top: 0.35rem;" onclick="addActivityToToday('${act.title}', '${act.duration}h', '${act.category}')">
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
    showToast(`Attività "${title}" aggiunta alla to-do list di oggi!`);
  };

  // HARMONY & DETOX SHOWCASE
  function renderHarmonyBar() {
    const harmonyBar = document.getElementById('harmonyBar');
    if (!harmonyBar) return;

    const a = state.allocations;
    const totalAllocated = a.productive + a.fitness + a.cinema + a.boredom;

    if (totalAllocated <= 0) {
      harmonyBar.innerHTML = `<div class="harmony-segment" style="width: 100%; background: rgba(255,255,255,0.1);"></div>`;
      return;
    }

    const pProd = (a.productive / totalAllocated) * 100;
    const pFit = (a.fitness / totalAllocated) * 100;
    const pCin = (a.cinema / totalAllocated) * 100;
    const pBor = (a.boredom / totalAllocated) * 100;

    harmonyBar.innerHTML = `
      <div class="harmony-segment" style="width: ${pProd + pFit}%; background: var(--accent-cyan);" title="Crescita & Sport"></div>
      <div class="harmony-segment" style="width: ${pCin}%; background: var(--accent-purple);" title="Cinema"></div>
      <div class="harmony-segment" style="width: ${pBor}%; background: #70e000;" title="Relax"></div>
    `;
  }

  function renderDetoxShowcase() {
    const metrics = calculateMetrics();
    const weeklyHours = metrics.reclaimedSocialHours * 7;
    const detoxWeeklyHours = document.getElementById('detoxWeeklyHours');
    if (detoxWeeklyHours) detoxWeeklyHours.textContent = `${weeklyHours.toFixed(1)} h`;

    const detoxBooksEquiv = document.getElementById('detoxBooksEquiv');
    if (detoxBooksEquiv) detoxBooksEquiv.textContent = `~${(weeklyHours / 5).toFixed(1)} Vol/Mese`;
  }

  // ==========================================================================
  // 10. USER PROFILE SCREEN RENDERER
  // ==========================================================================
  function renderUserProfile() {
    const metrics = calculateMetrics();

    const profileAvatarLarge = document.getElementById('profileAvatarLarge');
    const profileName = document.getElementById('profileName');
    const profileEmail = document.getElementById('profileEmail');
    const profileStatusBadge = document.getElementById('profileStatusBadge');
    const profileMotivationInput = document.getElementById('profileMotivationInput');

    if (profileAvatarLarge) profileAvatarLarge.textContent = state.user.avatar || 'AF';
    if (profileName) profileName.textContent = state.user.firstName ? `${state.user.firstName} ${state.user.lastName}` : 'Utente Registrato';
    if (profileEmail) profileEmail.textContent = state.user.email || 'Account Locale';
    
    if (profileStatusBadge) {
      if (state.user.id && !state.user.id.startsWith('usr_')) {
        profileStatusBadge.innerHTML = `<i class="fa-solid fa-cloud-check"></i> Supabase Cloud Synchronized`;
        profileStatusBadge.style.color = 'var(--accent-emerald)';
      } else {
        profileStatusBadge.innerHTML = `<i class="fa-solid fa-hard-drive"></i> Profilo Utente Attivo (Locale)`;
        profileStatusBadge.style.color = 'var(--accent-cyan)';
      }
    }

    if (profileMotivationInput && !profileMotivationInput.value) {
      profileMotivationInput.value = state.user.motivation || '';
    }

    const profileAwake = document.getElementById('profileAwake');
    if (profileAwake) profileAwake.textContent = `${metrics.awakeHours.toFixed(1)}h`;

    const profileReclaimed = document.getElementById('profileReclaimed');
    if (profileReclaimed) profileReclaimed.textContent = `${metrics.reclaimedSocialHours.toFixed(1)}h`;

    const profileScore = document.getElementById('profileScore');
    if (profileScore) profileScore.textContent = `${metrics.relationScore}%`;
  }

  // Save Motivation Button
  document.getElementById('btnSaveMotivation')?.addEventListener('click', () => {
    const input = document.getElementById('profileMotivationInput');
    if (input) {
      state.user.motivation = input.value.trim();
      saveState();
      showToast('Obiettivo e motivazione salvati!');
    }
  });

  // Open Auth Modal from Profile
  document.getElementById('btnOpenAuthFromProfile')?.addEventListener('click', () => {
    authModal.classList.add('open');
  });

  // Logout Button
  document.getElementById('btnLogout')?.addEventListener('click', async () => {
    if (confirm('Sei sicuro di voler uscire dal tuo account?')) {
      await window.TimeReclaimSupabase.signOutUser();
      state.user = { id: null, firstName: 'Ospite', lastName: '', email: '', avatar: 'TR', motivation: '' };
      saveState();
      showToast('Logout effettuato');
      switchTab('dashboard');
    }
  });

  // ==========================================================================
  // 11. AUTHENTICATION & MODAL CONTROLLERS (WITH FALLBACK HANDLERS)
  // ==========================================================================
  const authModal = document.getElementById('authModal');
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

  btnCloseAuthModal?.addEventListener('click', () => authModal.classList.remove('open'));

  tabAuthLogin?.addEventListener('click', () => {
    hideAuthStatus();
    tabAuthLogin.classList.add('active');
    tabAuthRegister.classList.remove('active');
    authModalTitle.textContent = 'Accedi';
    formLogin.style.display = 'block';
    formRegister.style.display = 'none';
    formForgotPassword.style.display = 'none';
  });

  tabAuthRegister?.addEventListener('click', () => {
    hideAuthStatus();
    tabAuthRegister.classList.add('active');
    tabAuthLogin.classList.remove('active');
    authModalTitle.textContent = 'Crea Account';
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

  // LOGIN HANDLER
  formLogin?.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideAuthStatus();
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value.trim();

    try {
      showAuthStatus('Accesso in corso...', false);
      const data = await window.TimeReclaimSupabase.signInUser({ email, password });
      
      const user = data.user;
      state.user.id = user.id;
      state.user.email = user.email;
      
      const profile = await window.TimeReclaimSupabase.fetchUserProfile(user.id);
      if (profile) {
        state.user.firstName = profile.first_name || 'Alessandro';
        state.user.lastName = profile.last_name || 'Foti';
      } else {
        const emailParts = email.split('@')[0].split('.');
        state.user.firstName = emailParts[0] ? emailParts[0].charAt(0).toUpperCase() + emailParts[0].slice(1) : 'Utente';
        state.user.lastName = emailParts[1] ? emailParts[1].charAt(0).toUpperCase() + emailParts[1].slice(1) : '';
      }
      state.user.avatar = (state.user.firstName[0] + (state.user.lastName[0] || '')).toUpperCase();

      saveState();
      showAuthStatus('Accesso effettuato!', false);
      showToast(`Bentornato/a, ${state.user.firstName}!`);
      setTimeout(() => authModal.classList.remove('open'), 800);
    } catch (err) {
      showAuthStatus(err.message || 'Errore durante l\'accesso', true);
    }
  });

  // REGISTER HANDLER (SAFE WITHOUT FAILED TO FETCH)
  formRegister?.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideAuthStatus();
    const firstName = document.getElementById('regFirstName').value.trim();
    const lastName = document.getElementById('regLastName').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const password = document.getElementById('regPassword').value.trim();

    try {
      showAuthStatus('Creazione account in corso...', false);
      const res = await window.TimeReclaimSupabase.signUpUser({ firstName, lastName, email, password });
      
      state.user.firstName = firstName;
      state.user.lastName = lastName;
      state.user.email = email;
      state.user.avatar = (firstName[0] + lastName[0]).toUpperCase();
      if (res && res.user) state.user.id = res.user.id;

      saveState();
      showAuthStatus('Registrazione completata con successo!', false);
      showToast(`Benvenuto/a, ${firstName}! Registrazione completata.`);
      setTimeout(() => authModal.classList.remove('open'), 800);
    } catch (err) {
      showAuthStatus(err.message || 'Errore durante la registrazione', true);
    }
  });

  // PASSWORD RESET HANDLER
  formForgotPassword?.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideAuthStatus();
    const email = document.getElementById('forgotEmail').value.trim();

    try {
      showAuthStatus('Invio mail di reset...', false);
      const res = await window.TimeReclaimSupabase.sendPasswordReset(email);
      showAuthStatus(res.message || `Email per il reset della password inviata a ${email}!`, false);
    } catch (err) {
      showAuthStatus(err.message || 'Errore durante l\'invio dell\'email', true);
    }
  });

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
      icon: category === 'cinema' ? 'fa-film' : category === 'fitness' ? 'fa-dumbbell' : 'fa-graduation-cap'
    });

    saveState();
    addActivityModal.classList.remove('open');
    addActivityForm.reset();
    showToast(`Nuova attività "${title}" creata nella Banca Attività!`);
  });

  // ==========================================================================
  // 12. GLOBAL RENDER ALL FUNCTION
  // ==========================================================================
  function renderAll() {
    const r = state.routine;

    const navAvatar = document.getElementById('navAvatar');
    const navUserName = document.getElementById('navUserName');
    if (navAvatar) navAvatar.textContent = state.user.avatar || 'TR';
    if (navUserName) navUserName.textContent = state.user.firstName ? `${state.user.firstName}` : 'Accedi';

    const metrics = calculateMetrics();
    const statAwakeHours = document.getElementById('statAwakeHours');
    if (statAwakeHours) statAwakeHours.textContent = `${metrics.awakeHours.toFixed(1)} h`;

    const statReclaimedHours = document.getElementById('statReclaimedHours');
    if (statReclaimedHours) statReclaimedHours.textContent = `${metrics.reclaimedSocialHours.toFixed(1)} h`;

    const statRelationScore = document.getElementById('statRelationScore');
    if (statRelationScore) statRelationScore.textContent = `${metrics.relationScore}%`;

    // Sliders sync
    if (sleepHoursInput) sleepHoursInput.value = r.sleepHours;
    if (sleepHoursVal) sleepHoursVal.textContent = `${r.sleepHours.toFixed(1)} Ore`;

    if (workHoursInput) workHoursInput.value = r.workHours;
    if (choresHoursInput) choresHoursInput.value = r.choresHours;
    document.getElementById('workHoursVal').textContent = `${r.workHours.toFixed(1)} Ore`;
    document.getElementById('choresHoursVal').textContent = `${r.choresHours.toFixed(1)} Ore`;

    if (socialWasteInput) socialWasteInput.value = r.socialWasteHours;
    if (socialWasteVal) socialWasteVal.textContent = `${r.socialWasteHours.toFixed(1)} Ore`;

    Object.keys(state.allocations).forEach(k => {
      const inp = document.getElementById(`alloc${k.charAt(0).toUpperCase() + k.slice(1)}Input`);
      const val = document.getElementById(`alloc${k.charAt(0).toUpperCase() + k.slice(1)}Val`);
      if (inp) inp.value = state.allocations[k];
      if (val) val.textContent = `${state.allocations[k].toFixed(1)} Ore`;
    });

    const step4TotalBudget = document.getElementById('step4TotalBudget');
    if (step4TotalBudget) step4TotalBudget.textContent = `${metrics.totalIntentionalBudget.toFixed(1)} Ore`;

    // Component Renders
    renderTimeWheelSVG();
    renderHarmonyBar();
    renderDailyChecklist();
    renderDetoxShowcase();
    renderCustomActivities();
    renderHourlyTimeline('dashboardHourlyGrid');
    renderUserProfile();
  }

  // Initial Boot Render
  renderAll();
  updateWizardUI();

});
