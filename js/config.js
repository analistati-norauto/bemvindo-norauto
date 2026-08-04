const SUPABASE_URL = "https://vouneijgdihatoeaxvek.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZvdW5laWpnZGloYXRvZWF4dmVrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU0Mzk1MjYsImV4cCI6MjEwMTAxNTUyNn0.OpGMc0xhlAt_XkJSd2c0o7_q983Z37qIWbbM-iEWntU";

const VIDEO_URL = "https://www.youtube.com/embed/TqlsYy-E-Po?si=JX3BnzfRZRdBt_CZ";

// 1. Guardamos a biblioteca original em um "cofre" seguro
window.SupabaseLib = window.supabase;

// 2. Sobrescrevemos o supabase principal para o login funcionar perfeitamente
window.supabase = window.SupabaseLib.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
