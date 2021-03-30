const { ApolloServer, gql, PubSub } = require("apollo-server");

const typeDefs = gql`
	type Query {
		hello: String!
	}

	type User {
		id: ID!
		username: String!
	}

	type Error {
		message: String!
		field: String!
	}

	type RegisterResponse {
		user: User
		errors: [Error]
	}

	input UserInfo {
		username: String!
		password: String!
		age: Int
	}

	type Mutation {
		register(userInfo: UserInfo): RegisterResponse
	}

	type Subscription {
		newUser: User!
	}
`;

const NEW_USER = "NEW_USER";

const resolvers = {
	Subscription: {
		newUser: {
			subscribe: (parent, _, { pubsub }) => pubsub.asyncIterator(NEW_USER),
		},
	},
	Query: {
		hello: () => "hello world",
	},
	Mutation: {
		register: (_, args, { pubsub }) => {
			// args above is how to use an argument in a resolver
			const user = {
				id: 23,
				username: args.userInfo.username,
			};
			// The args argument is an object that contains all GraphQL arguments that were provided for the field by the GraphQL operation.

			pubsub.publish(NEW_USER, {
				newUser: user,
			});
			// which the above, the newuser subscription is called each time a user registers
			return {
				user,
				errors: [
					{
						message: "Name is required",
						field: "name",
					},
					{
						message: "Username is already taken",
						field: "username",
					},
				],
			};
		},
	},
};

const pubsub = new PubSub(); // this can be used to trigger & publish events

const server = new ApolloServer({
	typeDefs,
	resolvers,
	context: ({ req, res }) => ({
		req,
		res,
		pubsub,
	}),
});

server.listen().then(({ url }) => console.log(`Server started at ${url}`));
