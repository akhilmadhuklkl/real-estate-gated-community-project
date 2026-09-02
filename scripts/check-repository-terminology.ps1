param(
    [Parameter()]
    [string]$RepositoryRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
)

$ErrorActionPreference = 'Stop'

$firstTerm = [char[]](67, 104, 97, 116, 71, 80, 84) -join ''
$secondTerm = [char[]](67, 111, 100, 101, 120) -join ''
$prohibitedPattern = "$firstTerm|$secondTerm"
$violationFound = $false

& rg -n -i --hidden --glob '!.git/**' --glob '!*.xlsx' $prohibitedPattern $RepositoryRoot
if ($LASTEXITCODE -eq 0) {
    $violationFound = $true
}
elseif ($LASTEXITCODE -ne 1) {
    throw 'The repository text scan could not be completed.'
}

$workbooks = Get-ChildItem -LiteralPath $RepositoryRoot -Filter '*.xlsx' -File -Recurse |
    Where-Object { $_.FullName -notmatch '[\\/]\.git[\\/]' }

foreach ($workbook in $workbooks) {
    $temporaryRoot = Join-Path ([System.IO.Path]::GetTempPath()) ("repository-policy-" + [guid]::NewGuid().ToString('N'))
    $archivePath = Join-Path $temporaryRoot 'workbook.zip'
    $extractedPath = Join-Path $temporaryRoot 'workbook'

    try {
        New-Item -ItemType Directory -Path $temporaryRoot | Out-Null
        Copy-Item -LiteralPath $workbook.FullName -Destination $archivePath
        Expand-Archive -LiteralPath $archivePath -DestinationPath $extractedPath

        & rg -n -i $prohibitedPattern $extractedPath
        if ($LASTEXITCODE -eq 0) {
            Write-Error "A prohibited terminology occurrence exists inside workbook: $($workbook.FullName)"
            $violationFound = $true
        }
        elseif ($LASTEXITCODE -ne 1) {
            throw "The workbook scan could not be completed: $($workbook.FullName)"
        }
    }
    finally {
        if (Test-Path -LiteralPath $temporaryRoot) {
            Remove-Item -LiteralPath $temporaryRoot -Recurse -Force
        }
    }
}

if ($violationFound) {
    Write-Error 'Repository terminology policy check failed.'
    exit 1
}

Write-Output 'Repository terminology policy check passed.'

