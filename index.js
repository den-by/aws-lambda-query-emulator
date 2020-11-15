const {loadSchemaSync} = require('@graphql-tools/load');
const {GraphQLFileLoader} = require('@graphql-tools/graphql-file-loader');
const {addResolversToSchema} = require('@graphql-tools/schema');
const server = require('./server');
const fs = require('fs');
const argv = require('minimist')(process.argv.slice(2));
const rootDir = argv['rootDir'];
require('dotenv').config({path: rootDir + '/config/env/.env.test'});
// import ROLE_ADMIN from [rootDir+'/helper/role-list.mjs'];
// const ROLE_ADMIN = require(rootDir+'/helper/role-list.ts');
// import * as name from '/helper/role-list.mjs';
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
    const serverlessString = fs.readFileSync(rootDir + '/serverless.yml', 'utf8');
    const serverless = require('yaml').parse(serverlessString);
    const mapping = serverless.custom['appSync']['mappingTemplates'];

    const path = require('path');
    const normalizedPath = path.join(rootDir, 'resolvers');
    let resolversFunctions = {};
    fs.readdirSync(normalizedPath).forEach(function (dir) {
        fs.readdirSync(path.join(normalizedPath, dir)).forEach(function (file) {
            const patch = normalizedPath + '/' + dir + '/' + file;
            try {
                resolversFunctions = {...resolversFunctions, ...require(patch)};
            } catch (e) {
                console.log('file not load: ' + patch);
            }
        });
    });

    const resolvers = mapping.reduce(function (sum, current) {
        const type = current.type;
        const field = current.field;
        let request;
        if (type === 'Query' || type === 'Mutation') {
            request = (_, atr) => resolversFunctions[field]({...atr, ...context});
            sum[type] = {...sum[type || {}], [field]: request};
        }
        return sum;
    }, {});

    const schema = loadSchemaSync([process.cwd() + '/aws.graphql', rootDir + '/graphql/*.graphql'], {
        loaders: [
            new GraphQLFileLoader(),
        ]
    });

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
