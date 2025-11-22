import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: {
    [`http://38.224.253.95:42069/graphql`]: {},
  },
  documents: ['lib/queries/**/*.graphql'],
  generates: {
    // Target 1: Base types, operations, and gql function using client preset
    './lib/generated/': {
      preset: 'client',
      // Removed explicit plugins here to rely on preset defaults for base generation
      presetConfig: {
        gqlTagName: 'gql',
      },
      config: {
        // Naming convention might still be useful, keep it for now
        namingConvention: 'keep',
      },
    },
    // Target 2: Hooks only, generated into a specific file
    './lib/generated/hooks.tsx': {
      plugins: ['typescript-react-apollo'],
      config: {
        withHooks: true,
        withHOC: false,
        // withComponent: true,
        // Naming convention might be needed here too
        // Explicitly state that operations/types are imported from the base file
        // This assumes the base types are in './graphql' relative to this output file
        // Adjust path if necessary based on actual generated structure
        importOperationTypesFrom: 'Types',
        typesNamespace: 'Types',
        importDocumentNodeExternallyFrom: './', // Import DocumentNode from base files in the same dir
      },
      preset: undefined, // Don't use a preset for this specific target
    },
  },
  ignoreNoDocuments: true,
};

export default config;
