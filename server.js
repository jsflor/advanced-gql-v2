const { gql, ApolloServer } = require("apollo-server");

const typeDefs = gql`
  type User {
    id: ID!
    username: String!
    createdAt: Int!
  }

  type Settings {
    user: User!
    theme: String!
  }

  input NewSettingsInput {
    user: ID!
    theme: String!
  }

  type Query {
    me: User!
    settings(user: ID!): Settings!
  }

  type Mutation {
    settings(input: NewSettingsInput): Settings!
  }
`;

const resolvers = {
  Query: {
    me() {
      return {
        id: "qfe76dqwe76d",
        username: "Sebastian",
        createdAt: 24234234,
      };
    },
    settings(_, { user }) {
      return {
        user,
        theme: "Light",
      };
    },
  },
  Mutation: {
    settings(_, { input }) {
      return input;
    },
  },
  Settings: {
    user(settings) {
      return {
        id: "qfe76dqwe76d",
        username: "Sebastian",
        createdAt: 24234234,
      };
    },
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

server.listen().then(({ url }) => console.log(url));
