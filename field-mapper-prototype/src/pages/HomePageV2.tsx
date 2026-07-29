import { useState } from 'react';
import type { CSSProperties } from 'react';
import {
  Button,
  Alert,
  Banner,
  Tag,
  Tabs,
  ComboBox,
  AWSIcon,
  CoSellIcon,
  OffersIcon,
  UserGroupIcon
} from '@tackle-io/design-system';
import {
  LISTINGS_BY_ACCOUNT,
  LISTING_FIELDS,
  SALESFORCE_FIELDS,
  SF,
  Row,
  Section,
  DefaultValueInput
} from './HomePage';

/* -------------------------------------------------------------------------- */
/* Version 2 — "Listing-first" architecture                                   */
/*                                                                            */
/* The primary axis is the LISTING (left rail). Shared mappings live once in  */
/* a "Shared base" that every listing inherits. Selecting a listing shows     */
/* only that listing's unique fields, plus inherited base fields that can be  */
/* overridden when needed. Offer type (Direct / Partner) is a secondary axis  */
/* handled inside the base.                                                    */
/* -------------------------------------------------------------------------- */

type FieldDef = { key: string; label: string; type: string };

// Shared base fields — mapped ONCE, inherited by every listing.
const BASE_BUYER_OFFER: FieldDef[] = [
  { key: 'aws_account_id', label: 'AWS Account ID', type: 'Text' },
  { key: 'company_name', label: 'Company name', type: 'Text' },
  { key: 'contact_fullname', label: 'Full name', type: 'Text' },
  { key: 'contact_email', label: 'Email', type: 'Text' },
  { key: 'contact_title', label: 'Title', type: 'Text' },
  { key: 'offer_name', label: 'Offer name', type: 'Text' },
  { key: 'offer_description', label: 'Offer description', type: 'Text' },
  { key: 'renewal', label: 'Renewal', type: 'Picklist' },
  { key: 'renewal_type', label: 'Renewal type', type: 'Picklist' },
  { key: 'deadline', label: 'Offer acceptance deadline', type: 'Text' }
];

const BASE_PRODUCT: FieldDef[] = [
  { key: 'listing', label: 'Listing', type: 'Picklist' },
  { key: 'payment_model', label: 'Payment model', type: 'Picklist' },
  { key: 'contract_start', label: 'Contract start', type: 'Picklist' },
  { key: 'currency', label: 'Currency', type: 'Picklist' }
];

const BASE_AGREEMENTS: FieldDef[] = [
  { key: 'eula_version', label: 'EULA version', type: 'Picklist' },
  { key: 'marketplace_fee', label: 'Marketplace fee', type: 'Text' }
];

// Partner-only base additions (the delta we identified in the gap analysis).
const PARTNER_FIELDS: FieldDef[] = [
  { key: 'partner_name', label: 'Partner name', type: 'Text' },
  { key: 'partner_aws_account', label: 'Partner AWS account number', type: 'Text' }
];

const PARTNER_AGREEMENTS: FieldDef[] = [
  { key: 'reseller_agreement_version', label: 'Reseller agreement version', type: 'Picklist' }
];

// A curated set of base fields we let a listing override, to demonstrate the
// "shared base + per-listing override" model.
const OVERRIDABLE_BASE: FieldDef[] = [
  { key: 'offer_name', label: 'Offer name', type: 'Text' },
  { key: 'offer_description', label: 'Offer description', type: 'Text' },
  { key: 'currency', label: 'Currency', type: 'Picklist' }
];

// Prefilled base mappings so the base looks configured out of the box.
const INITIAL_BASE_MAPPINGS: Record<string, string> = {
  aws_account_id: SF.awsId,
  company_name: SF.accountName,
  contact_fullname: SF.contactName,
  contact_email: SF.contactEmail,
  contact_title: SF.contactTitle,
  offer_name: SF.accountName,
  offer_description: SF.accountName,
  renewal: SF.expiration,
  renewal_type: SF.expiration,
  deadline: SF.expiration,
  listing: SF.accountName,
  payment_model: SF.startDate,
  contract_start: SF.startDate,
  currency: SF.awsId,
  eula_version: SF.expiration,
  marketplace_fee: SF.startDate
};

const OFFER_TYPE_TABS = [
  { id: 'direct', label: 'Direct offer' },
  { id: 'partner', label: 'Partner offer' }
];

const TACKLE_OBJECT_TABS = [
  { id: 'cosell', label: 'Co-Sell', icon: <CoSellIcon size="small" /> },
  { id: 'offers', label: 'Offers', icon: <OffersIcon size="small" /> }
];

const CARD: CSSProperties = {
  backgroundColor: 'var(--color-neutral-0)',
  borderRadius: 'var(--border-radius-base)',
  border: '1px solid var(--color-neutral-20)',
  overflow: 'hidden'
};

const shortName = (name: string) => name.replace(/\s*\(.*\)\s*$/, '');

export function HomePageV2() {
  const activeAccount = 'eu';
  const listings = LISTINGS_BY_ACCOUNT[activeAccount] || [];

  const [offerType, setOfferType] = useState('direct');
  // 'base' or a listing id
  const [selected, setSelected] = useState<string>('base');

  // Base mappings (shared across all listings)
  const [baseMappings, setBaseMappings] = useState<Record<string, string>>(INITIAL_BASE_MAPPINGS);

  // Per-listing unique-field mappings, keyed `${listingId}:${fieldKey}`
  const [listingMappings, setListingMappings] = useState<Record<string, string>>({});

  // Which base fields have been overridden for a listing, keyed `${listingId}:${fieldKey}`
  const [overrides, setOverrides] = useState<Record<string, boolean>>({});
  const [overrideMappings, setOverrideMappings] = useState<Record<string, string>>({});

  const [saveAlert, setSaveAlert] = useState<string | null>(null);

  const uniqueFieldCount = (listingId: string) => {
    const f = LISTING_FIELDS[listingId];
    if (!f) return 0;
    return f.registration.length + f.additional.length + f.usage.length;
  };

  const baseFieldCount =
    BASE_BUYER_OFFER.length +
    BASE_PRODUCT.length +
    BASE_AGREEMENTS.length +
    (offerType === 'partner' ? PARTNER_FIELDS.length + PARTNER_AGREEMENTS.length : 0);

  const handleSave = () => {
    if (selected === 'base') {
      setSaveAlert(
        `Saved the shared base mapping. These ${baseFieldCount} mappings are now inherited by all ${listings.length} listings.`
      );
    } else {
      const name = shortName(listings.find((l) => l.id === selected)?.name || 'this listing');
      setSaveAlert(`Saved listing-specific mappings for "${name}". Inherited base mappings are unchanged.`);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => setSaveAlert(null), 8000);
  };

  /* ----------------------------- Left rail ----------------------------- */

  const railItem = (opts: {
    id: string;
    title: string;
    subtitle: string;
    badge?: string;
    active: boolean;
    onClick: () => void;
  }) => (
    <button
      key={opts.id}
      onClick={opts.onClick}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '2px',
        width: '100%',
        textAlign: 'left',
        padding: '12px 16px',
        border: 'none',
        borderLeft: opts.active ? '3px solid #1fadad' : '3px solid transparent',
        backgroundColor: opts.active ? 'var(--color-neutral-10)' : 'transparent',
        cursor: 'pointer',
        fontFamily: 'var(--font-family-primary)'
      }}
    >
      <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
        <span
          style={{
            fontSize: '13px',
            fontWeight: opts.active ? 700 : 600,
            color: 'var(--color-neutral-100)'
          }}
        >
          {opts.title}
        </span>
        {opts.badge ? (
          <span
            style={{
              fontSize: '10px',
              fontWeight: 600,
              padding: '1px 6px',
              borderRadius: '10px',
              backgroundColor: 'var(--color-neutral-20)',
              color: 'var(--color-neutral-90)'
            }}
          >
            {opts.badge}
          </span>
        ) : null}
      </span>
      <span style={{ fontSize: '11px', color: 'var(--color-neutral-70)' }}>{opts.subtitle}</span>
    </button>
  );

  const leftRail = (
    <div
      style={{
        flex: '0 0 260px',
        borderRight: '1px solid var(--color-neutral-20)',
        backgroundColor: 'var(--color-neutral-0)',
        paddingBottom: '16px'
      }}
    >
      <div
        style={{
          padding: '16px 16px 8px 16px',
          fontSize: '11px',
          fontWeight: 700,
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
          color: 'var(--color-neutral-70)'
        }}
      >
        Configure
      </div>
      {railItem({
        id: 'base',
        title: 'Shared base',
        subtitle: 'Inherited by all listings',
        badge: `${baseFieldCount}`,
        active: selected === 'base',
        onClick: () => setSelected('base')
      })}

      <div
        style={{
          padding: '16px 16px 8px 16px',
          fontSize: '11px',
          fontWeight: 700,
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
          color: 'var(--color-neutral-70)'
        }}
      >
        Listings
      </div>
      {listings.map((l) =>
        railItem({
          id: l.id,
          title: shortName(l.name),
          subtitle: `${uniqueFieldCount(l.id)} unique field${uniqueFieldCount(l.id) === 1 ? '' : 's'}`,
          active: selected === l.id,
          onClick: () => setSelected(l.id)
        })
      )}
    </div>
  );

  /* ----------------------------- Base view ----------------------------- */

  const baseRow = (field: FieldDef) => (
    <Row
      key={field.key}
      label={field.label}
      type={field.type}
      defaultValue={
        <DefaultValueInput
          value={''}
          onChange={() => {}}
          placeholder={field.type === 'Picklist' ? 'Select a value' : 'Enter a value'}
        />
      }
    >
      <ComboBox
        options={SALESFORCE_FIELDS}
        value={baseMappings[field.key] || ''}
        onChange={(val) => setBaseMappings({ ...baseMappings, [field.key]: val })}
        placeholder="Choose a field"
        className="w-full"
      />
    </Row>
  );

  const baseView = (
    <div style={{ padding: '24px' }}>
      <Banner
        className="field-mapper-banner"
        variant="info"
        borderPosition="top"
        title="Shared base — mapped once, inherited everywhere"
      >
        <p style={{ margin: 0 }}>
          These mappings apply to <strong>every listing</strong> in your catalog. Map them once here; individual
          listings inherit them automatically and only override a field when they genuinely differ.
        </p>
      </Banner>

      <div style={{ marginTop: '24px' }}>
        {offerType === 'partner' && (
          <Section title="Partner fields" description="Only present on partner (CPPO) offers.">
            {PARTNER_FIELDS.map(baseRow)}
          </Section>
        )}

        <Section title="Buyer & offer fields">{BASE_BUYER_OFFER.map(baseRow)}</Section>
        <Section title="Product & pricing fields">{BASE_PRODUCT.map(baseRow)}</Section>
        <Section title="Agreements & fees" last={offerType !== 'partner'}>
          {BASE_AGREEMENTS.map(baseRow)}
        </Section>

        {offerType === 'partner' && (
          <Section title="Reseller agreement" last>
            {PARTNER_AGREEMENTS.map(baseRow)}
          </Section>
        )}
      </div>
    </div>
  );

  /* --------------------------- Listing view ---------------------------- */

  const listingUniqueRow = (listingId: string, field: FieldDef) => {
    const k = `${listingId}:${field.key}`;
    return (
      <Row
        key={k}
        label={
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--Neutral-Neutral-70)' }}>
              {field.label}
            </span>
          </span>
        }
        type={field.type}
        defaultValue={
          <DefaultValueInput value={''} onChange={() => {}} placeholder="Enter a value" />
        }
      >
        <ComboBox
          options={SALESFORCE_FIELDS}
          value={listingMappings[k] || ''}
          onChange={(val) => setListingMappings({ ...listingMappings, [k]: val })}
          placeholder="Choose a field"
          className="w-full"
        />
      </Row>
    );
  };

  const inheritedRow = (listingId: string, field: FieldDef) => {
    const k = `${listingId}:${field.key}`;
    const isOverridden = !!overrides[k];
    return (
      <Row
        key={k}
        label={
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--Neutral-Neutral-70)' }}>
              {field.label}
            </span>
            {isOverridden ? (
              <Tag color="blue">Overridden</Tag>
            ) : (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '2px',
                  fontSize: '10px',
                  fontWeight: 600,
                  padding: '1px 6px',
                  borderRadius: '10px',
                  backgroundColor: 'var(--color-neutral-20)',
                  color: 'var(--color-neutral-90)'
                }}
              >
                Inherited
              </span>
            )}
          </span>
        }
        type={field.type}
        defaultValue={
          isOverridden ? (
            <Button
              variant="secondary"
              size="small"
              onClick={() => setOverrides({ ...overrides, [k]: false })}
            >
              Revert to base
            </Button>
          ) : (
            <Button variant="secondary" size="small" onClick={() => setOverrides({ ...overrides, [k]: true })}>
              Override
            </Button>
          )
        }
      >
        {isOverridden ? (
          <ComboBox
            options={SALESFORCE_FIELDS}
            value={overrideMappings[k] || ''}
            onChange={(val) => setOverrideMappings({ ...overrideMappings, [k]: val })}
            placeholder="Choose a field"
            className="w-full"
          />
        ) : (
          <span style={{ fontSize: '13px', color: 'var(--color-neutral-70)', fontStyle: 'italic' }}>
            {baseMappings[field.key] || '—'}{' '}
            <span style={{ color: 'var(--color-neutral-50)' }}>(from base)</span>
          </span>
        )}
      </Row>
    );
  };

  const listingView = (listingId: string) => {
    const listing = listings.find((l) => l.id === listingId);
    const fields = LISTING_FIELDS[listingId] || { registration: [], additional: [], usage: [] };
    const hasUnique =
      fields.registration.length > 0 || fields.additional.length > 0 || fields.usage.length > 0;

    return (
      <div style={{ padding: '24px' }}>
        <Banner
          className="field-mapper-banner"
          variant="info"
          borderPosition="top"
          title={`${shortName(listing?.name || '')} inherits ${baseFieldCount} shared base mappings`}
        >
          <p style={{ margin: 0 }}>
            You only need to map what's <strong>unique to this listing</strong> below. Inherited base fields are shown
            for reference — override one only if this listing genuinely needs a different mapping.{' '}
            <button
              onClick={() => setSelected('base')}
              style={{
                background: 'none',
                border: 'none',
                padding: 0,
                color: '#1fadad',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              View shared base →
            </button>
          </p>
        </Banner>

        <div style={{ marginTop: '24px' }}>
          {hasUnique ? (
            <>
              {fields.registration.length > 0 && (
                <Section
                  title="Registration fields (unique to this listing)"
                  description="Buyers complete these on the Tackle registration page for this listing."
                  fieldColumnLabel="Listing field"
                >
                  {fields.registration.map((f) => listingUniqueRow(listingId, f))}
                </Section>
              )}
              {fields.additional.length > 0 && (
                <Section
                  title="Additional fields (unique to this listing)"
                  description="Support your own bookkeeping for this listing."
                  fieldColumnLabel="Listing field"
                >
                  {fields.additional.map((f) => listingUniqueRow(listingId, f))}
                </Section>
              )}
              {fields.usage.length > 0 && (
                <Section
                  title="Usage dimension fields (unique to this listing)"
                  description="Dimensions that come from this marketplace listing."
                  fieldColumnLabel="Listing field"
                >
                  {fields.usage.map((f) => listingUniqueRow(listingId, f))}
                </Section>
              )}
            </>
          ) : (
            <div
              style={{
                padding: '24px',
                marginBottom: '24px',
                textAlign: 'center',
                fontSize: '14px',
                color: 'var(--color-neutral-50)',
                border: '1px dashed var(--color-neutral-30)',
                borderRadius: 'var(--border-radius-base)'
              }}
            >
              {shortName(listing?.name || 'This listing')} has no unique fields. It uses the shared base mapping only.
            </div>
          )}

          <Section title="Inherited from base" description="Override a field only if this listing differs." last>
            {OVERRIDABLE_BASE.map((f) => inheritedRow(listingId, f))}
          </Section>
        </div>
      </div>
    );
  };

  /* ------------------------------ Render ------------------------------- */

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px' }}>
      {saveAlert && (
        <div style={{ marginBottom: '24px' }}>
          <Alert variant="success" title="Saved" description={saveAlert} />
        </div>
      )}

      {/* Concept explainer */}
      <div style={{ marginBottom: '24px' }}>
        <Alert
          variant="info"
          title="Version 2 concept — Listing-first"
          description="The listing is the primary axis. Shared mappings live once in the Shared base and are inherited by every listing. Pick a listing to map only what's unique to it, and override an inherited field only when it genuinely differs. Offer type (Direct / Partner) is a secondary toggle handled in the base."
        />
      </div>

      <div style={CARD}>
        {/* Object + offer type header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 24px 0 24px',
            gap: '16px',
            flexWrap: 'wrap'
          }}
        >
          <Tabs variant="platform" items={TACKLE_OBJECT_TABS} activeTab="offers" onTabChange={() => {}} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AWSIcon size="small" />
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-neutral-90)' }}>
              AWS Marketplace
            </span>
          </div>
        </div>

        <div style={{ padding: '16px 24px 0 24px' }}>
          <Tabs variant="platform" items={OFFER_TYPE_TABS} activeTab={offerType} onTabChange={setOfferType} />
        </div>

        {/* Draft status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '16px 24px 0 24px' }}>
          <Tag color="gray">Draft</Tag>
          <span style={{ fontSize: '12px', color: 'var(--color-neutral-70)' }}>
            <UserGroupIcon size={12} /> Listing-first mapping across {listings.length} listings
          </span>
        </div>

        {/* Two-pane: listing rail + content */}
        <div style={{ display: 'flex', alignItems: 'stretch', marginTop: '16px', borderTop: '1px solid var(--color-neutral-20)' }}>
          {leftRail}
          <div style={{ flex: '1 1 auto', minWidth: 0 }}>
            {selected === 'base' ? baseView : listingView(selected)}

            {/* Actions */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '8px',
                padding: '0 24px 24px 24px'
              }}
            >
              <Button variant="secondary" size="small">
                Cancel
              </Button>
              <Button variant="secondary" size="small" onClick={handleSave}>
                Save as draft
              </Button>
              <Button variant="primary" size="small" onClick={handleSave}>
                Publish
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
