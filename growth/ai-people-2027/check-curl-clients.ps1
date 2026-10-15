# Terminal-only HTTP regression check. No browser or JavaScript rendering.
$ErrorActionPreference = 'Stop'
$outputDirectory = Join-Path $PSScriptRoot '../../private/growth/ai-people-2027/curl-clients'
New-Item -ItemType Directory -Force -Path $outputDirectory | Out-Null
$urls = @(
  'https://visionarytalks.com/ai-people-to-watch/',
  'https://visionarytalks.com/ai-people-to-watch',
  'https://visionarytalks.com/ai-people-to-watch/?ref=qa1015'
)
$clients = @(
  @{name='curl'; agent=''},
  @{name='googlebot'; agent='Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)'},
  @{name='facebook'; agent='facebookexternalhit/1.1'}
)
$results = @()
foreach ($urlIndex in 0..($urls.Count - 1)) {
  foreach ($client in $clients) {
    $stem = Join-Path $outputDirectory "$urlIndex-$($client.name)"
    $arguments = @('-sS', '--max-time', '45', '-D', "$stem.headers.txt", '-o', "$stem.html", '-w', '%{http_code}', $urls[$urlIndex])
    if ($client.agent) { $arguments = @('-A', $client.agent) + $arguments }
    $status = & curl.exe @arguments
    if ($LASTEXITCODE -ne 0) { throw "curl failed: $($urls[$urlIndex]) $($client.name)" }
    $html = [IO.File]::ReadAllText("$stem.html")
    $headers = [IO.File]::ReadAllText("$stem.headers.txt")
    $result = [ordered]@{
      checkedAt = [DateTime]::UtcNow.ToString('o')
      url = $urls[$urlIndex]
      client = $client.name
      status = [int]$status
      oldTest = $html.Contains('My 2027 test')
      oldTitle = $html.Contains('The bets behind them.')
      oldIndex = $html.Contains('Explore the bottlenecks')
      faq = $html.Contains('Frequently asked questions')
      people = ([regex]::Matches($html, 'class="watch-person ')).Count
      completeHTML = $html.TrimEnd().EndsWith('</html>')
      bytes = (Get-Item -LiteralPath "$stem.html").Length
      cacheControl = ([regex]::Match($headers, '(?im)^Cache-Control:\s*(.+)$')).Groups[1].Value.Trim()
      vercelCache = ([regex]::Match($headers, '(?im)^X-Vercel-Cache:\s*(.+)$')).Groups[1].Value.Trim()
    }
    $results += $result
    if ($result.status -ne 200 -or $result.oldTest -or $result.oldTitle -or $result.oldIndex -or !$result.faq -or $result.people -ne 100 -or !$result.completeHTML) {
      throw ($result | ConvertTo-Json -Compress)
    }
  }
}
$results | ConvertTo-Json -Depth 4 | Set-Content -LiteralPath (Join-Path $outputDirectory 'report.json')
$results | ForEach-Object { $_ | ConvertTo-Json -Compress }
