import { createBrowserRouter } from "react-router";
import App from "../../../App";
import Home from "../../home/page/Home";
export const router = createBrowserRouter([
  {
    index: true,
    element: <Home />,
  },
]);
