import { lazy, Suspense, useEffect, useState, useCallback } from 'react';
import { AuthProvider, useAuth } from '@/lib/auth/AuthContext';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { SplashScreen } from '@/screens/SplashScreen';
import { AuthScreen } from '@/screens/AuthScreen';
import { HomeScreen } from '@/screens/HomeScreen';
import { BottomNav, type TabKey } from '@/components/ui/BottomNav';
import { GlobalSearch } from '@/components/ui/GlobalSearch';

// Lazy-load screens that aren't needed on initial render
const OxScreen = lazy(() => import('@/screens/OxScreen').then((m) => ({ default: m.OxScreen })));
const CreateScreen = lazy(() => import('@/screens/CreateScreen').then((m) => ({ default: m.CreateScreen })));
const AlertsScreen = lazy(() => import('@/screens/AlertsScreen').then((m) => ({ default: m.AlertsScreen })));
const ProfileScreen = lazy(() => import('@/screens/ProfileScreen').then((m) => ({ default: m.ProfileScreen })));
const NewsScreen = lazy(() => import('@/screens/NewsScreen').then((m) => ({ default: m.NewsScreen })));
const CreatorsScreen = lazy(() => import('@/screens/CreatorsScreen').then((m) => ({ default: m.CreatorsScreen })));
const SettingsScreen = lazy(() => import('@/screens/SettingsScreen').then((m) => ({ default: m.SettingsScreen })));
const VaultScreen = lazy(() => import('@/screens/VaultScreen').then((m) => ({ default: m.VaultScreen })));

type SubScreen = 'news' | 'creators' | 'settings' | 'vault' | null;

function ScreenLoader() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="h-7 w-7 animate-spin rounded-full border-2 border-ox-gold/30 border-t-ox-gold" />
    </div>
  );
}

function AppShell() {
  const { user, loading } = useAuth();
  const [booting, setBooting] = useState(true);
  const [tab, setTab] = useState<TabKey>('home');
  const [subScreen, setSubScreen] = useState<SubScreen>(null);
  const [exiting, setExiting] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const navigateToSub = useCallback((sub: SubScreen) => {
    setSubScreen(sub);
  }, []);

  const goBack = useCallback(() => {
    setExiting(true);
    setTimeout(() => {
      setSubScreen(null);
      setExiting(false);
    }, 200);
  }, []);

  const handleTabChange = useCallback((next: TabKey) => {
    setSubScreen(null);
    setTab(next);
  }, []);

  const handleSearchNavigate = useCallback((category: string) => {
    if (category === 'Vault') navigateToSub('vault');
    else if (category === 'Dashboard') setTab('home');
    else if (category === 'Chats') setTab('ox');
  }, [navigateToSub]);

  useEffect(() => {
    if (subScreen) setExiting(false);
  }, [subScreen]);

  const showSub = subScreen !== null;

  if (booting) {
    return <SplashScreen onDone={() => setBooting(false)} />;
  }

  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-ox-black">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-ox-gold/30 border-t-ox-gold" />
          <p className="text-[12px] tracking-[0.2em] text-white/30">LOADING</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthScreen />;
  }

  return (
    <div className="relative flex h-full w-full justify-center bg-black">
      <div className="relative h-full w-full max-w-[440px] overflow-hidden bg-ox-black sm:my-4 sm:h-[calc(100%-2rem)] sm:rounded-[44px] sm:border sm:border-white/10 sm:shadow-float">
        <div
          className="pointer-events-none absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full opacity-60 blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(212,175,55,0.18) 0%, rgba(212,175,55,0) 70%)' }}
        />

        {/* Main tab content */}
        <div
          className={[
            'relative h-full transition-all duration-300',
            showSub ? 'opacity-0 scale-[0.98] pointer-events-none' : 'opacity-100 scale-100',
          ].join(' ')}
        >
          <div key={tab} className="page-enter h-full">
            <ErrorBoundary>
              {tab === 'home' && (
                <HomeScreen
                  onOpenAlerts={() => setTab('alerts')}
                  onOpenOx={() => setTab('ox')}
                  onOpenNews={() => navigateToSub('news')}
                  onOpenCreators={() => navigateToSub('creators')}
                  onOpenProfile={() => setTab('profile')}
                  onOpenVault={() => navigateToSub('vault')}
                  onOpenSearch={() => setSearchOpen(true)}
                />
              )}
              {tab === 'ox' && (
                <Suspense fallback={<ScreenLoader />}>
                  <OxScreen />
                </Suspense>
              )}
              {tab === 'create' && (
                <Suspense fallback={<ScreenLoader />}>
                  <CreateScreen />
                </Suspense>
              )}
              {tab === 'alerts' && (
                <Suspense fallback={<ScreenLoader />}>
                  <AlertsScreen />
                </Suspense>
              )}
              {tab === 'profile' && (
                <Suspense fallback={<ScreenLoader />}>
                  <ProfileScreen
                    onOpenSettings={() => navigateToSub('settings')}
                    onOpenVault={() => navigateToSub('vault')}
                  />
                </Suspense>
              )}
            </ErrorBoundary>
          </div>
        </div>

        {/* Sub-screen overlay */}
        {showSub && (
          <div
            className={[
              'absolute inset-0 z-40 bg-ox-black',
              exiting ? 'page-exit' : 'page-enter',
            ].join(' ')}
          >
            <ErrorBoundary>
              <Suspense fallback={<ScreenLoader />}>
                {subScreen === 'news' && <NewsScreen onBack={goBack} />}
                {subScreen === 'creators' && <CreatorsScreen onBack={goBack} />}
                {subScreen === 'settings' && <SettingsScreen onBack={goBack} />}
                {subScreen === 'vault' && <VaultScreen onBack={goBack} />}
              </Suspense>
            </ErrorBoundary>
          </div>
        )}

        {/* Global search */}
        <GlobalSearch open={searchOpen} onClose={() => setSearchOpen(false)} onNavigate={handleSearchNavigate} />

        {/* Bottom navigation */}
        <BottomNav active={tab} onChange={handleTabChange} />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  );
}
