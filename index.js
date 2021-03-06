const { ApolloGateway,RemoteGraphQLDataSource  } = require("@apollo/gateway");
const { ApolloServer } = require("apollo-server-express");
const { ApolloServerPluginLandingPageGraphQLPlayground } = require('apollo-server-core');
const express = require("express");
const expressJwt = require("express-jwt");

async function createApolloGateway() {
    const port = 4000;
    const app = express();
    app.use(
        expressJwt({
          secret: "f1BtnWgD3VKY",
          algorithms: ["HS256"],
          credentialsRequired: false
        })
      );

    const gateway = new ApolloGateway({
        serviceList: [{ name: "accounts", url: "http://localhost:4001" }],
        buildService({ name, url }) {
            return new RemoteGraphQLDataSource({
              url,
              willSendRequest({ request, context }) {
                request.http.headers.set(
                  "user",
                  context.user ? JSON.stringify(context.user) : null
                );
              }
            });
          }
    });

    const server = new ApolloServer({
        gateway,
        subscriptions: false,
        plugins: [ApolloServerPluginLandingPageGraphQLPlayground({
            // options
        })],
        context: ({ req }) => {
            const user = req.user || null;
            console.log(user)
            return { user };
          }
    });
    await server.start()

    server.applyMiddleware({ app });

    app.listen({ port }, () =>
        console.log(`Server ready at http://localhost:${port}${server.graphqlPath}`)
    );
    console.log("here")

    return {server,app}
}

createApolloGateway().then(({ server, app })=> console.log("done"))