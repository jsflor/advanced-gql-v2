const {ApolloServer} = require('apollo-server')
const typeDefs = require('./typedefs')
const resolvers = require('./resolvers')
const {createToken, getUserFromToken} = require('./auth')
const db = require('./db')

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context({req, connection}) {
    const context = {...db};

    if (connection) {
      return {...context, ...connection.context};
    }

    const token = req.headers.authorization
    const user = getUserFromToken(token)
    return {...context, user, createToken}
  },
  subscriptions: {
    onConnect(connectionParams) {
      // Authorization! headers are not normalized
      const token = connectionParams.Authorization
      const user = getUserFromToken(token)

      if (!user) throw new Error("Unauthenticated");

      return {user}
    }
  }
})

server.listen(4000).then(({url}) => {
  console.log(`🚀 Server ready at ${url}`)
})
