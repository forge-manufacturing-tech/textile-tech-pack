describe('Sessions Management', () => {
    const password = 'TestPassword123!'
    let projectName: string

    beforeEach(() => {
        cy.viewport(1280, 720)
        // Register with unique email for this test suite
        const email = `test-sessions-${Date.now()}@example.com`
        projectName = `Session Test Project ${Date.now()}`

        // Mock Auth
        cy.intercept('POST', '**/api/auth/login', {
            statusCode: 200,
            body: { token: 'mock-token', name: 'Test User' }
        }).as('login')

        cy.intercept('POST', '**/api/auth/register', {
            statusCode: 200,
            body: { token: 'mock-token', name: 'Test User' }
        }).as('register')

        // Mock Projects
        let projects: any[] = []
        cy.intercept('GET', '**/api/projects', (req) => {
            req.reply({ statusCode: 200, body: projects })
        }).as('getProjects')

        cy.intercept('POST', '**/api/projects', (req) => {
            const newProject = { id: 'proj-123', name: req.body.name, description: req.body.description }
            projects = [newProject]
            req.reply({ statusCode: 201, body: newProject })
        }).as('createProject')

        cy.intercept('GET', '**/api/projects/proj-123', {
            statusCode: 200,
            body: { id: 'proj-123', name: projectName }
        }).as('getProject')

        // Mock Sessions
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
        cy.url({ timeout: 20000 }).should('include', '/#/dashboard')
        cy.contains('PROJECTS', { timeout: 20000 }).should('be.visible')

        // Mock re-fetch for project list after creation
        cy.intercept('GET', '**/api/projects', {
            statusCode: 200,
            body: [{ id: 'proj-123', name: projectName }]
        }).as('getProjectsAfterCreate')

        // Create Project
        cy.contains('+ New Project', { timeout: 10000 }).click()
        cy.get('input[type="text"]').first().type(projectName)
        cy.contains('button', 'Create').click()

        cy.wait('@createProject')

        cy.contains(projectName, { timeout: 10000 }).click()

        // Wait for sessions page to load
        cy.url({ timeout: 10000 }).should('include', '/projects/proj-123')
        cy.wait('@getSessions')

        // Verify we are on the Tech Transfer page
        cy.contains('TECH TRANSFER SUITE', { timeout: 10000 }).should('be.visible')
    })

    it('should display empty sessions sidebar', () => {
        cy.contains(/no history/i).should('be.visible')
    })

    it('should create a new session (operation)', () => {
        const sessionTitle = `Test Operation ${Date.now()}`

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

        cy.intercept('GET', '**/api/blobs*', { statusCode: 200, body: [] }).as('getBlobs')

        cy.contains('+ New Session', { timeout: 10000 }).should('be.visible').click()
        cy.contains('New Operation', { timeout: 10000 }).should('be.visible')
        cy.get('input[placeholder="Operation Name"]').type(sessionTitle)
        cy.contains('button', 'Initialize').click()

        cy.wait('@createSession')
        cy.wait('@getSessionsAfterCreate')

        // Session should appear in list
        cy.contains(sessionTitle, { timeout: 10000 }).should('be.visible')
    })

    it('should select and display session content', () => {
        const sessionTitle = `Selectable Operation ${Date.now()}`

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

        cy.intercept('GET', '**/api/blobs*', { statusCode: 200, body: [] }).as('getBlobs')

        cy.intercept('GET', '**/api/sessions/sess-2', {
            statusCode: 200,
            body: { id: 'sess-2', title: sessionTitle, project_id: 'proj-123', status: 'pending' }
        })

        // Create session
        cy.contains('+ New Session', { timeout: 10000 }).click()
        cy.get('input[placeholder="Operation Name"]').type(sessionTitle)
        cy.contains('button', 'Initialize').click()

        cy.wait('@createSession')
        cy.wait('@getSessionsAfterCreate')

        // Wait for loading to finish
        cy.contains('Initializing Core...').should('not.exist')

        // Should automatically select and display the empty state upload bucket
        cy.contains('Initialize Tech Transfer').should('be.visible')
    })

    it('should navigate back to projects', () => {
        cy.contains('Back', { timeout: 10000 }).click()
        cy.url({ timeout: 10000 }).should('include', '/#/dashboard')
        cy.contains('PROJECTS').should('be.visible')
    })
})
