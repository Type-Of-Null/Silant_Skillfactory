import Header from "./components/Header";
import MainNotAuth from "./components/MainNotAuth.jsx";
import MainAuth from "./components/MainAuth";
import Footer from "./components/Footer";
import { Routes, Route } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';

const App = () => {
  const { user } = useAuth();
  return (
    <div className="flex min-h-screen min-w-[320px] flex-col bg-[#EBE6D6]">
      <Header />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={user ? <MainAuth /> : <MainNotAuth />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

export default App;
