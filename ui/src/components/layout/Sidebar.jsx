import { LayoutDashboard, FolderCode, History, Settings, ShieldCheck } from 'lucide-react';

const MENU_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'projects', label: 'Projects', icon: FolderCode },
  { id: 'history', label: 'Review History', icon: History },
  { id: 'rules', label: 'Global Rules', icon: ShieldCheck },
  { id: 'settings', label: 'Settings', icon: Settings },
];

function Sidebar() {
  return (
    <aside className="w-64 h-screen bg-surface border-r border-line flex flex-col sticky top-0">
      <div className="p-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-electric rounded-xl flex items-center justify-center text-white shadow-lg shadow-electric/20">
            <ShieldCheck size={24} />
          </div>
          <div>
            <h1 className="font-black text-lg leading-none">ReviewGate</h1>
            <span className="type-caption text-[10px] uppercase tracking-wider font-bold opacity-50">Enterprise</span>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {MENU_ITEMS.map((item) => (
          <button
            key={item.id}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${
              item.id === 'dashboard' 
                ? 'bg-softBlue text-electric' 
                : 'text-muted hover:bg-surfaceSoft hover:text-ink'
            }`}
          >
            <item.icon size={20} className={item.id === 'dashboard' ? 'text-electric' : 'group-hover:scale-110 transition-transform'} />
            <span className="type-label">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 mt-auto">
        <div className="bg-softMint p-4 rounded-2xl border border-line/10">
          <p className="type-caption font-bold text-emerald-700 mb-1">System Health</p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-semibold text-emerald-600">All workers online</span>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
