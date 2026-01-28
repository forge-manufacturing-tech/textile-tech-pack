describe('Sessions Management', () => {
    const password = 'TestPassword123!'
    let projectName: string

    beforeEach(() => {
        cy.viewport(1280, 720)
        // Register with unique email for this test suite
        const email = `test-sessions-${Date.now()}@example.com`
        projectName = `Session Test Project ${Date.now()}`

        const createToken = (payload: any) => {
            const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
            const body = btoa(JSON.stringify(payload));
            return `${header}.${body}.signature`;
        };
        const validToken = createToken({ email: 'test@example.com', name: 'Test User', role: 'user', sub: 'user-pid' });

        // Mocks
        cy.intercept('POST', '**/api/auth/register', {
            statusCode: 200,
            body: { token: validToken, name: 'Test User' }
        }).as('register')

        cy.intercept('POST', '**/api/auth/login', {
            statusCode: 200,
            body: { token: validToken, name: 'Test User' }
        }).as('login')

        cy.intercept('GET', '**/api/projects', {
            statusCode: 200,
            body: []
        }).as('getProjects')

        cy.intercept('POST', '**/api/projects', (req) => {
            req.reply({
                statusCode: 200,
                body: { id: 'mock-project-id', name: req.body.name }
            })
        }).as('createProject')

        cy.intercept('GET', '**/api/projects/*', {
            statusCode: 200,
            body: { id: 'mock-project-id', name: projectName }
        }).as('getProject')

        cy.intercept('GET', '**/api/sessions*', {
            statusCode: 200,
            body: []
        }).as('getSessions')

        // Setup: Register, login, and create a project
        cy.visit('/login')
        cy.contains("Create New Account").click()
        cy.get('input[type="text"]').type('Test User')
        cy.get('input[type="email"]').type(email)
        cy.get('input[type="password"]').type(password)
        cy.get('button[type="submit"]').click()

        // Wait for redirect
        cy.url({ timeout: 20000 }).should('include', '/dashboard')
        cy.contains('PROJECTS', { timeout: 20000 }).should('be.visible')
        cy.contains(/no projects found/i, { timeout: 10000 })

        // Mock re-fetch for project list after creation
        cy.intercept('GET', '**/api/projects', {
            statusCode: 200,
            body: [{ id: 'mock-project-id', name: projectName }]
        }).as('getProjectsAfterCreate')

        cy.contains('+ New Project', { timeout: 10000 }).click()
        cy.get('input[type="text"]').first().type(projectName)
        cy.contains('button', 'Create').click()
        cy.contains(projectName, { timeout: 10000 }).click()

        // Wait for sessions page to load
        cy.url({ timeout: 10000 }).should('include', '/projects/')
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
                statusCode: 200,
                body: { id: 'mock-session-id', title: req.body.title, project_id: 'mock-project-id' }
            })
        }).as('createSession')

        cy.intercept('GET', '**/api/sessions*', {
            statusCode: 200,
            body: [{ id: 'mock-session-id', title: sessionTitle }]
        }).as('getSessionsAfterCreate')

        cy.contains('+ New Session', { timeout: 10000 }).should('be.visible').click()
        cy.contains('New Operation', { timeout: 10000 }).should('be.visible')
        cy.get('input[placeholder="Operation Name"]').type(sessionTitle)
        cy.contains('button', 'Initialize').click()

        // Session should appear in list
        cy.contains(sessionTitle, { timeout: 10000 }).should('be.visible')
    })

    it('should select and display session content', () => {
        const sessionTitle = `Selectable Operation ${Date.now()}`

        cy.intercept('POST', '**/api/sessions', (req) => {
            req.reply({
                statusCode: 200,
                body: { id: 'mock-session-id', title: req.body.title, project_id: 'mock-project-id' }
            })
        }).as('createSession')

        cy.intercept('GET', '**/api/sessions*', {
            statusCode: 200,
            body: [{ id: 'mock-session-id', title: sessionTitle }]
        }).as('getSessionsAfterCreate')

        cy.intercept('GET', '**/api/blobs*', {
            statusCode: 200,
            body: []
        }).as('getBlobs')

        cy.intercept('GET', '**/api/sessions/mock-session-id', {
            statusCode: 200,
            body: { id: 'mock-session-id', title: sessionTitle, status: 'pending' }
        })

        // Create session
        cy.contains('+ New Session', { timeout: 10000 }).click()
        cy.get('input[placeholder="Operation Name"]').type(sessionTitle)
        cy.contains('button', 'Initialize').click()

        // Should automatically select and display the empty state upload bucket
        cy.contains('Initialize Tech Transfer').should('be.visible')
    })

    it('should navigate back to projects', () => {
        cy.contains('Back', { timeout: 10000 }).click()
        cy.url({ timeout: 10000 }).should('include', '/dashboard')
        cy.contains('PROJECTS').should('be.visible')
    })

    it('should toggle between Designer and Manufacturer views', () => {
        const sessionTitle = `View Toggle Test ${Date.now()}`

        // Mock Session with ID
        cy.intercept('POST', '**/api/sessions', (req) => {
            req.reply({
                statusCode: 200,
                body: { id: 'mock-session-view-id', title: req.body.title, project_id: 'mock-project-id', content: '' }
            })
        }).as('createSessionForView')

        cy.intercept('GET', '**/api/sessions*', {
            statusCode: 200,
            body: [{ id: 'mock-session-view-id', title: sessionTitle }]
        }).as('getSessionsForView')

        cy.intercept('GET', '**/api/sessions/mock-session-view-id', {
            statusCode: 200,
            body: { id: 'mock-session-view-id', title: sessionTitle, status: 'pending', content: '' }
        })

        cy.intercept('GET', '**/api/blobs*', {
            statusCode: 200,
            body: []
        })

        cy.intercept('GET', '**/api/chat/messages*', {
            statusCode: 200,
            body: []
        })

        // Create Session
        cy.contains('+ New Session').click()
        cy.get('input[placeholder="Operation Name"]').type(sessionTitle)
        cy.contains('button', 'Initialize').click()

        // Verify Designer Mode (default)
        // Note: Buttons are uppercase via CSS but text is "Designer" / "Manufacturer" in code.
        // We can check case-insensitive or the exact text node.
        cy.contains('Designer').should('be.visible')
        cy.contains('Manufacturer').should('be.visible')

        // Toggle to Manufacturer
        cy.contains('Manufacturer').click()

        // Check for Chat Interface presence (Secure-AI-Link text)
        cy.contains('Secure-AI-Link').should('be.visible')

        // Toggle back
        cy.contains('Designer').click()
        cy.contains('Secure-AI-Link').should('not.exist')
    })
})
