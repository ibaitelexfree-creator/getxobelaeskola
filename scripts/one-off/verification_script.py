from playwright.sync_api import sync_playwright
import time

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            print("Navigating to http://localhost:3100")
            page.goto("http://localhost:3100", timeout=60000)

            # Wait for header
            print("Waiting for header...")
            # Using text locator for "Maestro v3" which is the text I modified style for
            page.wait_for_selector("text=Maestro v3")

            # Take screenshot
            print("Taking screenshot...")
            page.screenshot(path="verification_header.png")
            print("Screenshot saved to verification_header.png")

        except Exception as e:
            print(f"Error: {e}")
        finally:
            browser.close()

if __name__ == "__main__":
    run()
