from playwright.sync_api import sync_playwright
import time

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    # Set viewport to ensure elements are rendered nicely
    page = browser.new_page(viewport={"width": 1280, "height": 800})
    try:
        print("Navigating to http://localhost:3000/es/iaas")
        page.goto("http://localhost:3000/es/iaas")

        print("Waiting for hydration...")
        page.wait_for_selector("text=Inteligencia Artificial como Servicio", timeout=10000)

        # Trigger animations by scrolling
        print("Scrolling to trigger animations...")
        page.evaluate("window.scrollTo(0, 500)")
        time.sleep(0.5)
        page.evaluate("window.scrollTo(0, 1000)")
        time.sleep(0.5)
        page.evaluate("window.scrollTo(0, 2000)")
        time.sleep(1) # Wait for animations to finish

        # Scroll back up (optional, but full_page captures everything)
        # Actually full_page works best if we are at the top usually, but let's see.

        print("Taking screenshot...")
        page.screenshot(path="verification_iaas.png", full_page=True)
        print("Screenshot taken successfully")
    except Exception as e:
        print(f"Error: {e}")
    finally:
        browser.close()

with sync_playwright() as playwright:
    run(playwright)
