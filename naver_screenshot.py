from playwright.sync_api import sync_playwright
import time

def take_screenshot():
    with sync_playwright() as p:
        # Launch browser
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        
        # Navigate to Naver
        print("Navigating to Naver homepage...")
        page.goto("https://www.naver.com")
        
        # Wait for page to load
        page.wait_for_load_state("networkidle")
        
        # Take screenshot
        screenshot_path = "naver_homepage.png"
        page.screenshot(path=screenshot_path)
        print(f"Screenshot saved as {screenshot_path}")
        
        # Close browser
        browser.close()
        
        return screenshot_path

if __name__ == "__main__":
    try:
        path = take_screenshot()
        print(f"Success! Screenshot saved to: {path}")
    except Exception as e:
        print(f"Error: {e}")
        print("\nIf playwright is not installed, run:")
        print("pip install playwright")
        print("playwright install chromium")