import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://gbjkkjrxjfymmjbgymav.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdiamtranJ4amZ5bW1qYmd5bWF2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA2NDM3OTcsImV4cCI6MjA4NjIxOTc5N30.bvPmwbTtFGsJOArNIXRfp1gNtligYsBsSVx9Av-D0N0';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
