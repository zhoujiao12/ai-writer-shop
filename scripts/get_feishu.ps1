# 一键获取飞书文档内容
# 复制以下内容到 Windows PowerShell (管理员模式) 运行

# 安装 Playwright
pip install playwright
python -m playwright install chromium

# 运行获取脚本
$code = @'
from playwright.sync_api import sync_playwright
import time

URL = "https://pcn37a7x4pof.feishu.cn/docx/S9ogdsImCoKGrbxFMvZc5fnEnoe"
PASSWORD = "p36178#5"

with sync_playwright() as p:
    browser = p.chromium.launch(headless=False)
    page = browser.new_page()
    page.goto(URL)
    time.sleep(3)
    
    # 输入密码
    pwd_input = page.query_selector('input[type="password"]')
    if pwd_input:
        pwd_input.fill(PASSWORD)
        pwd_input.press("Enter")
        time.sleep(5)
    
    # 获取内容
    page.wait_for_selector("body", timeout=30000)
    content = page.inner_text("body")
    
    # 保存
    with open("$env:USERPROFILE\\Desktop\\飞书文档.txt", "w", encoding="utf-8") as f:
        f.write(content)
    
    print(f"✅ 已保存到桌面: 飞书文档.txt")
    print(f"内容长度: {len(content)} 字符")
    
    browser.close()
'@

python -c $code

# 打开文件
notepad "$env:USERPROFILE\Desktop\飞书文档.txt"
