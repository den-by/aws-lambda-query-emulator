const {loadSchemaSync} = require('@graphql-tools/load');
const {GraphQLFileLoader} = require('@graphql-tools/graphql-file-loader');
const {addResolversToSchema} = require('@graphql-tools/schema');
const server = require('./server');
const fs = require('fs');
const argv = require('minimist')(process.argv.slice(2));
const rootDir = argv['rootDir'];
require('dotenv').config({path: rootDir + '/config/env/.env.test'});
const getContext = function () {
    const contextPatch = argv['userType'] === 'purchaser' ? 'tests/test_create_purchaser.json' : 'tests/test_create_user.json';
    const contextJsonString = fs.readFileSync(rootDir + '/' + contextPatch);
    const context = JSON.parse(String(contextJsonString));
    const snakeCase = require('lodash.snakecase');

    return Object.entries(context).reduce((total, item) => {
        total[snakeCase(item[0])] = item[1];
        return total
    }, {})
};

const addResolversToSchemas = function (context) {

    const path = require('path');

    const normalizedPath = path.join(rootDir, 'function/graphql.js');
    const exports = require(normalizedPath)

    const schema = loadSchemaSync([process.cwd() + '/aws.graphql', rootDir + '/graphql/*.graphql'], {
        loaders: [
            new GraphQLFileLoader(),
        ]
    });

    const event = {
        arguments: {},
        security: {
            claims: {
                ['custom:account_id']: context.account_id,
                ['custom:is_purchaser']: context.is_purchaser
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
    const context = getContext()
    const schemaWithResolvers = addResolversToSchemas(context);
    server.expressApollo(schemaWithResolvers);
}
