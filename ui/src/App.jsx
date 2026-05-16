import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import Dashboard from './pages/Dashboard';

/**
 * App: Entry point chính của giao diện ReviewGate
 * Cấu trúc Layout gồm Sidebar cố định và vùng Main Content có Header
 */
function App() {
  return (
    <div className="flex bg-paper min-h-screen selection:bg-softBlue selection:text-electric">
      {/* Sidebar - Cố định bên trái */}
      <Sidebar />

      {/* Main Content - Bên phải */}
      <main className="flex-1 flex flex-col min-w-0">
        <Header />
        
        {/* Scrollable Area */}
        <div className="flex-1 overflow-y-auto">
          <Dashboard />
        </div>

        {/* Footer nhỏ nhẹ nhàng */}
        <footer className="p-6 text-center border-t border-line/30 bg-surfaceSoft/30">
          <p className="type-caption font-semibold">
            © 2026 ReviewGate Enterprise. Built with Love & React.
          </p>
        </footer>
      </main>
    </div>
  );
}

export default App;
