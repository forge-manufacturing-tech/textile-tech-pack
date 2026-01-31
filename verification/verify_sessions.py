from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page()

    # Mock API
    page.route("**/api/auth/login", lambda route: route.fulfill(
        status=200,
        body='{"token": "mock-token", "name": "Test User", "role": "user"}',
        headers={"Content-Type": "application/json"}
    ))

    page.route("**/api/projects", lambda route: route.fulfill(
        status=200,
        body='[{"id": "p1", "name": "Bebsi Project"}]',
        headers={"Content-Type": "application/json"}
    ))

    page.route("**/api/projects/p1", lambda route: route.fulfill(
        status=200,
        body='{"id": "p1", "name": "Bebsi Project"}',
        headers={"Content-Type": "application/json"}
    ))

    # Note: query params in route pattern might be tricky, using regex or just path is safer if simple
    page.route("**/api/sessions?project_id=p1", lambda route: route.fulfill(
        status=200,
        body='[{"id": "s1", "title": "Mass Production", "project_id": "p1", "status": "active"}]',
        headers={"Content-Type": "application/json"}
    ))

    page.route("**/api/sessions/s1", lambda route: route.fulfill(
        status=200,
        body='{"id": "s1", "title": "Mass Production", "project_id": "p1", "status": "active"}',
        headers={"Content-Type": "application/json"}
    ))

    # Mock Blobs - Correct URL pattern
    page.route("**/api/sessions/s1/blobs", lambda route: route.fulfill(
        status=200,
        body='[{"id": "b1", "session_id": "s1", "file_name": "Correct_BOM.xlsx", "content_type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "size": 1024, "created_at": "2023-01-01T00:00:00Z"}]',
        headers={"Content-Type": "application/json"}
    ))

    # Check the Chat Service URL as well.
    # Usually listMessages is /api/chat/messages?session_id=... or /api/sessions/{id}/messages
    # Let's assume /api/chat/messages based on previous files, but I should check.
    # Wait, ChatInterface calls ControllersChatService.listMessages(sessionId).
    # I should check ControllersChatService.ts too. But for now I will try generic match.
    page.route("**/api/chat/**", lambda route: route.fulfill(
        status=200,
        body='[{"id": "m1", "session_id": "s1", "role": "assistant", "content": "Hello, I am ready to assist with Bebsi production.", "created_at": "2023-01-01T00:00:00Z"}]',
        headers={"Content-Type": "application/json"}
    ))

    # Login
    page.goto("http://localhost:3000/login")
    page.fill('input[type="email"]', 'test@example.com')
    page.fill('input[type="password"]', 'password')
    page.click('button[type="submit"]')

    # Wait for dashboard
    page.wait_for_url("**/dashboard")

    # Click project
    page.click("text=Bebsi Project")

    # Click session
    page.click("text=Mass Production")

    # Wait for chat interface and blobs
    page.wait_for_selector("text=Secure-AI-Link")
    page.wait_for_selector("text=Correct_BOM.xlsx")

    # Take screenshot
    page.screenshot(path="verification/sessions_page.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
