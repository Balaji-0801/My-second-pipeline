trigger:
- main   # triggers pipeline on push to main branch

pool:
  vmImage: 'windows-latest'  # Using Windows agent for PowerShell

steps:
- checkout: self

# Step 1: Run Node.js apps locally in the pipeline
- task: NodeTool@0
  inputs:
    versionSpec: '20.x'   # Node.js version
  displayName: 'Install Node.js'

- script: |
    node app.js
    node app1.js
  displayName: 'Run Node.js apps locally'

# Step 2: Create Windows 11 VM in VMware Aria
- task: PowerShell@2
  inputs:
    targetType: 'inline'
    script: |
      # VM name with timestamp
      $vmName = "CI-CD-Win11-$(Get-Date -Format yyyyMMddHHmmss)"
      
      # Template ID (from your URL)
      $vmTemplateId = "81672911-9e39-3015-9096-f628bc482c08"
      
      # VMware Aria API URL
      $apiUrl = "https://srv01vra1.corp.trumpf.com/catalog/api/consumer/entitledCatalogItems/209bd02e-d7d1-4ea2-ad0e-ba215ce60a9e/requests"
      
      # Your VMware Aria credentials
      $username = "<sundaramba>"
      $password = "<Domain@54321Service@54321>"
      
      # Convert credentials to Base64 for Basic Auth
      $pair = "$username:$password"
      $encodedCreds = [Convert]::ToBase64String([System.Text.Encoding]::ASCII.GetBytes($pair))
      
      $headers = @{
          "Authorization" = "Basic $encodedCreds"
          "Content-Type" = "application/json"
      }
      
      # JSON payload to create VM
      $body = @{
          "requestData" = @{
              "name" = $vmName
              "parameters" = @{
                  "CPU" = "2"
                  "Memory" = "8GB"
                  "OS" = "Windows-11"
              }
          }
      } | ConvertTo-Json -Depth 10
      
      # Call VMware Aria API to create VM
      Invoke-RestMethod -Uri $apiUrl -Method Post -Headers $headers -Body $body
      Write-Output "Windows 11 VM $vmName creation request sent!"
