# inventory-management-dashboard
A comprehensive inventory management dashboard with real data entry, authentication, and admin controls.

## Supabase setup

1. Create a new Supabase project in the Supabase dashboard.
2. Copy your project URL and anon key from the project settings.
3. Add them to your local environment file:
   - .env.local/.env
   - or copy the values into .env.example as a template
4. Set the values as:

```bash
VITE_SUPABASE_URL="https://YOUR_PROJECT_REF.supabase.co"
VITE_SUPABASE_ANON_KEY="your-anon-key"
```

The app initializes a client only when both values are present, so the dashboard keeps working in local demo mode until Supabase is configured.
