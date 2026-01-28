describe('Mobile Responsiveness', () => {
    let projectName: string

    beforeEach(() => {
        cy.viewport('iphone-x') // Mobile viewport
        projectName = `Mobile Test Project ${Date.now()}`

        // Setup Auth and Mocks
        const createToken = (payload: any) => {
            const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
            const body = btoa(JSON.stringify(payload));
            return `${header}.${body}.signature`;
        };
        const validToken = createToken({ email: 'test@example.com', name: 'Test User', role: 'user', sub: 'user-pid' });

        cy.intercept('POST', '**/api/auth/login', {
            statusCode: 200,
            body: { token: validToken, name: 'Test User' }
        }).as('login')

        cy.intercept('GET', '**/api/projects', {
            statusCode: 200,
            body: [{ id: 'mock-project-id', name: projectName }]
        }).as('getProjects')

        cy.intercept('GET', '**/api/projects/*', {
            statusCode: 200,
            body: { id: 'mock-project-id', name: projectName }
        }).as('getProject')

        cy.intercept('GET', '**/api/sessions*', {
            statusCode: 200,
            body: [
                { id: 'session-1', title: 'Mobile Session 1', project_id: 'mock-project-id', status: 'completed' },
                { id: 'session-2', title: 'Mobile Session 2', project_id: 'mock-project-id' }
            ]
        }).as('getSessions')

        cy.intercept('GET', '**/api/sessions/session-1', {
            statusCode: 200,
            body: { id: 'session-1', title: 'Mobile Session 1', project_id: 'mock-project-id', status: 'completed' }
        }).as('getSessionDetail')

        cy.intercept('GET', '**/api/sessions/*/blobs', {
            statusCode: 200,
            body: []
        }).as('getBlobs')

        // Login
        cy.visit('/login')
        cy.get('input[type="email"]').type('test@example.com')
        cy.get('input[type="password"]').type('password')
        cy.get('button[type="submit"]').click()

        // Navigate to project
        cy.contains(projectName).click()
        cy.url().should('include', '/projects/')
    })

    it('should show session list and hide workbench when no session selected', () => {
        // List should be visible
        cy.contains('History').should('be.visible')
        cy.contains('Mobile Session 1').should('be.visible')

        // Workbench empty state should be hidden
        cy.contains('Select or Create a Session to Begin').should('not.be.visible')
    })

    it('should show workbench and hide session list when session selected', () => {
        cy.contains('Mobile Session 1').click()

        // Wait for session load (blobs are loaded when selecting a session)
        cy.wait('@getBlobs')

        // The list should be hidden (sidebar)
        // We can target the sidebar container. It has 'History' text.
        cy.contains('History').should('not.be.visible')

        // The workbench should be visible
        // In the mock, status is completed, so it shows "COMPLETE"
        cy.contains('COMPLETE').should('be.visible')
    })

    it('should navigate back to list from workbench', () => {
        cy.contains('Mobile Session 1').click()
        cy.wait('@getBlobs')

        // Verify we are in detail view
        cy.contains('History').should('not.be.visible')

        // Click back button
        cy.contains('← Back').click()

        // Should return to list view (still on project page)
        cy.url().should('include', '/projects/')
        cy.contains('History').should('be.visible')
        cy.contains('Mobile Session 1').should('be.visible')
    })
})
