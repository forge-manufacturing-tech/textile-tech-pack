describe('Admin Dashboard', () => {
  const adminPayload = {
    email: 'admin@example.com',
    name: 'Admin User',
    role: 'admin',
    sub: 'admin-pid',
    pid: 'admin-pid'
  };

  const userPayload = {
    email: 'user@example.com',
    name: 'Normal User',
    role: 'user',
    sub: 'user-pid',
    pid: 'user-pid'
  };

  const createToken = (payload: any) => {
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const body = btoa(JSON.stringify(payload));
    return `${header}.${body}.signature`;
  };

  const adminToken = createToken(adminPayload);
  const userToken = createToken(userPayload);

  beforeEach(() => {
    // Mock Projects list (called by ProjectsPage)
    cy.intercept('GET', '/api/projects', {
        statusCode: 200,
        body: []
    }).as('getProjects');
  });

  it('should redirect non-admin users away from /admin', () => {
    cy.intercept('POST', '/api/auth/login', {
      statusCode: 200,
      body: {
        token: userToken,
        name: userPayload.name,
        pid: userPayload.pid,
        is_verified: true
      }
    }).as('loginUser');

    cy.visit('/login');
    cy.get('input[type="email"]').type('user@example.com');
    cy.get('input[type="password"]').type('password');
    cy.get('button[type="submit"]').click();

    cy.wait('@loginUser');
    cy.location('pathname').should('eq', '/dashboard');

    // Try to access admin
    cy.visit('/admin');
    cy.location('pathname').should('eq', '/dashboard');

    // Check that Admin Panel button is NOT present
    cy.contains('Admin Panel').should('not.exist');
  });

  it('should allow admin users to access /admin', () => {
    cy.intercept('POST', '/api/auth/login', {
      statusCode: 200,
      body: {
        token: adminToken,
        name: adminPayload.name,
        pid: adminPayload.pid,
        is_verified: true
      }
    }).as('loginAdmin');

    cy.intercept('GET', '/api/admin/users', {
        statusCode: 200,
        body: [
            { name: 'Admin User', email: 'admin@example.com', role: 'admin', pid: 'admin-pid', id: 1, created_at: '2023-01-01' },
            { name: 'Normal User', email: 'user@example.com', role: 'user', pid: 'user-pid', id: 2, created_at: '2023-01-02' }
        ]
    }).as('getUsers');

    cy.visit('/login');
    cy.get('input[type="email"]').type('admin@example.com');
    cy.get('input[type="password"]').type('password');
    cy.get('button[type="submit"]').click();

    cy.wait('@loginAdmin');
    cy.location('pathname').should('eq', '/dashboard');

    // Check for Admin Panel button
    cy.contains('Admin Panel').click();
    cy.location('pathname').should('eq', '/admin');

    cy.wait('@getUsers');
    cy.contains('USER MANAGEMENT');
    cy.contains('Admin User');
    cy.contains('Normal User');
  });

  it('should promote a user', () => {
    // Setup admin session
    cy.intercept('POST', '/api/auth/login', {
      statusCode: 200,
      body: { token: adminToken, name: adminPayload.name, pid: adminPayload.pid, is_verified: true }
    }).as('loginAdmin');

    cy.intercept('GET', '/api/admin/users', {
        statusCode: 200,
        body: [
            { name: 'Normal User', email: 'user@example.com', role: 'user', pid: 'user-pid', id: 2, created_at: '2023-01-02' }
        ]
    }).as('getUsers');

    cy.intercept('POST', '/api/admin/users/user-pid/promote', {
        statusCode: 200,
        body: {}
    }).as('promoteUser');

    cy.visit('/login');
    cy.get('input[type="email"]').type('admin@example.com');
    cy.get('input[type="password"]').type('password');
    cy.get('button[type="submit"]').click();
    cy.wait('@loginAdmin');

    cy.visit('/admin');
    cy.wait('@getUsers');

    cy.contains('tr', 'Normal User').within(() => {
        cy.contains('Promote').click();
    });

    cy.wait('@promoteUser');
  });

  it('should demote an admin', () => {
    cy.intercept('POST', '/api/auth/login', {
        statusCode: 200,
        body: { token: adminToken, name: adminPayload.name, pid: adminPayload.pid, is_verified: true }
    }).as('loginAdmin');

    cy.intercept('GET', '/api/admin/users', {
        statusCode: 200,
        body: [
            { name: 'Another Admin', email: 'admin2@example.com', role: 'admin', pid: 'admin2-pid', id: 3, created_at: '2023-01-03' }
        ]
    }).as('getUsers');

    cy.intercept('POST', '/api/admin/users/admin2-pid/demote', {
        statusCode: 200,
        body: {}
    }).as('demoteUser');

    cy.visit('/login');
    cy.get('input[type="email"]').type('admin@example.com');
    cy.get('input[type="password"]').type('password');
    cy.get('button[type="submit"]').click();
    cy.wait('@loginAdmin');

    cy.visit('/admin');
    cy.wait('@getUsers');

    cy.contains('tr', 'Another Admin').within(() => {
        cy.contains('Demote').click();
    });
    // Confirm dialog
    cy.on('window:confirm', () => true);

    cy.wait('@demoteUser');
  });

  it('should delete a user', () => {
    cy.intercept('POST', '/api/auth/login', {
        statusCode: 200,
        body: { token: adminToken, name: adminPayload.name, pid: adminPayload.pid, is_verified: true }
    }).as('loginAdmin');

    cy.intercept('GET', '/api/admin/users', {
        statusCode: 200,
        body: [
            { name: 'User To Delete', email: 'delete@example.com', role: 'user', pid: 'delete-pid', id: 4, created_at: '2023-01-04' }
        ]
    }).as('getUsers');

    cy.intercept('DELETE', '/api/admin/users/delete-pid', {
        statusCode: 200,
        body: {}
    }).as('deleteUser');

    cy.visit('/login');
    cy.get('input[type="email"]').type('admin@example.com');
    cy.get('input[type="password"]').type('password');
    cy.get('button[type="submit"]').click();
    cy.wait('@loginAdmin');

    cy.visit('/admin');
    cy.wait('@getUsers');

    cy.contains('tr', 'User To Delete').within(() => {
        cy.get('button[title="Delete User"]').click();
    });

    // Confirm dialog
    cy.on('window:confirm', () => true);

    cy.wait('@deleteUser');
  });

  it('should bulk delete users', () => {
    cy.intercept('POST', '/api/auth/login', {
        statusCode: 200,
        body: { token: adminToken, name: adminPayload.name, pid: adminPayload.pid, is_verified: true }
    }).as('loginAdmin');

    cy.intercept('GET', '/api/admin/users', {
        statusCode: 200,
        body: [
            { name: 'User 1', email: 'u1@example.com', role: 'user', pid: 'u1-pid', id: 10, created_at: '2023-01-10' },
            { name: 'User 2', email: 'u2@example.com', role: 'user', pid: 'u2-pid', id: 11, created_at: '2023-01-11' }
        ]
    }).as('getUsers');

    cy.intercept('DELETE', '/api/admin/users/u1-pid', { statusCode: 200, body: {} }).as('deleteU1');
    cy.intercept('DELETE', '/api/admin/users/u2-pid', { statusCode: 200, body: {} }).as('deleteU2');

    cy.visit('/login');
    cy.get('input[type="email"]').type('admin@example.com');
    cy.get('input[type="password"]').type('password');
    cy.get('button[type="submit"]').click();
    cy.wait('@loginAdmin');

    cy.visit('/admin');
    cy.wait('@getUsers');

    // Select all
    cy.get('thead input[type="checkbox"]').click();

    // Click delete selected
    cy.contains('Delete Selected').click();

    // Confirm dialog
    cy.on('window:confirm', () => true);

    cy.wait('@deleteU1');
    cy.wait('@deleteU2');
  });
});
