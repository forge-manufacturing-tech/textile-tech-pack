describe('Projects Management', () => {
    const password = 'TestPassword123!'

    beforeEach(() => {
        // Mocks
        cy.intercept('POST', '**/api/auth/register', {
            statusCode: 200,
            body: { token: 'mock-token', name: 'Test User' }
        }).as('register')

        cy.intercept('GET', '**/api/projects', {
            statusCode: 200,
            body: []
        }).as('getProjects')

        cy.intercept('POST', '**/api/projects', (req) => {
            req.reply({
                statusCode: 200,
                body: { id: 'mock-project-id', name: req.body.name, description: req.body.description }
            })
        }).as('createProject')

        cy.intercept('GET', '**/api/projects/*', {
            statusCode: 200,
            body: { id: 'mock-project-id', name: 'Test Project' }
        }).as('getProject')

        cy.intercept('GET', '**/api/sessions*', {
            statusCode: 200,
            body: []
        }).as('getSessions')

        // Register and login before each test with unique email
        const email = `test-projects-${Date.now()}@example.com`

        cy.visit('/login')
        cy.contains("Create New Account").click()
        cy.get('input[type="text"]').type('Test User')
        cy.get('input[type="email"]').type(email)
        cy.get('input[type="password"]').type(password)
        cy.get('button[type="submit"]').click()

        // Wait for redirect to complete
        cy.url({ timeout: 20000 }).should('include', '/dashboard')
        cy.contains('PROJECTS', { timeout: 20000 }).should('be.visible')
        // Wait for page to fully load
        cy.contains(/no projects found/i, { timeout: 10000 })
    })

    it('should display empty projects page', () => {
        cy.contains('PROJECTS').should('be.visible')
        cy.contains(/no projects found/i).should('be.visible')
    })

    it('should create a new project', () => {
        const projectName = `Test Project ${Date.now()}`
        const projectDesc = 'Created by Cypress test'

        // Mock re-fetch of projects after create
        cy.intercept('GET', '**/api/projects', {
            statusCode: 200,
            body: [{ id: 'mock-project-id', name: projectName, description: projectDesc }]
        }).as('getProjectsAfterCreate')

        cy.contains('+ New Project', { timeout: 10000 }).click()
        cy.get('input[type="text"]').first().should('be.visible')
        cy.get('input[type="text"]').first().type(projectName)
        cy.get('textarea').type(projectDesc)
        cy.contains('button', 'Create').click()

        // Project should appear in list
        cy.contains(projectName, { timeout: 10000 }).should('be.visible')
        cy.contains(projectDesc).should('be.visible')
    })

    it('should navigate to project sessions', () => {
        const projectName = `Nav Test ${Date.now()}`

        // Mock re-fetch of projects after create
        cy.intercept('GET', '**/api/projects', {
            statusCode: 200,
            body: [{ id: 'mock-project-id', name: projectName }]
        }).as('getProjectsAfterCreate')

        // Mock project detail fetch on sessions page
        cy.intercept('GET', '**/api/projects/*', {
            statusCode: 200,
            body: { id: 'mock-project-id', name: projectName }
        }).as('getProjectDetail')

        // Create project
        cy.contains('+ New Project', { timeout: 10000 }).click()
        cy.get('input[type="text"]').first().type(projectName)
        cy.contains('button', 'Create').click()

        // Click on project
        cy.contains(projectName, { timeout: 10000 }).click()

        // Should navigate to sessions page
        cy.url({ timeout: 10000 }).should('include', '/projects/')
        cy.contains(projectName).should('be.visible')
    })
})
