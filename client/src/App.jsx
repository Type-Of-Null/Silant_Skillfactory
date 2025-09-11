import Header from "./components/Header";
import MainNotAuth from "./components/MainNotAuth.jsx";
import Footer from "./components/Footer";
import { Routes, Route } from 'react-router-dom';

const App = () => {
  return (
    <div className="flex min-h-screen min-w-[320px] flex-col bg-[#EBE6D6]">
      <Header />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<MainNotAuth />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

export default App;
