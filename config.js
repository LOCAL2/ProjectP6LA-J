var SUPABASE_URL = 'https://ekbmxftmujfzkobyiyvk.supabase.co';
var SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVrYm14ZnRtdWpmemtvYnlpeXZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYyNDY4MjQsImV4cCI6MjA4MTgyMjgyNH0.NZaOQQCo270sDkatM8sY_BZQOnUrIan6gAsnRVQog6I';
var GROQ_API_KEY = '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';

if (typeof supabaseClient === 'undefined') {
    var supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}
var supabase = supabaseClient;
