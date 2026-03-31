#!/usr/bin/env python3
"""
飞书文档自动获取脚本
使用 Playwright 自动化浏览器，获取密码保护的飞书文档内容

使用方法：
1. 在 Windows 上运行：python feishu_fetcher.py
2. 脚本会自动打开浏览器
3. 输入密码：p36178#5
4. 等待文档加载完成
5. 自动提取内容并保存
"""

from playwright.sync_api import sync_playwright
import time
import sys
import os
import json

# 飞书文档配置
FEISHU_DOC_URL = "https://pcn37a7x4pof.feishu.cn/docx/S9ogdsImCoKGrbxFMvZc5fnEnoe"
FEISHU_PASSWORD = "p36178#5"
OUTPUT_FILE = "/home/quan/.openclaw/workspace/data/飞书文档_A00路在脚下.md"

def fetch_feishu_doc():
    """获取飞书文档内容"""
    
    print("=" * 60)
    print("飞书文档自动获取脚本")
    print("=" * 60)
    print(f"文档URL: {FEISHU_DOC_URL}")
    print(f"密码: {FEISHU_PASSWORD}")
    print("=" * 60)
    
    with sync_playwright() as p:
        # 启动浏览器（非无头模式，方便看到操作过程）
        print("\n[1/5] 启动浏览器...")
        browser = p.chromium.launch(headless=False)
        context = browser.new_context()
        page = context.new_page()
        
        try:
            # 打开飞书文档
            print("[2/5] 打开飞书文档...")
            page.goto(FEISHU_DOC_URL, wait_until="networkidle", timeout=60000)
            
            # 等待页面加载
            time.sleep(3)
            
            # 检查是否需要输入密码
            print("[3/5] 检查是否需要密码...")
            
            # 尝试查找密码输入框
            password_input = page.query_selector('input[type="password"]')
            if password_input:
                print("发现密码输入框，正在输入密码...")
                password_input.fill(FEISHU_PASSWORD)
                time.sleep(1)
                
                # 查找提交按钮
                submit_btn = page.query_selector('button:has-text("确定"), button:has-text("提交"), button:has-text("确认")')
                if submit_btn:
                    submit_btn.click()
                else:
                    # 尝试按回车
                    password_input.press("Enter")
                
                print("密码已提交，等待文档加载...")
                time.sleep(5)
            
            # 等待文档内容加载
            print("[4/5] 等待文档内容加载...")
            page.wait_for_selector('.doc-content, .lark-record-format', timeout=30000)
            time.sleep(3)
            
            # 提取文档内容
            print("[5/5] 提取文档内容...")
            
            # 获取页面标题
            title = page.title()
            print(f"文档标题: {title}")
            
            # 获取文档主体内容
            content_selectors = [
                '.lark-record-format',
                '.doc-content',
                '[role="textbox"]',
                'article',
                '.feishu-doc-content'
            ]
            
            content = ""
            for selector in content_selectors:
                element = page.query_selector(selector)
                if element:
                    content = element.inner_text()
                    if content:
                        print(f"✅ 成功提取内容 (使用选择器: {selector})")
                        break
            
            if not content:
                # 如果上面都没找到，尝试获取整个页面文本
                content = page.inner_text('body')
                print("⚠️ 使用页面全部文本")
            
            # 滚动页面以加载更多内容（懒加载）
            print("滚动页面加载完整内容...")
            for i in range(5):
                page.evaluate("window.scrollBy(0, window.innerHeight)")
                time.sleep(1)
            
            # 再次获取内容
            for selector in content_selectors:
                element = page.query_selector(selector)
                if element:
                    new_content = element.inner_text()
                    if len(new_content) > len(content):
                        content = new_content
            
            # 保存内容
            output_path = OUTPUT_FILE
            if sys.platform == "win32":
                # Windows 路径
                output_path = os.path.expanduser("~/Documents/飞书文档_A00路在脚下.md")
            
            os.makedirs(os.path.dirname(output_path), exist_ok=True)
            
            with open(output_path, 'w', encoding='utf-8') as f:
                f.write(f"# {title}\n\n")
                f.write(f"> 来源: {FEISHU_DOC_URL}\n")
                f.write(f"> 提取时间: {time.strftime('%Y-%m-%d %H:%M:%S')}\n\n")
                f.write("---\n\n")
                f.write(content)
            
            print(f"\n✅ 内容已保存到: {output_path}")
            print(f"内容长度: {len(content)} 字符")
            
            # 截图保存
            screenshot_path = output_path.replace('.md', '.png')
            page.screenshot(path=screenshot_path, full_page=True)
            print(f"📸 截图已保存到: {screenshot_path}")
            
            # 输出内容预览
            print("\n" + "=" * 60)
            print("内容预览 (前500字):")
            print("=" * 60)
            print(content[:500] + "...")
            
            return content
            
        except Exception as e:
            print(f"❌ 错误: {e}")
            
            # 截图保存错误状态
            error_screenshot = os.path.expanduser("~/Documents/feishu_error.png")
            page.screenshot(path=error_screenshot)
            print(f"📸 错误截图已保存到: {error_screenshot}")
            
            return None
            
        finally:
            # 关闭浏览器
            print("\n按 Enter 关闭浏览器...")
            # input()  # 取消自动关闭，让用户确认
            browser.close()
            print("✅ 浏览器已关闭")

if __name__ == "__main__":
    content = fetch_feishu_doc()
    
    if content:
        print("\n" + "=" * 60)
        print("✅ 飞书文档获取成功！")
        print("=" * 60)
    else:
        print("\n" + "=" * 60)
        print("❌ 飞书文档获取失败")
        print("=" * 60)
        print("\n可能的原因：")
        print("1. 需要登录飞书账号")
        print("2. 密码输入失败")
        print("3. 网络问题")
        print("\n建议：手动复制文档内容")
