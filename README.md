# S1mpl3 API L1b

A lightweight, modular TypeScript API library built on Koa.js for creating scalable web applications with a clean, plugin-based architecture.

## Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
- [Core Concepts](#core-concepts)
  - [Application](#application)
  - [Modules](#modules)
  - [Controllers](#controllers)
- [Architecture](#architecture)
- [Usage Guide](#usage-guide)
  - [Creating an Application](#creating-an-application)
  - [Creating Modules](#creating-modules)
  - [Creating Controllers](#creating-controllers)
  - [Working with Models](#working-with-models)
- [API Reference](#api-reference)
- [Examples](#examples)
- [Development](#development)

## Installation

```bash
npm install s1mpl3-api-l1b
```

or with pnpm:

```bash
pnpm add s1mpl3-api-l1b
```

## Quick Start

```typescript
import { Application, BaseController, IModule } from 's1mpl3-api-l1b';
import Koa from 'koa';
import Router from 'koa-router';

// 1. Create a custom application
class MyApp extends Application {
  protected run(): void {
    super.run();
    console.log('Application is running!');
  }
}

// 2. Create a module (e.g., HTTP server)
class ServerModule implements IModule {
  private app: Koa;
  
  constructor(port: number) {
    this.app = new Koa();
    this.app.listen(port);
  }
  
  default(): void {
    console.log(`Server started on port ${port}`);
  }
}

// 3. Create a controller
class HelloController extends BaseController {
  path = '/api';
  
  build(): Router {
    const router = super.build();
    
    router.get('/hello', (ctx) => {
      ctx.body = { message: 'Hello, World!' };
    });
    
    return router;
  }
}

// 4. Initialize and run
const app = new MyApp();
app.use(ServerModule, 3000);
app.run();
```

## Core Concepts

### Application

The `Application` class is the core of your API. It manages modules and their lifecycle.

**Key Features:**
- Module management with `use()` and `set()`
- Initialization hooks (`beforeRun()`)
- Shared context for cross-module communication
- Lifecycle management

### Modules

Modules are reusable components that implement the `IModule` interface. They encapsulate specific functionality like database connections, HTTP servers, authentication, etc.

**Module Lifecycle:**
- **Init Modules** (via `set()`): Execute before regular modules
- **Regular Modules** (via `use()`): Execute during application run

### Controllers

Controllers extend `BaseController` and define API routes using Koa Router.

**Features:**
- Route prefix configuration
- Unsecured routes specification
- Clean route organization

## Architecture

```
Application
├── Init Modules (set)     → Execute immediately
│   └── Database
│   └── Configuration
│
└── Regular Modules (use)   → Execute on run()
    └── HTTP Server
    └── WebSocket Server
    └── Background Jobs
    
Controllers
├── BaseController
    └── build() → Router
    └── path (route prefix)
    └── unsecuredRoutes[]
```

## Usage Guide

### Creating an Application

```typescript
import { Application } from 's1mpl3-api-l1b';

class MyApplication extends Application {
  protected beforeRun(): void {
    // Initialize shared resources
    Application.sharedContext = {
      startTime: Date.now(),
      config: {}
    };
  }

  protected run(): void {
    super.run(); // Executes all registered modules
    console.log('Application ready!');
  }
}

const app = new MyApplication();
```

### Creating Modules

#### 1. Database Module Example

```typescript
import { IModule } from 's1mpl3-api-l1b';
import mongoose from 'mongoose';

class DatabaseModule implements IModule {
  private connectionString: string;

  constructor(connectionString: string) {
    this.connectionString = connectionString;
  }

  async default(): Promise<void> {
    await mongoose.connect(this.connectionString);
    console.log('Database connected');
  }
}

// Register as init module (executes immediately)
app.set(DatabaseModule, 'mongodb://localhost:27017/mydb');
```

#### 2. HTTP Server Module Example

```typescript
import { IModule } from 's1mpl3-api-l1b';
import Koa from 'koa';
import Router from 'koa-router';
import bodyParser from '@koa/bodyparser';
import cors from '@koa/cors';

class HTTPServerModule implements IModule {
  private app: Koa;
  private port: number;
  private controllers: BaseController[];

  constructor(port: number, controllers: BaseController[]) {
    this.app = new Koa();
    this.port = port;
    this.controllers = controllers;
  }

  default(): void {
    // Middleware
    this.app.use(cors());
    this.app.use(bodyParser());

    // Register controllers
    for (const controller of this.controllers) {
      const router = controller.build();
      this.app.use(router.routes());
      this.app.use(router.allowedMethods());
    }

    // Start server
    this.app.listen(this.port);
    console.log(`Server listening on port ${this.port}`);
  }
}

// Register as regular module
app.use(HTTPServerModule, 3000, [new UserController(), new AuthController()]);
```

### Creating Controllers

#### Basic Controller

```typescript
import { BaseController } from 's1mpl3-api-l1b';
import Router from 'koa-router';

class UserController extends BaseController {
  path = '/users';

  build(): Router {
    const router = super.build();

    // GET /users
    router.get('/', async (ctx) => {
      ctx.body = await User.find();
    });

    // GET /users/:id
    router.get('/:id', async (ctx) => {
      const user = await User.findById(ctx.params.id);
      ctx.body = user;
    });

    // POST /users
    router.post('/', async (ctx) => {
      const user = new User(ctx.request.body);
      await user.save();
      ctx.body = user;
    });

    return router;
  }
}
```

#### Controller with Authentication

```typescript
import { BaseController } from 's1mpl3-api-l1b';
import Router from 'koa-router';
import jwt from 'koa-jwt';

class AuthController extends BaseController {
  path = '/auth';
  unsecuredRoutes = ['/auth/login', '/auth/register'];

  build(): Router {
    const router = super.build();

    // Protected by JWT (except unsecuredRoutes)
    router.use(jwt({ 
      secret: 'your-secret',
      passthrough: true 
    }));

    router.post('/login', async (ctx) => {
      // Login logic
      const token = generateToken(user);
      ctx.body = { token };
    });

    router.post('/register', async (ctx) => {
      // Registration logic
    });

    router.get('/profile', async (ctx) => {
      // Requires authentication
      ctx.body = ctx.state.user;
    });

    return router;
  }
}
```

### Working with Models

The library includes built-in Mongoose model utilities.

#### User Model Example

```typescript
import { User, UserDocument } from 's1mpl3-api-l1b';

// Create user
const newUser = new User({
  username: 'john_doe',
  password: 'hashed_password'
});
await newUser.save();

// Find user
const user = await User.findOne({ username: 'john_doe' });

// Update user
await User.updateOne(
  { username: 'john_doe' },
  { password: 'new_hashed_password' }
);
```

#### Custom Model Example

```typescript
import mongoose, { Document, Schema } from 'mongoose';

interface IPost {
  title: string;
  content: string;
  author: string;
}

type PostDocument = IPost & Document;

const PostSchema = new Schema<PostDocument>({
  title: { type: String, required: true },
  content: { type: String, required: true },
  author: { type: String, required: true }
}, {
  timestamps: true
});

export const Post = mongoose.model<PostDocument>('Post', PostSchema);
```

## API Reference

### Application Class

#### Methods

##### `use<T extends IModule>(module: new (...args: any[]) => T, ...args: any[]): void`
Register a module to be executed during `run()`.

```typescript
app.use(HTTPServerModule, 3000);
```

##### `set<T extends IModule>(module: new (...args: any[]) => T, ...args: any[]): void`
Register an init module that executes immediately.

```typescript
app.set(DatabaseModule, 'mongodb://localhost/mydb');
```

##### `protected beforeRun(): void`
Override this method to perform setup before modules run.

##### `protected run(): void`
Override this method to customize module execution.

##### `protected exit(exitCode?: number): void`
Gracefully exit the application.

#### Properties

##### `static sharedContext: any`
Shared context accessible across all modules.

### BaseController Class

#### Properties

##### `readonly path?: string`
Route prefix for the controller.

##### `readonly unsecuredRoutes?: string[]`
Array of routes that should bypass authentication.

#### Methods

##### `build(): Router`
Build and return a Koa Router instance with defined routes.

### IModule Interface

```typescript
interface IModule {
  default(): void;
}
```

Implement this interface for all modules.

### IApplication Interface

```typescript
interface IApplication {
  run(): void | Promise<void>;
}
```

## Examples

### Complete REST API Example

```typescript
import { Application, BaseController, IModule } from 's1mpl3-api-l1b';
import Koa from 'koa';
import Router from 'koa-router';
import mongoose from 'mongoose';
import bodyParser from '@koa/bodyparser';

// Database Module
class DBModule implements IModule {
  constructor(private uri: string) {}
  
  async default() {
    await mongoose.connect(this.uri);
    console.log('✓ Database connected');
  }
}

// Server Module
class ServerModule implements IModule {
  constructor(
    private port: number, 
    private controllers: BaseController[]
  ) {}
  
  default() {
    const app = new Koa();
    app.use(bodyParser());
    
    this.controllers.forEach(ctrl => {
      const router = ctrl.build();
      app.use(router.routes());
    });
    
    app.listen(this.port);
    console.log(`✓ Server running on port ${this.port}`);
  }
}

// Product Controller
class ProductController extends BaseController {
  path = '/api/products';
  
  build(): Router {
    const router = super.build();
    
    router.get('/', async (ctx) => {
      ctx.body = await Product.find();
    });
    
    router.post('/', async (ctx) => {
      const product = new Product(ctx.request.body);
      await product.save();
      ctx.status = 201;
      ctx.body = product;
    });
    
    return router;
  }
}

// Main Application
class MyAPI extends Application {
  protected beforeRun() {
    Application.sharedContext = { version: '1.0.0' };
  }
  
  protected run() {
    super.run();
    console.log('🚀 API Ready!');
  }
}

// Initialize
const api = new MyAPI();
api.set(DBModule, 'mongodb://localhost:27017/shop');
api.use(ServerModule, 3000, [new ProductController()]);
api.run();
```

### Microservice Example with Multiple Modules

```typescript
class CacheModule implements IModule {
  default() {
    // Initialize Redis/node-cache
  }
}

class LoggerModule implements IModule {
  default() {
    // Setup logging
  }
}

class SchedulerModule implements IModule {
  default() {
    // Setup cron jobs
  }
}

const app = new Application();

// Init modules
app.set(DBModule, process.env.MONGO_URI);
app.set(CacheModule);
app.set(LoggerModule);

// Runtime modules
app.use(HTTPServerModule, 8080, controllers);
app.use(SchedulerModule);

app.run();
```

## Development

### Building the Library

```bash
# Development build
pnpm run build-dev

# Production build
pnpm run build

# Watch mode
pnpm run start:watch
```

### Project Structure

```
src/
├── api.ts                      # Main entry point
├── app/
│   ├── Application.ts          # Core Application class
│   └── controllers/
│       └── BaseController.ts   # Base controller class
├── definitions/
│   ├── interfaces/             # TypeScript interfaces
│   │   ├── Application/
│   │   ├── Module/
│   │   ├── User/
│   │   └── IFile/
│   ├── models/                 # Mongoose models
│   │   ├── user/
│   │   └── file/
│   └── module/
│       └── module.ts           # Module wrapper class
```

### TypeScript Configuration

The library compiles to ES6/CommonJS with full type definitions for TypeScript projects.

## Best Practices

1. **Separation of Concerns**: Keep controllers focused on routing, business logic in services
2. **Module Organization**: Use init modules for dependencies (DB, config) and regular modules for services
3. **Error Handling**: Implement global error handlers in your server module
4. **Type Safety**: Leverage TypeScript interfaces for better IDE support
5. **Testing**: Test controllers and modules independently
6. **Environment Config**: Use environment variables for configuration

## Dependencies

Core dependencies:
- `koa` - Web framework
- `koa-router` - Routing
- `mongoose` - MongoDB ODM
- `@koa/bodyparser` - Request body parsing
- `@koa/cors` - CORS support
- `jsonwebtoken` - JWT authentication
- `bcrypt` - Password hashing

## License

MIT © Julianitow

## Links

- GitHub: https://github.com/julianitow/s1mpl3-api-l1b
- Issues: https://github.com/julianitow/s1mpl3-api-l1b/issues
