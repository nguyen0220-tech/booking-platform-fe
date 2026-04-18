import { ApolloClient, InMemoryCache, HttpLink, from } from "@apollo/client";
import { onError } from "@apollo/client/link/error";

const httpLink = new HttpLink({
  uri: import.meta.env.VITE_API_URL + "/graphql",
  credentials: "include",
});

const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    for (let err of graphQLErrors) {
      if (err.extensions?.classification === "FORBIDDEN") {
        console.warn("Session expired. Redirecting to login...");

        localStorage.clear();
        sessionStorage.clear();

        window.location.replace("/?session=expired");
        return;
      }
    }
  }

  if (networkError) {
    console.error(`[Network error]: ${networkError}`);
  }
});

const client = new ApolloClient({
  link: from([errorLink, httpLink]), // errorLink phải đứng trước
  cache: new InMemoryCache(),
});

export default client;
