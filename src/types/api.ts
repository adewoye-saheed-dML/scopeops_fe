export interface UserRead {
  id: string;
  email: string;
  full_name: string | null;
  picture: string | null;
  provider: string;
}

export interface UserCreate {
  email: string;
  password: string;
  full_name?: string | null;
}

export interface Token {
  access_token: string;
  token_type: string;
}

export interface SupplierRead {
  supplier_name: string;
  domain: string | null;
  industry_locked: string;
  region: string | null;
  sbti_status: string | null;
  parent_id: string | null;
  id: string;
  has_disclosure: boolean;
  created_at: string;
  updated_at: string;
}

export interface SupplierCreate {
  supplier_name: string;
  domain?: string | null;
  industry_locked: string;
  region?: string | null;
  sbti_status?: string | null;
  parent_id?: string | null;
}

export interface SpendRead {
  supplier_id: string;
  category_code: string;
  fiscal_year: number;
  spend_amount: string | null;
  currency: string | null;
  quantity: string | null;
  unit_of_measure: string | null;
  material_type: string | null;
  factor_used_id: string | null;
  spend_id: number;
  calculated_co2e: string | null;
  calculated_scope_1: string | null;
  calculated_scope_2: string | null;
  calculated_scope_3: string | null;
  calculated_at: string | null;
  calculation_method: string | null;
}

export interface SpendCreate {
  supplier_id: string;
  category_code: string;
  fiscal_year: number;
  spend_amount?: number | string | null;
  currency?: string | null;
  quantity?: number | string | null;
  unit_of_measure?: string | null;
  material_type?: string | null;
  factor_used_id?: string | null;
}

export interface EmissionFactorCreate {
  provider: string;
  name: string;
  geography: string;
  year: number;
  unit_of_measure?: string;
  co2e_per_unit: number;
  scope_1_intensity?: number | null;
  scope_2_intensity?: number | null;
  scope_3_intensity?: number | null;
  version: string;
  external_id?: string | null;
  source_url?: string | null;
  methodology?: string | null;
}
