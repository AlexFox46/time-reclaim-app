/**
 * TIME RECLAIM - SUPABASE CLOUD AUTH & SYNC ENGINE
 */

window.TimeReclaimSupabase = (function () {
  let supabaseClient = null;

  function getCredentials() {
    return {
      url: localStorage.getItem('supabase_url') || '',
      key: localStorage.getItem('supabase_anon_key') || ''
    };
  }

  function setCredentials(url, key) {
    localStorage.setItem('supabase_url', url);
    localStorage.setItem('supabase_anon_key', key);
    return initClient();
  }

  function initClient() {
    const creds = getCredentials();
    if (creds.url && creds.key && window.supabase) {
      try {
        supabaseClient = window.supabase.createClient(creds.url, creds.key);
        console.log('Supabase client initialized successfully.');
        return true;
      } catch (e) {
        console.error('Failed to initialize Supabase client:', e);
      }
    }
    return false;
  }

  // Auto initialize if keys exist
  initClient();

  return {
    isConfigured: () => !!supabaseClient,
    setCredentials,
    getCredentials,

    // Auth 1: SignUp (Nome, Cognome, Email, Password)
    async signUpUser({ firstName, lastName, email, password }) {
      if (!supabaseClient) throw new Error('Supabase non è ancora configurato. Inserisci URL e Anon Key nelle impostazioni.');

      const { data, error } = await supabaseClient.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName
          }
        }
      });

      if (error) throw error;
      return data;
    },

    // Auth 2: SignIn (Email, Password)
    async signInUser({ email, password }) {
      if (!supabaseClient) throw new Error('Supabase non è ancora configurato.');

      const { data, error } = await supabaseClient.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;
      return data;
    },

    // Auth 3: Recupero Password via Email
    async sendPasswordReset(email) {
      if (!supabaseClient) throw new Error('Supabase non è ancora configurato.');

      const { data, error } = await supabaseClient.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.href
      });

      if (error) throw error;
      return data;
    },

    // Auth 4: SignOut
    async signOutUser() {
      if (!supabaseClient) return;
      const { error } = await supabaseClient.auth.signOut();
      if (error) throw error;
    },

    // Auth Session State Listener
    onAuthStateChange(callback) {
      if (!supabaseClient) return;
      supabaseClient.auth.onAuthStateChange((event, session) => {
        callback(event, session);
      });
    },

    // Fetch Current Session
    async getSession() {
      if (!supabaseClient) return null;
      const { data } = await supabaseClient.auth.getSession();
      return data?.session || null;
    },

    // Fetch User Profile from DB
    async fetchUserProfile(userId) {
      if (!supabaseClient || !userId) return null;

      const { data, error } = await supabaseClient
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) console.warn('Could not fetch user profile:', error);
      return data;
    },

    // Sync State to Cloud
    async syncStateToCloud(userId, state) {
      if (!supabaseClient || !userId) return { success: false };

      try {
        // Upsert Profile
        await supabaseClient.from('profiles').upsert({
          id: userId,
          first_name: state.user.firstName,
          last_name: state.user.lastName,
          email: state.user.email,
          avatar: state.user.avatar,
          motivation: state.user.motivation,
          updated_at: new Date()
        });

        // Upsert Routine
        await supabaseClient.from('routines').upsert({
          user_id: userId,
          sleep_hours: state.routine.sleepHours,
          wake_time: state.routine.wakeTime,
          sleep_time: state.routine.sleepTime,
          work_hours: state.routine.workHours,
          commute_hours: state.routine.commuteHours,
          chores_hours: state.routine.choresHours,
          social_waste_hours: state.routine.socialWasteHours,
          detox_percent: state.routine.detoxPercent,
          updated_at: new Date()
        });

        // Upsert Allocations
        await supabaseClient.from('allocations').upsert({
          user_id: userId,
          productive: state.allocations.productive,
          fitness: state.allocations.fitness,
          cinema: state.allocations.cinema,
          relations: state.allocations.relations,
          boredom: state.allocations.boredom,
          updated_at: new Date()
        });

        return { success: true };
      } catch (err) {
        console.error('Supabase Cloud Sync Error:', err);
        return { success: false, error: err.message };
      }
    }
  };
})();
