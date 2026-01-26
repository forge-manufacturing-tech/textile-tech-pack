describe('Sessions Management', () => {
    const password = 'TestPassword123!'
    let projectName: string

    beforeEach(() => {
        cy.viewport(1280, 720)
        // Register with unique email for this test suite
        const email = `test-sessions-${Date.now()}@example.com`
        projectName = `Session Test Project ${Date.now()}`

        // Setup: Register, login, and create a project
        cy.visit('/login')
        cy.contains("Create New Account").click()
        cy.get('input[type="text"]').type('Test User')
        cy.get('input[type="email"]').type(email)
        cy.get('input[type="password"]').type(password)
        cy.get('button[type="submit"]').click()

        // Wait for redirect
        cy.url({ timeout: 20000 }).should('eq', 'http://localhost:3000/')
        cy.contains('PROJECTS', { timeout: 20000 }).should('be.visible')
        cy.contains(/no projects found/i, { timeout: 10000 })

        cy.contains('+ New Project', { timeout: 10000 }).click()
        cy.get('input[type="text"]').first().type(projectName)
        cy.contains('button', 'Create').click()
        cy.contains(projectName, { timeout: 10000 }).click()

        // Wait for sessions page to load
        cy.url({ timeout: 10000 }).should('include', '/projects/')
        // Verify we are on the BOM Converter page
        cy.contains('BOM CONVERTER', { timeout: 10000 }).should('be.visible')
    })

    it('should display empty sessions sidebar', () => {
        cy.contains(/no history/i).should('be.visible')
    })

    it('should create a new session (operation)', () => {
        const sessionTitle = `Test Operation ${Date.now()}`

        cy.contains('+ New Session', { timeout: 10000 }).should('be.visible').click()
        cy.contains('New Operation', { timeout: 10000 }).should('be.visible')
        cy.get('input[placeholder="Operation Name"]').type(sessionTitle)
        cy.contains('button', 'Initialize').click()

        // Session should appear in list
        cy.contains(sessionTitle, { timeout: 10000 }).should('be.visible')
    })

    it('should select and display session content', () => {
        const sessionTitle = `Selectable Operation ${Date.now()}`

        // Create session
        cy.contains('+ New Session', { timeout: 10000 }).click()
        cy.get('input[placeholder="Operation Name"]').type(sessionTitle)
        cy.contains('button', 'Initialize').click()

        // Click on session
        cy.contains(sessionTitle, { timeout: 10000 }).click()

        // Should display the empty state upload bucket
        cy.contains('Upload Source BOM').should('be.visible')
    })

    it('should navigate back to projects', () => {
        cy.contains('Back', { timeout: 10000 }).click()
        cy.url({ timeout: 10000 }).should('eq', 'http://localhost:3000/')
        cy.contains('PROJECTS').should('be.visible')
    })
})
