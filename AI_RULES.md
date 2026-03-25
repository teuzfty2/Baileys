# AI Rules & Tech Stack

## Tech Stack

- **Runtime & Language**: Node.js with TypeScript.
- **Web Framework**: Express.js for building the REST API.
- **Databases**: 
  - MongoDB (Native Driver) as referenced in config.
  - MySQL using Sequelize ORM (installed in dependencies).
- **HTTP Client**: Axios for making external API requests.
- **Configuration**: Dotenv for environment variable management.
- **Package Manager**: pnpm.

## Development Rules

1.  **File Structure**:
    - All source code must reside in the `src/` directory.
    - API routes must be defined in `src/routes/`.
    - Middleware functions must be placed in `src/middleware/`.
    - Global configurations must be centralized in `src/config.ts`.

2.  **TypeScript**:
    - Use strict typing. Avoid `any` whenever possible.
    - Define global types in `types/index.d.ts` if they are shared across the project.

3.  **Configuration**:
    - Do not hardcode sensitive values (secrets, keys, URLs).
    - Always use `process.env` accessed via the `src/config.ts` file to retrieve environment variables.

4.  **External Integrations**:
    - Use `axios` for all HTTP requests to external services (e.g., Asaas API).

5.  **Coding Style**:
    - Use ES6+ syntax (import/export, async/await, arrow functions).
    - Keep controllers and logic separate from route definitions where possible (though simple handlers can be inline for now).