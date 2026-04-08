import type { EntityDefinition, FieldRuleDefinition, PageDefinition, CellManifestV1 } from '@ikary/cell-contract-core';
import { SUPPORT_CELL_MANIFEST } from '../../sample-manifests/support-cell';

// Flat array of FieldRuleDefinition — the wrapper groups by field and builds the entity.
// This sample covers all 10 FieldRuleType values across 18 fields with varied
// clientSafe / blocking / severity combinations to showcase the full rule surface.
const VALIDATION_SAMPLE: FieldRuleDefinition[] = [
  // ── username ── required + min + max + regex ───────────────────────────────
  {
    ruleId: 'user/username-required@1',
    type: 'required',
    field: 'username',
    messageKey: 'user.username.required',
    defaultMessage: 'Username is required.',
    clientSafe: true,
    blocking: true,
    severity: 'error',
  },
  {
    ruleId: 'user/username-min@1',
    type: 'min_length',
    field: 'username',
    messageKey: 'user.username.min',
    defaultMessage: 'Username must be at least 3 characters.',
    params: { min: 3 },
    clientSafe: true,
    blocking: true,
    severity: 'error',
  },
  {
    ruleId: 'user/username-max@1',
    type: 'max_length',
    field: 'username',
    messageKey: 'user.username.max',
    defaultMessage: 'Username must be at most 32 characters.',
    params: { max: 32 },
    clientSafe: true,
    blocking: true,
    severity: 'error',
  },
  {
    ruleId: 'user/username-slug@1',
    type: 'regex',
    field: 'username',
    messageKey: 'user.username.slug',
    defaultMessage: 'Username may only contain letters, numbers, hyphens, and underscores.',
    params: { pattern: '^[a-zA-Z0-9_-]+$' },
    clientSafe: true,
    blocking: true,
    severity: 'error',
  },

  // ── email ── required + email format ──────────────────────────────────────
  {
    ruleId: 'user/email-required@1',
    type: 'required',
    field: 'email',
    messageKey: 'user.email.required',
    defaultMessage: 'Email address is required.',
    clientSafe: true,
    blocking: true,
    severity: 'error',
  },
  {
    ruleId: 'user/email-format@1',
    type: 'email',
    field: 'email',
    messageKey: 'user.email.format',
    defaultMessage: 'Must be a valid email address.',
    clientSafe: true,
    blocking: true,
    severity: 'error',
  },
  {
    ruleId: 'user/email-max@1',
    type: 'max_length',
    field: 'email',
    messageKey: 'user.email.max',
    defaultMessage: 'Email address must not exceed 254 characters.',
    params: { max: 254 },
    clientSafe: true,
    blocking: false,
    severity: 'warning',
  },

  // ── password ── required + min + regex (strength) ─────────────────────────
  {
    ruleId: 'user/password-required@1',
    type: 'required',
    field: 'password',
    messageKey: 'user.password.required',
    defaultMessage: 'Password is required.',
    clientSafe: true,
    blocking: true,
    severity: 'error',
  },
  {
    ruleId: 'user/password-min@1',
    type: 'min_length',
    field: 'password',
    messageKey: 'user.password.min',
    defaultMessage: 'Password must be at least 8 characters.',
    params: { min: 8 },
    clientSafe: true,
    blocking: true,
    severity: 'error',
  },
  {
    ruleId: 'user/password-max@1',
    type: 'max_length',
    field: 'password',
    messageKey: 'user.password.max',
    defaultMessage: 'Password must not exceed 128 characters.',
    params: { max: 128 },
    clientSafe: false,
    blocking: true,
    severity: 'error',
  },
  {
    ruleId: 'user/password-strength@1',
    type: 'regex',
    field: 'password',
    messageKey: 'user.password.strength',
    defaultMessage: 'Password must contain at least one uppercase letter, one digit, and one special character.',
    params: { pattern: '^(?=.*[A-Z])(?=.*\\d)(?=.*[^A-Za-z0-9]).+$' },
    clientSafe: true,
    blocking: false,
    severity: 'warning',
  },

  // ── firstName ── required + min + max ─────────────────────────────────────
  {
    ruleId: 'user/firstName-required@1',
    type: 'required',
    field: 'firstName',
    messageKey: 'user.firstName.required',
    defaultMessage: 'First name is required.',
    clientSafe: true,
    blocking: true,
    severity: 'error',
  },
  {
    ruleId: 'user/firstName-min@1',
    type: 'min_length',
    field: 'firstName',
    messageKey: 'user.firstName.min',
    defaultMessage: 'First name must be at least 1 character.',
    params: { min: 1 },
    clientSafe: true,
    blocking: true,
    severity: 'error',
  },
  {
    ruleId: 'user/firstName-max@1',
    type: 'max_length',
    field: 'firstName',
    messageKey: 'user.firstName.max',
    defaultMessage: 'First name must not exceed 64 characters.',
    params: { max: 64 },
    clientSafe: true,
    blocking: true,
    severity: 'error',
  },

  // ── lastName ── required + min + max ──────────────────────────────────────
  {
    ruleId: 'user/lastName-required@1',
    type: 'required',
    field: 'lastName',
    messageKey: 'user.lastName.required',
    defaultMessage: 'Last name is required.',
    clientSafe: true,
    blocking: true,
    severity: 'error',
  },
  {
    ruleId: 'user/lastName-min@1',
    type: 'min_length',
    field: 'lastName',
    messageKey: 'user.lastName.min',
    defaultMessage: 'Last name must be at least 1 character.',
    params: { min: 1 },
    clientSafe: true,
    blocking: true,
    severity: 'error',
  },
  {
    ruleId: 'user/lastName-max@1',
    type: 'max_length',
    field: 'lastName',
    messageKey: 'user.lastName.max',
    defaultMessage: 'Last name must not exceed 64 characters.',
    params: { max: 64 },
    clientSafe: true,
    blocking: true,
    severity: 'error',
  },

  // ── phone ── regex only (optional field, non-blocking warning) ────────────
  {
    ruleId: 'user/phone-format@1',
    type: 'regex',
    field: 'phone',
    messageKey: 'user.phone.format',
    defaultMessage: 'Phone number must be in E.164 format (e.g. +14155552671).',
    params: { pattern: '^\\+[1-9]\\d{1,14}$' },
    clientSafe: true,
    blocking: false,
    severity: 'warning',
  },
  {
    ruleId: 'user/phone-max@1',
    type: 'max_length',
    field: 'phone',
    messageKey: 'user.phone.max',
    defaultMessage: 'Phone number must not exceed 16 characters.',
    params: { max: 16 },
    clientSafe: true,
    blocking: false,
    severity: 'warning',
  },

  // ── website ── regex + max ─────────────────────────────────────────────────
  {
    ruleId: 'user/website-format@1',
    type: 'regex',
    field: 'website',
    messageKey: 'user.website.format',
    defaultMessage: 'Website must start with https://.',
    params: { pattern: '^https://' },
    clientSafe: true,
    blocking: false,
    severity: 'warning',
  },
  {
    ruleId: 'user/website-max@1',
    type: 'max_length',
    field: 'website',
    messageKey: 'user.website.max',
    defaultMessage: 'Website URL must not exceed 2048 characters.',
    params: { max: 2048 },
    clientSafe: true,
    blocking: false,
    severity: 'warning',
  },

  // ── bio ── max + server-side length warning ────────────────────────────────
  {
    ruleId: 'user/bio-max@1',
    type: 'max_length',
    field: 'bio',
    messageKey: 'user.bio.max',
    defaultMessage: 'Bio must not exceed 500 characters.',
    params: { max: 500 },
    clientSafe: true,
    blocking: false,
    severity: 'warning',
  },
  {
    ruleId: 'user/bio-hard-max@1',
    type: 'max_length',
    field: 'bio',
    messageKey: 'user.bio.hard_max',
    defaultMessage: 'Bio exceeds the absolute limit of 1000 characters.',
    params: { max: 1000 },
    clientSafe: false,
    blocking: true,
    severity: 'error',
  },

  // ── age ── number_min + number_max ────────────────────────────────────────
  {
    ruleId: 'user/age-min@1',
    type: 'number_min',
    field: 'age',
    messageKey: 'user.age.min',
    defaultMessage: 'Age must be at least 18.',
    params: { min: 18 },
    clientSafe: true,
    blocking: true,
    severity: 'error',
  },
  {
    ruleId: 'user/age-max@1',
    type: 'number_max',
    field: 'age',
    messageKey: 'user.age.max',
    defaultMessage: 'Age must be at most 120.',
    params: { max: 120 },
    clientSafe: true,
    blocking: true,
    severity: 'error',
  },

  // ── salary ── number_min (non-blocking advisory) ──────────────────────────
  {
    ruleId: 'user/salary-min@1',
    type: 'number_min',
    field: 'salary',
    messageKey: 'user.salary.min',
    defaultMessage: 'Salary must be a positive number.',
    params: { min: 0 },
    clientSafe: true,
    blocking: true,
    severity: 'error',
  },
  {
    ruleId: 'user/salary-max@1',
    type: 'number_max',
    field: 'salary',
    messageKey: 'user.salary.max',
    defaultMessage: 'Salary exceeds the maximum allowed range.',
    params: { max: 10000000 },
    clientSafe: false,
    blocking: false,
    severity: 'warning',
  },

  // ── score ── number_min + number_max (strict range) ───────────────────────
  {
    ruleId: 'user/score-min@1',
    type: 'number_min',
    field: 'score',
    messageKey: 'user.score.min',
    defaultMessage: 'Score must be at least 0.',
    params: { min: 0 },
    clientSafe: true,
    blocking: true,
    severity: 'error',
  },
  {
    ruleId: 'user/score-max@1',
    type: 'number_max',
    field: 'score',
    messageKey: 'user.score.max',
    defaultMessage: 'Score must be at most 100.',
    params: { max: 100 },
    clientSafe: true,
    blocking: true,
    severity: 'error',
  },

  // ── rating ── number_min + number_max (decimal-compatible) ───────────────
  {
    ruleId: 'user/rating-min@1',
    type: 'number_min',
    field: 'rating',
    messageKey: 'user.rating.min',
    defaultMessage: 'Rating must be between 1 and 5.',
    params: { min: 1 },
    clientSafe: true,
    blocking: true,
    severity: 'error',
  },
  {
    ruleId: 'user/rating-max@1',
    type: 'number_max',
    field: 'rating',
    messageKey: 'user.rating.max',
    defaultMessage: 'Rating must be between 1 and 5.',
    params: { max: 5 },
    clientSafe: true,
    blocking: true,
    severity: 'error',
  },

  // ── discount ── number_min + number_max + server-only check ──────────────
  {
    ruleId: 'user/discount-min@1',
    type: 'number_min',
    field: 'discount',
    messageKey: 'user.discount.min',
    defaultMessage: 'Discount cannot be negative.',
    params: { min: 0 },
    clientSafe: true,
    blocking: true,
    severity: 'error',
  },
  {
    ruleId: 'user/discount-max@1',
    type: 'number_max',
    field: 'discount',
    messageKey: 'user.discount.max',
    defaultMessage: 'Discount cannot exceed 100%.',
    params: { max: 100 },
    clientSafe: true,
    blocking: true,
    severity: 'error',
  },
  {
    ruleId: 'user/discount-policy@1',
    type: 'number_max',
    field: 'discount',
    messageKey: 'user.discount.policy',
    defaultMessage: 'Discounts above 50% require manager approval.',
    params: { max: 50 },
    clientSafe: false,
    blocking: false,
    severity: 'warning',
  },

  // ── startDate ── date format ───────────────────────────────────────────────
  {
    ruleId: 'user/startDate-required@1',
    type: 'required',
    field: 'startDate',
    messageKey: 'user.startDate.required',
    defaultMessage: 'Start date is required.',
    clientSafe: true,
    blocking: true,
    severity: 'error',
  },
  {
    ruleId: 'user/startDate-format@1',
    type: 'date',
    field: 'startDate',
    messageKey: 'user.startDate.format',
    defaultMessage: 'Start date must be a valid calendar date.',
    clientSafe: true,
    blocking: true,
    severity: 'error',
  },

  // ── deadline ── future_date ────────────────────────────────────────────────
  {
    ruleId: 'user/deadline-required@1',
    type: 'required',
    field: 'deadline',
    messageKey: 'user.deadline.required',
    defaultMessage: 'Deadline is required.',
    clientSafe: true,
    blocking: true,
    severity: 'error',
  },
  {
    ruleId: 'user/deadline-future@1',
    type: 'future_date',
    field: 'deadline',
    messageKey: 'user.deadline.future',
    defaultMessage: 'Deadline must be a future date.',
    clientSafe: true,
    blocking: true,
    severity: 'error',
  },

  // ── renewalDate ── date (non-blocking advisory) ────────────────────────────
  {
    ruleId: 'user/renewalDate-format@1',
    type: 'date',
    field: 'renewalDate',
    messageKey: 'user.renewalDate.format',
    defaultMessage: 'Renewal date must be a valid calendar date.',
    clientSafe: true,
    blocking: false,
    severity: 'warning',
  },
  {
    ruleId: 'user/renewalDate-future@1',
    type: 'future_date',
    field: 'renewalDate',
    messageKey: 'user.renewalDate.future',
    defaultMessage: 'Renewal date should be in the future.',
    clientSafe: true,
    blocking: false,
    severity: 'warning',
  },

  // ── slug ── required + regex (URL-safe) ───────────────────────────────────
  {
    ruleId: 'user/slug-required@1',
    type: 'required',
    field: 'slug',
    messageKey: 'user.slug.required',
    defaultMessage: 'Slug is required.',
    clientSafe: true,
    blocking: true,
    severity: 'error',
  },
  {
    ruleId: 'user/slug-format@1',
    type: 'regex',
    field: 'slug',
    messageKey: 'user.slug.format',
    defaultMessage: 'Slug must be lowercase letters, numbers, and hyphens only.',
    params: { pattern: '^[a-z0-9]+(?:-[a-z0-9]+)*$' },
    clientSafe: true,
    blocking: true,
    severity: 'error',
  },
  {
    ruleId: 'user/slug-min@1',
    type: 'min_length',
    field: 'slug',
    messageKey: 'user.slug.min',
    defaultMessage: 'Slug must be at least 2 characters.',
    params: { min: 2 },
    clientSafe: true,
    blocking: true,
    severity: 'error',
  },
  {
    ruleId: 'user/slug-max@1',
    type: 'max_length',
    field: 'slug',
    messageKey: 'user.slug.max',
    defaultMessage: 'Slug must not exceed 80 characters.',
    params: { max: 80 },
    clientSafe: true,
    blocking: true,
    severity: 'error',
  },

  // ── role ── enum rule (field stays string type — no enumValues needed) ────
  {
    ruleId: 'user/role-required@1',
    type: 'required',
    field: 'role',
    messageKey: 'user.role.required',
    defaultMessage: 'Role is required.',
    clientSafe: true,
    blocking: true,
    severity: 'error',
  },
  {
    ruleId: 'user/role-enum@1',
    type: 'enum',
    field: 'role',
    messageKey: 'user.role.enum',
    defaultMessage: 'Role must be one of: viewer, editor, admin, owner.',
    params: { values: ['viewer', 'editor', 'admin', 'owner'] },
    clientSafe: true,
    blocking: true,
    severity: 'error',
  },

  // ── zipCode ── required + regex ───────────────────────────────────────────
  {
    ruleId: 'user/zipCode-required@1',
    type: 'required',
    field: 'zipCode',
    messageKey: 'user.zipCode.required',
    defaultMessage: 'ZIP code is required.',
    clientSafe: true,
    blocking: true,
    severity: 'error',
  },
  {
    ruleId: 'user/zipCode-format@1',
    type: 'regex',
    field: 'zipCode',
    messageKey: 'user.zipCode.format',
    defaultMessage: 'ZIP code must be 5 digits or ZIP+4 format (e.g. 12345 or 12345-6789).',
    params: { pattern: '^\\d{5}(?:-\\d{4})?$' },
    clientSafe: true,
    blocking: true,
    severity: 'error',
  },

  // ── notificationEmail ── email + max (server-only, non-blocking) ──────────
  {
    ruleId: 'user/notificationEmail-format@1',
    type: 'email',
    field: 'notificationEmail',
    messageKey: 'user.notificationEmail.format',
    defaultMessage: 'Notification email must be a valid address.',
    clientSafe: false,
    blocking: false,
    severity: 'warning',
  },
  {
    ruleId: 'user/notificationEmail-max@1',
    type: 'max_length',
    field: 'notificationEmail',
    messageKey: 'user.notificationEmail.max',
    defaultMessage: 'Notification email must not exceed 254 characters.',
    params: { max: 254 },
    clientSafe: false,
    blocking: false,
    severity: 'warning',
  },

  // ── inviteCode ── required + min + regex (alphanumeric token) ─────────────
  {
    ruleId: 'user/inviteCode-required@1',
    type: 'required',
    field: 'inviteCode',
    messageKey: 'user.inviteCode.required',
    defaultMessage: 'Invite code is required.',
    clientSafe: true,
    blocking: true,
    severity: 'error',
  },
  {
    ruleId: 'user/inviteCode-min@1',
    type: 'min_length',
    field: 'inviteCode',
    messageKey: 'user.inviteCode.min',
    defaultMessage: 'Invite code must be at least 8 characters.',
    params: { min: 8 },
    clientSafe: true,
    blocking: true,
    severity: 'error',
  },
  {
    ruleId: 'user/inviteCode-format@1',
    type: 'regex',
    field: 'inviteCode',
    messageKey: 'user.inviteCode.format',
    defaultMessage: 'Invite code must contain only uppercase letters and digits.',
    params: { pattern: '^[A-Z0-9]+$' },
    clientSafe: true,
    blocking: true,
    severity: 'error',
  },
];

const ENTITY_SAMPLE: EntityDefinition = {
  key: 'customer',
  name: 'Customer',
  pluralName: 'Customers',
  fields: [
    // ── Core identifiers (system) ────────────────────────────────────────────
    { key: 'externalId', type: 'string', name: 'External ID', system: true },
    {
      key: 'slug',
      type: 'string',
      name: 'Slug',
      list: { visible: true },
      validation: {
        fieldRules: [
          {
            ruleId: 'customer/slug-required@1',
            type: 'required',
            field: 'slug',
            messageKey: 'customer.slug.required',
            defaultMessage: 'Slug is required.',
            clientSafe: true,
            blocking: true,
            severity: 'error',
          },
          {
            ruleId: 'customer/slug-format@1',
            type: 'regex',
            field: 'slug',
            messageKey: 'customer.slug.format',
            defaultMessage: 'Slug must be lowercase letters, numbers, and hyphens only.',
            params: { pattern: '^[a-z0-9]+(?:-[a-z0-9]+)*$' },
            clientSafe: true,
            blocking: true,
            severity: 'error',
          },
        ],
      },
    },

    // ── List-visible classification (top-level, no object wrapping) ──────────
    {
      key: 'name',
      type: 'string',
      name: 'Name',
      list: { visible: true, searchable: true, sortable: true },
      create: { visible: true, order: 0 },
      validation: {
        fieldRules: [
          {
            ruleId: 'customer/name-required@1',
            type: 'required',
            field: 'name',
            messageKey: 'customer.name.required',
            defaultMessage: 'Name is required.',
            clientSafe: true,
            blocking: true,
            severity: 'error',
          },
          {
            ruleId: 'customer/name-min@1',
            type: 'min_length',
            field: 'name',
            messageKey: 'customer.name.min',
            defaultMessage: 'Name must be at least 1 character.',
            params: { min: 1 },
            clientSafe: true,
            blocking: true,
            severity: 'error',
          },
          {
            ruleId: 'customer/name-max@1',
            type: 'max_length',
            field: 'name',
            messageKey: 'customer.name.max',
            defaultMessage: 'Name must not exceed 200 characters.',
            params: { max: 200 },
            clientSafe: true,
            blocking: true,
            severity: 'error',
          },
        ],
      },
    },
    {
      key: 'email',
      type: 'string',
      name: 'Email',
      list: { visible: true, searchable: true },
      create: { visible: true, order: 1 },
      validation: {
        fieldRules: [
          {
            ruleId: 'customer/email-format@1',
            type: 'email',
            field: 'email',
            messageKey: 'customer.email.format',
            defaultMessage: 'Must be a valid email address.',
            clientSafe: true,
            blocking: true,
            severity: 'error',
          },
        ],
      },
    },
    {
      key: 'type',
      type: 'enum',
      name: 'Type',
      enumValues: ['individual', 'company'],
      list: { visible: true, filterable: true },
      create: { visible: true, order: 2 },
      validation: {
        fieldRules: [
          {
            ruleId: 'customer/type-required@1',
            type: 'required',
            field: 'type',
            messageKey: 'customer.type.required',
            defaultMessage: 'Type is required.',
            clientSafe: true,
            blocking: true,
            severity: 'error',
          },
        ],
      },
    },
    {
      key: 'status',
      type: 'enum',
      name: 'Status',
      enumValues: ['active', 'inactive', 'suspended', 'archived'],
      list: { visible: true, filterable: true },
      create: { visible: true, order: 3 },
      validation: {
        fieldRules: [
          {
            ruleId: 'customer/status-required@1',
            type: 'required',
            field: 'status',
            messageKey: 'customer.status.required',
            defaultMessage: 'Status is required.',
            clientSafe: true,
            blocking: true,
            severity: 'error',
          },
        ],
      },
    },
    {
      key: 'lifecycleStage',
      type: 'enum',
      name: 'Lifecycle Stage',
      enumValues: ['lead', 'prospect', 'active_customer', 'churned'],
      list: { visible: true, filterable: true },
      create: { visible: true, order: 4 },
    },
    {
      key: 'customerTier',
      type: 'enum',
      name: 'Customer Tier',
      enumValues: ['free', 'standard', 'premium', 'enterprise'],
      list: { visible: true, filterable: true },
      create: { visible: true, order: 5 },
    },

    // ── Nested object groups ──────────────────────────────────────────────────

    {
      key: 'identity',
      type: 'object',
      name: 'Identity',
      create: { order: 10 },
      fields: [
        { key: 'legalName', type: 'string', name: 'Legal Name' },
        { key: 'displayName', type: 'string', name: 'Display Name' },
        {
          key: 'shortName',
          type: 'string',
          name: 'Short Name',
          validation: {
            fieldRules: [
              {
                ruleId: 'customer/identity.shortName-max@1',
                type: 'max_length',
                field: 'shortName',
                messageKey: 'customer.identity.shortName.max',
                defaultMessage: 'Short name must not exceed 60 characters.',
                params: { max: 60 },
                clientSafe: true,
                blocking: true,
                severity: 'error',
              },
            ],
          },
        },
      ],
    },

    {
      key: 'contact',
      type: 'object',
      name: 'Contact',
      create: { order: 11 },
      fields: [
        {
          key: 'phone',
          type: 'string',
          name: 'Phone',
          validation: {
            fieldRules: [
              {
                ruleId: 'customer/contact.phone-format@1',
                type: 'regex',
                field: 'phone',
                messageKey: 'customer.contact.phone.format',
                defaultMessage: 'Phone must be in E.164 format (e.g. +14155552671).',
                params: { pattern: '^\\+[1-9]\\d{1,14}$' },
                clientSafe: true,
                blocking: false,
                severity: 'warning',
              },
            ],
          },
        },
        { key: 'mobile', type: 'string', name: 'Mobile' },
        { key: 'website', type: 'string', name: 'Website' },
      ],
    },

    {
      key: 'address',
      type: 'object',
      name: 'Address',
      create: { order: 12 },
      fields: [
        {
          key: 'street',
          type: 'string',
          name: 'Street',
          validation: {
            fieldRules: [
              {
                ruleId: 'customer/address.street-required@1',
                type: 'required',
                field: 'street',
                messageKey: 'customer.address.street.required',
                defaultMessage: 'Street is required.',
                clientSafe: true,
                blocking: true,
                severity: 'error',
              },
            ],
          },
        },
        { key: 'street2', type: 'string', name: 'Street Line 2' },
        {
          key: 'city',
          type: 'string',
          name: 'City',
          validation: {
            fieldRules: [
              {
                ruleId: 'customer/address.city-required@1',
                type: 'required',
                field: 'city',
                messageKey: 'customer.address.city.required',
                defaultMessage: 'City is required.',
                clientSafe: true,
                blocking: true,
                severity: 'error',
              },
            ],
          },
        },
        {
          key: 'postalCode',
          type: 'string',
          name: 'Postal Code',
          validation: {
            fieldRules: [
              {
                ruleId: 'customer/address.postalCode-required@1',
                type: 'required',
                field: 'postalCode',
                messageKey: 'customer.address.postalCode.required',
                defaultMessage: 'Postal code is required.',
                clientSafe: true,
                blocking: true,
                severity: 'error',
              },
            ],
          },
        },
        { key: 'state', type: 'string', name: 'State / Province' },
        {
          key: 'country',
          type: 'string',
          name: 'Country',
          validation: {
            fieldRules: [
              {
                ruleId: 'customer/address.country-required@1',
                type: 'required',
                field: 'country',
                messageKey: 'customer.address.country.required',
                defaultMessage: 'Country is required.',
                clientSafe: true,
                blocking: true,
                severity: 'error',
              },
            ],
          },
        },
        {
          key: 'countryCode',
          type: 'string',
          name: 'Country Code',
          validation: {
            fieldRules: [
              {
                ruleId: 'customer/address.countryCode-max@1',
                type: 'max_length',
                field: 'countryCode',
                messageKey: 'customer.address.countryCode.max',
                defaultMessage: 'Country code must not exceed 2 characters.',
                params: { max: 2 },
                clientSafe: true,
                blocking: true,
                severity: 'error',
              },
            ],
          },
        },
      ],
    },

    {
      key: 'billing',
      type: 'object',
      name: 'Billing',
      create: { order: 13 },
      fields: [
        {
          key: 'email',
          type: 'string',
          name: 'Billing Email',
          validation: {
            fieldRules: [
              {
                ruleId: 'customer/billing.email-format@1',
                type: 'email',
                field: 'email',
                messageKey: 'customer.billing.email.format',
                defaultMessage: 'Billing email must be a valid address.',
                clientSafe: true,
                blocking: false,
                severity: 'warning',
              },
            ],
          },
        },
        { key: 'contact', type: 'string', name: 'Billing Contact' },
        { key: 'vatNumber', type: 'string', name: 'VAT Number' },
        { key: 'taxId', type: 'string', name: 'Tax ID' },
        {
          key: 'currency',
          type: 'string',
          name: 'Currency',
          validation: {
            fieldRules: [
              {
                ruleId: 'customer/billing.currency-required@1',
                type: 'required',
                field: 'currency',
                messageKey: 'customer.billing.currency.required',
                defaultMessage: 'Currency is required.',
                clientSafe: true,
                blocking: true,
                severity: 'error',
              },
              {
                ruleId: 'customer/billing.currency-max@1',
                type: 'max_length',
                field: 'currency',
                messageKey: 'customer.billing.currency.max',
                defaultMessage: 'Currency code must not exceed 3 characters.',
                params: { max: 3 },
                clientSafe: true,
                blocking: true,
                severity: 'error',
              },
            ],
          },
        },
        {
          key: 'paymentTermsDays',
          type: 'number',
          name: 'Payment Terms (Days)',
          validation: {
            fieldRules: [
              {
                ruleId: 'customer/billing.paymentTermsDays-min@1',
                type: 'number_min',
                field: 'paymentTermsDays',
                messageKey: 'customer.billing.paymentTermsDays.min',
                defaultMessage: 'Payment terms cannot be negative.',
                params: { min: 0 },
                clientSafe: true,
                blocking: true,
                severity: 'error',
              },
              {
                ruleId: 'customer/billing.paymentTermsDays-max@1',
                type: 'number_max',
                field: 'paymentTermsDays',
                messageKey: 'customer.billing.paymentTermsDays.max',
                defaultMessage: 'Payment terms cannot exceed 365 days.',
                params: { max: 365 },
                clientSafe: true,
                blocking: true,
                severity: 'error',
              },
            ],
          },
        },
        // ── 3rd level nesting: billing.address ──────────────────────────────
        {
          key: 'address',
          type: 'object',
          name: 'Billing Address',
          fields: [
            { key: 'street', type: 'string', name: 'Street' },
            { key: 'street2', type: 'string', name: 'Street Line 2' },
            { key: 'city', type: 'string', name: 'City' },
            { key: 'postalCode', type: 'string', name: 'Postal Code' },
            { key: 'state', type: 'string', name: 'State / Province' },
            { key: 'country', type: 'string', name: 'Country' },
            {
              key: 'countryCode',
              type: 'string',
              name: 'Country Code',
              validation: {
                fieldRules: [
                  {
                    ruleId: 'customer/billing.address.countryCode-max@1',
                    type: 'max_length',
                    field: 'countryCode',
                    messageKey: 'customer.billing.address.countryCode.max',
                    defaultMessage: 'Country code must not exceed 2 characters.',
                    params: { max: 2 },
                    clientSafe: true,
                    blocking: true,
                    severity: 'error',
                  },
                ],
              },
            },
          ],
        },
      ],
    },

    {
      key: 'legal',
      type: 'object',
      name: 'Legal',
      create: { order: 14 },
      fields: [
        { key: 'registrationNumber', type: 'string', name: 'Registration Number' },
        { key: 'companyType', type: 'string', name: 'Company Type' },
        { key: 'incorporationDate', type: 'date', name: 'Incorporation Date' },
        { key: 'countryOfRegistration', type: 'string', name: 'Country of Registration' },
      ],
    },

    {
      key: 'verification',
      type: 'object',
      name: 'Verification',
      create: { order: 15 },
      fields: [
        { key: 'verified', type: 'boolean', name: 'Verified' },
        {
          key: 'level',
          type: 'enum',
          name: 'Verification Level',
          enumValues: ['none', 'basic', 'kyc', 'enhanced'],
        },
        { key: 'verifiedAt', type: 'datetime', name: 'Verified At', system: true },
        { key: 'verifiedBy', type: 'string', name: 'Verified By', system: true },
      ],
    },

    {
      key: 'commercial',
      type: 'object',
      name: 'Commercial',
      create: { order: 16 },
      fields: [
        { key: 'accountOwner', type: 'string', name: 'Account Owner' },
        { key: 'industry', type: 'string', name: 'Industry' },
        { key: 'segment', type: 'string', name: 'Segment' },
        {
          key: 'size',
          type: 'enum',
          name: 'Company Size',
          enumValues: ['startup', 'smb', 'mid_market', 'enterprise'],
        },
      ],
    },

    {
      key: 'financial',
      type: 'object',
      name: 'Financial',
      create: { order: 17 },
      fields: [
        {
          key: 'creditLimit',
          type: 'number',
          name: 'Credit Limit',
          validation: {
            fieldRules: [
              {
                ruleId: 'customer/financial.creditLimit-min@1',
                type: 'number_min',
                field: 'creditLimit',
                messageKey: 'customer.financial.creditLimit.min',
                defaultMessage: 'Credit limit cannot be negative.',
                params: { min: 0 },
                clientSafe: true,
                blocking: true,
                severity: 'error',
              },
            ],
          },
        },
        { key: 'currentBalance', type: 'number', name: 'Current Balance' },
        {
          key: 'lifetimeValue',
          type: 'number',
          name: 'Lifetime Value',
          validation: {
            fieldRules: [
              {
                ruleId: 'customer/financial.lifetimeValue-min@1',
                type: 'number_min',
                field: 'lifetimeValue',
                messageKey: 'customer.financial.lifetimeValue.min',
                defaultMessage: 'Lifetime value cannot be negative.',
                params: { min: 0 },
                clientSafe: true,
                blocking: true,
                severity: 'error',
              },
            ],
          },
        },
        {
          key: 'currency',
          type: 'string',
          name: 'Currency',
          validation: {
            fieldRules: [
              {
                ruleId: 'customer/financial.currency-max@1',
                type: 'max_length',
                field: 'currency',
                messageKey: 'customer.financial.currency.max',
                defaultMessage: 'Currency code must not exceed 3 characters.',
                params: { max: 3 },
                clientSafe: true,
                blocking: true,
                severity: 'error',
              },
            ],
          },
        },
      ],
    },

    {
      key: 'relationships',
      type: 'object',
      name: 'Relationships',
      create: { order: 18 },
      fields: [
        { key: 'parentCustomerId', type: 'string', name: 'Parent Customer ID' },
        { key: 'accountManagerId', type: 'string', name: 'Account Manager ID' },
        { key: 'primaryContactId', type: 'string', name: 'Primary Contact ID' },
      ],
    },

    {
      key: 'metrics',
      type: 'object',
      name: 'Metrics',
      system: true,
      fields: [
        { key: 'totalOrders', type: 'number', name: 'Total Orders', system: true },
        { key: 'totalInvoices', type: 'number', name: 'Total Invoices', system: true },
        { key: 'totalRevenue', type: 'number', name: 'Total Revenue', system: true },
        { key: 'lastActivityAt', type: 'datetime', name: 'Last Activity At', system: true },
      ],
    },

    {
      key: 'preferences',
      type: 'object',
      name: 'Preferences',
      create: { order: 19 },
      fields: [
        { key: 'language', type: 'string', name: 'Language' },
        { key: 'timezone', type: 'string', name: 'Timezone' },
        { key: 'communicationOptIn', type: 'boolean', name: 'Communication Opt-in' },
      ],
    },

    // ── Notes (top-level text field) ─────────────────────────────────────────
    { key: 'notes', type: 'text', name: 'Notes', create: { visible: true, order: 20 } },
  ],
};

const FORM_SAMPLE: EntityDefinition = {
  key: 'record',
  name: 'Record',
  pluralName: 'Records',
  fields: [
    {
      key: 'title',
      type: 'string',
      name: 'Title',
      list: { visible: true },
      create: { visible: true, order: 0, placeholder: 'Enter a title…' },
      validation: {
        fieldRules: [
          {
            ruleId: 'record/title-required@1',
            type: 'required',
            field: 'title',
            messageKey: 'record.title.required',
            defaultMessage: 'Title is required.',
            clientSafe: true,
            blocking: true,
            severity: 'error',
          },
          {
            ruleId: 'record/title-min@1',
            type: 'min_length',
            field: 'title',
            messageKey: 'record.title.min',
            defaultMessage: 'Title must be at least 3 characters.',
            params: { min: 3 },
            clientSafe: true,
            blocking: true,
            severity: 'error',
          },
          {
            ruleId: 'record/title-max@1',
            type: 'max_length',
            field: 'title',
            messageKey: 'record.title.max',
            defaultMessage: 'Title must be at most 100 characters.',
            params: { max: 100 },
            clientSafe: true,
            blocking: false,
            severity: 'warning',
          },
        ],
      },
    },
    {
      key: 'score',
      type: 'number',
      name: 'Score',
      list: { visible: true, sortable: true },
      create: { visible: true, order: 1 },
      validation: {
        fieldRules: [
          {
            ruleId: 'record/score-min@1',
            type: 'number_min',
            field: 'score',
            messageKey: 'record.score.min',
            defaultMessage: 'Score must be at least 0.',
            params: { min: 0 },
            clientSafe: true,
            blocking: true,
            severity: 'error',
          },
          {
            ruleId: 'record/score-max@1',
            type: 'number_max',
            field: 'score',
            messageKey: 'record.score.max',
            defaultMessage: 'Score must be at most 100.',
            params: { max: 100 },
            clientSafe: true,
            blocking: true,
            severity: 'error',
          },
        ],
      },
    },
    { key: 'active', type: 'boolean', name: 'Active', list: { visible: true }, create: { visible: true, order: 2 } },
    {
      key: 'category',
      type: 'enum',
      name: 'Category',
      enumValues: ['alpha', 'beta', 'gamma'],
      list: { visible: true, filterable: true },
      create: { visible: true, order: 3 },
    },
    {
      key: 'dueDate',
      type: 'date',
      name: 'Due Date',
      list: { visible: true, sortable: true },
      create: { visible: true, order: 4 },
    },
  ],
};

const SIMPLE_ENTITY_SAMPLE: EntityDefinition = {
  key: 'customer',
  name: 'Customer',
  pluralName: 'Customers',
  fields: [
    { key: 'name', type: 'string', name: 'Name', list: { visible: true, searchable: true } },
    { key: 'email', type: 'string', name: 'Email', list: { visible: true } },
    { key: 'phone', type: 'string', name: 'Phone' },
    { key: 'website', type: 'string', name: 'Website' },
    { key: 'industry', type: 'string', name: 'Industry', list: { visible: true } },
    { key: 'street', type: 'string', name: 'Street' },
    { key: 'city', type: 'string', name: 'City' },
    { key: 'postal_code', type: 'string', name: 'Postal Code' },
    { key: 'country', type: 'string', name: 'Country' },
    { key: 'vat_number', type: 'string', name: 'VAT Number' },
    { key: 'payment_terms_days', type: 'number', name: 'Payment Terms (Days)' },
    { key: 'account_owner_id', type: 'string', name: 'Account Owner ID' },
    {
      key: 'status',
      type: 'enum',
      name: 'Status',
      enumValues: ['active', 'inactive', 'suspended'],
      list: { visible: true, filterable: true },
    },
  ],
};

const NESTED_ENTITY_SAMPLE: EntityDefinition = {
  key: 'customer',
  name: 'Customer',
  pluralName: 'Customers',
  fields: [
    { key: 'name', type: 'string', name: 'Name', list: { visible: true, searchable: true } },
    { key: 'email', type: 'string', name: 'Email', list: { visible: true } },
    { key: 'phone', type: 'string', name: 'Phone' },
    {
      key: 'contact',
      type: 'object',
      name: 'Contact',
      fields: [{ key: 'website', type: 'string', name: 'Website' }],
    },
    {
      key: 'address',
      type: 'object',
      name: 'Address',
      fields: [
        { key: 'street', type: 'string', name: 'Street' },
        { key: 'city', type: 'string', name: 'City' },
        { key: 'postal_code', type: 'string', name: 'Postal Code' },
        { key: 'country', type: 'string', name: 'Country' },
      ],
    },
    {
      key: 'billing',
      type: 'object',
      name: 'Billing',
      fields: [
        { key: 'vat_number', type: 'string', name: 'VAT Number' },
        { key: 'payment_terms_days', type: 'number', name: 'Payment Terms (Days)' },
      ],
    },
    {
      key: 'commercial',
      type: 'object',
      name: 'Commercial',
      fields: [
        { key: 'industry', type: 'string', name: 'Industry' },
        { key: 'account_owner_id', type: 'string', name: 'Account Owner ID' },
      ],
    },
    {
      key: 'status',
      type: 'enum',
      name: 'Status',
      enumValues: ['active', 'inactive', 'suspended'],
      list: { visible: true, filterable: true },
    },
  ],
};

const BELONGS_TO_SAMPLE: EntityDefinition = {
  key: 'invoice',
  name: 'Invoice',
  pluralName: 'Invoices',
  fields: [
    { key: 'total_amount', type: 'number', name: 'Total Amount', list: { visible: true } },
    {
      key: 'status',
      type: 'enum',
      name: 'Status',
      enumValues: ['draft', 'sent', 'paid', 'cancelled'],
      list: { visible: true },
    },
    { key: 'due_date', type: 'date', name: 'Due Date' },
  ],
  relations: [{ key: 'customer_id', relation: 'belongs_to', entity: 'customer', required: true }],
};

const HAS_MANY_SAMPLE: EntityDefinition = {
  key: 'customer',
  name: 'Customer',
  pluralName: 'Customers',
  fields: [
    { key: 'name', type: 'string', name: 'Name', list: { visible: true } },
    { key: 'email', type: 'string', name: 'Email', list: { visible: true } },
  ],
  relations: [
    { key: 'invoices', relation: 'has_many', entity: 'invoice', foreignKey: 'customer_id' },
    { key: 'tickets', relation: 'has_many', entity: 'ticket', foreignKey: 'customer_id' },
  ],
};

const MANY_TO_MANY_SAMPLE: EntityDefinition = {
  key: 'user',
  name: 'User',
  pluralName: 'Users',
  fields: [
    { key: 'name', type: 'string', name: 'Name', list: { visible: true } },
    { key: 'email', type: 'string', name: 'Email', list: { visible: true } },
  ],
  relations: [
    {
      key: 'workspaces',
      relation: 'many_to_many',
      entity: 'workspace',
      through: 'membership',
      sourceKey: 'user_id',
      targetKey: 'workspace_id',
    },
  ],
};

const POLYMORPHIC_SAMPLE: EntityDefinition = {
  key: 'comment',
  name: 'Comment',
  pluralName: 'Comments',
  fields: [{ key: 'message', type: 'text', name: 'Message', list: { visible: true } }],
  relations: [{ key: 'target', relation: 'polymorphic', typeField: 'target_type', idField: 'target_id' }],
};

const ALL_RELATIONS_SAMPLE: EntityDefinition = {
  key: 'customer',
  name: 'Customer',
  pluralName: 'Customers',
  fields: [
    { key: 'name', type: 'string', name: 'Name', list: { visible: true } },
    { key: 'email', type: 'string', name: 'Email', list: { visible: true } },
    { key: 'status', type: 'enum', name: 'Status', enumValues: ['active', 'inactive'], list: { visible: true } },
  ],
  relations: [
    { key: 'account_manager_id', relation: 'belongs_to', entity: 'user', required: false },
    { key: 'parent_customer_id', relation: 'self', kind: 'belongs_to' },
    { key: 'invoices', relation: 'has_many', entity: 'invoice', foreignKey: 'customer_id' },
    {
      key: 'projects',
      relation: 'many_to_many',
      entity: 'project',
      through: 'project_member',
      sourceKey: 'customer_id',
      targetKey: 'project_id',
    },
    { key: 'activity', relation: 'polymorphic', typeField: 'target_type', idField: 'target_id' },
  ],
};

const COMPUTED_EXPRESSION_SAMPLE: EntityDefinition = {
  key: 'invoice',
  name: 'Invoice',
  pluralName: 'Invoices',
  fields: [
    { key: 'subtotal', type: 'number', name: 'Subtotal', list: { visible: true } },
    { key: 'tax_rate', type: 'number', name: 'Tax Rate' },
    { key: 'due_date', type: 'date', name: 'Due Date', list: { visible: true } },
  ],
  computed: [
    {
      key: 'tax_amount',
      name: 'Tax Amount',
      type: 'number',
      formulaType: 'expression',
      expression: 'subtotal * tax_rate',
    },
    {
      key: 'total_amount',
      name: 'Total Amount',
      type: 'number',
      formulaType: 'expression',
      expression: 'subtotal + tax_amount',
      dependencies: ['subtotal', 'tax_amount'],
    },
  ],
};

const COMPUTED_AGGREGATION_SAMPLE: EntityDefinition = {
  key: 'customer',
  name: 'Customer',
  pluralName: 'Customers',
  fields: [
    { key: 'name', type: 'string', name: 'Name', list: { visible: true } },
    { key: 'email', type: 'string', name: 'Email', list: { visible: true } },
  ],
  computed: [
    {
      key: 'lifetime_value',
      name: 'Lifetime Value',
      type: 'number',
      formulaType: 'aggregation',
      relation: 'invoices',
      operation: 'sum',
      field: 'total_amount',
    },
    {
      key: 'invoice_count',
      name: 'Invoice Count',
      type: 'number',
      formulaType: 'aggregation',
      relation: 'invoices',
      operation: 'count',
    },
    {
      key: 'unpaid_total',
      name: 'Unpaid Total',
      type: 'number',
      formulaType: 'aggregation',
      relation: 'invoices',
      operation: 'sum',
      field: 'total_amount',
      filter: 'status != "paid"',
    },
  ],
};

const COMPUTED_CONDITIONAL_SAMPLE: EntityDefinition = {
  key: 'invoice',
  name: 'Invoice',
  pluralName: 'Invoices',
  fields: [
    { key: 'due_date', type: 'date', name: 'Due Date', list: { visible: true } },
    {
      key: 'status',
      type: 'enum',
      name: 'Status',
      enumValues: ['draft', 'sent', 'paid', 'cancelled'],
      list: { visible: true },
    },
    { key: 'total_amount', type: 'number', name: 'Total Amount', list: { visible: true } },
  ],
  computed: [
    {
      key: 'overdue',
      name: 'Overdue',
      type: 'boolean',
      formulaType: 'conditional',
      condition: 'due_date < now()',
      then: 'true',
      else: 'false',
    },
    {
      key: 'is_paid',
      name: 'Is Paid',
      type: 'boolean',
      formulaType: 'conditional',
      condition: 'status == "paid"',
      then: 'true',
      else: 'false',
    },
    {
      key: 'is_high_value',
      name: 'Is High Value',
      type: 'boolean',
      formulaType: 'conditional',
      condition: 'total_amount > 10000',
      then: 'true',
      else: 'false',
    },
  ],
};

const COMPUTED_ALL_SAMPLE: EntityDefinition = {
  key: 'invoice',
  name: 'Invoice',
  pluralName: 'Invoices',
  fields: [
    { key: 'subtotal', type: 'number', name: 'Subtotal', list: { visible: true } },
    { key: 'tax_rate', type: 'number', name: 'Tax Rate' },
    { key: 'due_date', type: 'date', name: 'Due Date', list: { visible: true } },
    {
      key: 'status',
      type: 'enum',
      name: 'Status',
      enumValues: ['draft', 'sent', 'paid', 'cancelled'],
      list: { visible: true },
    },
  ],
  computed: [
    {
      key: 'total_amount',
      name: 'Total Amount',
      type: 'number',
      formulaType: 'expression',
      expression: 'subtotal * (1 + tax_rate)',
    },
    {
      key: 'payment_count',
      name: 'Payment Count',
      type: 'number',
      formulaType: 'aggregation',
      relation: 'payments',
      operation: 'count',
    },
    {
      key: 'overdue',
      name: 'Overdue',
      type: 'boolean',
      formulaType: 'conditional',
      condition: 'due_date < now() and status != "paid"',
      then: 'true',
      else: 'false',
    },
  ],
};

const LIFECYCLE_SIMPLE_SAMPLE: EntityDefinition = {
  key: 'invoice',
  name: 'Invoice',
  pluralName: 'Invoices',
  fields: [
    { key: 'status', type: 'string', name: 'Status', list: { visible: true } },
    { key: 'total_amount', type: 'number', name: 'Total Amount', list: { visible: true } },
  ],
  lifecycle: {
    field: 'status',
    initial: 'draft',
    states: ['draft', 'pending', 'approved', 'rejected', 'paid'],
    transitions: [
      { key: 'submit', from: 'draft', to: 'pending' },
      { key: 'approve', from: 'pending', to: 'approved' },
      { key: 'reject', from: 'pending', to: 'rejected' },
      { key: 'mark_paid', from: 'approved', to: 'paid' },
    ],
  },
};

const LIFECYCLE_GUARDS_SAMPLE: EntityDefinition = {
  key: 'invoice',
  name: 'Invoice',
  pluralName: 'Invoices',
  fields: [
    { key: 'status', type: 'string', name: 'Status', list: { visible: true } },
    { key: 'total_amount', type: 'number', name: 'Total Amount', list: { visible: true } },
  ],
  lifecycle: {
    field: 'status',
    initial: 'draft',
    states: ['draft', 'pending', 'approved', 'rejected', 'paid'],
    transitions: [
      { key: 'submit', from: 'draft', to: 'pending', guards: ['total_amount > 0'] },
      { key: 'approve', from: 'pending', to: 'approved', guards: ['total_amount > 0', 'customer_verified == true'] },
      { key: 'reject', from: 'pending', to: 'rejected' },
      { key: 'mark_paid', from: 'approved', to: 'paid', guards: ['payment_received == true'] },
    ],
  },
};

const LIFECYCLE_HOOKS_SAMPLE: EntityDefinition = {
  key: 'invoice',
  name: 'Invoice',
  pluralName: 'Invoices',
  fields: [
    { key: 'status', type: 'string', name: 'Status', list: { visible: true } },
    { key: 'total_amount', type: 'number', name: 'Total Amount', list: { visible: true } },
  ],
  lifecycle: {
    field: 'status',
    initial: 'draft',
    states: ['draft', 'pending', 'approved', 'rejected', 'paid'],
    transitions: [
      { key: 'submit', from: 'draft', to: 'pending', hooks: ['notify_approvers'] },
      { key: 'approve', from: 'pending', to: 'approved', hooks: ['send_invoice_approved_email', 'create_audit_log'] },
      { key: 'reject', from: 'pending', to: 'rejected', hooks: ['notify_sales_team'] },
      { key: 'mark_paid', from: 'approved', to: 'paid', hooks: ['update_customer_balance', 'close_invoice'] },
    ],
  },
};

const LIFECYCLE_FULL_SAMPLE: EntityDefinition = {
  key: 'invoice',
  name: 'Invoice',
  pluralName: 'Invoices',
  fields: [
    { key: 'status', type: 'string', name: 'Status', list: { visible: true } },
    { key: 'total_amount', type: 'number', name: 'Total Amount', list: { visible: true } },
  ],
  lifecycle: {
    field: 'status',
    initial: 'draft',
    states: ['draft', 'pending', 'approved', 'rejected', 'paid'],
    transitions: [
      {
        key: 'submit',
        from: 'draft',
        to: 'pending',
        label: 'Submit for Approval',
        guards: ['total_amount > 0'],
        hooks: ['notify_approvers'],
        event: 'invoice.submitted',
      },
      {
        key: 'approve',
        from: 'pending',
        to: 'approved',
        label: 'Approve',
        guards: ['total_amount > 0', 'customer_verified == true'],
        hooks: ['send_invoice_approved_email', 'create_audit_log'],
        event: 'invoice.approved',
      },
      {
        key: 'reject',
        from: 'pending',
        to: 'rejected',
        label: 'Reject',
        hooks: ['notify_sales_team'],
        event: 'invoice.rejected',
      },
      {
        key: 'mark_paid',
        from: 'approved',
        to: 'paid',
        label: 'Mark as Paid',
        guards: ['payment_received == true'],
        hooks: ['update_customer_balance', 'close_invoice'],
        event: 'invoice.paid',
      },
    ],
  },
};

const EVENTS_ENTITY_SAMPLE: EntityDefinition = {
  key: 'invoice',
  name: 'Invoice',
  pluralName: 'Invoices',
  fields: [
    { key: 'status', type: 'string', name: 'Status', list: { visible: true } },
    { key: 'total_amount', type: 'number', name: 'Total Amount', list: { visible: true } },
    { key: 'bank_account', type: 'string', name: 'Bank Account' },
  ],
  events: {
    exclude: ['bank_account'],
    names: {
      created: 'billing.invoice.raised',
      updated: 'billing.invoice.changed',
      deleted: 'billing.invoice.voided',
    },
  },
};

const EVENTS_LIFECYCLE_SAMPLE: EntityDefinition = {
  key: 'invoice',
  name: 'Invoice',
  pluralName: 'Invoices',
  fields: [
    { key: 'status', type: 'string', name: 'Status', list: { visible: true } },
    { key: 'total_amount', type: 'number', name: 'Total Amount', list: { visible: true } },
  ],
  lifecycle: {
    field: 'status',
    initial: 'draft',
    states: ['draft', 'pending', 'approved', 'paid'],
    transitions: [
      { key: 'submit', from: 'draft', to: 'pending', event: 'invoice.submitted' },
      { key: 'approve', from: 'pending', to: 'approved', event: 'invoice.approved' },
      { key: 'pay', from: 'approved', to: 'paid', event: 'invoice.paid' },
    ],
  },
  events: {
    exclude: [],
  },
};

const EVENTS_FULL_SAMPLE: EntityDefinition = {
  key: 'invoice',
  name: 'Invoice',
  pluralName: 'Invoices',
  fields: [
    { key: 'status', type: 'string', name: 'Status', list: { visible: true } },
    { key: 'total_amount', type: 'number', name: 'Total Amount', list: { visible: true } },
    { key: 'bank_account', type: 'string', name: 'Bank Account' },
  ],
  relations: [{ key: 'customer_id', relation: 'belongs_to', entity: 'customer', required: true }],
  lifecycle: {
    field: 'status',
    initial: 'draft',
    states: ['draft', 'pending', 'approved', 'paid'],
    transitions: [
      { key: 'submit', from: 'draft', to: 'pending', event: 'invoice.submitted' },
      { key: 'approve', from: 'pending', to: 'approved', event: 'invoice.approved' },
      { key: 'pay', from: 'approved', to: 'paid', event: 'invoice.paid' },
    ],
  },
  events: {
    exclude: ['bank_account'],
    names: {
      created: 'billing.invoice.raised',
      updated: 'billing.invoice.changed',
      deleted: 'billing.invoice.voided',
    },
  },
};

const DASHBOARD_SAMPLE: PageDefinition = {
  key: 'dashboard',
  type: 'dashboard',
  title: 'Dashboard',
  path: '/dashboard',
};

const CAPABILITIES_SIMPLE_SAMPLE: EntityDefinition = {
  key: 'invoice',
  name: 'Invoice',
  pluralName: 'Invoices',
  fields: [
    {
      key: 'status',
      type: 'enum',
      name: 'Status',
      enumValues: ['draft', 'pending', 'approved', 'paid'],
      list: { visible: true },
    },
    { key: 'total_amount', type: 'number', name: 'Total Amount', list: { visible: true } },
  ],
  lifecycle: {
    field: 'status',
    initial: 'draft',
    states: ['draft', 'pending', 'approved', 'paid'],
    transitions: [
      { key: 'submit', from: 'draft', to: 'pending' },
      { key: 'approve', from: 'pending', to: 'approved' },
      { key: 'pay', from: 'approved', to: 'paid' },
    ],
  },
  capabilities: [
    { key: 'submit', type: 'transition', transition: 'submit', description: 'Submit for approval' },
    { key: 'approve', type: 'transition', transition: 'approve', description: 'Approve invoice', confirm: true },
    { key: 'export_pdf', type: 'export', format: 'pdf', description: 'Download as PDF' },
    { key: 'reset', type: 'mutation', updates: { status: 'draft' }, description: 'Reset to draft', confirm: true },
  ],
};

const CAPABILITIES_INPUTS_SAMPLE: EntityDefinition = {
  key: 'invoice',
  name: 'Invoice',
  pluralName: 'Invoices',
  fields: [{ key: 'status', type: 'string', name: 'Status', list: { visible: true } }],
  lifecycle: {
    field: 'status',
    initial: 'draft',
    states: ['draft', 'pending', 'approved', 'rejected'],
    transitions: [
      { key: 'submit', from: 'draft', to: 'pending' },
      { key: 'approve', from: 'pending', to: 'approved' },
      { key: 'reject', from: 'pending', to: 'rejected' },
    ],
  },
  capabilities: [
    { key: 'submit', type: 'transition', transition: 'submit' },
    {
      key: 'approve',
      type: 'transition',
      transition: 'approve',
      confirm: true,
      inputs: [{ key: 'note', type: 'text', label: 'Approval Note', required: false }],
    },
    {
      key: 'reject',
      type: 'transition',
      transition: 'reject',
      confirm: true,
      inputs: [
        { key: 'reason', type: 'text', label: 'Rejection Reason', required: true },
        { key: 'notify', type: 'boolean', label: 'Notify Customer', required: false, defaultValue: true },
        {
          key: 'priority',
          type: 'select',
          label: 'Follow-up Priority',
          options: ['low', 'medium', 'high'],
          required: false,
        },
      ],
    },
  ],
};

const CAPABILITIES_FULL_SAMPLE: EntityDefinition = {
  key: 'invoice',
  name: 'Invoice',
  pluralName: 'Invoices',
  fields: [
    { key: 'status', type: 'string', name: 'Status', list: { visible: true } },
    { key: 'assignee', type: 'string', name: 'Assignee', list: { visible: true } },
  ],
  lifecycle: {
    field: 'status',
    initial: 'draft',
    states: ['draft', 'pending', 'approved', 'rejected'],
    transitions: [
      { key: 'submit', from: 'draft', to: 'pending' },
      { key: 'approve', from: 'pending', to: 'approved' },
      { key: 'reject', from: 'pending', to: 'rejected' },
    ],
  },
  capabilities: [
    {
      key: 'approve',
      type: 'transition',
      transition: 'approve',
      confirm: true,
      description: 'Approve invoice',
      inputs: [{ key: 'note', type: 'text', label: 'Note', required: false }],
    },
    {
      key: 'reject',
      type: 'transition',
      transition: 'reject',
      confirm: true,
      description: 'Reject invoice',
      inputs: [{ key: 'reason', type: 'text', label: 'Reason', required: true }],
    },
    {
      key: 'reassign',
      type: 'mutation',
      updates: {},
      description: 'Reassign to another user',
      inputs: [{ key: 'assignee_id', type: 'entity', entity: 'user', label: 'New Assignee', required: true }],
    },
    { key: 'send_email', type: 'workflow', workflow: 'send_invoice_email', description: 'Email to customer' },
    { key: 'export_pdf', type: 'export', format: 'pdf', description: 'Download as PDF' },
    {
      key: 'sync_qb',
      type: 'integration',
      provider: 'quickbooks',
      operation: 'create_invoice',
      description: 'Sync to QuickBooks',
    },
  ],
};

const POLICIES_BASIC_SAMPLE: EntityDefinition = {
  key: 'invoice',
  name: 'Invoice',
  pluralName: 'Invoices',
  fields: [
    {
      key: 'status',
      type: 'enum',
      name: 'Status',
      enumValues: ['draft', 'pending', 'approved'],
      list: { visible: true },
    },
    { key: 'owner_id', type: 'string', name: 'Owner ID', list: { visible: true } },
    { key: 'total_amount', type: 'number', name: 'Total Amount', list: { visible: true } },
  ],
  lifecycle: {
    field: 'status',
    initial: 'draft',
    states: ['draft', 'pending', 'approved'],
    transitions: [
      { key: 'submit', from: 'draft', to: 'pending' },
      { key: 'approve', from: 'pending', to: 'approved' },
    ],
  },
  capabilities: [
    {
      key: 'approve',
      type: 'transition',
      transition: 'approve',
      scope: 'entity',
      confirm: true,
      description: 'Approve invoice',
    },
  ],
  policies: {
    view: { scope: 'role' },
    create: { scope: 'role' },
    update: { scope: 'role' },
    delete: { scope: 'role' },
  },
};

const POLICIES_CONDITIONAL_SAMPLE: EntityDefinition = {
  key: 'invoice',
  name: 'Invoice',
  pluralName: 'Invoices',
  fields: [
    { key: 'status', type: 'string', name: 'Status', list: { visible: true } },
    { key: 'owner_id', type: 'string', name: 'Owner ID', list: { visible: true } },
  ],
  policies: {
    view: { scope: 'role', condition: "owner_id == user.id OR user.hasScope('invoice.admin')" },
    update: { scope: 'role', condition: 'owner_id == user.id' },
    delete: { scope: 'role', condition: "owner_id == user.id OR user.hasScope('invoice.admin')" },
    create: { scope: 'role' },
  },
};

const POLICIES_FIELD_SAMPLE: EntityDefinition = {
  key: 'invoice',
  name: 'Invoice',
  pluralName: 'Invoices',
  fields: [
    { key: 'status', type: 'string', name: 'Status', list: { visible: true } },
    { key: 'total_amount', type: 'number', name: 'Total Amount', list: { visible: true } },
    { key: 'owner_id', type: 'string', name: 'Owner ID', list: { visible: true } },
    { key: 'internal_notes', type: 'text', name: 'Internal Notes', list: { visible: false } },
  ],
  policies: {
    view: { scope: 'role' },
    create: { scope: 'role' },
    update: { scope: 'role' },
    delete: { scope: 'role' },
  },
  fieldPolicies: {
    total_amount: { view: { scope: 'role' }, update: { scope: 'role' } },
    owner_id: { view: { scope: 'role' }, update: { scope: 'role' } },
    internal_notes: { view: { scope: 'role' }, update: { scope: 'role' } },
  },
};

const POLICIES_ROLES_SAMPLE: EntityDefinition = {
  key: 'invoice',
  name: 'Invoice',
  pluralName: 'Invoices',
  fields: [
    {
      key: 'status',
      type: 'enum',
      name: 'Status',
      enumValues: ['draft', 'pending', 'approved'],
      list: { visible: true },
    },
    { key: 'owner_id', type: 'string', name: 'Owner ID', list: { visible: true } },
    { key: 'total_amount', type: 'number', name: 'Total Amount', list: { visible: true } },
  ],
  lifecycle: {
    field: 'status',
    initial: 'draft',
    states: ['draft', 'pending', 'approved'],
    transitions: [
      { key: 'submit', from: 'draft', to: 'pending' },
      { key: 'approve', from: 'pending', to: 'approved' },
    ],
  },
  capabilities: [
    {
      key: 'approve',
      type: 'transition',
      transition: 'approve',
      scope: 'entity',
      confirm: true,
      description: 'Approve invoice',
    },
    { key: 'export_pdf', type: 'export', format: 'pdf', scope: 'global', description: 'Download as PDF' },
  ],
  policies: {
    view: { scope: 'role' },
    create: { scope: 'role' },
    update: { scope: 'role', condition: 'owner_id == user.id' },
    delete: { scope: 'role' },
  },
  fieldPolicies: {
    total_amount: {
      view: { scope: 'role' },
      update: { scope: 'role' },
    },
  },
};

export type BuilderSampleKey =
  | 'app'
  | 'dashboard'
  | 'list'
  | 'detail'
  | 'form'
  | 'simple-entity'
  | 'nested-entity'
  | 'entity-belongs-to'
  | 'entity-has-many'
  | 'entity-many-to-many'
  | 'entity-polymorphic'
  | 'entity-all-relations'
  | 'computed-expression'
  | 'computed-aggregation'
  | 'computed-conditional'
  | 'computed-all'
  | 'lifecycle-simple'
  | 'lifecycle-guards'
  | 'lifecycle-hooks'
  | 'lifecycle-full'
  | 'events-entity'
  | 'events-lifecycle'
  | 'events-full'
  | 'capabilities-simple'
  | 'capabilities-inputs'
  | 'capabilities-full'
  | 'policies-basic'
  | 'policies-conditional'
  | 'policies-field'
  | 'policies-roles'
  | 'validation';

export const BUILDER_SAMPLES: Record<
  BuilderSampleKey,
  EntityDefinition | FieldRuleDefinition[] | PageDefinition | CellManifestV1
> = {
  app: SUPPORT_CELL_MANIFEST,
  dashboard: DASHBOARD_SAMPLE,
  list: SIMPLE_ENTITY_SAMPLE,
  detail: SIMPLE_ENTITY_SAMPLE,
  form: FORM_SAMPLE,
  'simple-entity': SIMPLE_ENTITY_SAMPLE,
  'nested-entity': NESTED_ENTITY_SAMPLE,
  'entity-belongs-to': BELONGS_TO_SAMPLE,
  'entity-has-many': HAS_MANY_SAMPLE,
  'entity-many-to-many': MANY_TO_MANY_SAMPLE,
  'entity-polymorphic': POLYMORPHIC_SAMPLE,
  'entity-all-relations': ALL_RELATIONS_SAMPLE,
  'computed-expression': COMPUTED_EXPRESSION_SAMPLE,
  'computed-aggregation': COMPUTED_AGGREGATION_SAMPLE,
  'computed-conditional': COMPUTED_CONDITIONAL_SAMPLE,
  'computed-all': COMPUTED_ALL_SAMPLE,
  'lifecycle-simple': LIFECYCLE_SIMPLE_SAMPLE,
  'lifecycle-guards': LIFECYCLE_GUARDS_SAMPLE,
  'lifecycle-hooks': LIFECYCLE_HOOKS_SAMPLE,
  'lifecycle-full': LIFECYCLE_FULL_SAMPLE,
  'events-entity': EVENTS_ENTITY_SAMPLE,
  'events-lifecycle': EVENTS_LIFECYCLE_SAMPLE,
  'events-full': EVENTS_FULL_SAMPLE,
  'capabilities-simple': CAPABILITIES_SIMPLE_SAMPLE,
  'capabilities-inputs': CAPABILITIES_INPUTS_SAMPLE,
  'capabilities-full': CAPABILITIES_FULL_SAMPLE,
  'policies-basic': POLICIES_BASIC_SAMPLE,
  'policies-conditional': POLICIES_CONDITIONAL_SAMPLE,
  'policies-field': POLICIES_FIELD_SAMPLE,
  'policies-roles': POLICIES_ROLES_SAMPLE,
  validation: VALIDATION_SAMPLE,
};
