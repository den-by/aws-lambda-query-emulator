const defValue = {port: 8080};
module.exports.ApolloServer = function (schema, port = defValue.port) {
    const ApolloServer = require('apollo-server').ApolloServer
    const server = new ApolloServer({
        schema,
        introspection: true,
        playground: true,
    });

    server.listen(port).then(({url}) => {
        console.log(`🚀 Server ready at ${url}`);
    });
}

module.exports.express = function (schema, port = defValue.port) {

    const express = require('express');
    const graphqlHTTP = require('express-graphql');

    const app = express();
    app.use('/', graphqlHTTP({
        schema,
        graphiql: true
    }));

    const getListen = async () => await app.listen(port);


    getListen().then();

    console.log(`🚀 Server ready at http://localhost:${port}`)
}

module.exports.expressApollo = function (schema, port = defValue.port) {
    const express = require('express');
    const {ApolloServer} = require('apollo-server-express');
    const app = express();
    const server = new ApolloServer({schema});
    server.applyMiddleware({app});
    app.listen({port}, () =>
        console.log(`🚀 Server ready at http://localhost:${port}${server.graphqlPath}`)
    );
}
