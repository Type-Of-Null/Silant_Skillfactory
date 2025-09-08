import Header from "./components/Header";
import Main from "./components/Main.jsx";
import Footer from "./components/Footer";
import { BrowserRouter, Routes, Route } from "react-router-dom";

const routes = [
  { path: "/", element: <Main /> },
  // { path: "/auth", element: <Auth /> },
  // { path: "*", element: <Error /> },
	// {path: "/search", element: <Search/>},
	// {path: "/result", element: <Result/>},
];

export default function App() {
  return (
    <div className="flex min-h-screen min-w-[320px] flex-col bg-[#EBE6D6]">
      <BrowserRouter>
        <Header />
        <div className="flex-grow flex flex-col max-md:justify-center max-md:items-center">
          <Routes>
            {routes.map((route, index) => (
              <Route key={index} path={route.path} element={route.element} />
            ))}
          </Routes>
        </div>
        <Footer />
      </BrowserRouter>
    </div>
  );
}
