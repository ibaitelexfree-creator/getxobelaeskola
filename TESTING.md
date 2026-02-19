# Testing Environment (Vitest)

We have configured `vitest` for unit testing.

## Running Tests
- Run all tests: `npx vitest run`
- Watch mode: `npx vitest`
- Run specific file: `npx vitest source/path/to/file.test.ts`

## Configuration
- `vitest.config.ts`: Main configuration. Uses `jsdom` environment.
- `vitest.setup.ts`: Loads `@testing-library/jest-dom` extensions.

## Coverage
To check coverage, run: `npx vitest run --coverage` (requires installing `@vitest/coverage-v8`).

## Next Steps
- Add tests for `src/lib/weather.ts` (mocking fetch).
- Extract logic from components to `src/lib/` and test it in isolation.
