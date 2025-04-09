"use client"

import * as React from 'react';
import { createContext, useContext, useEffect, useState } from "react";
import { useAuth, useUser, useSession } from "@clerk/nextjs";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

type SupabaseContextType = {
  getClient: () => SupabaseClient | null;
  getUser: () => any;
  getSession: () => any;
  isReady: () => boolean;
};

const SupabaseContext = createContext<SupabaseContextType | undefined>(undefined);

export const SupabaseProvider = ({ children }: { children: React.ReactNode }) => {
  const { getToken } = useAuth();
  const { user } = useUser();
  const { session } = useSession();

  const [supabaseClient, setSupabaseClient] = useState<SupabaseClient | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const initialize = async () => {
      if (!getToken || !user || !session || supabaseClient) return;

      try {
        const token = await getToken({ template: "supabase" });

        const client = createClient(supabaseUrl, supabaseAnonKey, {
          auth: {
            persistSession: true,
            autoRefreshToken: true,
          },
          global: {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        });

        setSupabaseClient(client);
        setReady(true);
      } catch (err) {
        console.error("Error initializing Supabase client:", err);
      }
    };

    initialize();
  }, [getToken, user, session, supabaseClient]);

  const value: SupabaseContextType = {
    getClient: () => supabaseClient,
    getUser: () => user,
    getSession: () => session,
    isReady: () => ready,
  };

  // Use React.createElement instead of JSX syntax
  return React.createElement(SupabaseContext.Provider, { value }, children);
};

export const useSupabase = (): SupabaseContextType => {
  const context = useContext(SupabaseContext);
  if (!context) {
    throw new Error("useSupabase must be used within a SupabaseProvider");
  }
  return context;
};
