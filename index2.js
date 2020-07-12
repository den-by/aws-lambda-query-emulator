
const path = require('path');

// const {loadSchemaSync} = require('@graphql-tools/load');
// const {GraphQLFileLoader} = require('@graphql-tools/graphql-file-loader');
// const {addResolversToSchema} = require('@graphql-tools/schema');
// const {expressApollo,addResolversToSchema,GraphQLFileLoader,loadSchemaSync} = require('a1develops-graphql-loader')
const YAML = require('yaml');
const fs = require('fs');
const port = 8080;
const argv = require('minimist')(process.argv.slice(2));
const contextPatch = argv['userType'] === 'purchaser' ? 'tests/test_create_purchaser.json' : 'tests/test_create_user.json';
require('dotenv').config({path: 'config/env/.env.test'});
const {availableParameters} = require('./helper/context/context.js');

const contextJsonString = fs.readFileSync(contextPatch);

const context = JSON.parse(String(contextJsonString));
const contextAdapter = Object.keys(context).reduce(function (previous, key) {
    if (availableParameters[key]) {
        let newKey = availableParameters[key];
        previous[newKey] = context[key];
    } else {
        previous[key] = context[key];
    }

    return previous;
}, {});

const serverlessString = fs.readFileSync('./serverless.yml', 'utf8');
const serverless = YAML.parse(serverlessString);
const mapping = serverless.custom['appSync']['mappingTemplates'];

const normalizedPath = path.join(__dirname, 'resolvers');
let resolversFunctions = {};
fs.readdirSync(normalizedPath).forEach(function (dir) {
    fs.readdirSync(path.join(normalizedPath, dir)).forEach(function (file) {
        resolversFunctions = {...require('./resolvers/' + dir + '/' + file), ...resolversFunctions};
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


const schema = loadSchemaSync(['./aws.graphql', './graphql/*.graphql'], {
    loaders: [
        new GraphQLFileLoader(),
    ]
});

const schemaWithResolvers = addResolversToSchema({
    schema: schema,
    resolvers,
});

// const express = require('express');
// // const bodyParser = require('body-parser');
// // const {ApolloServer} = require ('apollo-server-express');
//
// // const PORT = 3000;
//
// const app = express();
// const server = new ApolloServer({ schema:schemaWithResolvers });
// server.applyMiddleware({ app });
// // bodyParser is needed just for POST.
// app.listen({ port: port }, () =>
//     console.log(`🚀 Server ready at http://localhost:${port}${server.graphqlPath}`)
// );

// const {server} = require('a1develops-graphql-loader')
// console.log(toSecond(4));
expressApollo(schemaWithResolvers,port);
//
// const {ApolloServer} = require('a1develops-graphql-loader')
//
// const server = new ApolloServer({
//     schema : schemaWithResolvers,
//     introspection: true,
//     playground: true,
// });
//
// server.listen(port).then(({ url }) => {
//     console.log(`🚀 Server ready at ${url}`);
// });

// const express = require('express');
// const graphqlHTTP = require('express-graphql');

// const app = express();
// app.use('/', graphqlHTTP({
//     schema: schemaWithResolvers,
//     graphiql: true
// }));
//
// app.listen(port);

console.log('GraphQL API server running at localhost: ' + port);

