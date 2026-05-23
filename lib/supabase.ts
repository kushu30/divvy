import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://dhantcehzbmriksgvnek.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRoYW50Y2VoemJtcmlrc2d2bmVrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk1NTYzMzgsImV4cCI6MjA5NTEzMjMzOH0.tzkFBi7adUdefJ2r7ALIOe41WaLNEiVXxnJVPdhjJTY";

export const supabase = createClient(
    supabaseUrl,
    supabaseAnonKey
);