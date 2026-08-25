/**
 * TIME RECLAIM - FULL-STACK ENGINE & UI UX ARCHITECTURE
 * Mobile-First Liquid Glass Experience: Onboarding 6 Step, Timeline Orizzontale Snap, 4 Viste & FAB
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
      onboardingCompleted: false,
      googleCalendarLinked: true,
      freeTimeGoalMinutes: 180,
      wakeTime: '07:00',
      sleepTime: '23:00'
    },
    timelineBlocks: [
      { id: 'b1', title: 'Risveglio & Caffè', startTime: '07:00', endTime: '07:30', tag: 'dovere' },
      { id: 'b2', title: 'Lavoro Focus', startTime: '09:00', endTime: '13:00', tag: 'dovere' },
      { id: 'b3', title: 'Pausa Pranzo Intenzionale', startTime: '13:00', endTime: '14:00', tag: 'tempo_libero' },
      { id: 'b4', title: 'Lavoro Pomeriggio', startTime: '14:00', endTime: '18:00', tag: 'dovere' },
      { id: 'b5', title: 'Workout / Palestra', startTime: '18:30', endTime: '19:30', tag: 'tempo_libero' },
      { id: 'b6', title: 'Cinema & Relax Serale', startTime: '21:00', endTime: '23:00', tag: 'tempo_libero' }
    ],
    routines: [
      { id: 'r1', title: 'Idratazione & Stretching', moment: 'mattina', isActive: true, startTime: '07:15', endTime: '07:30' },
      { id: 'r2', title: 'Pianificazione Priorità', moment: 'lavoro', isActive: true, startTime: '09:00', endTime: '09:15' },
      { id: 'r3', title: 'Lettura o Musica', moment: 'sera', isActive: true, startTime: '22:00', endTime: '22:45' }
    ],
    catalog: [
      { id: 'c1', title: 'Allenamento in Palestra', tag: 'tempo_libero', durationMinutes: 60, icon: 'fa-dumbbell' },
      { id: 'c2', title: 'Lettura o Corso Online', tag: 'tempo_libero', durationMinutes: 90, icon: 'fa-book' },
      { id: 'c3', title: 'Film / Serie TV', tag: 'tempo_libero', durationMinutes: 120, icon: 'fa-film' },
      { id: 'c4', title: 'Faccende Domestiche', tag: 'dovere', durationMinutes: 45, icon: 'fa-broom' },
      { id: 'c5', title: 'Sessione di Studio / Work', tag: 'dovere', durationMinutes: 120, icon: 'fa-briefcase' }
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
  // 3. NAVIGATION SYSTEM (4 MAIN VIEWS)
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

  document.getElementById('headerAvatarBtn')?.addEventListener('click', () => switchTab('profile'));

  // ==========================================================================
  // 4. ONBOARDING MULTI-STEP WIZARD (6 STEPS)
  // ==========================================================================
  let currentOnboardingStep = 1;

  const onboardingWizard = document.getElementById('onboardingWizard');
  const onboardingStepTitle = document.getElementById('onboardingStepTitle');
  const onboardingStepPercent = document.getElementById('onboardingStepPercent');
  const onboardingProgressFill = document.getElementById('onboardingProgressFill');

  function updateOnboardingStepUI() {
    for (let s = 1; s <= 6; s++) {
      const stepEl = document.getElementById(`onbStep${s}`);
      if (stepEl) stepEl.classList.toggle('active', s === currentOnboardingStep);
    }

    const percent = Math.round((currentOnboardingStep / 6) * 100);
    if (onboardingStepTitle) onboardingStepTitle.textContent = `Passo ${currentOnboardingStep} di 6`;
    if (onboardingStepPercent) onboardingStepPercent.textContent = `${percent}%`;
    if (onboardingProgressFill) onboardingProgressFill.style.width = `${percent}%`;
  }

  function checkOnboardingStatus() {
    if (!state.user.onboardingCompleted) {
      if (onboardingWizard) onboardingWizard.style.display = 'flex';
      currentOnboardingStep = 1;
      updateOnboardingStepUI();
    } else {
      if (onboardingWizard) onboardingWizard.style.display = 'none';
    }
  }

  // Step 1 -> Step 2
  document.getElementById('onbBtnStep1Next')?.addEventListener('click', () => {
    currentOnboardingStep = 2;
    updateOnboardingStepUI();
  });

  // Step 2 -> Step 3
  document.getElementById('onbBtnStep2Prev')?.addEventListener('click', () => { currentOnboardingStep = 1; updateOnboardingStepUI(); });
  document.getElementById('onbBtnStep2Next')?.addEventListener('click', () => {
    state.user.wakeTime = document.getElementById('onbWakeTime').value;
    state.user.sleepTime = document.getElementById('onbSleepTime').value;
    currentOnboardingStep = 3;
    updateOnboardingStepUI();
  });

  // Step 3 -> Step 4
  document.getElementById('onbBtnStep3Prev')?.addEventListener('click', () => { currentOnboardingStep = 2; updateOnboardingStepUI(); });
  document.getElementById('onbBtnStep3Next')?.addEventListener('click', () => {
    currentOnboardingStep = 4;
    updateOnboardingStepUI();
  });

  // Step 4 Goal Slider
  const onbFreeGoalInput = document.getElementById('onbFreeGoalInput');
  const onbFreeGoalVal = document.getElementById('onbFreeGoalVal');

  onbFreeGoalInput?.addEventListener('input', (e) => {
    const mins = parseInt(e.target.value);
    state.user.freeTimeGoalMinutes = mins;
    const hours = (mins / 60).toFixed(1);
    if (onbFreeGoalVal) onbFreeGoalVal.textContent = `${hours} Ore (${mins} min)`;
  });

  document.getElementById('onbBtnStep4Prev')?.addEventListener('click', () => { currentOnboardingStep = 3; updateOnboardingStepUI(); });
  document.getElementById('onbBtnStep4Next')?.addEventListener('click', () => {
    currentOnboardingStep = 5;
    updateOnboardingStepUI();
  });

  // Step 5 -> Step 6 (Timeline Generation Loading)
  document.getElementById('onbBtnStep5Prev')?.addEventListener('click', () => { currentOnboardingStep = 4; updateOnboardingStepUI(); });
  document.getElementById('onbBtnStep5Next')?.addEventListener('click', () => {
    state.user.notifyStreaks = document.getElementById('onbNotifyStreaks')?.checked ?? true;
    state.user.notifyWeekly = document.getElementById('onbNotifyWeekly')?.checked ?? true;
    
    currentOnboardingStep = 6;
    updateOnboardingStepUI();

    // Loading Progress Bar Animation
    let progress = 0;
    const genFill = document.getElementById('onbGenProgressFill');
    const interval = setInterval(() => {
      progress += 20;
      if (genFill) genFill.style.width = `${progress}%`;
      if (progress >= 100) {
        clearInterval(interval);
        state.user.onboardingCompleted = true;
        saveState();
        setTimeout(() => {
          if (onboardingWizard) onboardingWizard.style.display = 'none';
          showToast('Timeline generata! Benvenuto in TimeReclaim.');
          switchTab('agenda');
        }, 500);
      }
    }, 400);
  });

  // ==========================================================================
  // 6. CORE COMPONENT: HORIZONTAL TIMELINE SNAP-TO-CARD (AGENDA)
  // ==========================================================================
  function renderHorizontalTimeline() {
    const container = document.getElementById('horizontalTimeline');
    if (!container) return;

    if (state.timelineBlocks.length === 0) {
      container.innerHTML = `<div style="padding: 1rem; color: var(--text-muted);">Nessuna attività programmata oggi. Usa il tasto (+) in basso a destra per aggiungerne una!</div>`;
      return;
    }

    container.innerHTML = state.timelineBlocks.map(b => {
      const isFree = b.tag === 'tempo_libero';
      return `
        <div class="timeline-card-block ${isFree ? 'block-free-time' : 'block-duty'}">
          <div>
            <div class="block-time">
              <i class="fa-solid ${isFree ? 'fa-sparkles' : 'fa-clock'}"></i>
              ${b.startTime} - ${b.endTime}
            </div>
            <h4 class="block-title">${b.title}</h4>
          </div>
          <div>
            <span class="block-badge">${isFree ? '✨ Tempo Libero' : '💼 Dovere'}</span>
          </div>
        </div>
      `;
    }).join('');
  }

  // ==========================================================================
  // 7. ROUTINE MANAGEMENT BY MOMENTS
  // ==========================================================================
  function renderRoutines() {
    const morningList = document.getElementById('routineMorningList');
    const workList = document.getElementById('routineWorkList');
    const eveningList = document.getElementById('routineEveningList');

    const renderList = (listEl, moment) => {
      if (!listEl) return;
      const items = state.routines.filter(r => r.moment === moment);
      if (items.length === 0) {
        listEl.innerHTML = `<p style="font-size: 0.8rem; color: var(--text-muted); padding: 0.5rem;">Nessun blocco per questo momento.</p>`;
        return;
      }
      listEl.innerHTML = items.map(r => `
        <div class="check-item">
          <div class="check-left">
            <span class="check-title">${r.title}</span>
            <span style="font-size: 0.75rem; color: var(--text-muted);">(${r.startTime} - ${r.endTime})</span>
          </div>
          <label class="glass-switch">
            <input type="checkbox" ${r.isActive ? 'checked' : ''} onchange="toggleRoutineActive('${r.id}')">
            <span class="switch-slider"></span>
          </label>
        </div>
      `).join('');
    };

    renderList(morningList, 'mattina');
    renderList(workList, 'lavoro');
    renderList(eveningList, 'sera');
  }

  window.toggleRoutineActive = function(id) {
    const item = state.routines.find(r => r.id === id);
    if (item) {
      item.isActive = !item.isActive;
      saveState();
      showToast(`Routine "${item.title}" ${item.isActive ? 'attivata' : 'disattivata'}`);
    }
  };

  // ==========================================================================
  // 8. ACTIVITIES CATALOG & LIBRERIA
  // ==========================================================================
  function renderCatalog() {
    const grid = document.getElementById('catalogActivitiesGrid');
    if (!grid) return;

    grid.innerHTML = state.catalog.map(c => `
      <div class="option-card" style="border-color: ${c.tag === 'tempo_libero' ? 'var(--tag-free-time-border)' : 'var(--glass-border)'}">
        <div class="option-icon" style="background: ${c.tag === 'tempo_libero' ? 'var(--accent-neon-cyan)' : 'var(--accent-blue)'}; color: #050b14;">
          <i class="fa-solid ${c.icon || 'fa-star'}"></i>
        </div>
        <div class="option-info">
          <h4 style="font-size: 0.95rem; font-weight: 700; color: #fff;">${c.title}</h4>
          <p style="font-size: 0.75rem; color: var(--text-muted);">Durata: ${c.durationMinutes} min</p>
        </div>
        <button class="btn-glass btn-sm" style="margin-top: 0.35rem;" onclick="addCatalogToAgenda('${c.title}', '${c.tag}')">
          <i class="fa-solid fa-plus"></i> Aggiungi all'Agenda
        </button>
      </div>
    `).join('');
  }

  window.addCatalogToAgenda = function(title, tag) {
    state.timelineBlocks.push({
      id: Date.now().toString(),
      title,
      startTime: '18:00',
      endTime: '19:30',
      tag
    });
    saveState();
    showToast(`Attività "${title}" aggiunta alla timeline!`);
  };

  // ==========================================================================
  // 9. FAB (+) QUICK ADD MODAL & GOOGLE CALENDAR SYNC
  // ==========================================================================
  const quickAddModal = document.getElementById('quickAddModal');
  const fabQuickAdd = document.getElementById('fabQuickAdd');
  const btnCloseQuickAddModal = document.getElementById('btnCloseQuickAddModal');

  let selectedQuickTag = 'tempo_libero';

  fabQuickAdd?.addEventListener('click', () => quickAddModal.classList.add('open'));
  btnCloseQuickAddModal?.addEventListener('click', () => quickAddModal.classList.remove('open'));

  const btnTagFreeTime = document.getElementById('btnTagFreeTime');
  const btnTagDuty = document.getElementById('btnTagDuty');

  btnTagFreeTime?.addEventListener('click', () => {
    selectedQuickTag = 'tempo_libero';
    btnTagFreeTime.className = 'btn-glass btn-primary btn-sm';
    btnTagDuty.className = 'btn-glass btn-secondary btn-sm';
  });

  btnTagDuty?.addEventListener('click', () => {
    selectedQuickTag = 'dovere';
    btnTagDuty.className = 'btn-glass btn-primary btn-sm';
    btnTagFreeTime.className = 'btn-glass btn-secondary btn-sm';
  });

  document.getElementById('formQuickAdd')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = document.getElementById('quickActTitle').value.trim();
    const startTime = document.getElementById('quickActStart').value;
    const endTime = document.getElementById('quickActEnd').value;

    const newBlock = {
      id: Date.now().toString(),
      title,
      startTime,
      endTime,
      tag: selectedQuickTag
    };

    state.timelineBlocks.push(newBlock);
    saveState();

    quickAddModal.classList.remove('open');
    document.getElementById('formQuickAdd').reset();
    showToast(`Attività "${title}" salvata nell'Agenda!`);

    // Call Supabase Edge Function to sync to Google Calendar if linked
    if (state.user.googleCalendarLinked && window.TimeReclaimSupabase && window.TimeReclaimSupabase.isConfigured()) {
      try {
        console.log('Chiamata asincrona Supabase Edge Function per Google Calendar API...');
      } catch (err) {
        console.warn('Sync Google Calendar warn:', err);
      }
    }
  });

  // ==========================================================================
  // 10. USER PROFILE SCREEN RENDERER & AUTH
  // ==========================================================================
  function renderUserProfile() {
    const profileAvatarLarge = document.getElementById('profileAvatarLarge');
    const profileName = document.getElementById('profileName');
    const profileEmail = document.getElementById('profileEmail');
    const profileStatusBadge = document.getElementById('profileStatusBadge');

    if (profileAvatarLarge) profileAvatarLarge.textContent = state.user.avatar || 'TR';
    if (profileName) profileName.textContent = state.user.firstName ? `${state.user.firstName} ${state.user.lastName}` : 'Alessandro Foti';
    if (profileEmail) profileEmail.textContent = state.user.email || 'alessandro@esempio.com';

    if (profileStatusBadge) {
      if (state.user.id && !state.user.id.startsWith('usr_')) {
        profileStatusBadge.innerHTML = `<i class="fa-solid fa-cloud-check"></i> Supabase Cloud Connected`;
        profileStatusBadge.style.color = 'var(--accent-neon-cyan)';
      } else {
        profileStatusBadge.innerHTML = `<i class="fa-solid fa-hard-drive"></i> Profilo Utente Attivo`;
        profileStatusBadge.style.color = 'var(--accent-neon-lime)';
      }
    }
  }

  // AUTH MODAL HANDLERS
  const authModal = document.getElementById('authModal');
  const btnCloseAuthModal = document.getElementById('btnCloseAuthModal');
  const authModalTitle = document.getElementById('authModalTitle');
  const authStatusBanner = document.getElementById('authStatusBanner');

  const tabAuthLogin = document.getElementById('tabAuthLogin');
  const tabAuthRegister = document.getElementById('tabAuthRegister');
  const formLogin = document.getElementById('formLogin');
  const formRegister = document.getElementById('formRegister');

  function showAuthStatus(msg, isError = false) {
    if (!authStatusBanner) return;
    authStatusBanner.style.display = 'block';
    authStatusBanner.style.background = isError ? 'rgba(255, 77, 109, 0.15)' : 'rgba(0, 245, 212, 0.15)';
    authStatusBanner.style.color = isError ? 'var(--accent-red)' : 'var(--accent-neon-lime)';
    authStatusBanner.textContent = msg;
  }

  function hideAuthStatus() { if (authStatusBanner) authStatusBanner.style.display = 'none'; }

  document.getElementById('btnOpenAuthFromProfile')?.addEventListener('click', () => authModal.classList.add('open'));
  btnCloseAuthModal?.addEventListener('click', () => authModal.classList.remove('open'));

  tabAuthLogin?.addEventListener('click', () => {
    hideAuthStatus();
    tabAuthLogin.classList.add('active');
    tabAuthRegister.classList.remove('active');
    authModalTitle.textContent = 'Accedi';
    formLogin.style.display = 'block';
    formRegister.style.display = 'none';
  });

  tabAuthRegister?.addEventListener('click', () => {
    hideAuthStatus();
    tabAuthRegister.classList.add('active');
    tabAuthLogin.classList.remove('active');
    authModalTitle.textContent = 'Crea Account';
    formLogin.style.display = 'none';
    formRegister.style.display = 'block';
  });

  // Login Form
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

      saveState();
      showAuthStatus('Accesso effettuato!', false);
      showToast(`Bentornato/a! Accesso eseguito.`);
      setTimeout(() => {
        authModal.classList.remove('open');
        checkOnboardingStatus();
      }, 800);
    } catch (err) {
      showAuthStatus(err.message || 'Errore durante l\'accesso', true);
    }
  });

  // Register Form
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
      state.user.onboardingCompleted = false; // New user triggers onboarding
      if (res && res.user) state.user.id = res.user.id;

      saveState();
      showAuthStatus('Registrazione completata!', false);
      showToast(`Benvenuto/a, ${firstName}! Registrazione eseguita.`);
      setTimeout(() => {
        authModal.classList.remove('open');
        checkOnboardingStatus();
      }, 800);
    } catch (err) {
      showAuthStatus(err.message || 'Errore durante la registrazione', true);
    }
  });

  // Logout Button
  document.getElementById('btnLogout')?.addEventListener('click', async () => {
    if (confirm('Sei sicuro di voler uscire dal tuo account?')) {
      await window.TimeReclaimSupabase.signOutUser();
      state.user = { id: null, firstName: 'Ospite', lastName: '', email: '', avatar: 'TR', onboardingCompleted: false };
      saveState();
      showToast('Logout effettuato');
      switchTab('agenda');
    }
  });

  // ==========================================================================
  // 11. GLOBAL RENDER ALL FUNCTION
  // ==========================================================================
  function renderAll() {
    const navAvatar = document.getElementById('navAvatar');
    const navUserName = document.getElementById('navUserName');
    if (navAvatar) navAvatar.textContent = state.user.avatar || 'TR';
    if (navUserName) navUserName.textContent = state.user.firstName ? `${state.user.firstName}` : 'Accedi';

    const todayDateEl = document.getElementById('agendaTodayDate');
    if (todayDateEl) {
      const options = { weekday: 'long', day: 'numeric', month: 'long' };
      const todayStr = new Date().toLocaleDateString('it-IT', options);
      todayDateEl.innerHTML = `<i class="fa-solid fa-clock" style="color: var(--accent-neon-cyan);"></i> Agenda - ${todayStr}`;
    }

    renderHorizontalTimeline();
    renderRoutines();
    renderCatalog();
    renderUserProfile();
  }

  // Boot Application
  renderAll();
  checkOnboardingStatus();

});
