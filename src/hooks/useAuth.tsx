
import { useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { UserMetadata } from '@/lib/supabase-auth';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("Auth state changed:", event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        
        // Get the role from user metadata if available
        if (session?.user?.user_metadata?.role) {
          setUserRole(session.user.user_metadata.role);
          console.log("User role set from metadata:", session.user.user_metadata.role);
        } else if (session?.user) {
          // If no role in metadata, default to 'volunteer'
          setUserRole('volunteer');
          console.log("No role in metadata, defaulting to volunteer");
        }
      }
    );

    // Then check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("Initial session check:", session?.user?.email);
      setSession(session);
      setUser(session?.user ?? null);
      
      // Get the role from user metadata if available
      if (session?.user?.user_metadata?.role) {
        setUserRole(session.user.user_metadata.role);
        console.log("Initial user role set:", session.user.user_metadata.role);
      } else if (session?.user) {
        // If no role in metadata, default to 'volunteer'
        setUserRole('volunteer');
        console.log("No role found, defaulting to volunteer");
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      toast({
        title: "Welcome back!",
        description: "You've successfully signed in.",
      });
      return { error: null };
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error signing in",
        description: error.message || "Failed to sign in",
      });
      return { error };
    }
  };

  const signUp = async (
    email: string, 
    password: string, 
    metadata: UserMetadata
  ) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
        },
      });
      if (error) throw error;
      toast({
        title: "Welcome!",
        description: "Your account has been created successfully. Please check your email to verify your account.",
      });
      return { error: null };
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error creating account",
        description: error.message,
      });
      return { error };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { error: null };
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error signing out",
        description: error.message,
      });
      return { error };
    }
  };

  // Update a user's role
  const updateUserRole = async (userId: string, role: string) => {
    try {
      const { data, error } = await supabase.auth.admin.updateUserById(
        userId,
        { user_metadata: { role } }
      );
      
      if (error) throw error;
      
      toast({
        title: "Role updated",
        description: `User role updated to ${role}.`,
      });
      
      return { data, error: null };
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error updating role",
        description: error.message,
      });
      return { error };
    }
  };

  const isNonprofit = () => {
    console.log("Checking if nonprofit. User role:", userRole);
    return userRole === 'nonprofit';
  };
  
  const isVolunteer = () => {
    console.log("Checking if volunteer. User role:", userRole);
    return userRole === 'volunteer';
  };

  const isAdmin = () => {
    console.log("Checking if admin. User role:", userRole);
    return userRole === 'admin';
  };

  return {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    userRole,
    updateUserRole,
    isNonprofit,
    isVolunteer,
    isAdmin,
  };
}
