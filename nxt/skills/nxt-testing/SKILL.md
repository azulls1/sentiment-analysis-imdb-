---
name: nxt-testing
description: "Genera tests automatizados (unit, integration, e2e) siguiendo
las mejores prácticas de testing para asegurar calidad del código."
---

# NXT Testing Skill

## Propósito
Generar tests completos y mantenibles.

## Cuándo se Activa
- Escribir unit tests
- Crear integration tests
- Generar E2E tests
- Aumentar coverage
- TDD (Test Driven Development)

## Instrucciones

### 1. Pirámide de Tests

```
         ╱╲
        ╱  ╲
       ╱ E2E╲        5% - Flujos críticos completos
      ╱──────╲
     ╱        ╲
    ╱Integration╲   15% - Integración entre módulos
   ╱────────────╲
  ╱              ╲
 ╱   Unit Tests   ╲ 80% - Lógica de negocio aislada
╱──────────────────╲
```

### 2. Tipos de Tests

#### Unit Tests
- Testean una unidad aislada (función, clase, componente)
- Mock de todas las dependencias externas
- Muy rápidos de ejecutar
- Deben ser 80%+ del total de tests

```typescript
// user.service.test.ts
describe('UserService', () => {
  let userService: UserService;
  let mockUserRepository: jest.Mocked<IUserRepository>;

  beforeEach(() => {
    mockUserRepository = {
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };
    userService = new UserService(mockUserRepository);
  });

  describe('getUserById', () => {
    it('should return user when found', async () => {
      // Arrange
      const expectedUser = { id: '1', name: 'John', email: 'john@test.com' };
      mockUserRepository.findById.mockResolvedValue(expectedUser);

      // Act
      const result = await userService.getUserById('1');

      // Assert
      expect(result).toEqual(expectedUser);
      expect(mockUserRepository.findById).toHaveBeenCalledWith('1');
    });

    it('should throw NotFoundException when user not found', async () => {
      // Arrange
      mockUserRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(userService.getUserById('999'))
        .rejects.toThrow(NotFoundException);
    });
  });
});
```

#### Integration Tests
- Testean interacción entre módulos
- Usan base de datos de test (real o in-memory)
- APIs reales (pero ambiente de staging)
- 15% del total de tests

```typescript
// users.integration.test.ts
describe('Users API (Integration)', () => {
  let app: Express;
  let testDb: TestDatabase;

  beforeAll(async () => {
    testDb = await TestDatabase.create();
    app = createApp({ database: testDb });
  });

  afterAll(async () => {
    await testDb.cleanup();
  });

  beforeEach(async () => {
    await testDb.reset();
  });

  describe('POST /api/users', () => {
    it('should create a new user', async () => {
      const newUser = {
        name: 'Jane Doe',
        email: 'jane@test.com',
        password: 'SecurePass123!'
      };

      const response = await request(app)
        .post('/api/users')
        .send(newUser)
        .expect(201);

      expect(response.body).toMatchObject({
        id: expect.any(String),
        name: newUser.name,
        email: newUser.email
      });
      expect(response.body.password).toBeUndefined();
    });

    it('should return 400 for invalid email', async () => {
      const response = await request(app)
        .post('/api/users')
        .send({ name: 'Test', email: 'invalid-email', password: 'pass' })
        .expect(400);

      expect(response.body.errors).toContainEqual(
        expect.objectContaining({ field: 'email' })
      );
    });
  });
});
```

#### E2E Tests
- Testean flujos completos de usuario
- Browser automation (Playwright/Cypress)
- 5% del total de tests
- Solo paths críticos

```typescript
// login.e2e.test.ts
import { test, expect } from '@playwright/test';

test.describe('Login Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('should login successfully with valid credentials', async ({ page }) => {
    // Fill form
    await page.fill('[data-testid="email-input"]', 'user@test.com');
    await page.fill('[data-testid="password-input"]', 'validPassword123');

    // Submit
    await page.click('[data-testid="login-button"]');

    // Assert redirect to dashboard
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('[data-testid="welcome-message"]'))
      .toContainText('Welcome');
  });

  test('should show error with invalid credentials', async ({ page }) => {
    await page.fill('[data-testid="email-input"]', 'wrong@test.com');
    await page.fill('[data-testid="password-input"]', 'wrongPassword');
    await page.click('[data-testid="login-button"]');

    await expect(page.locator('[data-testid="error-message"]'))
      .toBeVisible();
    await expect(page).toHaveURL('/login');
  });
});
```

### 3. Frameworks por Stack

| Stack | Unit | Integration | E2E |
|-------|------|-------------|-----|
| React | Jest + RTL | Jest + MSW | Playwright |
| Next.js | Jest + RTL | Jest + Supertest | Playwright |
| Node/Express | Jest | Jest + Supertest | Playwright |
| Python/FastAPI | Pytest | Pytest + TestClient | Playwright |
| Vue | Vitest | Vitest | Playwright |

### 4. Patrones de Testing

#### Arrange-Act-Assert (AAA)
```typescript
it('should calculate total with discount', () => {
  // Arrange
  const items = [{ price: 100 }, { price: 50 }];
  const discount = 0.1; // 10%

  // Act
  const total = calculateTotal(items, discount);

  // Assert
  expect(total).toBe(135); // 150 - 10% = 135
});
```

#### Given-When-Then (BDD)
```typescript
describe('Shopping Cart', () => {
  describe('given a cart with items', () => {
    describe('when applying a valid coupon', () => {
      it('then should reduce the total price', () => {
        // ...
      });
    });
  });
});
```

### 5. React Testing Best Practices

```typescript
// UserProfile.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UserProfile } from './UserProfile';

describe('UserProfile', () => {
  const mockUser = {
    id: '1',
    name: 'John Doe',
    email: 'john@test.com'
  };

  it('should render user information', () => {
    render(<UserProfile user={mockUser} />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@test.com')).toBeInTheDocument();
  });

  it('should call onEdit when edit button clicked', async () => {
    const onEdit = jest.fn();
    render(<UserProfile user={mockUser} onEdit={onEdit} />);

    await userEvent.click(screen.getByRole('button', { name: /edit/i }));

    expect(onEdit).toHaveBeenCalledWith(mockUser.id);
  });

  it('should show loading state', () => {
    render(<UserProfile user={mockUser} isLoading />);

    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });
});
```

### 6. Coverage Requirements

```yaml
# Mínimos requeridos
coverage:
  statements: ">= 80%"
  branches: ">= 75%"
  functions: ">= 80%"
  lines: ">= 80%"

# Por tipo de archivo
thresholds:
  services: 90%
  utils: 95%
  controllers: 80%
  components: 75%
```

### 7. Qué Testear vs Qué NO Testear

#### ✅ Testear
- Lógica de negocio
- Edge cases y boundary conditions
- Error handling
- Integraciones críticas
- User interactions
- State changes

#### ❌ NO Testear
- Getters/setters simples
- Código de terceros/librerías
- Configuración estática
- Estilos CSS (usar visual regression si es crítico)
- Implementación interna (testear comportamiento)

### 8. Test Data

```typescript
// factories/user.factory.ts
import { faker } from '@faker-js/faker';

export const createTestUser = (overrides = {}) => ({
  id: faker.string.uuid(),
  name: faker.person.fullName(),
  email: faker.internet.email(),
  createdAt: faker.date.past(),
  ...overrides
});

// Usage
const user = createTestUser({ name: 'Specific Name' });
```

## Ejemplos de Uso

```
"Escribe unit tests para el servicio de usuarios"
"Genera integration tests para el endpoint de auth"
"Crea E2E test para el flujo de registro"
"Aumenta el coverage del componente Dashboard"
"Implementa tests para los edge cases del carrito"
```
