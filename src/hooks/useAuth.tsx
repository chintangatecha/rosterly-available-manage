
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';

export type Profile = {
  id: string;
  email: string;
  role: 'manager' | 'employee';
  first_name: string | null;
  last_name: string | null;
}

export type ProfileUpdateData = {
  first_name?: string | null;
  last_name?: string | null;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getSession = async () => {
      try {
        // Get the initial session
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        
        setSession(session);
        setUser(session?.user || null);
        
        if (session?.user) {
          // Fetch the user profile if we have a session
          fetchUserProfile(session.user.id);
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error('Error getting session:', error);
        setLoading(false);
      }
    };
    
    // Function to fetch user profile
    const fetchUserProfile = async (userId: string) => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();
        
        if (error) throw error;
        
        console.log("User profile loaded:", data);
        setProfile(data as Profile);
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };
    
    // Initial session check
    getSession();
    
    // Setup auth state change listener
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      console.log("Auth state changed:", event, newSession?.user?.id);
      
      setSession(newSession);
      setUser(newSession?.user || null);
      
      if (newSession?.user) {
        await fetchUserProfile(newSession.user.id);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });
    
    // Cleanup
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);
  
  const isManager = profile?.role === 'manager';
  
  const signOut = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signOut();
    if (error) console.error('Error signing out:', error);
    setLoading(false);
  };
  
  const updateProfile = async (profileData: ProfileUpdateData) => {
    if (!user) throw new Error('You must be logged in to update your profile');
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('id', user.id);
      
      if (error) throw error;
      
      // Update the local profile state with the new data
      if (profile) {
        setProfile({
          ...profile,
          ...profileData
        });
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };
  
  return {
    user,
    profile,
    session,
    loading,
    isManager,
    signOut,
    updateProfile
  };
};
