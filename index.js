// const {loadSchemaSync} =
// const {GraphQLFileLoader} =
// const {addResolversToSchema} =
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