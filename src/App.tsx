import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store/store';
import { ThemeProvider } from './context/ThemeContext';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import HomePage from './pages/HomePage/HomePage';
import ViewPage from './pages/ViewPage/ViewPage';
import FilesPage from './pages/FilesPage/FilesPage';

export default function App() {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <BrowserRouter>
          <Header />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/files" element={<FilesPage />} />
            <Route path="/files/:id" element={<ViewPage />} />
            {/* Обратная совместимость */}
            <Route path="/projects" element={<Navigate to="/files" replace />} />
            <Route path="/projects/:id" element={<Navigate to="/files" replace />} />
          </Routes>
          <Footer />
        </BrowserRouter>
      </ThemeProvider>
    </Provider>
  );
}
