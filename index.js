const {loadSchemaSync} = require('@graphql-tools/load');
const {GraphQLFileLoader} = require('@graphql-tools/graphql-file-loader');
const {addResolversToSchema} = require('@graphql-tools/schema');
// const {ApolloServer, express,expressApollo } = require ('apollo-server-express');
// module.exports.graphql = require('graphql')
// const ApolloServer = require('apollo-server').ApolloServer

const {ApolloServer, express,expressApollo } = require('./server');

// const server = require('./server');
// module.exports.toSecond = value => value*2
// module.exports.toThird = value => value*3

module.exports.loadSchemaSync = loadSchemaSync;
module.exports.GraphQLFileLoader = GraphQLFileLoader;
module.exports.addResolversToSchema = addResolversToSchema;
module.exports.ApolloServer = ApolloServer;
module.exports.express = express;
module.exports.expressApollo = expressApollo;