from playwright.sync_api import sync_playwright, expect

def verify_create_modal():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()

        # Set Fake Token
        context.add_init_script("""
            localStorage.setItem('token', 'fake-token');
            localStorage.setItem('user', JSON.stringify({id: '1', name: 'Test User'}));
        """)

        page = context.new_page()

        # Navigate
        print("Navigating...")
        # Mock API
        page.route("**/api/projects/123", lambda route: route.fulfill(
            status=200,
            body='{"id": "123", "name": "Test Project"}',
            headers={"content-type": "application/json"}
        ))
        # Note: SessionsPage calls list(projectId) which does GET /api/sessions?project_id=123
        page.route("**/api/sessions?project_id=123", lambda route: route.fulfill(
            status=200,
            body='[]',
            headers={"content-type": "application/json"}
        ))

        # Correct URL
        page.goto("http://localhost:3000/projects/123")

        page.wait_for_timeout(3000)

        # Take screenshot of page
        page.screenshot(path="verification/page_state_corrected.png")

        try:
            btn = page.get_by_text("+ New Session")
            if btn.is_visible():
                print("Clicking New Session...")
                btn.click()
                page.wait_for_timeout(1000)
                page.screenshot(path="verification/create_modal.png")
                print("Screenshot saved.")
            else:
                print("New Session button not visible.")
        except Exception as e:
            print(f"Error finding button: {e}")

        browser.close()

if __name__ == "__main__":
    verify_create_modal()
