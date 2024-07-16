import { getDirective, MapperKind, mapSchema } from '@graphql-tools/utils';
import { defaultFieldResolver, GraphQLSchema } from 'graphql';
import { AuthenticationError } from 'src/errors';

export function authDirective(directiveName: string) {
  return {
    authDirectiveTypeDefs: `directive @${directiveName} on FIELD_DEFINITION`,
    authDirectiveTransformer: (schema: GraphQLSchema) =>
      mapSchema(schema, {
        [MapperKind.OBJECT_FIELD](fieldConfig) {
          const authDirective = getDirective(
            schema,
            fieldConfig,
            directiveName,
          )?.[0];
          if (authDirective) {
            const { resolve = defaultFieldResolver } = fieldConfig;

            fieldConfig.resolve = async function (...args) {
              const context = args[2];
              if (!context.user)
                throw new AuthenticationError('Not authenticated');
              return resolve.apply(this, args);
            };
          }
          return fieldConfig;
        },
      }),
  };
}
