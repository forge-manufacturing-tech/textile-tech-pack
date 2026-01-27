describe('Authentication Flow', () => {
    beforeEach(() => {
        cy.intercept('POST', '**/api/auth/login', {
            statusCode: 200,
            body: { token: 'mock-token', name: 'Mock User' }
        }).as('loginRequest')

        cy.intercept('POST', '**/api/auth/register', {
            statusCode: 200,
            body: { token: 'mock-token', name: 'Mock User' }
        }).as('registerRequest')

        cy.visit('/login')
    })

    it('should display login page', () => {
        cy.contains('INTERLOCK').should('be.visible')
        cy.contains('SYSTEM ACCESS').should('be.visible')
        cy.get('input[type="email"]').should('be.visible')
        cy.get('input[type="password"]').should('be.visible')
    })

    it('should toggle between login and register', () => {
        cy.contains("Create New Account").click()
        cy.contains('CREATE NEW ACCOUNT').should('be.visible')
        cy.get('input[type="text"]').should('be.visible') // Name field only in register

        cy.contains('Access Existing Account').click()
        cy.contains('SYSTEM ACCESS').should('be.visible')
    })

    it('should show error on invalid login', () => {
        cy.intercept('POST', '**/api/auth/login', {
            statusCode: 401,
            body: { message: 'Invalid credentials' }
        }).as('loginError')

        cy.get('input[type="email"]').type('nonexistent@example.com')
        cy.get('input[type="password"]').type('wrongpassword')
        cy.get('button[type="submit"]').click()

        // Wait for error element to appear (API might be slow)
        cy.get('.bg-industrial-alert\\/10', { timeout: 20000 }).should('be.visible')
        // Should still be on login page
        cy.url().should('include', '/login')
    })

    it('should complete full registration and login flow', () => {
        const email = `test-${Date.now()}@example.com`
        const password = 'TestPassword123!'
        const name = 'Cypress Test User'

        // Register
        cy.contains("Create New Account").click()
        cy.get('input[type="text"]').type(name)
        cy.get('input[type="email"]').type(email)
        cy.get('input[type="password"]').type(password)
        cy.get('button[type="submit"]').click()

        // Make sure no error appeared
        cy.get('.bg-industrial-alert\\/10').should('not.exist')

        // Wait a bit for React state to update


        // Should redirect to projects page (might take a moment)
        cy.url({ timeout: 20000 }).should('include', '/dashboard')
        cy.contains('PROJECTS', { timeout: 20000 }).should('be.visible')
        cy.contains(email).should('be.visible')
    })
})
