
// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://oepapllyodypugwlqldh.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9lcGFwbGx5b2R5cHVnd2xxbGRoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM0MDIzNzcsImV4cCI6MjA1ODk3ODM3N30.iF9G-7v8iKR8uI9ER0vDhuA2OcpUABc-aZvhXSTOlls";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(
  SUPABASE_URL, 
  SUPABASE_PUBLISHABLE_KEY,
  {
    realtime: {
      params: {
        eventsPerSecond: 10, // Increase if needed for chat application
      },
    },
  }
);
