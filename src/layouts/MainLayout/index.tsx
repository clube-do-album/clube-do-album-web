import { Activity, BarChart3, ChevronRight, Home, LogOut, Menu, Search, UsersRound, UserRound, X } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import albumDiscLogo from '../../assets/clubepng.png';
import type { ChildrenProps, Session } from '../../types';

type MainLayoutProps = ChildrenProps & {
  session: Session;
  status: string;
  onLogout: () => void;
  onLoadProfile: () => void;
  onDismissStatus: () => void;
};

export function MainLayout({ session, status, children, onLogout, onLoadProfile, onDismissStatus }: MainLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  function closeMenu() {
    setIsMenuOpen(false);
  }

  return (
    <main className="app-shell">
      <aside className={`sidebar-drawer ${isMenuOpen ? 'open' : ''}`} aria-hidden={!isMenuOpen}>
        <div className="drawer-header">
          <button
            className="drawer-brand"
            onClick={() => {
              navigate('/');
              closeMenu();
            }}
          >
            <img className="brand-disc" src={albumDiscLogo} alt="" aria-hidden="true" />
            Clube do Album
          </button>
          <button className="drawer-close" onClick={closeMenu} aria-label="Fechar menu">
            <X size={18} />
          </button>
        </div>
        <nav>
          <RouteButton to="/" end icon={<Home size={18} />} label="Inicio" onClick={closeMenu} />
          <RouteButton to="/ranking" icon={<BarChart3 size={18} />} label="Ranking" onClick={closeMenu} />
          <RouteButton to="/feed" icon={<Activity size={18} />} label="Feed" onClick={closeMenu} />
          <RouteButton to="/people" icon={<UsersRound size={18} />} label="Pessoas" onClick={closeMenu} />
          <RouteButton
            to="/profile"
            icon={<UserRound size={18} />}
            label="Perfil"
            onClick={() => {
              onLoadProfile();
              closeMenu();
            }}
          />
        </nav>
        <div className="drawer-divider" />
        <nav>
          <RouteButton to="/" end icon={<Search size={18} />} label="Explorar albuns" onClick={closeMenu} />
        </nav>
        <div className="drawer-divider" />
        <div className="drawer-user">
          <UserRound size={18} />
          <strong>{session.user.name}</strong>
          <small>{session.user.email}</small>
        </div>
        <button className="nav-button muted" onClick={onLogout}>
          <LogOut size={18} />
          Sair
        </button>
      </aside>

      <section className="main-area">
        <header className="topbar">
          <div className="topbar-left">
            <button className="menu-trigger" onClick={() => setIsMenuOpen(true)} aria-label="Abrir menu">
              <Menu size={20} />
            </button>
            <button className="topbar-brand" onClick={() => navigate('/')}>
              <img className="brand-disc" src={albumDiscLogo} alt="" aria-hidden="true" />
              <strong>Clube do Album</strong>
            </button>
            <nav className="topbar-nav" aria-label="Navegacao principal">
              <TopbarLink to="/ranking" label="Ranking" />
              <TopbarLink to="/feed" label="Feed" />
              <TopbarLink to="/people" label="Pessoas" />
              <TopbarLink to="/profile" label="Perfil" onClick={onLoadProfile} />
            </nav>
          </div>
          <div className="topbar-actions">
            <span className="page-kicker">{routeTitle(location.pathname)}</span>
            <button className="avatar-button" onClick={() => navigate('/profile')}>
              <UserRound size={15} />
              {session.user.name}
              <ChevronRight size={14} />
            </button>
          </div>
        </header>

        {children}
      </section>

      {status && (
        <div className="toast-message" role="status">
          <span>{status}</span>
          <button className="toast-close" onClick={onDismissStatus} aria-label="Fechar mensagem">
            <X size={16} />
          </button>
        </div>
      )}
    </main>
  );
}

function TopbarLink({ to, label, onClick }: { to: string; label: string; onClick?: () => void }) {
  return (
    <NavLink className={({ isActive }) => `topbar-link ${isActive ? 'active' : ''}`} to={to} onClick={onClick}>
      {label}
    </NavLink>
  );
}

function RouteButton({
  to,
  end,
  icon,
  label,
  onClick,
}: {
  to: string;
  end?: boolean;
  icon: ReactNode;
  label: string;
  onClick?: () => void;
}) {
  return (
    <NavLink className={({ isActive }) => `nav-button ${isActive ? 'active' : ''}`} to={to} end={end} onClick={onClick}>
      {icon}
      {label}
    </NavLink>
  );
}

function routeTitle(pathname: string) {
  if (pathname.startsWith('/album')) {
    return 'Album';
  }

  if (pathname.startsWith('/profile/edit')) {
    return 'Editar perfil';
  }

  if (pathname.startsWith('/profile')) {
    return 'Perfil';
  }

  if (pathname.startsWith('/people')) {
    return 'Pessoas';
  }

  if (pathname.startsWith('/ranking')) {
    return 'Ranking';
  }

  if (pathname.startsWith('/feed')) {
    return 'Feed';
  }

  return 'Inicio';
}
