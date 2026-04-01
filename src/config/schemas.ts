export interface Column {
  key: string
  label: string
  type: 'text' | 'number' | 'boolean' | 'date' | 'textarea' | 'select'
  mono?: boolean
  hideInForm?: boolean
  lookup?: {
    table: string
    keyField: string
    labelField: string
  }
}

export interface TableSchema {
  name: string
  readOnly: boolean
  columns: Column[]
}

export const tableSchemas: Record<string, TableSchema> = {
  profiles: {
    name: 'Profiles',
    readOnly: true,
    columns: [
      { key: 'id', label: 'ID', type: 'text', mono: true },
      { key: 'email', label: 'Email', type: 'text' },
      { key: 'is_superadmin', label: 'Superadmin', type: 'boolean' },
      { key: 'is_matrix_admin', label: 'Matrix Admin', type: 'boolean' },
      { key: 'created_datetime_utc', label: 'Created', type: 'date' },
    ]
  },
  images: {
    name: 'Images',
    readOnly: false,
    columns: [
      { key: 'id', label: 'ID', type: 'text', mono: true, hideInForm: true },
      { key: 'url', label: 'Image URL', type: 'text' },
      { key: 'is_public', label: 'Public', type: 'boolean' },
      { key: 'is_common_use', label: 'Common Use', type: 'boolean' },
      { key: 'image_description', label: 'Description', type: 'textarea' },
      { key: 'created_datetime_utc', label: 'Created', type: 'date', hideInForm: true },
    ]
  },
  humor_flavors: {
    name: 'Humor Flavors',
    readOnly: false,
    columns: [
      { key: 'id', label: 'ID', type: 'text', mono: true, hideInForm: true },
      { key: 'slug', label: 'Slug', type: 'text' },
      { key: 'description', label: 'Description', type: 'text' },
      { key: 'created_datetime_utc', label: 'Created', type: 'date', hideInForm: true },
    ]
  },
  humor_flavor_steps: {
    name: 'Humor Flavor Steps',
    readOnly: false,
    columns: [
      { key: 'id', label: 'ID', type: 'text', mono: true, hideInForm: true },
      { 
        key: 'humor_flavor_id', 
        label: 'Humor Flavor', 
        type: 'select',
        lookup: { table: 'humor_flavors', keyField: 'id', labelField: 'slug' }
      },
      { key: 'order_by', label: 'Order', type: 'number' },
      { key: 'llm_system_prompt', label: 'System Prompt', type: 'textarea' },
      { key: 'llm_user_prompt', label: 'User Prompt', type: 'textarea' },
      { key: 'llm_temperature', label: 'Temperature (0-1)', type: 'number' },
      { 
        key: 'llm_model_id', 
        label: 'LLM Model', 
        type: 'select',
        lookup: { table: 'llm_models', keyField: 'id', labelField: 'name' }
      },
      { 
        key: 'llm_input_type_id', 
        label: 'Input Type', 
        type: 'select',
        lookup: { table: 'llm_input_types', keyField: 'id', labelField: 'slug' }
      },
      { 
        key: 'llm_output_type_id', 
        label: 'Output Type', 
        type: 'select',
        lookup: { table: 'llm_output_types', keyField: 'id', labelField: 'slug' }
      },
      { 
        key: 'humor_flavor_step_type_id', 
        label: 'Step Type', 
        type: 'select',
        lookup: { table: 'humor_flavor_step_types', keyField: 'id', labelField: 'slug' }
      },
    ]
  },
  terms: {
    name: 'Terms',
    readOnly: false,
    columns: [
      { key: 'id', label: 'ID', type: 'text', mono: true, hideInForm: true },
      { key: 'term', label: 'Term', type: 'text' },
      { key: 'definition', label: 'Definition', type: 'textarea' },
      { key: 'example', label: 'Example', type: 'textarea' },
      { key: 'priority', label: 'Priority', type: 'number' },
    ]
  },
  captions: {
    name: 'Captions',
    readOnly: true,
    columns: [
      { key: 'id', label: 'ID', type: 'text', mono: true },
      { key: 'content', label: 'Content', type: 'text' },
      { key: 'like_count', label: 'Likes', type: 'number' },
      { key: 'is_featured', label: 'Featured', type: 'boolean' },
    ]
  },
  caption_requests: {
    name: 'Caption Requests',
    readOnly: true,
    columns: [
      { key: 'id', label: 'ID', type: 'text', mono: true },
      { 
        key: 'image_id', 
        label: 'Image', 
        type: 'select',
        lookup: { table: 'images', keyField: 'id', labelField: 'url' }
      },
      { 
        key: 'profile_id', 
        label: 'Profile', 
        type: 'select',
        lookup: { table: 'profiles', keyField: 'id', labelField: 'email' }
      },
      { key: 'created_datetime_utc', label: 'Created', type: 'date' },
    ]
  },
  caption_examples: {
    name: 'Caption Examples',
    readOnly: false,
    columns: [
      { key: 'id', label: 'ID', type: 'text', mono: true, hideInForm: true },
      { 
        key: 'image_id', 
        label: 'Image', 
        type: 'select',
        lookup: { table: 'images', keyField: 'id', labelField: 'url' }
      },
      { key: 'caption', label: 'Caption', type: 'text' },
      { key: 'explanation', label: 'Explanation', type: 'textarea' },
      { key: 'priority', label: 'Priority', type: 'number' },
    ]
  },
  llm_models: {
    name: 'LLM Models',
    readOnly: false,
    columns: [
      { key: 'id', label: 'ID', type: 'text', mono: true, hideInForm: true },
      { key: 'name', label: 'Name', type: 'text' },
      { key: 'llm_provider_id', label: 'Provider ID', type: 'text' },
      { key: 'provider_model_id', label: 'Provider Model ID', type: 'text' },
    ]
  },
  llm_providers: {
    name: 'LLM Providers',
    readOnly: false,
    columns: [
      { key: 'id', label: 'ID', type: 'text', mono: true, hideInForm: true },
      { key: 'name', label: 'Name', type: 'text' },
    ]
  },
  llm_prompt_chains: {
    name: 'LLM Prompt Chains',
    readOnly: true,
    columns: [
      { key: 'id', label: 'ID', type: 'text', mono: true },
      { key: 'caption_request_id', label: 'Request ID', type: 'text' },
      { key: 'created_datetime_utc', label: 'Created', type: 'date' },
    ]
  },
  allowed_signup_domains: {
    name: 'Allowed Signup Domains',
    readOnly: false,
    columns: [
      { key: 'id', label: 'ID', type: 'text', mono: true, hideInForm: true },
      { key: 'apex_domain', label: 'Domain', type: 'text' },
    ]
  },
  humor_flavor_mix: {
    name: 'Humor Mix',
    readOnly: false,
    columns: [
      { key: 'id', label: 'ID', type: 'text', mono: true, hideInForm: true },
      { 
        key: 'humor_flavor_id', 
        label: 'Humor Flavor', 
        type: 'select',
        lookup: { table: 'humor_flavors', keyField: 'id', labelField: 'slug' }
      },
      { key: 'caption_count', label: 'Caption Count', type: 'number' },
    ]
  },
  llm_model_responses: {
    name: 'LLM Responses',
    readOnly: true,
    columns: [
      { key: 'id', label: 'ID', type: 'text', mono: true },
      { key: 'llm_model_response', label: 'Response', type: 'textarea' },
      { key: 'llm_model_id', label: 'Model ID', type: 'text' },
      { key: 'created_datetime_utc', label: 'Created', type: 'date' },
    ]
  },
  whitelist_email_addresses: {
    name: 'Whitelisted Emails',
    readOnly: false,
    columns: [
      { key: 'id', label: 'ID', type: 'text', mono: true, hideInForm: true },
      { key: 'email_address', label: 'Email Address', type: 'text' },
    ]
  },
}
