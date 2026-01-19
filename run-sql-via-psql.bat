# Alternative: Use psql directly with your connection string
# Get your connection string from Supabase dashboard > Settings > Database

# Format: postgresql://postgres:[YOUR-PASSWORD]@mgkarabtbhluvkrfyrmu.supabase.co:5432/postgres

# 1. Install psql (PostgreSQL client) if you don't have it
# 2. Run this command with your actual password:
# psql "postgresql://postgres:[YOUR-PASSWORD]@mgkarabtbhluvkrfyrmu.supabase.co:5432/postgres" -f fix-missing-tables.sql

# Example (replace YOUR_PASSWORD with your actual password):
# psql "postgresql://postgres:YOUR_PASSWORD@mgkarabtbhluvkrfyrmu.supabase.co:5432/postgres" -f fix-missing-tables.sql