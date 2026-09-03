import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import App from "./App.jsx";
import "./styles/globals.css";
import "leaflet/dist/leaflet.css";

const queryClient = new QueryClient({
   defaultOptions: {
      queries: {
         staleTime: 1000 * 60 * 5, // 5 minutes
         cacheTime: 1000 * 60 * 30, // 30 minutes
         retry: 1,
         refetchOnWindowFocus: false,
      },
   },
});

createRoot(document.getElementById("root")).render(
   <QueryClientProvider client={queryClient}>
      <BrowserRouter>
         <App />
      </BrowserRouter>
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
   </QueryClientProvider>
);
