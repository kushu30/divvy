import { useEffect, useState } from "react";

import { Session } from "@supabase/supabase-js";

import AuthScreen from "./screens/AuthScreen";

import DashboardScreen from "./screens/DashboardScreen";

import { supabase } from "./lib/supabase";

export default function App() {
  const [session, setSession] =
    useState<Session | null>(null);

  useEffect(() => {
    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        setSession(session);
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (!session) {
    return <AuthScreen />;
  }

  return <DashboardScreen />;
}