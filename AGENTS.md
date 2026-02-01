# Instructions for agents

## Development Commands

```bash
npm install      # Install dependencies before using the project
npm run dev      # Start the development server and workflow
npm run build    # Prepare the final release
npm run preview  # Test the final release locally
npm run test     # Run unit tests for data consistency validation
npm run test:watch  # Run tests in watch mode during development
```

## Code Standards
- All files must include the full MIT-0 license notice (see LICENSE.md for the standard text)
- Follow existing patterns and maintain TypeScript strict mode compliance

## Database Schema Migrations

When modifying the stored data format for `ShaderProject`:

1. **Increment `DB_VERSION`** in `src/shader-manager.ts`
2. **Add migration logic** in the `upgrade()` callback of `getDB()` function
   - Handle data transformation from previous version(s)
   - Ensure backward compatibility with existing data
   - Example pattern:
     ```typescript
     if (oldVersion < 2) {
         // Migrate v1 to v2 format
         const store = database.objectStore('shaders');
         const allShaders = await store.getAll();
         // Transform and put back
     }
     ```
3. **Update `ShaderProject` interface** in `src/types.ts` with new fields/changes
4. **Create migration tests** in `src/shader-manager.test.ts`
   - Test that old format data is correctly transformed
   - Test that new format data works as expected
   - Test round-trip consistency (export/import new format)
5. **Update this document** to reflect the new schema version and migration approach
