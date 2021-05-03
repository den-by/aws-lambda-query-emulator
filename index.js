const {loadSchemaSync} = require('@graphql-tools/load');
const {GraphQLFileLoader} = require('@graphql-tools/graphql-file-loader');
const {addResolversToSchema} = require('@graphql-tools/schema');
const server = require('./server');
const argv = require('minimist')(process.argv.slice(2));
const rootDir = argv['rootDir'];
require('dotenv').config({path: rootDir + '/config/env/.env.test'});

const addResolversToSchemas = function () {

    const path = require('path');

    const normalizedPath =  argv['start_bundle'] ? './dist/main.js' : path.join(rootDir, 'function/graphql.js');

    const exports = require(normalizedPath)

    const schema = loadSchemaSync([process.cwd() + '/aws.graphql', rootDir + '/graphql/*.graphql'], {
        loaders: [
            new GraphQLFileLoader(),
        ]
    });

    const event = {
        arguments: {},
        security: {
           sourceIp: '0.0.0.0',
            claims: {
                ['custom:account_id']: argv.account_id,
                ['custom:is_purchaser']: argv.is_purchaser
            }
        }
    }

    const handleFunction = async function (...args) {
        const arg = args[1]
        const functionName = args[3].fieldName;
        const handler = exports.handler;
        const context = {
            done: function (...args) {
                const stop = 1;
            },
            succeed: function (...args) {
                const stop = 1;
            },
            fail: function (...args) {
                const stop = 1;
            },
            getRemainingTimeInMillis: function (...args) {
                return 10000;
            },
            memoryLimitInMB: function (...args) {
                return 100;
            },
        }
        const callback = function (...args) {
            const stop = 1;
        }
        return await handler({
            ...event,
            field: functionName,
            arguments: {...event.arguments, ...arg}
        }, context, callback);
    }

    const proxy = new Proxy({}, {
        get(...all) {
            return handleFunction
        }
    });

    const resolvers = {Query: proxy, Mutation: proxy}

    const schemaWithResolvers = addResolversToSchema({
        schema,
        resolvers,
    });
    return schemaWithResolvers;
};

module.exports.startServer = function () {
    const schemaWithResolvers = addResolversToSchemas();
    server.expressApollo(schemaWithResolvers);
}
