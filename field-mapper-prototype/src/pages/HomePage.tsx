import { useState } from 'react';
import type { ReactNode, CSSProperties } from 'react';
import {
  Button,
  Alert,
  Banner,
  Checkbox,
  Tag,
  Tabs,
  AWSIcon,
  MicrosoftIcon,
  GoogleIcon,
  CoSellIcon,
  OffersIcon,
  WarningIcon,
  HelpIcon,
  UserGroupIcon,
  ComboBox,
  TextField
} from '@tackle-io/design-system';

// Define Mock Listings grouped by regional account
// Sellers typically maintain one catalog of listings, not a new set per account.
// So every regional account shares the same listing catalog.
const LISTING_CATALOG: Array<{ id: string; name: string; model: 'contract' | 'usage' | 'contract_usage' }> = [
  { id: 'lst-eu-premium', name: 'Hooli Premium', model: 'contract_usage' },
  { id: 'lst-eu-basic', name: 'Hooli Basic', model: 'contract' },
  { id: 'lst-eu-lite', name: 'Hooli Standard API', model: 'usage' },
  { id: 'lst-eu-enterprise', name: 'Hooli Enterprise', model: 'contract_usage' }
];

export const LISTINGS_BY_ACCOUNT: Record<string, Array<{ id: string; name: string; model: 'contract' | 'usage' | 'contract_usage' }>> = {
  eu: LISTING_CATALOG,
  sa: LISTING_CATALOG,
  na: LISTING_CATALOG
};

// Fields that exist on each listing (Registration, Additional, Usage dimensions).
// A field shared by multiple listings uses the SAME `key` on each, so it collapses
// into one shared mapping (see listingsSharingField / the "Common" indicator).
export const LISTING_FIELDS: Record<string, {
  registration: Array<{ key: string; label: string; type: string }>;
  additional: Array<{ key: string; label: string; type: string }>;
  usage: Array<{ key: string; label: string; type: string }>;
}> = {
  // Hooli Premium
  'lst-eu-premium': {
    registration: [
      { key: 'reg_job_title', label: 'Job title', type: 'Text' },
      { key: 'reg_industry', label: 'Industry', type: 'Text' },
      { key: 'reg_company_address', label: 'Company Address', type: 'Text' },
      { key: 'reg_phone_number', label: 'Phone number', type: 'Text' },
      { key: 'reg_existing_customer', label: 'Are you an existing customer?', type: 'Picklist' }
    ],
    additional: [
      { key: 'add_sf_opportunity', label: 'Salesforce opportunity', type: 'Text' },
      { key: 'add_quote_number', label: 'Quote number', type: 'Text' },
      { key: 'add_cppo_partner', label: 'CPPO Partner', type: 'Text' }
    ],
    usage: [
      { key: 'usage_add_charge', label: 'add_charge', type: 'Number' },
      { key: 'usage_api_overage', label: 'api_overage', type: 'Number' }
    ]
  },
  // Hooli Basic
  'lst-eu-basic': {
    registration: [
      { key: 'reg_job_title', label: 'Job title', type: 'Text' },
      { key: 'reg_company_address', label: 'Company Address', type: 'Text' }
    ],
    additional: [
      { key: 'add_sf_opportunity', label: 'Salesforce opportunity', type: 'Text' },
      { key: 'add_quote_number', label: 'Quote number', type: 'Text' }
    ],
    usage: []
  },
  // Hooli Standard API
  'lst-eu-lite': {
    registration: [
      { key: 'reg_job_title', label: 'Job title', type: 'Text' },
      { key: 'reg_industry', label: 'Industry', type: 'Text' },
      { key: 'reg_company_address', label: 'Company Address', type: 'Text' },
      { key: 'reg_phone_number', label: 'Phone number', type: 'Text' }
    ],
    additional: [
      { key: 'add_sf_opportunity', label: 'Salesforce opportunity', type: 'Text' },
      { key: 'add_quote_number', label: 'Quote number', type: 'Text' },
      { key: 'add_cppo_partner', label: 'CPPO Partner', type: 'Text' }
    ],
    usage: [
      { key: 'usage_add_charge', label: 'add_charge', type: 'Number' },
      { key: 'usage_api_overage', label: 'api_overage', type: 'Number' }
    ]
  },
  // Hooli Enterprise
  'lst-eu-enterprise': {
    registration: [
      { key: 'reg_job_title', label: 'Job title', type: 'Text' },
      { key: 'reg_company_address', label: 'Company Address', type: 'Text' },
      { key: 'reg_company_domain', label: 'Company domain', type: 'Text' }
    ],
    additional: [
      { key: 'add_sf_opportunity', label: 'Salesforce opportunity', type: 'Text' },
      { key: 'add_quote_number', label: 'Quote number', type: 'Text' }
    ],
    usage: [
      { key: 'usage_add_charge', label: 'add_charge', type: 'Number' },
      { key: 'usage_data_egress', label: 'data_egress', type: 'Number' }
    ]
  }
};

// ComboBox renders its `value` string directly in the input, so every option's
// value is its own display label.
const asOptions = (labels: string[]) => labels.map((label) => ({ value: label, label }));

export const SF = {
  awsId: 'Opportunity > AWS ID',
  accountName: 'Opportunity > Account > Account Name',
  contactRoles: 'Opportunity > OpportunityContactRoles',
  contactName: 'OpportunityContactRole > Contact > Full Name',
  contactEmail: 'OpportunityContactRole > Contact > Email',
  contactTitle: 'OpportunityContactRole > Contact > Title',
  expiration: 'Opportunity > Private Offer Expiration Date',
  startDate: 'Opportunity > Start Date',
  endDate: 'Opportunity > End Date',
  quoteLineItems: 'Opportunity > Quote > QuoteLineItems',
  salesRep: 'SF_Sales_Rep__c (Text)',
  oppId: 'SF_Opportunity_ID__c (Text)',
  companySize: 'SF_Company_Size__c (Picklist)',
  billingEmail: 'SF_Billing_Email__c (Email)',
  phone: 'SF_Phone__c (Phone)',
  productionTier: 'SF_Production_Tier__c (Text)',
  dataIngested: 'SF_Data_Ingested__c (Number)',
  apiCalls: 'SF_API_Calls_Volume__c (Number)',
  activeUsers: 'SF_Active_Users__c (Number)',
  seatsPurchased: 'SF_Seats_Purchased__c (Number)',
  sandboxId: 'SF_Sandbox_ID__c (Text)'
};

export const SALESFORCE_FIELDS = asOptions(Object.values(SF));

const SF_CONTACT_OBJECT_OPTIONS = asOptions([SF.contactRoles]);

const SF_LINE_ITEM_OBJECT_OPTIONS = asOptions([SF.quoteLineItems]);

// "Last saved" always reads as yesterday, e.g. "Last saved 7/27/2026 10:01:01 EST"
const lastSavedLabel = () => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const date = `${yesterday.getMonth() + 1}/${yesterday.getDate()}/${yesterday.getFullYear()}`;
  return `Last saved ${date} 10:01:01 EST`;
};

// Default-value picklists for the renewal fields
const RENEWAL_OPTIONS = asOptions(['Yes', 'No']);
const RENEWAL_TYPE_OPTIONS = asOptions(['Auto-renew', 'Manual renewal', 'Do not renew']);

// Default-value picklists for the product & pricing header fields
const LISTING_DEFAULT_OPTIONS = asOptions([
  'Tackle Cloud GTM Platform',
  'SaaS Premium Listing',
  'Enterprise Cloud Platform'
]);
const PAYMENT_MODEL_OPTIONS = asOptions(['Paid upfront', 'Payment schedule', 'Usage-based']);
const CONTRACT_START_OPTIONS = asOptions(['On offer acceptance', 'On subscription', 'Custom date']);
const CURRENCY_OPTIONS = asOptions(['USD', 'EUR', 'GBP', 'JPY']);

// Tab sets mirroring the nested tab hierarchy in the design
const ACCOUNT_SETTINGS_TABS = [
  { id: 'subscription', label: 'Subscription' },
  { id: 'preferences', label: 'Preferences' },
  { id: 'marketplace', label: 'Marketplace' },
  { id: 'cosell', label: 'Co-Sell' },
  { id: 'field-mapper', label: 'Field mapper' },
  { id: 'm2m', label: 'M2M apps' }
];

const TACKLE_OBJECT_TABS = [
  { id: 'cosell', label: 'Co-Sell', icon: <CoSellIcon size="small" /> },
  { id: 'offers', label: 'Offers', icon: <OffersIcon size="small" /> }
];

const CLOUD_TABS = [
  { id: 'aws', label: 'AWS', icon: <AWSIcon size="small" /> },
  { id: 'azure', label: 'Microsoft', icon: <MicrosoftIcon size="small" /> },
  { id: 'gcp', label: 'Google', icon: <GoogleIcon size="small" /> }
];

const OFFER_TYPE_TABS = [
  { id: 'direct', label: 'Direct offer' },
  { id: 'partner', label: 'Partner offer' }
];

/* -------------------------------------------------------------------------- */
/* Data table primitives — 240 / 128 / fluid / 240 column grid from the design */
/* -------------------------------------------------------------------------- */

const COL_FIELD: CSSProperties = { flex: '0 0 240px', minWidth: '240px' };
const COL_TYPE: CSSProperties = { flex: '0 0 128px', minWidth: '128px' };
const COL_SALESFORCE: CSSProperties = { flex: '1 1 432px', minWidth: '280px' };
const COL_DEFAULT: CSSProperties = { flex: '0 0 240px', minWidth: '200px' };

const CELL_PADDING = '8px 16px';

const FIELD_LABEL_STYLE: CSSProperties = {
  fontFamily: 'var(--font-family-primary)',
  fontSize: '12px',
  fontWeight: 700,
  lineHeight: '20px',
  color: 'var(--Neutral-Neutral-70)'
};

const SECTION_TITLE_STYLE: CSSProperties = {
  margin: '0 0 16px 0',
  fontFamily: 'var(--font-family-primary)',
  fontSize: '16px',
  fontWeight: 700,
  lineHeight: '24px',
  color: 'var(--color-neutral-100)'
};

const SUBSECTION_TITLE_STYLE: CSSProperties = {
  margin: '0 0 4px 0',
  fontFamily: 'var(--font-family-primary)',
  fontSize: '16px',
  fontWeight: 400,
  lineHeight: '24px',
  color: 'var(--color-neutral-70)'
};

const HELP_TEXT_STYLE: CSSProperties = {
  margin: '0 0 8px 0',
  fontFamily: 'var(--font-family-primary)',
  fontSize: '12px',
  fontWeight: 400,
  lineHeight: '20px',
  color: 'var(--color-neutral-70)'
};

const ColumnHeaders = ({ fieldColumnLabel = 'Field' }: { fieldColumnLabel?: string }) => {
  const cell: CSSProperties = {
    fontFamily: 'var(--font-family-primary)',
    fontSize: '16px',
    fontWeight: 700,
    lineHeight: '24px',
    color: 'var(--color-neutral-100)',
    padding: '8px 16px'
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', minHeight: '40px', backgroundColor: 'var(--color-neutral-20)' }}>
      <div style={{ ...COL_FIELD, ...cell }}>{fieldColumnLabel}</div>
      <div style={{ ...COL_TYPE, ...cell }}>Type</div>
      <div style={{ ...COL_SALESFORCE, ...cell }}>Salesforce field</div>
      <div style={{ ...COL_DEFAULT, ...cell }}>Default value</div>
    </div>
  );
};

// One mapping row: label, data type tag, Salesforce target, default value
export const Row = ({
  label,
  type,
  align = 'center',
  children,
  defaultValue
}: {
  label: ReactNode;
  type?: string;
  align?: 'center' | 'flex-start';
  children?: ReactNode;
  defaultValue?: ReactNode;
}) => (
  <div style={{ display: 'flex', alignItems: align, minHeight: '56px' }}>
    <div style={{ ...COL_FIELD, padding: CELL_PADDING, display: 'flex', alignItems: 'center', minHeight: '40px' }}>
      {typeof label === 'string' ? <span style={FIELD_LABEL_STYLE}>{label}</span> : label}
    </div>
    <div style={{ ...COL_TYPE, padding: CELL_PADDING, display: 'flex', alignItems: 'center', minHeight: '40px' }}>
      {type ? <Tag color="gray">{type}</Tag> : null}
    </div>
    <div style={{ ...COL_SALESFORCE, padding: CELL_PADDING, display: 'flex', flexDirection: 'column' }}>{children}</div>
    <div
      className="fm-default-cell"
      style={{ ...COL_DEFAULT, padding: CELL_PADDING, display: 'flex', alignItems: 'center', minHeight: '40px' }}
    >
      {defaultValue}
    </div>
  </div>
);

// A titled block of mapping rows. Sections are separated by rules, not by cards.
export const Section = ({
  title,
  description,
  fieldColumnLabel,
  last = false,
  children
}: {
  title: string;
  description?: string;
  fieldColumnLabel?: string;
  last?: boolean;
  children: ReactNode;
}) => (
  <div
    style={{
      paddingBottom: '24px',
      marginBottom: '24px',
      borderBottom: last ? 'none' : '1px solid var(--color-neutral-20)'
    }}
  >
    <h2 style={{ ...SECTION_TITLE_STYLE, marginBottom: description ? '4px' : '16px' }}>{title}</h2>
    {description ? <p style={{ ...HELP_TEXT_STYLE, marginBottom: '16px' }}>{description}</p> : null}
    <ColumnHeaders fieldColumnLabel={fieldColumnLabel} />
    {children}
  </div>
);

const SubSection = ({
  title,
  description,
  children
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) => (
  <div style={{ marginTop: '24px' }}>
    <h3 style={SUBSECTION_TITLE_STYLE}>{title}</h3>
    {description ? <p style={HELP_TEXT_STYLE}>{description}</p> : null}
    {children}
  </div>
);

export const DefaultValueInput = ({
  value,
  onChange,
  placeholder
}: {
  value: string;
  onChange: (next: string) => void;
  placeholder: string;
}) => (
  <input
    type="text"
    className="fm-default-input"
    value={value}
    placeholder={placeholder}
    onChange={(e) => onChange(e.target.value)}
    style={{
      width: '100%',
      height: '40px',
      padding: '8px 12px',
      borderRadius: '4px',
      border: '1px solid var(--color-neutral-40)',
      fontFamily: 'var(--font-family-primary)',
      fontSize: '14px',
      lineHeight: '22px',
      color: 'var(--color-neutral-100)',
      boxSizing: 'border-box'
    }}
  />
);

export function HomePage() {
  // Top level settings tab state
  const [activeTab, setActiveTab] = useState('field-mapper');

  // The account whose listing catalog is being mapped (fixed for this prototype)
  const [activeAccount] = useState('eu');

  // Sub-selectors (Tackle Object, Cloud, Offer type)
  const [tackleObject, setTackleObject] = useState('offers');
  const [activeCloud, setActiveCloud] = useState('aws');
  const [offerType, setOfferType] = useState('direct');

  // Active Listing Selector (The Single Driver of Zone 2)
  const listingsForAccount = LISTINGS_BY_ACCOUNT[activeAccount] || [];
  const [activeListingId, setActiveListingId] = useState(listingsForAccount[0]?.id || '');

  // Track Salesforce custom text dynamic template mode
  const [offerNameTemplate, setOfferNameTemplate] = useState('{Opportunity > Account > Account Name} Private Offer');
  const [offerDescriptionTemplate, setOfferDescriptionTemplate] = useState('');

  // Active mapping state to demonstrate updates (Tiers 1 & 2 are global!)
  const [mappings, setMappings] = useState<Record<string, string>>({
    // Account-wide structural mappings
    aws_account_id: SF.awsId,
    company_name: SF.accountName,
    buyer_contact_obj: SF.contactRoles,
    contact_fullname: SF.contactName,
    contact_email: SF.contactEmail,
    contact_title: SF.contactTitle,
    deadline: SF.expiration,
    currency: SF.awsId,

    start_date: SF.startDate,
    end_date: SF.endDate,
    usage_end_date: SF.endDate,
    new_service_end_date: SF.endDate,

    payment_schedule_obj: SF.quoteLineItems,
    invoice_date: SF.startDate,
    payment_amt: SF.expiration,

    contract_dimension_obj: SF.quoteLineItems,
    contract_dimension_field: SF.awsId,
    contract_api_name: SF.accountName,
    contract_quantity: SF.expiration,
    contract_price_per: SF.startDate,

    usage_dimension_obj: SF.quoteLineItems,
    usage_sku: SF.accountName,
    usage_desc: SF.expiration,
    usage_fee: SF.startDate,

    // Listing-unique mappings
    sales_rep: SF.salesRep,
    opportunity_id: SF.oppId,
    company_size: SF.companySize,
    billing_contact: SF.billingEmail,
    phone_number: SF.phone,
    production_tier: SF.productionTier,
    data_ingestion: SF.dataIngested,
    api_calls: SF.apiCalls,
    active_users: SF.activeUsers,
    seat_count: SF.seatsPurchased,
    sandbox_id: SF.sandboxId,
  });

  // Default values mapping for specific keys
  const [defaultValues, setDefaultValues] = useState<Record<string, string>>({
    aws_account_id: '',
    company_name: '',
    contact_fullname: '',
    contact_email: '',
    contact_title: '',
    deadline: '',
    sales_rep: '',
    opportunity_id: '',
    company_size: '100-500',
    billing_contact: 'billing@finance.com',
    phone_number: '',
    production_tier: 'Enterprise Suite',
    data_ingestion: '10',
    api_calls: '100000',
    active_users: '250',
    seat_count: '5',
    sandbox_id: 'DEV-ENV-99'
  });

  // Track checked state for propagation checkboxes
  const [propagationChecked, setPropagationChecked] = useState<Record<string, boolean>>({
    sales_rep: true,
    opportunity_id: true,
    company_size: true,
    billing_contact: true,
    phone_number: true,
    data_ingestion: true,
    api_calls: true,
    active_users: true
  });

  // Notification Banner
  const [saveAlert, setSaveAlert] = useState<{ show: boolean; msg: string; type: 'success' | 'info' } | null>(null);

  // Active Tooltip for listing unique fields
  const [hoveredField, setHoveredField] = useState<string | null>(null);

  const handleListingChange = (listingName: string) => {
    const listing = listingsForAccount.find((list) => list.name === listingName);
    if (listing) setActiveListingId(listing.id);
  };

  // A field is "common" when it also exists on OTHER listings in the ISV's
  // listing catalog (the same set shown in the Listing menu). We derive the
  // shared listings from that catalog so the "Common" tag/tooltip and the
  // propagation checkbox always stay in sync with the listings menu.
  const listingsSharingField = (fieldKey: string): string[] =>
    listingsForAccount
      .filter((list) => list.id !== activeListingId)
      .filter((list) => {
        const fields = LISTING_FIELDS[list.id];
        if (!fields) return false;
        return [...fields.registration, ...fields.additional, ...fields.usage].some(
          (row) => row.key === fieldKey
        );
      })
      .map((list) => list.name.replace(/\s*\(.*\)\s*$/, ''));

  // Save changes handler
  const handleSave = () => {
    let propagatedFields: string[] = [];

    // Analyze how many other listings would be impacted based on checked propagation items
    const activeFields = LISTING_FIELDS[activeListingId] || { registration: [], additional: [], usage: [] };
    const allListingUniqueRows = [...activeFields.registration, ...activeFields.additional, ...activeFields.usage];

    allListingUniqueRows.forEach(field => {
      if (propagationChecked[field.key] && listingsSharingField(field.key).length > 0) {
        propagatedFields.push(field.label);
      }
    });

    const activeList = listingsForAccount.find(l => l.id === activeListingId);
    const listingNameShort = activeList ? activeList.name.split(' (')[0] : 'Selected Listing';

    if (propagatedFields.length > 0) {
      setSaveAlert({
        show: true,
        type: 'success',
        msg: `Successfully saved mappings for "${listingNameShort}". Structural changes apply globally, and listing-specific defaults [${propagatedFields.join(', ')}] were successfully propagated to other active listings across your regional accounts (Europe, South America, and North America).`
      });
    } else {
      setSaveAlert({
        show: true,
        type: 'info',
        msg: `Successfully saved mappings. Global structures and "${listingNameShort}" defaults were saved. No custom value propagation was performed.`
      });
    }

    // Scroll to top of the content area to show the notification
    window.scrollTo({ top: 0, behavior: 'smooth' });

    setTimeout(() => {
      setSaveAlert(null);
    }, 9000);
  };

  // A structural mapping row: mapped once, applies to every listing in the account.
  // `defaultCell` controls the Default value column:
  //  - 'input' → editable global default (the norm)
  //  - 'none'  → the field has no default value
  const renderStructuralRow = (
    fieldKey: string,
    fieldLabel: string,
    fieldType: string,
    defaultCell: 'input' | 'none' = 'input',
    defaultPlaceholder: string = 'Set global default'
  ) => (
    <Row
      key={fieldKey}
      label={fieldLabel}
      type={fieldType}
      defaultValue={
        defaultCell === 'none' ? null : (
          <DefaultValueInput
            value={defaultValues[fieldKey] || ''}
            onChange={(next) => setDefaultValues({ ...defaultValues, [fieldKey]: next })}
            placeholder={defaultPlaceholder}
          />
        )
      }
    >
      <ComboBox
        options={SALESFORCE_FIELDS}
        value={mappings[fieldKey] || ''}
        onChange={(val) => setMappings({ ...mappings, [fieldKey]: val })}
        placeholder="Choose a field"
        className="w-full"
      />
    </Row>
  );

  // A picklist row whose default value is itself a picklist (ComboBox), e.g. the
  // product & pricing header fields.
  const renderPicklistRow = (
    fieldKey: string,
    fieldLabel: string,
    defaultOptions: Array<{ value: string; label: string }>
  ) => (
    <Row
      key={fieldKey}
      label={fieldLabel}
      type="Picklist"
      defaultValue={
        <ComboBox
          options={defaultOptions}
          value={mappings[`${fieldKey}_default`] || ''}
          onChange={(val) => setMappings({ ...mappings, [`${fieldKey}_default`]: val })}
          placeholder="Select a value"
          className="w-full"
        />
      }
    >
      <ComboBox
        options={SALESFORCE_FIELDS}
        value={mappings[fieldKey] || ''}
        onChange={(val) => setMappings({ ...mappings, [fieldKey]: val })}
        placeholder="Choose a field"
        className="w-full"
      />
    </Row>
  );

  // A list-backed field needs its parent Salesforce object chosen before its
  // children can be mapped, so the row carries no data type of its own.
  const renderParentObjectRow = (
    fieldKey: string,
    fieldLabel: string,
    options: Array<{ value: string; label: string }>
  ) => (
    <Row key={fieldKey} label={fieldLabel}>
      <ComboBox
        options={options}
        value={mappings[fieldKey] || ''}
        onChange={(val) => setMappings({ ...mappings, [fieldKey]: val })}
        placeholder="Choose an object"
        className="w-full"
      />
    </Row>
  );

  // A listing-unique row: values and defaults come from the selected listing
  const renderListingValueRow = (
    fieldKey: string,
    fieldLabel: string,
    fieldType: string
  ) => {
    const commonWith = listingsSharingField(fieldKey);
    const label = (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
        <span style={FIELD_LABEL_STYLE}>{fieldLabel}</span>

        {commonWith.length > 0 && (
          <div
            style={{ display: 'inline-flex', alignItems: 'center', cursor: 'pointer', position: 'relative' }}
            onMouseEnter={() => setHoveredField(fieldKey)}
            onMouseLeave={() => setHoveredField(null)}
          >
            <span
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '2px',
                fontSize: '10px',
                fontWeight: 600,
                padding: '1px 6px',
                borderRadius: '10px',
                backgroundColor: '#1fadad',
                color: 'var(--color-neutral-0)'
              }}
            >
              <UserGroupIcon size={10} />
              Common
            </span>

            {hoveredField === fieldKey && (
              <div
                style={{
                  position: 'absolute',
                  bottom: '24px',
                  left: 0,
                  width: '280px',
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
                <div style={{ fontWeight: 700, marginBottom: '4px' }}>Shared listing field</div>
                <p style={{ margin: '0 0 4px 0', color: 'var(--color-neutral-40)' }}>
                  Tackle also has this field on these listings:
                </p>
                <ul style={{ margin: 0, paddingLeft: '16px' }}>
                  {commonWith.map((listName) => (
                    <li key={listName}>{listName}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    );

    return (
      <div key={fieldKey}>
        <Row
          label={label}
          type={fieldType}
          defaultValue={
            <DefaultValueInput
              value={defaultValues[fieldKey] || ''}
              onChange={(next) => setDefaultValues({ ...defaultValues, [fieldKey]: next })}
              placeholder="Enter default value"
            />
          }
        >
          <ComboBox
            options={SALESFORCE_FIELDS}
            value={mappings[fieldKey] || ''}
            onChange={(val) => setMappings({ ...mappings, [fieldKey]: val })}
            placeholder="Choose a field"
            className="w-full"
          />
        </Row>

        {/* Aligned to the Salesforce field column: 240px + 128px */}
        {commonWith.length > 0 && (
          <div style={{ paddingLeft: '368px', paddingBottom: '8px' }}>
            <Checkbox
              label={`Apply this Salesforce mapping to the ${commonWith.length} other ${
                commonWith.length === 1 ? 'listing' : 'listings'
              } sharing this field`}
              checked={!!propagationChecked[fieldKey]}
              onChange={() =>
                setPropagationChecked({ ...propagationChecked, [fieldKey]: !propagationChecked[fieldKey] })
              }
            />
          </div>
        )}
      </div>
    );
  };

  const activeListingDetails = listingsForAccount.find(l => l.id === activeListingId);
  const pricingModel = activeListingDetails?.model || 'contract_usage';
  const activeFields = LISTING_FIELDS[activeListingId] || { registration: [], additional: [], usage: [] };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px' }}>
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
      <Tabs variant="platform" items={ACCOUNT_SETTINGS_TABS} activeTab={activeTab} onTabChange={setActiveTab} />

      {activeTab !== 'field-mapper' ? (
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
            This tab is simulated as page framing. Switch back to <strong>Field mapper</strong> to explore the prototype.
          </p>
          <Button variant="secondary" style={{ marginTop: '16px' }} onClick={() => setActiveTab('field-mapper')}>
            Back to Field mapper
          </Button>
        </div>
      ) : (
        <>
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
              <Alert
                variant={saveAlert.type}
                title={saveAlert.type === 'success' ? 'Changes saved and applied' : 'Changes saved'}
                description={saveAlert.msg}
              />
            </div>
          )}

          {/* ==================================================================== */}
          {/* One content surface. Every level of scope is a tab, not a new card.  */}
          {/* ==================================================================== */}
          <div
            style={{
              backgroundColor: 'var(--color-neutral-0)',
              borderRadius: 'var(--border-radius-base)',
              border: '1px solid var(--color-neutral-20)',
              boxShadow: 'var(--elevation-100)',
              overflow: 'hidden'
            }}
          >
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
                <Tabs
                  variant="platform"
                  items={TACKLE_OBJECT_TABS}
                  activeTab={tackleObject}
                  onTabChange={setTackleObject}
                />
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
                    Additional fields not used by your cloud partners are required by Tackle for sending order
                    notifications
                  </li>
                </ul>
              </Banner>
            </div>

            {/* Scope 2 — cloud */}
            <div style={{ padding: '24px 24px 0 24px' }}>
              <Tabs variant="platform" items={CLOUD_TABS} activeTab={activeCloud} onTabChange={setActiveCloud} />

              {activeCloud !== 'aws' || tackleObject !== 'offers' ? (
                <div style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--color-neutral-50)' }}>
                  <WarningIcon size="large" style={{ color: 'var(--color-yellow-40)', marginBottom: '16px' }} />
                  <h3 style={{ margin: '0 0 8px 0', color: 'var(--color-neutral-90)' }}>
                    Prototype focus: AWS Marketplace offers
                  </h3>
                  <p style={{ margin: 0, fontSize: '14px' }}>
                    Select <strong>Offers</strong> and <strong>AWS</strong> to explore the listing-driven field mapper.
                  </p>
                </div>
              ) : (
                /* Scope 3 — offer type */
                <div style={{ padding: '24px 24px 0 24px' }}>
                  <Tabs variant="platform" items={OFFER_TYPE_TABS} activeTab={offerType} onTabChange={setOfferType} />

                  {/* Draft status */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '24px 0' }}>
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

                  {/* ---------------------------------------------------------- */}
                  {/* Account-wide sections: mapped once, used by every listing  */}
                  {/* ---------------------------------------------------------- */}

                  <Section title="Buyer fields">
                    {renderStructuralRow('aws_account_id', 'AWS account ID', 'Text', 'none')}
                    {renderStructuralRow('company_name', 'Company name', 'Text', 'none')}

                    <SubSection
                      title="Buyer contact fields"
                      description="Map the contact details of your buyer. This field can contain multiple items. Select the Salesforce object that stores it, and then map the fields below."
                    >
                      {renderParentObjectRow(
                        'buyer_contact_obj',
                        'Salesforce object for buyer contact',
                        SF_CONTACT_OBJECT_OPTIONS
                      )}
                      {renderStructuralRow('contact_fullname', 'Full name', 'Text', 'none')}
                      {renderStructuralRow('contact_email', 'Email', 'Text', 'none')}
                      {renderStructuralRow('contact_title', 'Title', 'Text', 'none')}
                    </SubSection>
                  </Section>

                  <Section title="Offer fields">
                    <Row
                      label="Offer name"
                      type="Text"
                      align="flex-start"
                    >
                      <TextField
                        multiline
                        rows={2}
                        value={offerNameTemplate}
                        onChange={(e) => setOfferNameTemplate(e.target.value)}
                        placeholder="Type @ to add dynamic fields."
                        helperText="Text mode enabled. Use the '@' key to switch to Salesforce lookup mode to add dynamic fields."
                      />
                    </Row>

                    <Row
                      label="Offer description"
                      type="Text"
                      align="flex-start"
                    >
                      <TextField
                        multiline
                        rows={2}
                        value={offerDescriptionTemplate}
                        onChange={(e) => setOfferDescriptionTemplate(e.target.value)}
                        placeholder="Type @ to add dynamic fields."
                        helperText="Text mode enabled. Use the '@' key to switch to Salesforce lookup mode to add dynamic fields."
                      />
                    </Row>

                    <Row
                      label="Renewal"
                      type="Picklist"
                      defaultValue={
                        <ComboBox
                          options={RENEWAL_OPTIONS}
                          value={mappings.renewal_default || ''}
                          onChange={(val) => setMappings({ ...mappings, renewal_default: val })}
                          placeholder="Set default value"
                          className="w-full"
                        />
                      }
                    >
                      <ComboBox
                        options={SALESFORCE_FIELDS}
                        value={mappings.renewal || ''}
                        onChange={(val) => setMappings({ ...mappings, renewal: val })}
                        placeholder="Choose a field"
                        className="w-full"
                      />
                    </Row>

                    <Row
                      label="Renewal type"
                      type="Picklist"
                      defaultValue={
                        <ComboBox
                          options={RENEWAL_TYPE_OPTIONS}
                          value={mappings.renewal_type_default || ''}
                          onChange={(val) => setMappings({ ...mappings, renewal_type_default: val })}
                          placeholder="Set default value"
                          className="w-full"
                        />
                      }
                    >
                      <ComboBox
                        options={SALESFORCE_FIELDS}
                        value={mappings.renewal_type || ''}
                        onChange={(val) => setMappings({ ...mappings, renewal_type: val })}
                        placeholder="Choose a field"
                        className="w-full"
                      />
                    </Row>

                    {renderStructuralRow('deadline', 'Offer acceptance deadline', 'Text', 'none')}

                    <SubSection title="Buyer country availability">
                      <Row
                        label="Country codes"
                        type="Text"
                        align="flex-start"
                        defaultValue={
                          <TextField
                            value={defaultValues.country_codes || ''}
                            onChange={(e) => setDefaultValues({ ...defaultValues, country_codes: e.target.value })}
                            placeholder="Enter values, hit enter to add a value"
                            helperText="Press Enter to add each value"
                          />
                        }
                      >
                        <ComboBox
                          options={SALESFORCE_FIELDS}
                          value={mappings.country_codes || ''}
                          onChange={(val) => setMappings({ ...mappings, country_codes: val })}
                          placeholder="Choose a field"
                          className="w-full"
                        />
                      </Row>
                    </SubSection>
                  </Section>

                  <Section title="Product and pricing fields">
                    {renderPicklistRow('listing', 'Listing', LISTING_DEFAULT_OPTIONS)}
                    {renderPicklistRow('payment_model', 'Payment model', PAYMENT_MODEL_OPTIONS)}
                    {renderPicklistRow('contract_start', 'Contract start', CONTRACT_START_OPTIONS)}
                    {renderPicklistRow('currency', 'Currency', CURRENCY_OPTIONS)}

                    <SubSection
                      title="Start on acceptance fields"
                      description="For contracts starting when your buyer accepts the private offer."
                    >
                      <Row
                        label="Offer duration"
                        type="Text"
                        defaultValue={
                          <DefaultValueInput
                            value={defaultValues.offer_duration || ''}
                            onChange={(next) => setDefaultValues({ ...defaultValues, offer_duration: next })}
                            placeholder="Enter a value"
                          />
                        }
                      >
                        <ComboBox
                          options={SALESFORCE_FIELDS}
                          value={mappings.offer_duration || ''}
                          onChange={(val) => setMappings({ ...mappings, offer_duration: val })}
                          placeholder="Choose a field"
                          className="w-full"
                        />
                      </Row>
                    </SubSection>

                    <SubSection
                      title="Future dated fields"
                      description="For contracts starting and ending on the dates you define in the private offer."
                    >
                      {renderStructuralRow('start_date', 'Start date', 'Text', 'none')}
                      {renderStructuralRow('end_date', 'End date', 'Text', 'none')}
                    </SubSection>

                    <SubSection
                      title="Contract dimensions"
                      description="Each AWS private offer can have one or more dimensions. This field can contain multiple items. Select the Salesforce object that stores it, and then map the fields below."
                    >
                      {renderParentObjectRow(
                        'contract_dimension_obj',
                        'Salesforce object for contract dimensions',
                        SF_LINE_ITEM_OBJECT_OPTIONS
                      )}
                      {renderStructuralRow('contract_dimension_field', 'Dimension', 'Text', 'input', 'Enter a value')}
                      {renderStructuralRow('contract_api_name', 'API name', 'Text', 'input', 'Enter a value')}
                      {renderStructuralRow('contract_quantity', 'Quantity', 'Number', 'input', 'Enter a value')}
                      {renderStructuralRow('contract_price_per', 'Price per unit', 'Number', 'none')}
                    </SubSection>

                    <SubSection
                      title="Payment schedule"
                      description="This payment model lets buyers pay in installments throughout the course of their contract. This field can contain multiple items. Select the Salesforce object that stores it, and then map the fields below."
                    >
                      {renderParentObjectRow(
                        'payment_schedule_obj',
                        'Salesforce object for payment schedule',
                        SF_LINE_ITEM_OBJECT_OPTIONS
                      )}
                      {renderStructuralRow('invoice_date', 'Invoice date', 'Text', 'none')}
                      {renderStructuralRow('payment_amt', 'Payment amount', 'Text', 'none')}
                    </SubSection>

                    <SubSection
                      title="Usage only"
                      description="For contracts that will bill buyers on their usage only."
                    >
                      {renderStructuralRow('usage_end_date', 'Usage end date', 'Text', 'none')}
                    </SubSection>

                    <SubSection
                      title="Amendments"
                      description="For contracts that are being amended."
                    >
                      {renderStructuralRow('new_service_end_date', 'New service end date', 'Text', 'none')}
                    </SubSection>

                    <SubSection
                      title="Usage dimensions"
                      description="Each AWS private offer can have one or more usage dimensions. This field can contain multiple items. Select the Salesforce object that stores it, and then map the fields below."
                    >
                      {renderParentObjectRow(
                        'usage_dimension_obj',
                        'Salesforce object for usage dimensions',
                        SF_LINE_ITEM_OBJECT_OPTIONS
                      )}
                      {renderStructuralRow('usage_sku', 'Dimension', 'Picklist', 'none')}
                      {renderStructuralRow('usage_desc', 'Description', 'Text', 'none')}
                      {renderStructuralRow('usage_fee', 'Fee amount', 'Number', 'none')}
                    </SubSection>
                  </Section>

                  <Section title="End user license agreement fields">
                    {renderStructuralRow('eula_version', 'EULA version', 'Picklist')}
                  </Section>

                  <Section title="Notify users">
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
                      <ComboBox
                        options={SALESFORCE_FIELDS}
                        value={mappings.notify_emails || ''}
                        onChange={(val) => setMappings({ ...mappings, notify_emails: val })}
                        placeholder="Choose a field"
                        className="w-full"
                      />
                    </Row>
                  </Section>

                  {/* ---------------------------------------------------------- */}
                  {/* Listing-specific sections: driven by the selected listing  */}
                  {/* ---------------------------------------------------------- */}

                  <div style={{ paddingBottom: '24px', marginBottom: '24px', borderBottom: '1px solid var(--color-neutral-20)' }}>
                    <h2 style={SECTION_TITLE_STYLE}>Product listing</h2>
                    <p style={HELP_TEXT_STYLE}>
                      Registration, additional, and usage dimension fields are defined on each listing. Choose a listing
                      to map the fields it actually has.
                    </p>

                    <Row
                      label="Listing"
                      defaultValue={
                        <Tag color="blue">
                          {pricingModel === 'contract_usage'
                            ? 'Contract + usage'
                            : pricingModel === 'contract'
                            ? 'Contract only'
                            : 'Usage only'}
                        </Tag>
                      }
                    >
                      <ComboBox
                        options={asOptions(listingsForAccount.map((list) => list.name))}
                        value={activeListingDetails?.name || ''}
                        onChange={handleListingChange}
                        placeholder="Choose a listing"
                        className="w-full"
                      />
                    </Row>
                  </div>

                  {activeFields.registration.length > 0 && (
                    <Section
                      title="Registration fields"
                      description="Buyers complete these fields on the Tackle registration page for this listing."
                      fieldColumnLabel="Listing field"
                    >
                      {activeFields.registration.map((field) =>
                        renderListingValueRow(field.key, field.label, field.type)
                      )}
                    </Section>
                  )}

                  <Section
                    title="Additional fields"
                    description="Your sellers fill in these fields on the offer to support your own bookkeeping."
                    fieldColumnLabel="Listing field"
                  >
                    <Row
                      label="Marketplace fee"
                      type="Text"
                      defaultValue={
                        <DefaultValueInput
                          value={defaultValues.marketplace_fee || ''}
                          onChange={(next) => setDefaultValues({ ...defaultValues, marketplace_fee: next })}
                          placeholder="Enter a value"
                        />
                      }
                    >
                      <ComboBox
                        options={SALESFORCE_FIELDS}
                        value={mappings.marketplace_fee || ''}
                        onChange={(val) => setMappings({ ...mappings, marketplace_fee: val })}
                        placeholder="Choose a field"
                        className="w-full"
                      />
                    </Row>

                    {activeFields.additional.map((field) =>
                      renderListingValueRow(field.key, field.label, field.type)
                    )}
                  </Section>

                  {activeFields.usage.length > 0 && (
                    <Section
                      title="Usage dimension fields"
                      description="These dimensions come from the marketplace listing itself."
                      fieldColumnLabel="Listing field"
                      last
                    >
                      {activeFields.usage.map((field) =>
                        renderListingValueRow(field.key, field.label, field.type)
                      )}
                    </Section>
                  )}

                  {activeFields.registration.length === 0 &&
                    activeFields.additional.length === 0 &&
                    activeFields.usage.length === 0 && (
                      <div
                        style={{
                          padding: '24px',
                          marginBottom: '24px',
                          textAlign: 'center',
                          fontSize: '14px',
                          color: 'var(--color-neutral-50)'
                        }}
                      >
                        {activeListingDetails ? activeListingDetails.name.split(' (')[0] : 'This listing'} has no
                        registration, additional, or usage dimension fields.
                      </div>
                    )}

                  {/* Actions */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', padding: '0 0 32px 0' }}>
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
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
