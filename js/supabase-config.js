/**
 * TIME RECLAIM - SUPABASE CLOUD AUTH & SYNC ENGINE
 * Credenziali Supabase legate a monte senza richiesta credenziali all'utente in UI
 */

window.TimeReclaimSupabase = (function () {
  let supabaseClient = null;

  // Credenziali legate a monte (sostituibili con quelle del progetto Supabase)
  const BOUND_SUPABASE_URL = localStorage.getItem('supabase_url') || 'https://xyzcompany.supabase.co';
  const BOUND_SUPABASE_ANON_KEY = localStorage.getItem('supabase_anon_key') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6...';

  function initClient() {
    if (BOUND_SUPABASE_URL && BOUND_SUPABASE_ANON_KEY && window.supabase) {
      try {
        supabaseClient = window.supabase.createClient(BOUND_SUPABASE_URL, BOUND_SUPABASE_ANON_KEY);
        console.log('Supabase client legato a monte inizializzato.');
        return true;
      } catch (e) {
        console.warn('Inizializzazione Supabase fallita (usare local storage fallback):', e);
      }
    }
    return false;
  }

  initClient();

  return {
    isConfigured: () => !!supabaseClient,
    
    // SignUp (Nome, Cognome, Email, Password)
    async signUpUser({ firstName, lastName, email, password }) {
      if (!supabaseClient) {
        // Fallback simulato se Supabase non è ancora connesso al DB reale
        return { user: { id: 'local_' + Date.now(), email } };
      }

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

    // SignIn (Email, Password)
    async signInUser({ email, password }) {
      if (!supabaseClient) {
        return { user: { id: 'local_user', email } };
      }

      const { data, error } = await supabaseClient.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;
      return data;
    },

    // Password Reset Email
    async sendPasswordReset(email) {
      if (!supabaseClient) {
        return { message: 'Email inviata con successo' };
      }

      const { data, error } = await supabaseClient.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.href
      });

      if (error) throw error;
      return data;
    },

    // SignOut
    async signOutUser() {
      if (!supabaseClient) return;
      await supabaseClient.auth.signOut();
    },

    // Auth Session Listener
    onAuthStateChange(callback) {
      if (!supabaseClient) return;
      supabaseClient.auth.onAuthStateChange((event, session) => {
        callback(event, session);
      });
    },

    // Fetch User Profile
    async fetchUserProfile(userId) {
      if (!supabaseClient || !userId || userId.startsWith('local_')) return null;

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
      if (!supabaseClient || !userId || userId.startsWith('local_')) return { success: false };

      try {
        await supabaseClient.from('profiles').upsert({
          id: userId,
          first_name: state.user.firstName,
          last_name: state.user.lastName,
          email: state.user.email,
          avatar: state.user.avatar,
          motivation: state.user.motivation,
          updated_at: new Date()
        });

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
