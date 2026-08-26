/**
 * TIME RECLAIM - FULL-STACK ENGINE & WIREFRAME LAYOUT SYSTEM
 * Layout allineato ai 3 Wireframe: Day Chips, Timeline Segmentata, KPI Trio, Card Visive con Sfondo WCAG, Dashed Add Card e Storici.
 */

document.addEventListener('DOMContentLoaded', () => {

  // ==========================================================================
  // 1. STATE STORE & LOCALSTORAGE PERSISTENCE
  // ==========================================================================
  const DEFAULT_STATE = {
    user: {
      id: null,
      firstName: 'Alessandro',
      lastName: 'Foti',
      email: 'alessandro@esempio.com',
      avatar: 'AF',
      streakDays: 3,
      noSocialHours: 15,
      freeTimeHours: 5.0
    },
    plannedActivities: [
      { id: 'p1', title: 'Lavoro', startTime: '9:00', endTime: '13:00', tag: 'busy' },
      { id: 'p2', title: 'Pranzo', startTime: '13:00', endTime: '14:00', tag: 'free' },
      { id: 'p3', title: 'Lavoro', startTime: '14:00', endTime: '18:00', tag: 'busy' },
      { id: 'p4', title: 'Cena', startTime: '20:00', endTime: '21:00', tag: 'free' }
    ],
    suggestedActivities: [
      {
        id: 's1',
        title: 'Yoga',
        subtitle: 'Sessione di stretching e relax',
        duration: '45 minuti',
        tag: 'free',
        bgImage: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?q=80&w=800&auto=format&fit=crop'
      },
      {
        id: 's2',
        title: 'Serie tv',
        subtitle: 'Tempo: 50 minuti',
        duration: '50 minuti',
        tag: 'free',
        bgImage: 'https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?q=80&w=800&auto=format&fit=crop'
      },
      {
        id: 's3',
        title: 'Basket',
        subtitle: 'Partita al parco',
        duration: '50 minuti',
        tag: 'free',
        bgImage: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=800&auto=format&fit=crop'
      },
      {
        id: 's4',
        title: 'Allenamento',
        subtitle: 'Sessione palestra/workout',
        duration: '1h e 30 min',
        tag: 'free',
        bgImage: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=800&auto=format&fit=crop'
      }
    ],
    activityHistory: [
      { id: 'h1', title: 'Lavoro', durationText: '8 h', tag: 'busy' },
      { id: 'h2', title: 'Basket', durationText: '50 min', tag: 'free' },
      { id: 'h3', title: 'Allenamento', durationText: '1h e 30 min', tag: 'free' }
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
  // 2. TOAST NOTIFICATIONS
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
  // 3. NAVIGATION (4 WIREFRAME TABS)
  // ==========================================================================
  const navItems = document.querySelectorAll('.nav-item');
  const viewSections = document.querySelectorAll('.view-section');

  navItems.forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });

  function switchTab(tabId) {
    navItems.forEach(b => b.classList.toggle('active', b.dataset.tab === tabId));
    viewSections.forEach(sec => sec.classList.toggle('active', sec.id === `view-${tabId}`));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ==========================================================================
  // 4. HEADER DATE & DAY CHIPS RENDERER (WIREFRAME 1 & 2)
  // ==========================================================================
  function renderHeaderDateAndChips() {
    const dateEl = document.getElementById('currentFormattedDate');
    if (dateEl) {
      const now = new Date();
      const options = { day: 'numeric', month: 'long' };
      dateEl.textContent = now.toLocaleDateString('it-IT', options);
    }

    const dayItems = document.querySelectorAll('.day-chip-item');
    dayItems.forEach((chip, idx) => {
      chip.onclick = () => {
        dayItems.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
      };
    });
  }

  // ==========================================================================
  // 5. SEGMENTED 24-HOUR TIMELINE PROGRESS BAR RENDERER
  // ==========================================================================
  function renderSegmentedTimeline(containerId) {
    const track = document.getElementById(containerId);
    if (!track) return;

    // Pattern matching Wireframe 1 & 2 timeline bar (sleep -> busy -> lunch free -> busy -> evening free -> sleep)
    const segments = [
      { type: 'sleep', widthPercent: 29 }, // 00:00 - 07:00
      { type: 'busy', widthPercent: 25 },  // 07:00 - 13:00 Lavoro
      { type: 'free', widthPercent: 8 },   // 13:00 - 14:00 Pranzo
      { type: 'busy', widthPercent: 17 },  // 14:00 - 18:00 Lavoro
      { type: 'free', widthPercent: 12 },  // 18:00 - 21:00 Tempo Libero
      { type: 'sleep', widthPercent: 9 }   // 21:00 - 24:00
    ];

    track.innerHTML = segments.map(s => `
      <div class="segmented-piece ${s.type}" style="width: ${s.widthPercent}%;"></div>
    `).join('');
  }

  // ==========================================================================
  // 6. KPI TRIO RENDERER (WIREFRAME 1)
  // ==========================================================================
  function renderKPITrio() {
    const kpiFreeTime = document.getElementById('kpiFreeTime');
    const kpiNoSocial = document.getElementById('kpiNoSocial');
    const kpiStreak = document.getElementById('kpiStreak');

    if (kpiFreeTime) kpiFreeTime.textContent = `${state.user.freeTimeHours} h`;
    if (kpiNoSocial) kpiNoSocial.textContent = `${state.user.noSocialHours} h`;
    if (kpiStreak) kpiStreak.textContent = `x${state.user.streakDays} gg`;
  }

  // ==========================================================================
  // 7. SUGGESTED ACTIVITIES CAROUSEL RENDERER (WCAG ACCESSIBILITY COMPLIANT)
  // ==========================================================================
  function renderSuggestedCarousels() {
    const renderCarousel = (containerId) => {
      const container = document.getElementById(containerId);
      if (!container) return;

      container.innerHTML = state.suggestedActivities.map(item => `
        <div class="image-bg-card" style="background-image: url('${item.bgImage}');">
          <!-- Dark Gradient Overlay for WCAG Text Contrast -->
          <div class="card-image-overlay"></div>

          <div class="card-image-content">
            <h3 class="card-image-title">${item.title}</h3>
            <p class="card-image-subtitle">${item.subtitle || item.duration}</p>
            <button class="btn-glass btn-primary btn-sm" style="margin-top: 0.35rem; width: 100%;" onclick="addSuggestedToToday('${item.title}', '${item.duration}')">
              <i class="fa-solid fa-plus"></i> Add activity
            </button>
          </div>
        </div>
      `).join('');
    };

    renderCarousel('agendaSuggestedCarousel');
    renderCarousel('catalogSuggestedCarousel');
  }

  window.addSuggestedToToday = function(title, duration) {
    state.plannedActivities.push({
      id: Date.now().toString(),
      title,
      startTime: '18:30',
      endTime: '19:30',
      tag: 'free'
    });

    state.activityHistory.push({
      id: Date.now().toString(),
      title,
      durationText: duration,
      tag: 'free'
    });

    saveState();
    showToast(`Attività "${title}" aggiunta al tuo piano di oggi!`);
  };

  // ==========================================================================
  // 8. PLANNED ACTIVITIES LIST RENDERER (WIREFRAME 2)
  // ==========================================================================
  function renderPlannedActivities() {
    const container = document.getElementById('plannedActivitiesList');
    if (!container) return;

    if (state.plannedActivities.length === 0) {
      container.innerHTML = `<p style="color: var(--text-muted); padding: 0.5rem;">Nessuna attività pianificata. Clicca su "+ Add Activity" sopra!</p>`;
      return;
    }

    container.innerHTML = state.plannedActivities.map(item => `
      <div class="planned-item-card">
        <span class="planned-item-title">${item.title}</span>
        <span class="planned-item-time">${item.startTime}-${item.endTime}</span>
      </div>
    `).join('');
  }

  // ==========================================================================
  // 9. ACTIVITY HISTORY LIST RENDERER (WIREFRAME 3)
  // ==========================================================================
  function renderActivityHistory() {
    const container = document.getElementById('historyActivitiesList');
    if (!container) return;

    container.innerHTML = state.activityHistory.map(item => `
      <div class="history-item-card">
        <span class="planned-item-title">${item.title}</span>
        <span class="planned-item-time">${item.durationText}</span>
      </div>
    `).join('');
  }

  // ==========================================================================
  // 10. MODAL QUICK ADD HANDLERS
  // ==========================================================================
  const quickAddModal = document.getElementById('quickAddModal');
  const btnCloseQuickAddModal = document.getElementById('btnCloseQuickAddModal');
  const fabQuickAdd = document.getElementById('fabQuickAdd');
  const btnAgendaAddActivity = document.getElementById('btnAgendaAddActivity');
  const btnRoutineAddDashed = document.getElementById('btnRoutineAddDashed');

  let selectedTag = 'free';

  const openQuickAddModal = () => quickAddModal?.classList.add('open');
  const closeQuickAddModal = () => quickAddModal?.classList.remove('open');

  fabQuickAdd?.addEventListener('click', openQuickAddModal);
  btnAgendaAddActivity?.addEventListener('click', openQuickAddModal);
  btnRoutineAddDashed?.addEventListener('click', openQuickAddModal);
  btnCloseQuickAddModal?.addEventListener('click', closeQuickAddModal);

  const btnTagFreeTime = document.getElementById('btnTagFreeTime');
  const btnTagDuty = document.getElementById('btnTagDuty');

  btnTagFreeTime?.addEventListener('click', () => {
    selectedTag = 'free';
    btnTagFreeTime.className = 'btn-glass btn-accent-free btn-sm';
    btnTagDuty.className = 'btn-glass btn-primary btn-sm';
  });

  btnTagDuty?.addEventListener('click', () => {
    selectedTag = 'busy';
    btnTagDuty.className = 'btn-glass btn-primary btn-sm';
    btnTagFreeTime.className = 'btn-glass btn-accent-free btn-sm';
  });

  document.getElementById('formQuickAdd')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const title = document.getElementById('quickActTitle').value.trim();
    const startTime = document.getElementById('quickActStart').value;
    const endTime = document.getElementById('quickActEnd').value;

    state.plannedActivities.push({
      id: Date.now().toString(),
      title,
      startTime,
      endTime,
      tag: selectedTag
    });

    state.activityHistory.push({
      id: Date.now().toString(),
      title,
      durationText: '1 h',
      tag: selectedTag
    });

    saveState();
    closeQuickAddModal();
    document.getElementById('formQuickAdd').reset();
    showToast(`Attività "${title}" salvata!`);
  });

  // ==========================================================================
  // 11. USER PROFILE RENDERER & AUTH
  // ==========================================================================
  function renderUserProfile() {
    const profileAvatarLarge = document.getElementById('profileAvatarLarge');
    const profileName = document.getElementById('profileName');
    const profileEmail = document.getElementById('profileEmail');

    if (profileAvatarLarge) profileAvatarLarge.textContent = state.user.avatar || 'AF';
    if (profileName) profileName.textContent = state.user.firstName ? `${state.user.firstName} ${state.user.lastName}` : 'Alessandro Foti';
    if (profileEmail) profileEmail.textContent = state.user.email || 'alessandro@esempio.com';
  }

  // Auth Handlers
  const authModal = document.getElementById('authModal');
  const btnCloseAuthModal = document.getElementById('btnCloseAuthModal');
  const tabAuthLogin = document.getElementById('tabAuthLogin');
  const tabAuthRegister = document.getElementById('tabAuthRegister');
  const formLogin = document.getElementById('formLogin');
  const formRegister = document.getElementById('formRegister');

  document.getElementById('btnOpenAuthFromProfile')?.addEventListener('click', () => authModal?.classList.add('open'));
  btnCloseAuthModal?.addEventListener('click', () => authModal?.classList.remove('open'));

  tabAuthLogin?.addEventListener('click', () => {
    formLogin.style.display = 'block';
    formRegister.style.display = 'none';
  });

  tabAuthRegister?.addEventListener('click', () => {
    formLogin.style.display = 'none';
    formRegister.style.display = 'block';
  });

  formLogin?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value.trim();
    try {
      const data = await window.TimeReclaimSupabase.signInUser({ email, password });
      if (data && data.user) state.user.id = data.user.id;
      saveState();
      authModal?.classList.remove('open');
      showToast('Accesso effettuato!');
    } catch (err) {
      showToast('Errore durante l\'accesso');
    }
  });

  formRegister?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const firstName = document.getElementById('regFirstName').value.trim();
    const lastName = document.getElementById('regLastName').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const password = document.getElementById('regPassword').value.trim();

    try {
      const res = await window.TimeReclaimSupabase.signUpUser({ firstName, lastName, email, password });
      state.user.firstName = firstName;
      state.user.lastName = lastName;
      state.user.email = email;
      state.user.avatar = (firstName[0] + lastName[0]).toUpperCase();
      if (res && res.user) state.user.id = res.user.id;

      saveState();
      authModal?.classList.remove('open');
      showToast(`Benvenuto/a, ${firstName}!`);
    } catch (err) {
      showToast('Errore durante la registrazione');
    }
  });

  document.getElementById('btnLogout')?.addEventListener('click', async () => {
    if (confirm('Sei sicuro di voler uscire dal tuo account?')) {
      await window.TimeReclaimSupabase.signOutUser();
      state.user = { id: null, firstName: 'Ospite', lastName: '', email: '', avatar: 'TR', streakDays: 1, noSocialHours: 0, freeTimeHours: 2 };
      saveState();
      showToast('Logout effettuato');
    }
  });

  // ==========================================================================
  // 12. GLOBAL RENDER ALL FUNCTION
  // ==========================================================================
  function renderAll() {
    renderHeaderDateAndChips();
    renderSegmentedTimeline('agendaSegmentedTrack');
    renderSegmentedTimeline('routineSegmentedTrack');
    renderKPITrio();
    renderSuggestedCarousels();
    renderPlannedActivities();
    renderActivityHistory();
    renderUserProfile();
  }

  // Boot Application
  renderAll();

});
