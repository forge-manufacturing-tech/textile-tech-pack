from playwright.sync_api import sync_playwright, expect

def verify_create_modal():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Navigate
        print("Navigating...")
        page.goto("http://localhost:3000")

        # Wait for "New Session" button
        print("Waiting for button...")
        # Since backend is down, it might be stuck on loading or show dashboard with empty state.
        # But SessionsPage renders "Initializing Core..." if loading=true.
        # It sets loading=false only after `loadProjectAndSessions` returns or fails.
        # The `loadProjectAndSessions` calls API. If API fails, it catches error.
        # If 404, navigates to dashboard.
        # If unrelated error, it sets loading=false.

        # However, `SessionsPage` requires `projectId` param.
        # The route is likely `/projects/:projectId/sessions`.
        # I need to visit a valid-looking URL.
        page.goto("http://localhost:3000/projects/123/sessions")

        # It will try to fetch project 123. It will fail.
        # catch block: if 403 or 404 navigate dashboard.
        # If network error (backend down), it might just set loading=false.

        # Let's wait a bit.
        page.wait_for_timeout(3000)

        # Take screenshot of whatever we see
        page.screenshot(path="verification/page_state.png")

        # Check if we can see "+ New Session" button
        # It is in the header.

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
