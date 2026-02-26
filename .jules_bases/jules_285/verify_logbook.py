
import os
import time
from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={'width': 1280, 'height': 800})
        page = context.new_page()

        # Navigate to the logbook page
        print("Navigating to logbook page...")
        try:
            response = page.goto("http://localhost:3000/es/academy/logbook", timeout=60000)
            print(f"Response status: {response.status if response else 'No response'}")
        except Exception as e:
            print(f"Navigation failed: {e}")
            browser.close()
            return

        # Wait for the page to load
        # We look for "Bitácora Digital" title
        try:
            page.wait_for_selector("text=Bitácora Digital", timeout=60000)
            print("Page loaded.")
        except Exception as e:
            print("Timeout waiting for page load.")
            os.makedirs("/home/jules/verification", exist_ok=True)
            page.screenshot(path="/home/jules/verification/verification_timeout.png")
            browser.close()
            return

        # Click on "Diario" tab
        print("Clicking on 'Diario' tab...")
        try:
            page.click("text=Diario", timeout=5000)
        except:
            # Maybe it's loading or something, try force click or wait
            print("Retry clicking Diario tab...")
            time.sleep(2)
            page.click("text=Diario")

        # Wait for form to appear
        # Look for "Nueva Entrada de Diario"
        try:
            page.wait_for_selector("text=Nueva Entrada de Diario", timeout=10000)
            print("Diario tab loaded.")
        except:
            print("Failed to load Diario tab content.")
            os.makedirs("/home/jules/verification", exist_ok=True)
            page.screenshot(path="/home/jules/verification/verification_fail_tab.png")
            browser.close()
            return

        # Fill some data to check inputs
        page.fill("input[placeholder='Ej. Real Club Marítimo']", "Puerto Getxo")
        page.fill("input[placeholder='Nombres de los tripulantes...']", "Juan, Maria")
        page.fill("input[placeholder='Ej. 12']", "15")
        page.fill("input[placeholder='Ej. NW']", "NE")
        page.fill("textarea[placeholder='Viradas, trasluchadas, rizos...']", "Viradas x 10")
        page.fill("textarea[placeholder='Reflexiones sobre la navegación, estado del mar...']", "Mar en calma, buena práctica.")

        # Take screenshot of the form
        time.sleep(2) # wait for render
        os.makedirs("/home/jules/verification", exist_ok=True)
        screenshot_path = "/home/jules/verification/logbook_form.png"
        page.screenshot(path=screenshot_path, full_page=True)
        print(f"Screenshot saved to {screenshot_path}")

        # Check for Export PDF button
        export_btn = page.query_selector("text=Exportar PDF")
        if export_btn:
            print("Export PDF button found.")
        else:
            print("Export PDF button NOT found.")

        browser.close()

if __name__ == "__main__":
    run()
