# 飞书文档获取脚本 (PowerShell)
# 使用 Edge 浏览器自动化

param(
    [string]$Url = "https://pcn37a7x4pof.feishu.cn/docx/S9ogdsImCoKGrbxFMvZc5fnEnoe",
    [string]$Password = "p36178#5"
)

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "飞书文档自动获取脚本 (PowerShell + Edge)" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "文档URL: $Url" -ForegroundColor Yellow
Write-Host "密码: $Password" -ForegroundColor Yellow
Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

# 创建 Edge 浏览器对象
$edge = New-Object -ComObject "InternetExplorer.Application"
$edge.Visible = $true
$edge.Navigate($Url)

# 等待页面加载
Write-Host "[1/3] 等待页面加载..." -ForegroundColor Green
Start-Sleep -Seconds 5

# 检查是否有密码输入框
Write-Host "[2/3] 检查密码输入框..." -ForegroundColor Green

$passwordInputs = $edge.Document.getElementsByTagName("input") | Where-Object { $_.type -eq "password" }

if ($passwordInputs) {
    Write-Host "发现密码输入框，正在输入密码..." -ForegroundColor Yellow
    $passwordInputs[0].value = $Password
    Start-Sleep -Seconds 1
    
    # 尝试按回车
    $passwordInputs[0].focus()
    $shell = New-Object -ComObject WScript.Shell
    $shell.SendKeys("{ENTER}")
    
    Write-Host "密码已提交，等待文档加载..." -ForegroundColor Green
    Start-Sleep -Seconds 5
}

# 获取页面内容
Write-Host "[3/3] 提取文档内容..." -ForegroundColor Green

# 等待用户确认文档已加载
Write-Host ""
Write-Host "请在浏览器中确认文档已完全加载，然后按任意键继续..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

# 获取页面文本
$content = $edge.Document.body.innerText

# 保存内容
$outputPath = "$env:USERPROFILE\Documents\飞书文档_A00路在脚下.md"
$content | Out-File -FilePath $outputPath -Encoding UTF8

Write-Host ""
Write-Host "✅ 内容已保存到: $outputPath" -ForegroundColor Green
Write-Host "内容长度: $($content.Length) 字符" -ForegroundColor Green

# 截图
Add-Type -AssemblyName System.Windows.Forms
$bitmap = New-Object System.Drawing.Bitmap($edge.Document.body.clientWidth, $edge.Document.body.clientHeight)
$graphics = [System.Drawing.Graphics]::FromImage($bitmap)
$graphics.CopyFromScreen($edge.Left, $edge.Top, 0, 0, $bitmap.Size)
$bitmap.Save("$env:USERPROFILE\Documents\飞书文档截图.png")

Write-Host "📸 截图已保存到: $env:USERPROFILE\Documents\飞书文档截图.png" -ForegroundColor Green

# 输出内容预览
Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "内容预览 (前500字):" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host $content.Substring(0, [Math]::Min(500, $content.Length))
Write-Host "..."

# 关闭浏览器
$edge.Quit()

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "✅ 完成！" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Cyan

# 打开输出目录
explorer "$env:USERPROFILE\Documents"
