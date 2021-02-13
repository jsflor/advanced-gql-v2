const { gql,ApolloServer, PubSub, AuthenticationError, UserInputError, SchemaDirectiveVisitor } = require("apollo-server");
const {defaultFieldResolver, GraphQLString} = require('graphql');

const pubSub = new PubSub();
const NEW_ITEM = 'NEW_ITEM';

class LogDirective extends SchemaDirectiveVisitor {
  visitFieldDefinition(field, type) {
    const resolver = field.resolve || defaultFieldResolver;
    //const {message} = this.args;

    // pass up arguments to the directives
    field.args.push({
      type: GraphQLString,
      name: 'message'
    });

    field.resolve = (root, {message, ...rest}, ctx, info) => {
      const {message: schemaMessage} = this.args;
      console.log('hi!!!', message || schemaMessage);
      return resolver.call(this, root, rest, ctx, info);
    }
  }
}

const typeDefs = gql`
  directive @log(message: String = "my msg") on FIELD_DEFINITION

  type User {
    id: ID! @log
    username: String! @log(message: "username here")
    error: String! @deprecated(reason: "Use this other field")
    createdAt: String!
  }

  type Settings {
    user: User!
    theme: String!
  }

  type Item {
    task: String!
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
    createItem(task: String!): Item!
  }

  type Subscription {
    newItem: Item
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
    createItem(_, {task}) {
      const item = {task};
      pubSub.publish(NEW_ITEM, {newItem: item});
      return item;
    }
  },

  Subscription: {
    newItem: {
      subscribe: () => pubSub.asyncIterator(NEW_ITEM)
    }
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

  User: {
    error() {
      return 'aasasd';
    },
    id() {
      return '234234234';
    },
    username() {
      return 'sebastian'
    }
  }

};

const server = new ApolloServer({
  typeDefs,
  resolvers,
  schemaDirectives: {
    log: LogDirective
  },
  formatError(e) {
    console.log(e);
    return e;
  },
  context({connection}) {
    if (connection) {
      return {...connection.context};
    }
  },
  subscriptions: {
    onConnect(params) {
      
    }
  }
});

server.listen().then(({ url }) => console.log(url));
