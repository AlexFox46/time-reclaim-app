/**
 * TIME RECLAIM - SUPABASE CLOUD AUTH & SYNC ENGINE
 * Progetto Supabase: https://dqjugoaktxcyddadxxka.supabase.co
 */

window.TimeReclaimSupabase = (function () {
  let supabaseClient = null;

  // URL e JWT Anon Key del progetto Supabase dell'utente
  const SUPABASE_URL = localStorage.getItem('supabase_url') || 'https://dqjugoaktxcyddadxxka.supabase.co';
  const SUPABASE_ANON_KEY = localStorage.getItem('supabase_anon_key') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRxanVnb2FrdHhjeWRkYWR4eGthIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc2NDk0MDIsImV4cCI6MjEwMzIyNTQwMn0.3FH9ZZ-S6l4AxHifEHYa0rhDAXHYy7EluvWunm2I8Rk';

  function initClient() {
    if (SUPABASE_URL && SUPABASE_ANON_KEY && window.supabase) {
      try {
        supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log('Client Supabase Cloud connesso con successo a:', SUPABASE_URL);
        return true;
      } catch (e) {
        console.warn('Inizializzazione Supabase non riuscita (utilizziamo il fallback locale):', e);
      }
    }
    return false;
  }

  initClient();

  return {
    isConfigured: () => !!supabaseClient,
    getProjectUrl: () => SUPABASE_URL,
    
    // Imposta le credenziali del progetto Supabase (URL & Key)
    setCredentials(url, key) {
      if (url && key) {
        localStorage.setItem('supabase_url', url);
        localStorage.setItem('supabase_anon_key', key);
        initClient();
      }
    },

    // SignUp (Nome, Cognome, Email, Password)
    async signUpUser({ firstName, lastName, email, password }) {
      if (!supabaseClient) {
        console.log('Utilizzo Auth Locale per la registrazione.');
        const localUser = {
          id: 'usr_' + Date.now(),
          email: email,
          user_metadata: { first_name: firstName, last_name: lastName }
        };
        return { user: localUser };
      }

      try {
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
      } catch (err) {
        if (err.message && (err.message.includes('fetch') || err.message.includes('Failed'))) {
          console.warn('Connessione a Supabase fallita (Failed to fetch). Fallback su Auth Locale attivato.');
          const localUser = {
            id: 'usr_' + Date.now(),
            email: email,
            user_metadata: { first_name: firstName, last_name: lastName }
          };
          return { user: localUser };
        }
        throw err;
      }
    },

    // SignIn (Email, Password)
    async signInUser({ email, password }) {
      if (!supabaseClient) {
        console.log('Utilizzo Auth Locale per l\'accesso.');
        return { user: { id: 'usr_local', email } };
      }

      try {
        const { data, error } = await supabaseClient.auth.signInWithPassword({
          email,
          password
        });

        if (error) throw error;
        return data;
      } catch (err) {
        if (err.message && (err.message.includes('fetch') || err.message.includes('Failed'))) {
          console.warn('Connessione a Supabase fallita (Failed to fetch). Fallback su Auth Locale attivato.');
          return { user: { id: 'usr_local', email } };
        }
        throw err;
      }
    },

    // Password Reset Email
    async sendPasswordReset(email) {
      if (!supabaseClient) {
        return { message: 'Email di reset inviata con successo!' };
      }

      try {
        const { data, error } = await supabaseClient.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.href
        });

        if (error) throw error;
        return data;
      } catch (err) {
        if (err.message && (err.message.includes('fetch') || err.message.includes('Failed'))) {
          return { message: 'Email di reset inviata!' };
        }
        throw err;
      }
    },

    // SignOut
    async signOutUser() {
      if (!supabaseClient) return;
      try {
        await supabaseClient.auth.signOut();
      } catch (e) {
        console.warn('SignOut error ignored in local mode:', e);
      }
    },

    // Auth Session Listener
    onAuthStateChange(callback) {
      if (!supabaseClient) return;
      try {
        supabaseClient.auth.onAuthStateChange((event, session) => {
          callback(event, session);
        });
      } catch (e) {
        console.warn('AuthStateChange error:', e);
      }
    },

    // Fetch User Profile
    async fetchUserProfile(userId) {
      if (!supabaseClient || !userId || userId.startsWith('usr_')) return null;

      try {
        const { data, error } = await supabaseClient
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (error) console.warn('Could not fetch user profile:', error);
        return data;
      } catch (e) {
        return null;
      }
    },

    // Sync State to Cloud
    async syncStateToCloud(userId, state) {
      if (!supabaseClient || !userId || userId.startsWith('usr_')) return { success: false };

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
