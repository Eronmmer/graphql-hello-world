const { ApolloServer, gql } = require("apollo-server");

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
`;

const resolvers = {
	Query: {
		hello: () => "hello world",
	},
	Mutation: {
		register: (parent, args, context, info) => {
			console.log(context);
			return {
				// args above is how to use an argument in a resolver
				// The args argument is an object that contains all GraphQL arguments that were provided for the field by the GraphQL operation.

				user: {
					id: 23,
					username: args.userInfo.username,
				},
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
		}
	},
};

const server = new ApolloServer({
	typeDefs,
	resolvers,
	context: ({ req, res }) => ({
		req,
		res,
	}),
});

server.listen().then(({ url }) => console.log(`Server started at ${url}`));
