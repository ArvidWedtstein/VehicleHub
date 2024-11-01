import { ref } from 'vue';
import { defineStore } from 'pinia';
import { supabase } from '@/lib/supabaseClient';
import { type Session } from '@supabase/supabase-js';

type Profile = {
  id: number;
  created_at?: string;
  user_id: string;
  name: string;
  profile_image_url?: string;
  role_id?: number;
};

// TODO: fix google login
export const useSessionStore = defineStore('session', () => {
  const session = ref<Session | null>(null);
  const profile = ref<Profile | null>(null);

  const getProfile = async () => {
    try {
      if (!session.value?.user.id) return;

      const { data, error, status } = await supabase
        .from('Profiles')
        .select(`id, user_id, name, profile_image_url, role_id`)
        .eq('user_id', session.value?.user.id)
        .single();

      if (error && status !== 406) throw error;

      profile.value = data as Profile;

      console.log(data);
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message);
      }
    }
  };

  const login = async (email: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithOtp({
        email: email,
      });

      if (error) throw error;

      alert('Check your email for the login link!');

      return data;
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message);
      }
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      alert(error);
    }
  };

  const initialize = async () => {
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      alert(error);
    }

    session.value = data.session;

    await getProfile();

    supabase.auth.onAuthStateChange(async (event, _session) => {
      console.info('Auth State Changed', event);
      session.value = _session;

      if (!profile.value) {
        getProfile();
      }
    });
  };

  return { session, profile, initialize, logout, login };
});
