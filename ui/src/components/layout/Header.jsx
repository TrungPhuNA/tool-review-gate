import { Search, Bell, UserCircle, Settings } from 'lucide-react';

function Header() {
  return (
    <header className="h-20 bg-surface/80 backdrop-blur-md border-b border-line px-8 flex items-center justify-between sticky top-0 z-50">
      <div className="relative w-96">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted">
          <Search size={18} />
        </span>
        <input 
          type="text" 
          placeholder="Search for repositories, commits..." 
          className="w-full bg-surfaceSoft border border-line rounded-xl py-2.5 pl-11 pr-4 text-sm focus:outline-none focus:border-electric/30 transition-colors"
        />
      </div>

      <div className="flex items-center gap-6">
        <button className="relative text-muted hover:text-ink transition-colors">
          <Bell size={22} />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-accent text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-surface">
            3
          </span>
        </button>
        
        <div className="w-px h-6 bg-line" />

        <div className="flex items-center gap-3 pl-2">
          <div className="text-right">
            <p className="type-label leading-none">TrungPhuNA</p>
            <p className="type-caption text-electric font-bold">Admin</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-softBlue flex items-center justify-center text-electric">
            <UserCircle size={28} />
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
