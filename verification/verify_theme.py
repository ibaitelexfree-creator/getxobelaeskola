from playwright.sync_api import sync_playwright
import time

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.set_viewport_size({"width": 1280, "height": 720})
        try:
            print("Navigating to home...")
            response = page.goto("http://localhost:3001/es", timeout=60000)
            print(f"Response: {response.status}")

            # Wait for nav
            page.wait_for_selector("nav", timeout=30000)

            # 1. Default (Dark)
            page.screenshot(path="verification_1_dark.png")
            print("Dark screenshot taken")

            # Find toggle
            # It should be "Switch to Premium Theme" initially
            toggle = page.locator('button[aria-label="Switch to Premium Theme"]').first

            if toggle.count() == 0:
                print("Toggle not found by exact label. Trying partial match...")
                toggle = page.locator('button[aria-label*="Theme"]').first

            if toggle.count() > 0:
                print("Clicking toggle (to Premium)...")
                toggle.click()
                time.sleep(1) # Wait for transition
                page.screenshot(path="verification_2_premium.png")
                print("Premium screenshot taken")

                # Now label should be "Switch to Light Theme"
                toggle = page.locator('button[aria-label="Switch to Light Theme"]').first
                if toggle.count() == 0:
                     toggle = page.locator('button[aria-label*="Theme"]').first

                print("Clicking toggle (to Light)...")
                toggle.click()
                time.sleep(1)
                page.screenshot(path="verification_3_light.png")
                print("Light screenshot taken")
            else:
                print("Toggle button not found!")
                print(page.content())

        except Exception as e:
            print(f"Error: {e}")
        finally:
            browser.close()

if __name__ == "__main__":
    run()
