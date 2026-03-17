---
name: nxt-code
description: "Genera código de producción siguiendo principios de Clean Code,
SOLID, y las mejores prácticas del tech stack seleccionado."
---

# NXT Code Skill

## Propósito
Generar código limpio, testeable y mantenible.

## Cuándo se Activa
- Implementar stories
- Crear componentes
- Escribir servicios
- Generar boilerplate
- Refactorizar código existente

## Instrucciones

### 1. Principios Obligatorios

#### Clean Code
- **Nombres descriptivos y consistentes**
  ```typescript
  // ❌ Malo
  const d = new Date();
  const fn = (u) => u.n;

  // ✅ Bueno
  const currentDate = new Date();
  const getUserName = (user) => user.name;
  ```

- **Funciones pequeñas (máx 20 líneas)**
  ```typescript
  // ❌ Malo: función de 50+ líneas haciendo múltiples cosas

  // ✅ Bueno: funciones enfocadas
  function validateUser(user: User): ValidationResult {
    return {
      isValid: isEmailValid(user.email) && isPasswordStrong(user.password),
      errors: collectValidationErrors(user)
    };
  }
  ```

- **Un nivel de abstracción por función**
- **Comentarios solo cuando necesarios**
- **Formato consistente (usar Prettier/ESLint)**

#### SOLID
- **S**ingle Responsibility: Una clase = una razón para cambiar
- **O**pen/Closed: Abierto para extensión, cerrado para modificación
- **L**iskov Substitution: Subtipos intercambiables con tipos base
- **I**nterface Segregation: Interfaces pequeñas y específicas
- **D**ependency Inversion: Depender de abstracciones, no implementaciones

#### Testing
- Tests junto al código
- Naming: describe-it pattern
- Arrange-Act-Assert
- Mock de dependencias externas

### 2. Estructura por Tech Stack

#### React/Next.js
```
src/
├── components/
│   └── ComponentName/
│       ├── ComponentName.tsx        # Componente principal
│       ├── ComponentName.test.tsx   # Tests
│       ├── ComponentName.styles.ts  # Estilos (CSS-in-JS)
│       ├── ComponentName.types.ts   # Tipos TypeScript
│       └── index.ts                 # Re-export
├── hooks/
│   └── useHookName.ts
├── services/
│   └── serviceName.service.ts
├── utils/
│   └── utilName.util.ts
├── types/
│   └── index.ts
└── constants/
    └── index.ts
```

#### Node/Express
```
src/
├── controllers/
│   └── resource.controller.ts
├── services/
│   └── resource.service.ts
├── repositories/
│   └── resource.repository.ts
├── middlewares/
│   └── auth.middleware.ts
├── routes/
│   └── resource.routes.ts
├── models/
│   └── resource.model.ts
├── utils/
│   └── helper.util.ts
├── types/
│   └── index.ts
├── config/
│   └── index.ts
└── tests/
    ├── unit/
    └── integration/
```

#### Python/FastAPI
```
src/
├── api/
│   └── routes/
│       └── resource.py
├── core/
│   ├── config.py
│   └── security.py
├── models/
│   └── resource.py
├── schemas/
│   └── resource.py
├── services/
│   └── resource_service.py
├── repositories/
│   └── resource_repository.py
└── tests/
    ├── unit/
    └── integration/
```

### 3. Convenciones de Naming

| Elemento | Convención | Ejemplo |
|----------|------------|---------|
| Components | PascalCase | `UserProfile.tsx` |
| Functions | camelCase | `getUserById()` |
| Constants | UPPER_SNAKE_CASE | `MAX_RETRY_COUNT` |
| Files | kebab-case o según framework | `user-service.ts` |
| Interfaces | PascalCase con I prefix (opcional) | `IUser` o `User` |
| Types | PascalCase | `UserResponse` |
| Enums | PascalCase | `UserStatus` |
| CSS Classes | kebab-case | `.user-profile` |

### 4. Patrones Comunes

#### Repository Pattern
```typescript
interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findAll(): Promise<User[]>;
  create(data: CreateUserDto): Promise<User>;
  update(id: string, data: UpdateUserDto): Promise<User>;
  delete(id: string): Promise<void>;
}
```

#### Service Layer
```typescript
class UserService {
  constructor(private readonly userRepository: IUserRepository) {}

  async getUserById(id: string): Promise<User> {
    const user = await this.userRepository.findById(id);
    if (!user) throw new NotFoundException('User not found');
    return user;
  }
}
```

#### Factory Pattern
```typescript
class NotificationFactory {
  static create(type: NotificationType): INotification {
    switch (type) {
      case 'email': return new EmailNotification();
      case 'sms': return new SmsNotification();
      case 'push': return new PushNotification();
      default: throw new Error(`Unknown notification type: ${type}`);
    }
  }
}
```

### 5. Imports

```typescript
// 1. External packages (alphabetical)
import { useEffect, useState } from 'react';
import axios from 'axios';

// 2. Internal absolute imports
import { UserService } from '@/services/user.service';
import { User } from '@/types';

// 3. Relative imports
import { UserCard } from './UserCard';
import styles from './UserList.module.css';
```

### 6. Error Handling

```typescript
// Custom error classes
class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code: string
  ) {
    super(message);
    this.name = 'AppError';
  }
}

class NotFoundException extends AppError {
  constructor(resource: string) {
    super(`${resource} not found`, 404, 'NOT_FOUND');
  }
}

// Usage
try {
  const user = await userService.findById(id);
} catch (error) {
  if (error instanceof NotFoundException) {
    return res.status(404).json({ error: error.message });
  }
  throw error;
}
```

### 7. Antes de Generar Código

1. ✅ Leer story-context
2. ✅ Identificar patrones existentes en el proyecto
3. ✅ Seguir convenciones establecidas
4. ✅ No reinventar la rueda
5. ✅ Considerar edge cases
6. ✅ Pensar en testabilidad

## Ejemplos de Uso

```
"Implementa el componente de login"
"Crea el servicio de autenticación"
"Genera el endpoint de usuarios"
"Refactoriza el componente UserList para usar hooks"
"Implementa el patrón repository para productos"
```
