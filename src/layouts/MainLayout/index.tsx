import { Activity, BarChart3, Bell, CheckCheck, ChevronRight, Home, LogOut, Menu, Search, UsersRound, UserRound, X } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import albumDiscLogo from '../../assets/clubepng.png';
import type { ChildrenProps, NotificationItem, Session } from '../../types';

type MainLayoutProps = ChildrenProps & {
  session: Session;
  status: string;
  notifications: NotificationItem[];
  unreadNotifications: number;
  onLogout: () => void;
  onDismissStatus: () => void;
  onRefreshNotifications: () => void;
  onReadNotification: (notification: NotificationItem) => void;
  onReadAllNotifications: () => void;
};

export function MainLayout({
  session,
  status,
  notifications,
  unreadNotifications,
  children,
  onLogout,
  onDismissStatus,
  onRefreshNotifications,
  onReadNotification,
  onReadAllNotifications,
}: MainLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isHeaderNotificationsOpen, setIsHeaderNotificationsOpen] = useState(false);
  const [isDrawerNotificationsOpen, setIsDrawerNotificationsOpen] = useState(false);

  function closeMenu() {
    setIsMenuOpen(false);
    setIsDrawerNotificationsOpen(false);
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
            Clube do Álbum
          </button>
          <button className="drawer-close" onClick={closeMenu} aria-label="Fechar menu">
            <X size={18} />
          </button>
        </div>
        <nav>
          <RouteButton to="/" end icon={<Home size={18} />} label="Início" onClick={closeMenu} />
          <RouteButton to="/ranking" icon={<BarChart3 size={18} />} label="Ranking" onClick={closeMenu} />
          <RouteButton to="/feed" icon={<Activity size={18} />} label="Feed" onClick={closeMenu} />
          <RouteButton to="/people" icon={<UsersRound size={18} />} label="Pessoas" onClick={closeMenu} />
          <RouteButton
            to="/profile"
            icon={<UserRound size={18} />}
            label="Perfil"
            onClick={() => {
              closeMenu();
            }}
          />
        </nav>
        <button
          className={`nav-button drawer-notification-button ${isDrawerNotificationsOpen ? 'active' : ''}`}
          onClick={() => {
            setIsDrawerNotificationsOpen((current) => !current);
            setIsHeaderNotificationsOpen(false);
            onRefreshNotifications();
          }}
        >
          <Bell size={18} />
          <span>Notificações</span>
          {unreadNotifications > 0 && (
            <strong className="notification-count">{unreadNotifications > 9 ? '9+' : unreadNotifications}</strong>
          )}
        </button>
        {isDrawerNotificationsOpen && (
          <NotificationPanel
            variant="drawer"
            notifications={notifications}
            unreadNotifications={unreadNotifications}
            onReadAllNotifications={onReadAllNotifications}
            onReadNotification={(notification) => {
              onReadNotification(notification);
              setIsDrawerNotificationsOpen(false);
              closeMenu();
            }}
          />
        )}
        <div className="drawer-divider" />
        <nav>
          <RouteButton to="/" end icon={<Search size={18} />} label="Explorar álbuns" onClick={closeMenu} />
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
              <strong>Clube do Álbum</strong>
            </button>
            <nav className="topbar-nav" aria-label="Navegação principal">
              <TopbarLink to="/ranking" label="Ranking" />
              <TopbarLink to="/feed" label="Feed" />
              <TopbarLink to="/people" label="Pessoas" />
              <TopbarLink to="/profile" label="Perfil" />
            </nav>
          </div>
          <div className="topbar-actions">
            <span className="page-kicker">{routeTitle(location.pathname)}</span>
            <div className="notification-menu">
              <button
                className="notification-trigger"
                onClick={() => {
                  setIsHeaderNotificationsOpen((current) => !current);
                  setIsDrawerNotificationsOpen(false);
                  onRefreshNotifications();
                }}
                aria-label="Abrir notificações"
              >
                <Bell size={17} />
                {unreadNotifications > 0 && <span>{unreadNotifications > 9 ? '9+' : unreadNotifications}</span>}
              </button>
              {isHeaderNotificationsOpen && (
                <NotificationPanel
                  notifications={notifications}
                  unreadNotifications={unreadNotifications}
                  onReadAllNotifications={onReadAllNotifications}
                  onReadNotification={(notification) => {
                    onReadNotification(notification);
                    setIsHeaderNotificationsOpen(false);
                  }}
                />
              )}
            </div>
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

function NotificationPanel({
  variant = 'popover',
  notifications,
  unreadNotifications,
  onReadNotification,
  onReadAllNotifications,
}: {
  variant?: 'popover' | 'drawer';
  notifications: NotificationItem[];
  unreadNotifications: number;
  onReadNotification: (notification: NotificationItem) => void;
  onReadAllNotifications: () => void;
}) {
  return (
    <section className={`notification-popover notification-popover-${variant}`}>
      <div className="notification-popover-header">
        <strong>Notificações</strong>
        <button onClick={onReadAllNotifications} disabled={unreadNotifications === 0}>
          <CheckCheck size={14} />
          Ler todas
        </button>
      </div>
      <div className="notification-list">
        {notifications.length > 0 ? notifications.map((notification) => (
          <button
            className={`notification-item ${notification.readAt ? '' : 'unread'}`}
            key={notification.id}
            onClick={() => onReadNotification(notification)}
          >
            <strong>{cleanNotificationText(notification.title)}</strong>
            <span>{cleanNotificationText(notification.message)}</span>
            <small>{formatNotificationDate(notification.createdAt ?? notification.occurredAt)}</small>
          </button>
        )) : (
          <p className="notification-empty">Nenhuma notificação por enquanto.</p>
        )}
      </div>
    </section>
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
    return 'Álbum';
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

  return 'Início';
}

function formatNotificationDate(value?: string) {
  if (!value) {
    return 'agora';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'agora';
  }

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

function cleanNotificationText(value: string) {
  const withoutUuid = value.replace(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi, 'item');

  return withoutUuid.replace(/[0-9a-f]{8}\.\.\./gi, 'item');
}
