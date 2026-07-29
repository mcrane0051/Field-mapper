import { useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import {
  Button,
  Alert,
  Banner,
  Tag,
  Tabs,
  ComboBox,
  TextField,
  AWSIcon,
  MicrosoftIcon,
  GoogleIcon,
  CoSellIcon,
  OffersIcon,
  ListingsIcon,
  HelpIcon,
  WarningIcon
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
/* Version 3 — the 3-tab model                                                */
/*                                                                            */
/*   Direct offer fields | Partner offer fields | Listing fields             */
/*                                                                            */
/* - Offer-type tabs hold the OFFER-level fields (full parity with V1, plus a */
/*   partner delta). Direct and Partner are independent documents that can    */
/*   diverge (CPPO), so sharing is EXPLICIT via a pull-based "Copy from"       */
/*   right-side drawer with a preview/diff and overwrite callout.             */
/* - Listing fields tab holds LISTING-scoped fields, DEDUPED across the        */
/*   catalog: a field on N listings is ONE shared row (mapping + default),     */
/*   badged with its listings. No propagation checkbox.                        */
/* -------------------------------------------------------------------------- */

const ACCOUNT = 'eu';
const shortName = (name: string) => name.replace(/\s*\(.*\)\s*$/, '');
const asOpt = (labels: string[]) => labels.map((l) => ({ value: l, label: l }));

// Default-value picklist option sets (mirror V1)
const RENEWAL_OPTIONS = asOpt(['Yes', 'No']);
const RENEWAL_TYPE_OPTIONS = asOpt(['Auto-renew', 'Manual renewal', 'Do not renew']);
const LISTING_DEFAULT_OPTIONS = asOpt(['Hooli Premium', 'Hooli Basic', 'Hooli Standard API', 'Hooli Enterprise']);
const PAYMENT_MODEL_OPTIONS = asOpt(['Paid upfront', 'Payment schedule', 'Usage-based']);
const CONTRACT_START_OPTIONS = asOpt(['On offer acceptance', 'On subscription', 'Custom date']);
const CURRENCY_OPTIONS = asOpt(['USD', 'EUR', 'GBP', 'JPY']);
const SF_CONTACT_OBJECT_OPTIONS = asOpt([SF.contactRoles]);
const SF_LINE_ITEM_OBJECT_OPTIONS = asOpt([SF.quoteLineItems]);

// When a field has a parent object mapping, its child fields are scoped to that
// object: their options all start with the object's leaf name (e.g. "QuoteLineItems > ...").
const CHILD_FIELDS_BY_OBJECT: Record<string, string[]> = {
  OpportunityContactRoles: ['Full Name', 'Email', 'Title', 'Role', 'Phone', 'Company'],
  QuoteLineItems: [
    'Product Name',
    'SKU',
    'Description',
    'Quantity',
    'Unit Price',
    'Total Price',
    'Discount',
    'Start Date',
    'End Date',
    'Invoice Date',
    'Fee Amount'
  ]
};
// Leaf = last segment of the object path, e.g. "Opportunity > Quote > QuoteLineItems" -> "QuoteLineItems"
const objectLeaf = (path: string) => (path ? path.split('>').pop()!.trim() : '');
const childOptionsFor = (path: string) =>
  (CHILD_FIELDS_BY_OBJECT[objectLeaf(path)] || []).map((f) => {
    const v = `${objectLeaf(path)} > ${f}`;
    return { value: v, label: v };
  });

// Every shared offer field that can be copied between Direct and Partner.
const COPYABLE_OFFER_FIELDS: Array<{ key: string; label: string }> = [
  { key: 'aws_account_id', label: 'AWS account ID' },
  { key: 'company_name', label: 'Company name' },
  { key: 'buyer_contact_obj', label: 'Salesforce object for buyer contact' },
  { key: 'contact_fullname', label: 'Full name' },
  { key: 'contact_email', label: 'Email' },
  { key: 'contact_title', label: 'Title' },
  { key: 'offer_name', label: 'Offer name' },
  { key: 'offer_description', label: 'Offer description' },
  { key: 'renewal', label: 'Renewal' },
  { key: 'renewal_type', label: 'Renewal type' },
  { key: 'deadline', label: 'Offer acceptance deadline' },
  { key: 'country_codes', label: 'Country codes' },
  { key: 'listing', label: 'Listing' },
  { key: 'payment_model', label: 'Payment model' },
  { key: 'contract_start', label: 'Contract start' },
  { key: 'currency', label: 'Currency' },
  { key: 'offer_duration', label: 'Offer duration' },
  { key: 'start_date', label: 'Start date' },
  { key: 'end_date', label: 'End date' },
  { key: 'contract_dimension_obj', label: 'Salesforce object for contract dimensions' },
  { key: 'contract_dimension_field', label: 'Dimension' },
  { key: 'contract_api_name', label: 'API name' },
  { key: 'contract_quantity', label: 'Quantity' },
  { key: 'contract_price_per', label: 'Price per unit' },
  { key: 'payment_schedule_obj', label: 'Salesforce object for payment schedule' },
  { key: 'invoice_date', label: 'Invoice date' },
  { key: 'payment_amt', label: 'Payment amount' },
  { key: 'usage_end_date', label: 'Usage end date' },
  { key: 'new_service_end_date', label: 'New service end date' },
  { key: 'usage_pricing_obj', label: 'Salesforce object for usage pricing' },
  { key: 'usage_match_key', label: 'Sku' },
  { key: 'usage_fee', label: 'Fee amount' },
  { key: 'eula_version', label: 'EULA version' },
  { key: 'marketplace_fee', label: 'Marketplace fee' },
  { key: 'notify_emails', label: 'Email addresses' }
];

// Direct offer starts fully mapped.
const INITIAL_DIRECT_MAPPINGS: Record<string, string> = {
  aws_account_id: SF.awsId,
  company_name: SF.accountName,
  buyer_contact_obj: SF.contactRoles,
  contact_fullname: 'OpportunityContactRoles > Full Name',
  contact_email: 'OpportunityContactRoles > Email',
  contact_title: 'OpportunityContactRoles > Title',
  renewal: SF.expiration,
  renewal_type: SF.expiration,
  deadline: SF.expiration,
  country_codes: SF.accountName,
  listing: SF.accountName,
  payment_model: SF.startDate,
  contract_start: SF.startDate,
  currency: SF.awsId,
  offer_duration: SF.startDate,
  start_date: SF.startDate,
  end_date: SF.endDate,
  contract_dimension_obj: SF.quoteLineItems,
  contract_dimension_field: 'QuoteLineItems > Product Name',
  contract_api_name: 'QuoteLineItems > SKU',
  contract_quantity: 'QuoteLineItems > Quantity',
  contract_price_per: 'QuoteLineItems > Unit Price',
  payment_schedule_obj: SF.quoteLineItems,
  invoice_date: 'QuoteLineItems > Invoice Date',
  payment_amt: 'QuoteLineItems > Total Price',
  usage_end_date: SF.endDate,
  new_service_end_date: SF.endDate,
  usage_pricing_obj: SF.quoteLineItems,
  usage_match_key: 'QuoteLineItems > SKU',
  usage_fee: 'QuoteLineItems > Fee Amount',
  eula_version: SF.expiration,
  marketplace_fee: SF.startDate,
  notify_emails: SF.contactEmail
};
const INITIAL_DIRECT_DEFAULTS: Record<string, string> = {
  offer_name: '{Opportunity > Account > Account Name} - Private Offer'
};

// Partner offer starts PARTIALLY mapped, with a few values that DIFFER from Direct,
// so "Copy from Direct offer" immediately shows the overwrite callout.
const INITIAL_PARTNER_MAPPINGS: Record<string, string> = {
  company_name: SF.awsId, // differs from Direct (accountName) → will show "Overwrites"
  buyer_contact_obj: SF.contactRoles, // parent selected so the scoped child combo is enabled
  contact_email: 'OpportunityContactRoles > Role', // differs from Direct (… > Email) → "Overwrites"
  deadline: SF.startDate // differs from Direct (expiration) → "Overwrites"
};
const INITIAL_PARTNER_DEFAULTS: Record<string, string> = {
  offer_name: '{Opportunity > Account > Account Name} Private Offer - CPPO' // CPPO divergence → "Overwrites"
};

const ACCOUNT_SETTINGS_TABS = [
  { id: 'subscription', label: 'Subscription' },
  { id: 'preferences', label: 'Preferences' },
  { id: 'marketplace', label: 'Marketplace' },
  { id: 'cosell', label: 'Co-Sell' },
  { id: 'field-mapper', label: 'Field mapper' },
  { id: 'm2m', label: 'M2M apps' }
];

const OFFER_TABS = [
  { id: 'direct', label: 'Direct offer fields' },
  { id: 'partner', label: 'Partner offer fields' },
  { id: 'listing', label: 'Listing fields' }
];

// Fields that exist on the Direct offer but are NOT shown on the Partner offer.
// These are excluded from the "Copy from Direct offer" diff when Partner is the target.
const PARTNER_HIDDEN_FIELDS = new Set([
  'buyer_contact_obj',
  'contact_fullname',
  'contact_email',
  'contact_title',
  'country_codes',
  'offer_duration',
  'start_date',
  'end_date',
  'new_service_end_date'
]);

const TACKLE_OBJECT_TABS = [
  { id: 'cosell', label: 'Co-Sell', icon: <CoSellIcon size="small" /> },
  { id: 'offers', label: 'Offers', icon: <OffersIcon size="small" /> }
];

const CLOUD_TABS = [
  { id: 'aws', label: 'AWS', icon: <AWSIcon size="small" /> },
  { id: 'azure', label: 'Microsoft', icon: <MicrosoftIcon size="small" /> },
  { id: 'gcp', label: 'Google', icon: <GoogleIcon size="small" /> }
];

// "Last saved" always reads as yesterday (mirrors V1)
const lastSavedLabel = () => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const date = `${yesterday.getMonth() + 1}/${yesterday.getDate()}/${yesterday.getFullYear()}`;
  return `Last saved ${date} 10:01:01 EST`;
};

const CARD: CSSProperties = {
  backgroundColor: 'var(--color-neutral-0)',
  borderRadius: 'var(--border-radius-base)',
  border: '1px solid var(--color-neutral-20)'
};

/* --------------------- Listing-field dedupe helper ------------------------- */

type FieldDef = { key: string; label: string; type: string };
type DedupedField = { field: FieldDef; listings: string[] };

const dedupeSection = (section: 'registration' | 'additional' | 'usage'): DedupedField[] => {
  const listings = LISTINGS_BY_ACCOUNT[ACCOUNT] || [];
  const map = new Map<string, DedupedField>();
  listings.forEach((l) => {
    (LISTING_FIELDS[l.id]?.[section] || []).forEach((f) => {
      if (!map.has(f.key)) map.set(f.key, { field: f, listings: [] });
      map.get(f.key)!.listings.push(shortName(l.name));
    });
  });
  return [...map.values()];
};

export function HomePageV3() {
  const listings = LISTINGS_BY_ACCOUNT[ACCOUNT] || [];
  const totalListings = listings.length;

  const [activeSettingsTab, setActiveSettingsTab] = useState('field-mapper');
  const [tackleObject, setTackleObject] = useState('offers');
  const [activeCloud, setActiveCloud] = useState('aws');
  const [tab, setTab] = useState('direct');

  const [directMappings, setDirectMappings] = useState<Record<string, string>>(INITIAL_DIRECT_MAPPINGS);
  const [partnerMappings, setPartnerMappings] = useState<Record<string, string>>(INITIAL_PARTNER_MAPPINGS);
  const [directDefaults, setDirectDefaults] = useState<Record<string, string>>(INITIAL_DIRECT_DEFAULTS);
  const [partnerDefaults, setPartnerDefaults] = useState<Record<string, string>>(INITIAL_PARTNER_DEFAULTS);

  const [listingMappings, setListingMappings] = useState<Record<string, string>>({});
  const [listingDefaults, setListingDefaults] = useState<Record<string, string>>({});

  const [copyOpen, setCopyOpen] = useState(false);
  const [hoveredCommon, setHoveredCommon] = useState<string | null>(null);
  const [saveAlert, setSaveAlert] = useState<string | null>(null);

  const isPartner = tab === 'partner';
  const mappings = isPartner ? partnerMappings : directMappings;
  const setMappings = isPartner ? setPartnerMappings : setDirectMappings;
  const defaults = isPartner ? partnerDefaults : directDefaults;
  const setDefaults = isPartner ? setPartnerDefaults : setDirectDefaults;

  /* --------------------------- Offer-row helpers ----------------------- */

  const mapCombo = (key: string) => (
    <ComboBox
      options={SALESFORCE_FIELDS}
      value={mappings[key] || ''}
      onChange={(val) => setMappings({ ...mappings, [key]: val })}
      placeholder="Choose a field"
      className="w-full"
    />
  );

  // Child field of a parent object mapping: options are scoped to the selected object.
  const childMapCombo = (key: string, parentKey: string, helperText?: string) => {
    const parentVal = mappings[parentKey] || '';
    return (
      <ComboBox
        options={childOptionsFor(parentVal)}
        value={mappings[key] || ''}
        onChange={(val) => setMappings({ ...mappings, [key]: val })}
        placeholder={parentVal ? 'Choose a field' : 'Select the object above first'}
        disabled={!parentVal}
        helperText={helperText}
        className="w-full"
      />
    );
  };

  const structRow = (
    key: string,
    label: string,
    type: string,
    defaultCell: 'input' | 'none' = 'input',
    placeholder = 'Enter a value',
    parentKey?: string
  ) => (
    <Row
      key={key}
      label={label}
      type={type}
      defaultValue={
        defaultCell === 'input' ? (
          <DefaultValueInput
            value={defaults[key] || ''}
            onChange={(next) => setDefaults({ ...defaults, [key]: next })}
            placeholder={placeholder}
          />
        ) : undefined
      }
    >
      {parentKey ? childMapCombo(key, parentKey) : mapCombo(key)}
    </Row>
  );

  const picklistRow = (
    key: string,
    label: string,
    options: Array<{ value: string; label: string }>,
    placeholder = 'Select a value'
  ) => (
    <Row
      key={key}
      label={label}
      type="Picklist"
      defaultValue={
        <ComboBox
          options={options}
          value={defaults[key] || ''}
          onChange={(val) => setDefaults({ ...defaults, [key]: val })}
          placeholder={placeholder}
          className="w-full"
        />
      }
    >
      {mapCombo(key)}
    </Row>
  );

  const parentObjectRow = (key: string, label: string, options: Array<{ value: string; label: string }>) => (
    <Row key={key} label={label}>
      <ComboBox
        options={options}
        value={mappings[key] || ''}
        onChange={(val) => setMappings({ ...mappings, [key]: val })}
        placeholder="Choose a field"
        className="w-full"
      />
    </Row>
  );

  const subHeader = (title: string, description?: string) => (
    <div style={{ marginTop: '24px' }}>
      <h3
        style={{
          margin: '0 0 4px 0',
          fontFamily: 'var(--font-family-primary)',
          fontSize: '16px',
          fontWeight: 400,
          lineHeight: '24px',
          color: 'var(--color-neutral-70)'
        }}
      >
        {title}
      </h3>
      {description ? (
        <p
          style={{
            margin: '0 0 8px 0',
            fontFamily: 'var(--font-family-primary)',
            fontSize: '12px',
            lineHeight: '20px',
            color: 'var(--color-neutral-70)'
          }}
        >
          {description}
        </p>
      ) : null}
    </div>
  );

  const offerView = (
    <div style={{ padding: '24px 48px' }}>
      {isPartner && (
        <Section title="Partner fields">
          {structRow('partner_name', 'Partner name', 'Text', 'none')}
          {structRow('partner_aws_account', 'Partner AWS account number', 'Text', 'none')}
        </Section>
      )}

      <Section title="Buyer fields">
        {structRow('aws_account_id', 'AWS account ID', 'Text', 'none')}
        {structRow('company_name', 'Company name', 'Text', 'none')}
        {!isPartner && (
          <>
            {subHeader(
              'Buyer contact fields',
              'Map the contact details of your buyer. Select the Salesforce object that stores it, then map the fields below.'
            )}
            {parentObjectRow('buyer_contact_obj', 'Salesforce object for buyer contact', SF_CONTACT_OBJECT_OPTIONS)}
            {structRow('contact_fullname', 'Full name', 'Text', 'none', 'Enter a value', 'buyer_contact_obj')}
            {structRow('contact_email', 'Email', 'Text', 'none', 'Enter a value', 'buyer_contact_obj')}
            {structRow('contact_title', 'Title', 'Text', 'none', 'Enter a value', 'buyer_contact_obj')}
          </>
        )}
      </Section>

      <Section title="Offer fields">
        <Row label="Offer name" type="Text" align="flex-start">
          <TextField
            multiline
            rows={2}
            value={defaults.offer_name || ''}
            onChange={(e) => setDefaults({ ...defaults, offer_name: e.target.value })}
            placeholder="Type @ to add dynamic fields."
            helperText="Text mode enabled. Use the '@' key to switch to Salesforce lookup mode to add dynamic fields."
          />
        </Row>
        <Row label="Offer description" type="Text" align="flex-start">
          <TextField
            multiline
            rows={2}
            value={defaults.offer_description || ''}
            onChange={(e) => setDefaults({ ...defaults, offer_description: e.target.value })}
            placeholder="Type @ to add dynamic fields."
            helperText="Text mode enabled. Use the '@' key to switch to Salesforce lookup mode to add dynamic fields."
          />
        </Row>
        {picklistRow('renewal', 'Renewal', RENEWAL_OPTIONS)}
        {picklistRow('renewal_type', 'Renewal type', RENEWAL_TYPE_OPTIONS)}
        {structRow('deadline', 'Offer acceptance deadline', 'Text', 'none')}

        {!isPartner && (
          <>
            {subHeader('Buyer country availability')}
            <Row
              label="Country codes"
              type="Text"
              align="flex-start"
              defaultValue={
                <TextField
                  value={defaults.country_codes_default || ''}
                  onChange={(e) => setDefaults({ ...defaults, country_codes_default: e.target.value })}
                  placeholder="Enter values, hit enter to add a value"
                  helperText="Press Enter to add each value"
                />
              }
            >
              {mapCombo('country_codes')}
            </Row>
          </>
        )}
      </Section>

      <Section title="Product and pricing fields">
        {picklistRow('listing', 'Listing', LISTING_DEFAULT_OPTIONS)}
        {picklistRow('payment_model', 'Payment model', PAYMENT_MODEL_OPTIONS)}
        {picklistRow('contract_start', 'Contract start', CONTRACT_START_OPTIONS)}
        {picklistRow('currency', 'Currency', CURRENCY_OPTIONS)}
        {isPartner && structRow('max_service_start_date', 'Max service start date', 'Text', 'none')}

        {!isPartner && (
          <>
            {subHeader(
              'Start on acceptance fields',
              'For contracts starting when your buyer accepts the private offer.'
            )}
            {structRow('offer_duration', 'Offer duration', 'Text', 'input', 'Enter a value')}

            {subHeader(
              'Future dated fields',
              'For contracts starting and ending on the dates you define in the private offer.'
            )}
            {structRow('start_date', 'Start date', 'Text', 'none')}
            {structRow('end_date', 'End date', 'Text', 'none')}
          </>
        )}

        {subHeader(
          'Contract dimensions',
          'Each AWS private offer can have one or more dimensions. Select the Salesforce object that stores it, then map the fields below.'
        )}
        {parentObjectRow('contract_dimension_obj', 'Salesforce object for contract dimensions', SF_LINE_ITEM_OBJECT_OPTIONS)}
        {structRow('contract_dimension_field', 'Dimension', 'Text', 'input', 'Enter a value', 'contract_dimension_obj')}
        {structRow('contract_api_name', 'API name', 'Text', 'input', 'Enter a value', 'contract_dimension_obj')}
        {structRow('contract_quantity', 'Quantity', 'Number', 'input', 'Enter a value', 'contract_dimension_obj')}
        {structRow('contract_price_per', 'Price per unit', 'Number', 'none', 'Enter a value', 'contract_dimension_obj')}

        {subHeader(
          'Payment schedule',
          'Lets buyers pay in installments throughout the course of their contract. Select the Salesforce object that stores it, then map the fields below.'
        )}
        {parentObjectRow('payment_schedule_obj', 'Salesforce object for payment schedule', SF_LINE_ITEM_OBJECT_OPTIONS)}
        {structRow('invoice_date', 'Invoice date', 'Text', 'none', 'Enter a value', 'payment_schedule_obj')}
        {structRow('payment_amt', 'Payment amount', 'Text', 'none', 'Enter a value', 'payment_schedule_obj')}

        {subHeader('Usage only', 'For contracts that will bill buyers on their usage only.')}
        {structRow('usage_end_date', 'Usage end date', 'Text', 'none')}

        {!isPartner && (
          <>
            {subHeader('Amendments', 'For contracts that are being amended.')}
            {structRow('new_service_end_date', 'New service end date', 'Text', 'none')}
          </>
        )}

        {subHeader(
          'Usage dimensions',
          'Each listing defines its own usage dimensions. Map where usage pricing lives in Salesforce once — Tackle matches each line item to the right dimension by its SKU name, so this scales to any number of dimensions.'
        )}
        {parentObjectRow('usage_pricing_obj', 'Salesforce object for usage pricing', SF_LINE_ITEM_OBJECT_OPTIONS)}
        <Row label="Sku" align="flex-start">
          {childMapCombo(
            'usage_match_key',
            'usage_pricing_obj',
            "Match this to the dimension's SKU name so each line item's fee maps correctly."
          )}
        </Row>
        {structRow('usage_fee', 'Fee amount', 'Number', 'none', 'Enter a value', 'usage_pricing_obj')}
      </Section>

      <Section title="End user license agreement fields">
        {structRow('eula_version', 'EULA version', 'Picklist')}
      </Section>

      {isPartner && (
        <Section title="Reseller agreement">
          {picklistRow('reseller_agreement_version', 'Reseller agreement version', asOpt(['v1', 'v2', 'v3']))}
        </Section>
      )}

      <Section title="Additional fields">
        {structRow('marketplace_fee', 'Marketplace fee', 'Text', 'input', 'Enter a value')}
      </Section>

      <Section title="Notify users" last>
        <Row
          label="Email addresses"
          type="List"
          defaultValue={
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-start' }}>
              <Tag color="gray">carson.stoltz@tackle.io</Tag>
              <Tag color="gray">karla.henriquez@appdirect.com</Tag>
            </div>
          }
        >
          {mapCombo('notify_emails')}
        </Row>
      </Section>
    </div>
  );

  /* --------------------------- Listing view ---------------------------- */

  const membership = (names: string[], key: string): ReactNode => {
    const isAll = names.length >= totalListings;
    const label = isAll ? 'All' : String(names.length);
    return (
      <span
        style={{ display: 'inline-flex', alignItems: 'center', cursor: 'default', position: 'relative' }}
        onMouseEnter={() => setHoveredCommon(key)}
        onMouseLeave={() => setHoveredCommon(null)}
      >
        {/* Listing badge — icon + count ("All" or number). Matches Figma node 1277:17767. */}
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            padding: '2px 8px',
            borderRadius: '4px',
            backgroundColor: 'var(--color-neutral-0)',
            border: '1px solid var(--color-neutral-20)',
            color: '#253858',
            fontFamily: 'var(--font-family-primary)',
            fontSize: '12px',
            fontWeight: 400,
            lineHeight: '18px'
          }}
        >
          <ListingsIcon size={16} />
          {label}
        </span>
        {hoveredCommon === key && (
          <div
            style={{
              position: 'absolute',
              bottom: '24px',
              left: 0,
              width: '260px',
              zIndex: 99,
              padding: '12px',
              borderRadius: '4px',
              backgroundColor: 'var(--color-neutral-100)',
              color: 'var(--color-neutral-0)',
              boxShadow: 'var(--elevation-400)',
              fontFamily: 'var(--font-family-primary)',
              fontSize: '12px',
              lineHeight: '20px'
            }}
          >
            <div style={{ fontWeight: 700, marginBottom: '4px' }}>
              {names.length > 1 ? 'Shared listing field' : 'Listing field'}
            </div>
            <p style={{ margin: '0 0 4px 0', color: 'var(--color-neutral-40)' }}>
              {names.length > 1 ? 'This mapping applies to these listings:' : 'This mapping applies to this listing:'}
            </p>
            <ul style={{ margin: 0, paddingLeft: '16px' }}>
              {names.map((n) => (
                <li key={n}>{n}</li>
              ))}
            </ul>
          </div>
        )}
      </span>
    );
  };

  const listingRow = (row: DedupedField, showDefault = true) => {
    const { field, listings: names } = row;
    return (
      <Row
        key={field.key}
        label={
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--Neutral-Neutral-70)' }}>{field.label}</span>
            {membership(names, field.key)}
          </span>
        }
        type={field.type}
        defaultValue={
          showDefault ? (
            <DefaultValueInput
              value={listingDefaults[field.key] || ''}
              onChange={(next) => setListingDefaults({ ...listingDefaults, [field.key]: next })}
              placeholder={field.type === 'Picklist' ? 'Select a value' : 'Enter a value'}
            />
          ) : undefined
        }
      >
        <ComboBox
          options={SALESFORCE_FIELDS}
          value={listingMappings[field.key] || ''}
          onChange={(val) => setListingMappings({ ...listingMappings, [field.key]: val })}
          placeholder="Choose a field"
          className="w-full"
        />
      </Row>
    );
  };

  const registration = dedupeSection('registration');
  const additional = dedupeSection('additional');

  const listingView = (
    <div style={{ padding: '24px 48px' }}>
      <div style={{ marginBottom: '16px' }}>
        <Banner
          className="field-mapper-banner"
          variant="info"
          borderPosition="top"
          expandable={true}
          defaultExpanded={true}
          title="One setup for all AWS listings enabled in Tackle"
        >
          <p style={{ margin: 0 }}>
            Map the Salesforce field to each listing field. If a field appears on more than one of your Tackle-enabled listings, this mapping applies to all of them.
          </p>
        </Banner>
      </div>

      <Section
        title="Registration fields"
        description="Buyers complete these on the Tackle registration page."
        fieldColumnLabel="Listing field"
      >
        {registration.map((row) => listingRow(row, false))}
      </Section>

      <Section
        title="Additional fields"
        description="Support your own bookkeeping on the bookable artifact."
        fieldColumnLabel="Listing field"
        last
      >
        {additional.map((row) => listingRow(row, true))}
      </Section>
    </div>
  );

  /* --------------------------- Copy-from flow -------------------------- */

  const sourceLabel = isPartner ? 'Direct offer' : 'Partner offer';
  const sourceMappings = isPartner ? directMappings : partnerMappings;
  const sourceDefaults = isPartner ? directDefaults : partnerDefaults;

  const copyDiff = COPYABLE_OFFER_FIELDS
    // When copying INTO the Partner offer, skip fields that don't exist on that tab.
    .filter((f) => !(isPartner && PARTNER_HIDDEN_FIELDS.has(f.key)))
    .map((f) => {
    const srcMap = sourceMappings[f.key] || '';
    const srcDef = sourceDefaults[f.key] || '';
    const tgtMap = mappings[f.key] || '';
    const tgtDef = defaults[f.key] || '';
    const hasSource = srcMap !== '' || srcDef !== '';
    const changes = srcMap !== tgtMap || srcDef !== tgtDef;
    const overwrites = (tgtMap !== '' && srcMap !== tgtMap) || (tgtDef !== '' && srcDef !== tgtDef);
    return { field: f, srcMap, srcDef, tgtMap, tgtDef, hasSource, changes, overwrites };
  }).filter((d) => d.hasSource && d.changes);

  const overwriteCount = copyDiff.filter((d) => d.overwrites).length;

  const applyCopy = () => {
    const nextMap = { ...mappings };
    const nextDef = { ...defaults };
    copyDiff.forEach((d) => {
      nextMap[d.field.key] = d.srcMap;
      nextDef[d.field.key] = d.srcDef;
    });
    setMappings(nextMap);
    setDefaults(nextDef);
    setCopyOpen(false);
    setSaveAlert(
      `Copied ${copyDiff.length} field${copyDiff.length === 1 ? '' : 's'} from ${sourceLabel}${
        overwriteCount > 0 ? ` (${overwriteCount} overwritten)` : ''
      }.`
    );
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => setSaveAlert(null), 7000);
  };

  // Right-side drawer (design system "RightPanelLayout" / elevation 500R)
  const copyDrawer = copyOpen && (
    <>
      <div
        onClick={() => setCopyOpen(false)}
        style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,43,65,0.4)', zIndex: 100 }}
      />
      <div
        role="dialog"
        aria-label={`Copy mappings from ${sourceLabel}`}
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          height: '100vh',
          width: 'min(480px, 96vw)',
          zIndex: 101,
          backgroundColor: 'var(--color-neutral-0)',
          boxShadow: 'var(--elevation-500R)',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--color-neutral-20)' }}>
          <h2 style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: 700, color: 'var(--color-neutral-100)' }}>
            Copy from {sourceLabel}
          </h2>
          <p style={{ margin: 0, fontSize: '13px', color: 'var(--color-neutral-70)' }}>
            Copies Salesforce mappings and default values from the {sourceLabel} into this form.
          </p>
        </div>

        {overwriteCount > 0 && (
          <div style={{ padding: '16px 24px 0 24px' }}>
            <Alert
              variant="warning"
              title={`${overwriteCount} field${overwriteCount === 1 ? '' : 's'} will be overwritten`}
              description="Existing values on this form (shown struck through below) will be replaced. Review before applying."
            />
          </div>
        )}

        <div style={{ flex: '1 1 auto', overflow: 'auto', padding: '8px 24px 24px 24px' }}>
          {copyDiff.length === 0 ? (
            <p style={{ color: 'var(--color-neutral-70)', fontSize: '14px', marginTop: '16px' }}>
              Nothing to copy — the {sourceLabel} has no mappings that differ from this form.
            </p>
          ) : (
            copyDiff.map((d) => (
              <div
                key={d.field.key}
                style={{
                  padding: '12px 0',
                  borderBottom: '1px solid var(--color-neutral-20)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-neutral-100)' }}>
                    {d.field.label}
                  </span>
                  {d.overwrites && <Tag color="red">Overwrites</Tag>}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--color-neutral-70)' }}>
                  <span style={{ color: 'var(--color-neutral-50)' }}>Mapping:</span>{' '}
                  <span style={{ textDecoration: d.tgtMap && d.tgtMap !== d.srcMap ? 'line-through' : 'none' }}>
                    {d.tgtMap || '(empty)'}
                  </span>{' '}
                  → <strong>{d.srcMap || '(empty)'}</strong>
                </div>
                {(d.srcDef || d.tgtDef) && (
                  <div style={{ fontSize: '12px', color: 'var(--color-neutral-70)' }}>
                    <span style={{ color: 'var(--color-neutral-50)' }}>Default:</span>{' '}
                    <span style={{ textDecoration: d.tgtDef && d.tgtDef !== d.srcDef ? 'line-through' : 'none' }}>
                      {d.tgtDef || '(empty)'}
                    </span>{' '}
                    → <strong>{d.srcDef || '(empty)'}</strong>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '8px',
            padding: '16px 24px',
            borderTop: '1px solid var(--color-neutral-20)'
          }}
        >
          <Button variant="secondary" size="small" onClick={() => setCopyOpen(false)}>
            Cancel
          </Button>
          <Button variant="primary" size="small" onClick={applyCopy} disabled={copyDiff.length === 0}>
            Apply{copyDiff.length > 0 ? ` (${copyDiff.length})` : ''}
          </Button>
        </div>
      </div>
    </>
  );

  /* ------------------------------ Render ------------------------------- */

  if (activeSettingsTab !== 'field-mapper') {
    return (
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 32px 32px 32px' }}>
        <div style={{ marginBottom: '32px' }}>
          <h1
            style={{
              margin: '0 0 4px 0',
              fontFamily: 'var(--font-family-primary)',
              fontSize: '40px',
              fontWeight: 300,
              lineHeight: '60px',
              color: 'var(--color-neutral-100)'
            }}
          >
            Account settings
          </h1>
          <p
            style={{
              margin: 0,
              fontFamily: 'var(--font-family-primary)',
              fontSize: '16px',
              lineHeight: '24px',
              color: 'var(--color-neutral-100)'
            }}
          >
            Setup and maintain your Tackle environment.
          </p>
        </div>

        <Tabs
          variant="platform"
          items={ACCOUNT_SETTINGS_TABS}
          activeTab={activeSettingsTab}
          onTabChange={setActiveSettingsTab}
        />

        <div
          style={{
            marginTop: '24px',
            padding: '40px',
            textAlign: 'center',
            backgroundColor: 'var(--color-neutral-0)',
            borderRadius: 'var(--border-radius-base)',
            border: '1px solid var(--color-neutral-20)',
            color: 'var(--color-neutral-50)'
          }}
        >
          <HelpIcon size="large" style={{ color: 'var(--color-neutral-50)', marginBottom: '16px' }} />
          <h3 style={{ margin: '0 0 8px 0', color: 'var(--color-neutral-90)' }}>Placeholder account settings tab</h3>
          <p style={{ margin: 0, fontSize: '14px' }}>
            This tab is simulated as page framing. Switch back to <strong>Field mapper</strong> to explore the
            prototype.
          </p>
          <Button variant="secondary" style={{ marginTop: '16px' }} onClick={() => setActiveSettingsTab('field-mapper')}>
            Back to Field mapper
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 32px 32px 32px' }}>
      {/* Page header */}
      <div style={{ marginBottom: '32px' }}>
        <h1
          style={{
            margin: '0 0 4px 0',
            fontFamily: 'var(--font-family-primary)',
            fontSize: '40px',
            fontWeight: 300,
            lineHeight: '60px',
            color: 'var(--color-neutral-100)'
          }}
        >
          Account settings
        </h1>
        <p
          style={{
            margin: 0,
            fontFamily: 'var(--font-family-primary)',
            fontSize: '16px',
            lineHeight: '24px',
            color: 'var(--color-neutral-100)'
          }}
        >
          Setup and maintain your Tackle environment.
        </p>
      </div>

      {/* Account settings tabs */}
      <Tabs
        variant="platform"
        items={ACCOUNT_SETTINGS_TABS}
        activeTab={activeSettingsTab}
        onTabChange={setActiveSettingsTab}
      />

      <p
        style={{
          margin: '24px 0',
          fontFamily: 'var(--font-family-primary)',
          fontSize: '16px',
          lineHeight: '24px',
          color: 'var(--color-neutral-100)'
        }}
      >
        Map Co-Sell and marketplace offers fields to Salesforce.
      </p>

      {saveAlert && (
        <div style={{ marginBottom: '24px' }}>
          <Alert variant="success" title="Done" description={saveAlert} />
        </div>
      )}

      <div style={{ ...CARD, boxShadow: 'var(--elevation-100)' }}>
        {/* Scope 1 — Tackle object */}
        <div style={{ display: 'flex', alignItems: 'stretch', gap: '24px', paddingTop: '8px' }}>
          <div
            style={{
              width: '200px',
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              paddingLeft: '24px',
              borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
              fontFamily: 'var(--font-family-primary)',
              fontSize: '16px',
              fontWeight: 700,
              lineHeight: '24px',
              color: 'var(--color-neutral-100)'
            }}
          >
            Tackle objects
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <Tabs variant="platform" items={TACKLE_OBJECT_TABS} activeTab={tackleObject} onTabChange={setTackleObject} />
          </div>
        </div>

        {/* Guidance for the whole mapper, directly under the object tabs */}
        <div style={{ padding: '24px 24px 0 24px' }}>
          <Banner
            className="field-mapper-banner"
            variant="info"
            borderPosition="top"
            expandable
            defaultExpanded
            title="Tackle tips for mapping private offer fields to Salesforce fields:"
          >
            <ul style={{ margin: 0, paddingLeft: '20px' }}>
              <li>
                You can map any fields required and not required by your cloud partners to any of your Salesforce
                opportunity or quote fields
              </li>
              <li>
                Additional fields not used by your cloud partners are required by Tackle for sending order notifications
              </li>
            </ul>
          </Banner>
        </div>

        {/* Scope 2 — cloud */}
        <div style={{ padding: '24px 24px 0 24px' }}>
          <Tabs variant="platform" items={CLOUD_TABS} activeTab={activeCloud} onTabChange={setActiveCloud} />
        </div>

        {activeCloud !== 'aws' || tackleObject !== 'offers' ? (
          <div style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--color-neutral-50)' }}>
            <WarningIcon size="large" style={{ color: 'var(--color-yellow-40)', marginBottom: '16px' }} />
            <h3 style={{ margin: '0 0 8px 0', color: 'var(--color-neutral-90)' }}>Prototype focus: AWS Marketplace offers</h3>
            <p style={{ margin: 0, fontSize: '14px' }}>
              Select <strong>Offers</strong> and <strong>AWS</strong> to explore the 3-tab field mapper.
            </p>
          </div>
        ) : (
          <>
            {/* Scope 3 — offer type (extra indent vs. the cloud tabs above, matching V1) */}
            <div style={{ padding: '24px 48px 0 48px' }}>
              <Tabs variant="platform" items={OFFER_TABS} activeTab={tab} onTabChange={setTab} />
            </div>

            {/* Draft status — aligns with the level-3 tabs */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '24px 48px 0 48px' }}>
              <Tag color="gray">Draft</Tag>
              <span
                style={{
                  fontFamily: 'var(--font-family-primary)',
                  fontSize: '12px',
                  lineHeight: '20px',
                  color: 'var(--color-neutral-100)'
                }}
              >
                {lastSavedLabel()}
              </span>
            </div>

            {tab === 'listing' ? listingView : offerView}

            {/* Sticky action bar — floats at the bottom of the viewport while scrolling,
                then settles flush into the bottom of the card when you reach the end. */}
            <div
              style={{
                position: 'sticky',
                bottom: 0,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 24px',
                backgroundColor: 'var(--color-neutral-0)',
                borderTop: '1px solid var(--color-neutral-20)',
                borderBottomLeftRadius: 'var(--border-radius-base)',
                borderBottomRightRadius: 'var(--border-radius-base)',
                zIndex: 20
              }}
            >
              <div>
                {tab !== 'listing' && (
                  <Button variant="secondary" size="small" onClick={() => setCopyOpen(true)}>
                    Copy from {sourceLabel}
                  </Button>
                )}
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <Button variant="secondary" size="small">
                  Cancel
                </Button>
                <Button variant="secondary" size="small">
                  Save as draft
                </Button>
                <Button variant="primary" size="small">
                  Publish
                </Button>
              </div>
            </div>
          </>
        )}
      </div>

      {copyDrawer}
    </div>
  );
}
