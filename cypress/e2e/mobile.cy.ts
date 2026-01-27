describe('Mobile View Experience', () => {
    const password = 'TestPassword123!'
    let projectName: string

    beforeEach(() => {
        // Set viewport to iPhone X size
        cy.viewport(375, 812)

        // Register with unique email for this test suite
        const email = `test-mobile-${Date.now()}@example.com`
        projectName = `Mobile Test Project ${Date.now()}`

        // Mock API responses
        cy.intercept('POST', '**/api/auth/register', {
            statusCode: 200,
            body: { token: 'mock-token', name: 'Test User' }
        }).as('register')

        cy.intercept('POST', '**/api/auth/login', {
            statusCode: 200,
            body: { token: 'mock-token', name: 'Test User' }
        }).as('login')

        let projects: any[] = []
        cy.intercept('GET', '**/api/projects', (req) => {
            req.reply({
                statusCode: 200,
                body: projects
            })
        }).as('getProjects')

        cy.intercept('POST', '**/api/projects', (req) => {
            const newProject = { id: 'proj-123', name: req.body.name, description: req.body.description }
            projects = [newProject]
            req.reply({
                statusCode: 201,
                body: newProject
            })
        }).as('createProject')

        cy.intercept('GET', '**/api/projects/proj-123', {
            statusCode: 200,
            body: { id: 'proj-123', name: projectName, description: 'Test Description' }
        }).as('getProject')

        cy.intercept('GET', '**/api/sessions?project_id=proj-123', {
            statusCode: 200,
            body: []
        }).as('getSessions')

        // Setup: Register, login, and create a project
        cy.visit('/#/login')
        cy.contains("Create New Account").click()
        cy.get('input[type="text"]').type('Test User')
        cy.get('input[type="email"]').type(email)
        cy.get('input[type="password"]').type(password)
        cy.get('button[type="submit"]').click()

        cy.wait('@register')

        // Wait for redirect
        cy.url({ timeout: 20000 }).should('eq', 'http://localhost:3000/#/')
        cy.contains('PROJECTS', { timeout: 20000 }).should('be.visible')

        // Create Project
        cy.contains('+ New Project', { timeout: 10000 }).click()
        cy.get('input[type="text"]').first().type(projectName)
        cy.contains('button', 'Create').click()

        cy.wait('@createProject')

        // Mock getOne project before navigation
        cy.intercept('GET', '**/api/projects/proj-123', {
            statusCode: 200,
            body: { id: 'proj-123', name: projectName }
        }).as('getProjectDetails')

        cy.contains(projectName, { timeout: 10000 }).click()

        // Wait for sessions page to load
        cy.url({ timeout: 10000 }).should('include', '/projects/proj-123')
        cy.wait('@getSessions')
    })

    it('should show sessions list and hide workbench initially on mobile', () => {
        // Verify we are on the Tech Transfer page
        cy.contains('TECH TRANSFER SUITE', { timeout: 10000 }).should('be.visible')

        // Sidebar (History) should be visible
        cy.contains('History').should('be.visible')

        // Workbench content (Empty state "Select or Create...") should be hidden on mobile because !selectedSession
        // Wait, my implementation hides Main Content if !selectedSession on mobile.
        // So "Select or Create a Session to Begin" text is inside Main Content, so it should NOT be visible.
        cy.contains('Select or Create a Session to Begin').should('not.be.visible')
    })

    it('should auto-select new session and switch to workbench view', () => {
        const sessionTitle = `Mobile Session ${Date.now()}`

        cy.intercept('POST', '**/api/sessions', (req) => {
            req.reply({
                statusCode: 201,
                body: { id: 'sess-1', title: req.body.title, project_id: 'proj-123', status: 'pending' }
            })
        }).as('createSession')

        cy.intercept('GET', '**/api/sessions?project_id=proj-123', {
            statusCode: 200,
            body: [{ id: 'sess-1', title: sessionTitle, project_id: 'proj-123', status: 'pending' }]
        }).as('getSessionsAfterCreate')

        cy.intercept('GET', '**/api/blobs*', {
            statusCode: 200,
            body: []
        }).as('getBlobs')

        // Create new session
        cy.contains('+ New Session').click()
        cy.get('input[placeholder="Operation Name"]').type(sessionTitle)
        cy.contains('button', 'Initialize').click()

        cy.wait('@createSession')
        cy.wait('@getSessionsAfterCreate') // triggered by loadProjectAndSessions

        // Wait for loading to finish
        cy.contains('Initializing Core...').should('not.exist')

        // After creation, it should auto-select.
        // On mobile, this means Sidebar becomes hidden and Workbench becomes visible.

        // Sidebar (History) should be hidden
        // Note: Cypress 'be.hidden' checks CSS visibility/display none.
        // My implementation adds 'hidden' class which sets display: none.
        cy.get('.scanlines').should('not.be.visible') // Sidebar has 'scanlines' class

        // Workbench should be visible
        // We should see the Workbench content. Since it's a new session, it shows "Initialize Tech Transfer" (Wizard Step 1)
        cy.contains('Initialize Tech Transfer').should('be.visible')

        // And the "Back to Session List" button should be visible
        cy.contains('← Back to Session List').should('be.visible')
    })

    it('should navigate back to list from workbench', () => {
        const sessionTitle = `Mobile Nav Session ${Date.now()}`

        cy.intercept('POST', '**/api/sessions', (req) => {
            req.reply({
                statusCode: 201,
                body: { id: 'sess-2', title: req.body.title, project_id: 'proj-123', status: 'pending' }
            })
        }).as('createSession')

        cy.intercept('GET', '**/api/sessions?project_id=proj-123', {
            statusCode: 200,
            body: [{ id: 'sess-2', title: sessionTitle, project_id: 'proj-123', status: 'pending' }]
        }).as('getSessionsAfterCreate')

        cy.intercept('GET', '**/api/blobs*', {
            statusCode: 200,
            body: []
        }).as('getBlobs')

        // Create and auto-select
        cy.contains('+ New Session').click()
        cy.get('input[placeholder="Operation Name"]').type(sessionTitle)
        cy.contains('button', 'Initialize').click()

        cy.wait('@createSession')
        cy.wait('@getSessionsAfterCreate')

        // Wait for loading to finish
        cy.contains('Initializing Core...').should('not.exist')

        cy.contains('Initialize Tech Transfer', { timeout: 10000 }).should('be.visible')

        // Click Back to List
        cy.contains('← Back to Session List').click()

        // Sidebar should be visible again
        cy.contains('History').should('be.visible')
        cy.contains(sessionTitle).should('be.visible')

        // Workbench should be hidden
        cy.contains('Initialize Tech Transfer').should('not.be.visible')
    })

    it('should select an existing session from list', () => {
        const sessionTitle = `Existing Session ${Date.now()}`

        cy.intercept('POST', '**/api/sessions', (req) => {
            req.reply({
                statusCode: 201,
                body: { id: 'sess-3', title: req.body.title, project_id: 'proj-123', status: 'pending' }
            })
        }).as('createSession')

        cy.intercept('GET', '**/api/sessions?project_id=proj-123', {
            statusCode: 200,
            body: [{ id: 'sess-3', title: sessionTitle, project_id: 'proj-123', status: 'pending' }]
        }).as('getSessionsAfterCreate')

        cy.intercept('GET', '**/api/blobs*', {
            statusCode: 200,
            body: []
        }).as('getBlobs')

        // Create session
        cy.contains('+ New Session').click()
        cy.get('input[placeholder="Operation Name"]').type(sessionTitle)
        cy.contains('button', 'Initialize').click()

        cy.wait('@createSession')
        cy.wait('@getSessionsAfterCreate')

        // Wait for loading to finish
        cy.contains('Initializing Core...').should('not.exist')

        // Go back to list
        cy.contains('← Back to Session List').click()

        // Click the session in the list
        cy.contains(sessionTitle).click()

        // Workbench should be visible
        cy.contains('Initialize Tech Transfer').should('be.visible')
        cy.get('.scanlines').should('not.be.visible')
    })
})
