# PowerShell script to execute SQL on Supabase
# This script will create the missing tables in your production database

$SUPABASE_URL = "https://mgkarabtbhluvkrfyrmu.supabase.co"
$SUPABASE_SERVICE_ROLE_KEY = Read-Host "Please enter your Supabase Service Role Key (you can find this in your Supabase project settings > API > Service Role Key)"

if (-not $SUPABASE_SERVICE_ROLE_KEY) {
    Write-Host "❌ Service Role Key is required to execute SQL. Please get it from your Supabase dashboard."
    exit 1
}

# Read the SQL script
$sqlScript = Get-Content -Path "create-tables-manually.sql" -Raw

Write-Host "🚀 Executing SQL script to create missing tables..."

try {
    $headers = @{
        "Authorization" = "Bearer $SUPABASE_SERVICE_ROLE_KEY"
        "apikey" = $SUPABASE_SERVICE_ROLE_KEY
        "Content-Type" = "application/json"
    }

    $body = @{
        query = $sqlScript
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "$SUPABASE_URL/rest/v1/rpc/exec_sql" -Method Post -Headers $headers -Body $body

    Write-Host "✅ SQL executed successfully!"
    Write-Host "Response: $response"
    
    Write-Host ""
    Write-Host "🎉 Tables created successfully!"
    Write-Host ""
    Write-Host "Next steps:"
    Write-Host "1. Go to your deployed site: https://m-873.github.io/M873/"
    Write-Host "2. Sign in with your owner email"
    Write-Host "3. Navigate to the owner dashboard"
    Write-Host "4. Test adding/editing features"

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
    Write-Host "💡 Alternative solution:"
    Write-Host "1. Go to https://app.supabase.com/projects"
    Write-Host "2. Select your project 'mgkarabtbhluvkrfyrmu'"
    Write-Host "3. Click 'SQL Editor' in the left sidebar"
    Write-Host "4. Copy and paste the content of 'create-tables-manually.sql'"
    Write-Host "5. Click 'Run' to execute the SQL"
}