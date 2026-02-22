from playwright.sync_api import sync_playwright, expect

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # 1. Landing Page
        print("Navigating to /es/skills...")
        page.goto("http://localhost:3002/es/skills")

        # Wait for the title
        expect(page.get_by_role("heading", name="Examen PER")).to_be_visible()
        print("Landing page visible.")

        # 2. Start Exam
        print("Clicking 'Comenzar Examen'...")
        page.get_by_role("button", name="Comenzar Examen").click()

        # 3. Wait for Exam Question
        print("Waiting for question text...")
        # The first question text
        question_text = "¿Cómo se denomina la parte trasera de una embarcación?"

        # Wait for the question text to be visible (this verifies the text color fix!)
        # If text is invisible (white on white), Playwright might still 'see' it in DOM but visibility check might fail?
        # Actually Playwright .to_be_visible() checks visibility (opacity > 0, display not none).
        # It does NOT check contrast.
        # But if the text is present in the DOM, we can check.

        expect(page.get_by_text(question_text)).to_be_visible()
        print("Question text found and visible.")

        # Check options
        expect(page.get_by_role("button", name="Popa")).to_be_visible()
        print("Option 'Popa' found.")

        # Check the sidebar map
        expect(page.get_by_text("Mapa de Examen")).to_be_visible()
        print("Sidebar visible.")

        # Take screenshot
        screenshot_path = "verification/skills_exam_v3.png"
        page.screenshot(path=screenshot_path)
        print(f"Screenshot saved to {screenshot_path}")

        browser.close()

if __name__ == "__main__":
    run()
