const {loadSchemaSync} = require('@graphql-tools/load');
const {GraphQLFileLoader} = require('@graphql-tools/graphql-file-loader');
const {addResolversToSchema} = require('@graphql-tools/schema');
// const {ApolloServer, express,expressApollo } = require ('apollo-server-express');
// module.exports.graphql = require('graphql')
// const ApolloServer = require('apollo-server').ApolloServer

// const {ApolloServer, express,expressApollo } = require('./server');

module.exports.server = require('./server');
module.exports.yaml = require('yaml');
module.exports.loadSchemaSync = require('@graphql-tools/load').loadSchemaSync;
module.exports.GraphQLFileLoader = require('@graphql-tools/graphql-file-loader').GraphQLFileLoader;
module.exports.addResolversToSchema = require('@graphql-tools/schema').addResolversToSchema;
// module.exports.ApolloServer = ApolloServer;
// module.exports.express = express;
// module.exports.expressApollo = expressApollo;



// const sdfsd = __dirname;


module.exports.contextAdapterCreate = function () {
    const fs = require('fs');
    const argv = require('minimist')(process.argv.slice(2));
    const  rootDir = process.cwd();
    const contextPatch = argv['userType'] === 'purchaser' ? 'tests/test_create_purchaser.json' : 'tests/test_create_user.json';
    const contextJsonString = fs.readFileSync(rootDir+'/'+contextPatch);

    require('dotenv').config({path: rootDir+'/config/env/.env.test'});
    const context = JSON.parse(String(contextJsonString));
    const {availableParameters} = require(rootDir+'/helper/context/context.js');
    const contextAdapter = Object.keys(context).reduce(function (previous, key) {
        if (availableParameters[key]) {
            let newKey = availableParameters[key];
            previous[newKey] = context[key];
        } else {
            previous[key] = context[key];
        }

        return previous;
    }, {});
    return contextAdapter
}


module.exports.addResolversToSchemas = function (contextAdapter){
    const  rootDir = process.cwd()
    const fs = require('fs');
    const serverlessString = fs.readFileSync(rootDir+'/serverless.yml', 'utf8');
    const serverless = require('yaml').parse(serverlessString);
    const mapping = serverless.custom['appSync']['mappingTemplates'];

    const path = require('path');
    const normalizedPath = path.join(rootDir, 'resolvers');
    let resolversFunctions = {};
    fs.readdirSync(normalizedPath).forEach(function (dir) {
        fs.readdirSync(path.join(normalizedPath, dir)).forEach(function (file) {
            const patch = normalizedPath+'/' + dir + '/' + file;
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
            request = (_, atr) => resolversFunctions[field]({...atr, ...contextAdapter});
            sum[type] = {...sum[type || {}], [field]: request};
        }
        return sum;
    }, {});


    const schema = loadSchemaSync([rootDir+'/aws.graphql', rootDir+'/graphql/*.graphql'], {
        loaders: [
            new GraphQLFileLoader(),
        ]
    });

    const schemaWithResolvers = addResolversToSchema({
        schema,
        resolvers,
    });
    return schemaWithResolvers;

}