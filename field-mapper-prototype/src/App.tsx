import { useState } from 'react';
import { ApplicationShell, Menu, Tag, Button, CloseIcon } from '@tackle-io/design-system';
import { HomePage } from './pages/HomePage';
import { HomePageV2 } from './pages/HomePageV2';
import { HomePageV3 } from './pages/HomePageV3';

const ACCOUNTS = [
  { value: 'na', label: 'Hooli - North America' },
  { value: 'eu', label: 'Hooli - Europe' },
  { value: 'jp', label: 'Hooli - Japan' }
];

const EnvironmentAvatar = ({ initial = 'H' }: { initial?: string }) => (
  <div
    style={{
      width: '32px',
      height: '32px',
      backgroundColor: '#97A0AF',
      borderRadius: '4px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: '"Open Sans", sans-serif',
      fontSize: '20px',
      fontWeight: 600,
      lineHeight: '30px',
      color: '#FFFFFF'
    }}
  >
    {initial}
  </div>
);

const VERSIONS = [
  { id: 'v1', label: 'Version 1', caption: 'Offer-type first' },
  { id: 'v2', label: 'Version 2', caption: 'Listing-first' },
  { id: 'v3', label: 'Version 3', caption: '3-tab (Direct / Partner / Listing)' }
];

export default function App() {
  const [collapsed, setCollapsed] = useState(false);
  const [activeAccount, setActiveAccount] = useState('na');
  const [accountPickerOpen, setAccountPickerOpen] = useState(false);
  const [version, setVersion] = useState('v3');
  // Prototype-only version switcher. Hidden by default (kept out of stakeholder view);
  // click the Tackle logo in the sidebar to reveal it, close icon to hide it again.
  const [showToolbar, setShowToolbar] = useState(false);

  const activeAccountLabel =
    ACCOUNTS.find((acct) => acct.value === activeAccount)?.label || ACCOUNTS[0].label;

  return (
    <>
      <ApplicationShell
        activeItemId="settings"
        collapsed={collapsed}
        onToggle={() => setCollapsed(!collapsed)}
        accountName={activeAccountLabel}
        accountLabel="Switch accounts"
        onAccountClick={() => setAccountPickerOpen((open) => !open)}
        environmentName="Hooli production"
        environmentLabel="Switch environments"
        environmentAvatar={<EnvironmentAvatar />}
        environmentBadge={<Tag color="green">Production</Tag>}
        environmentCollapsedContent={<Tag color="green">Prod</Tag>}
        userName="User Name"
        userEmail="username@mail.com"
      >
        {/* Prototype version switcher toolbar — hidden from stakeholders by default.
            Toggle via the Tackle logo overlay (see below). */}
        {showToolbar && (
          <div
            style={{
              position: 'sticky',
              top: 0,
              zIndex: 30,
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              padding: '10px 32px',
              backgroundColor: 'var(--color-neutral-0)',
              borderBottom: '1px solid var(--color-neutral-20)',
              boxShadow: 'var(--elevation-100)'
            }}
          >
            <span
              style={{
                fontFamily: 'var(--font-family-primary)',
                fontSize: '13px',
                fontWeight: 700,
                color: 'var(--color-neutral-90)'
              }}
            >
              Field mapper prototype
            </span>
            <div style={{ display: 'flex', gap: '8px' }}>
              {VERSIONS.map((v) => (
                <Button
                  key={v.id}
                  variant={version === v.id ? 'primary' : 'secondary'}
                  size="small"
                  onClick={() => setVersion(v.id)}
                >
                  {v.label}
                </Button>
              ))}
            </div>
            <span
              style={{
                fontFamily: 'var(--font-family-primary)',
                fontSize: '12px',
                color: 'var(--color-neutral-70)'
              }}
            >
              {VERSIONS.find((v) => v.id === version)?.caption}
            </span>
            <button
              type="button"
              aria-label="Hide prototype version switcher"
              title="Hide"
              onClick={() => setShowToolbar(false)}
              style={{
                marginLeft: 'auto',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '28px',
                height: '28px',
                border: 'none',
                borderRadius: 'var(--border-radius-base)',
                background: 'transparent',
                color: 'var(--color-neutral-70)',
                cursor: 'pointer'
              }}
            >
              <CloseIcon size="small" />
            </button>
          </div>
        )}

        {version === 'v1' ? <HomePage /> : version === 'v2' ? <HomePageV2 /> : <HomePageV3 />}
      </ApplicationShell>

      {/* Invisible hotspot over the sidebar Tackle logo — click to toggle the
          prototype version switcher (kept hidden from stakeholders by default). */}
      <div
        role="button"
        aria-label="Toggle prototype version switcher"
        title="Toggle prototype version switcher"
        onClick={() => setShowToolbar((open) => !open)}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: collapsed ? '56px' : '150px',
          height: '48px',
          zIndex: 60,
          cursor: 'pointer'
        }}
      />

      {/* Account picker popover, anchored to the sidebar account footer */}
      {accountPickerOpen && (
        <>
          <div
            onClick={() => setAccountPickerOpen(false)}
            style={{ position: 'fixed', inset: 0, zIndex: 40 }}
          />
          <div
            style={{
              position: 'fixed',
              left: collapsed ? '72px' : '16px',
              bottom: '224px',
              zIndex: 50,
              width: 224,
              borderRadius: '4px',
              backgroundColor: 'var(--color-neutral-0)',
              boxShadow: 'var(--elevation-400)'
            }}
          >
            <Menu
              aria-label="Switch accounts"
              density="action"
              width={224}
              items={ACCOUNTS}
              selectedValue={activeAccount}
              onSelect={(value) => {
                setActiveAccount(value);
                setAccountPickerOpen(false);
              }}
            />
          </div>
        </>
      )}
    </>
  );
}
