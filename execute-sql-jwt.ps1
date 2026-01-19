# Direct SQL execution with correct JWT token
$SUPABASE_URL = "https://mgkarabtbhluvkrfyrmu.supabase.co"
$SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp4YnlkamlwdGloenN4dWN2eW5wIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODI5MDkzMywiZXhwIjoyMDgzODY2OTMzfQ.LzV_K0W4X5WzHLFVXFthkoVBCrxkZ6gWIRAlMZcf0WQ"

Write-Host "🚀 Executing SQL script to create missing tables..."
Write-Host "Using provided Service Role JWT..."

# Read the SQL script
$sqlScript = Get-Content -Path "create-tables-manually.sql" -Raw

try {
    $headers = @{
        "Authorization" = "Bearer $SUPABASE_SERVICE_ROLE_KEY"
        "apikey" = $SUPABASE_SERVICE_ROLE_KEY
        "Content-Type" = "application/json"
    }

    $body = @{
        query = $sqlScript
    } | ConvertTo-Json

    Write-Host "Sending request to Supabase..."
    Write-Host "URL: $SUPABASE_URL/rest/v1/rpc/exec_sql"
    
    $response = Invoke-RestMethod -Uri "$SUPABASE_URL/rest/v1/rpc/exec_sql" -Method Post -Headers $headers -Body $body

    Write-Host "✅ SQL executed successfully!"
    Write-Host "Response: $response"
    
    Write-Host ""
    Write-Host "🎉 Tables created successfully!"
    Write-Host ""
    Write-Host "✨ Owner feature editing is now enabled!"
    Write-Host ""
    Write-Host "🎯 Next steps:"
    Write-Host "1. Go to your deployed site: https://m-873.github.io/M873/"
    Write-Host "2. Sign in with your owner email (mahfuzulislam873@gmail.com)"
    Write-Host "3. Navigate to the owner dashboard"
    Write-Host "4. Test adding/editing features"
    Write-Host ""
    Write-Host "🔧 You can now:"
    Write-Host "   • Add new features with title, description, status, and links"
    Write-Host "   • Edit existing features - change any field"
    Write-Host "   • Delete features you no longer want"
    Write-Host "   • Change feature status (upcoming, live, deprecated)"
    Write-Host "   • Reorder features using sort_order"

} catch {
    Write-Host "❌ Error executing SQL: $($_.Exception.Message)"
    Write-Host "Status Code: $($_.Exception.Response.StatusCode)"
    
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $reader.BaseStream.Position = 0
        $reader.DiscardBufferedData()
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response: $responseBody"
    }
    
    Write-Host ""
    Write-Host "💡 Manual solution:"
    Write-Host "1. Go to https://app.supabase.com/projects"
    Write-Host "2. Select your project 'mgkarabtbhluvkrfyrmu'"
    Write-Host "3. Click 'SQL Editor' in the left sidebar"
    Write-Host "4. Copy and paste the content of 'create-tables-manually.sql'"
    Write-Host "5. Click 'Run' to execute the SQL"
    Write-Host ""
    Write-Host "📝 The SQL script creates:"
    Write-Host "   • features table (for feature management)"
    Write-Host "   • user_roles table (for owner permissions)"
    Write-Host "   • RLS policies (for security)"
    Write-Host "   • has_role function (for permission checking)"
    Write-Host "   • Sets you as the owner"
}