import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";

import { RouterProvider } from "react-router-dom";
import Routes from "./routers/Routes";
import Authprovider from "./context/AuthProvider";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Authprovider>
      <RouterProvider
        router={Routes}
        fallbackElement={<div>Loading...</div>}
      ></RouterProvider>
    </Authprovider>
  </StrictMode>
);
