# Diagnostic Script for Supabase Database Issues

This script will help us identify why you're getting PGRST205 errors in the deployed app.

## Current Status

✅ **Tables exist in database** - Both `user_roles` and `features` tables are accessible via API
✅ **Data is present** - Features table has 5 entries
✅ **Local development works** - No errors in dev server

## Potential Issues

### 1. Authentication/Authorization Problem
The most likely issue is that the deployed app is trying to access the tables without proper authentication.

**To test this:**
1. Open your deployed app: https://m-873.github.io/M873/
2. Open browser DevTools (F12)
3. Go to Network tab
4. Look for failed requests to Supabase
5. Check the response headers and error messages

### 2. Environment Variables Issue
Check if the deployed version has the correct environment variables:

**In your deployed app:**
```javascript
// Open browser console and run:
console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('Supabase Key:', import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.substring(0, 10) + '...');
```

### 3. CORS or Network Issues
The PGRST205 errors might be due to:
- CORS restrictions
- Network connectivity issues
- Browser security policies

### 4. Row Level Security (RLS) Policies
The tables might have RLS policies that prevent access without proper authentication.

## Quick Fix Options

### Option 1: Add Default Data
Since the tables exist but are empty (0 user roles), let's add some default data:

```sql
-- Run this in Supabase dashboard SQL editor
INSERT INTO public.user_roles (user_id, role) VALUES 
('00000000-0000-0000-0000-000000000000', 'owner')
ON CONFLICT (user_id, role) DO NOTHING;
```

### Option 2: Temporarily Disable RLS (for testing)
```sql
-- Run this in Supabase dashboard SQL editor
ALTER TABLE public.user_roles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.features DISABLE ROW LEVEL SECURITY;
```

### Option 3: Check Authentication Flow
The issue might be in the authentication flow. Let me create a test page to debug this.

## Next Steps

1. **Test the deployed app** - Check if errors still appear
2. **Check browser console** - Look for specific error messages
3. **Try the quick fixes** above
4. **Let me know what you find** - I can create more targeted solutions

Would you like me to create a debug page to help identify the exact authentication issue?