/**
 * TIME RECLAIM - SUPABASE CLOUD SYNC & AUTH ENGINE
 */

window.TimeReclaimSupabase = (function () {
  let supabaseClient = null;

  // Key storage in localStorage for easy configuration from UI
  function getCredentials() {
    return {
      url: localStorage.getItem('supabase_url') || '',
      key: localStorage.getItem('supabase_anon_key') || ''
    };
  }

  function setCredentials(url, key) {
    localStorage.setItem('supabase_url', url);
    localStorage.setItem('supabase_anon_key', key);
    initClient();
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

    // Sync state to Supabase Cloud
    async syncStateToCloud(state) {
      if (!supabaseClient) return { success: false, reason: 'Not configured' };

      try {
        // Upsert Profile
        const { data: profileData, error: profileErr } = await supabaseClient
          .from('profiles')
          .upsert({
            name: state.user.name,
            avatar: state.user.avatar,
            motivation: state.user.motivation,
            updated_at: new Date()
          })
          .select();

        if (profileErr) throw profileErr;
        const profileId = profileData?.[0]?.id;

        if (profileId) {
          // Upsert Routine
          await supabaseClient.from('routines').upsert({
            profile_id: profileId,
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
            profile_id: profileId,
            productive: state.allocations.productive,
            fitness: state.allocations.fitness,
            cinema: state.allocations.cinema,
            relations: state.allocations.relations,
            boredom: state.allocations.boredom,
            updated_at: new Date()
          });
        }

        return { success: true };
      } catch (err) {
        console.error('Supabase Cloud Sync Error:', err);
        return { success: false, error: err.message };
      }
    }
  };
})();
