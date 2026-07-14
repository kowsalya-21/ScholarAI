import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import ErrorBoundary from './components/ErrorBoundary';
import { ThemeProvider } from './context/ThemeContext';
import CustomToaster from './components/CustomToaster';

function AppContent() {
  return (
    <>
      {/* Toast Notification Container */}
      <CustomToaster />
      
      {/* Central Routing Mapping */}
      <ErrorBoundary>
        <AppRoutes />
      </ErrorBoundary>
    </>
  );
}

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
