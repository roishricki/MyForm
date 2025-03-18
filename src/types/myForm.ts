export interface Step {
  num: number;
  title: string;
  subtitle: string;
}

export interface PersonalInfo {
  field: keyof FormValues;
  label: string;
  placeholder: string;
}

export interface PlanOption {
  id: string;
  name: string;
  description?: string;
  monthly_price: number;
  yearly_price: number;
  icon_path: string;
}

export interface AddOn {
  id: string;
  name: string;
  description: string;
  monthly_price: number;
  yearly_price: number;
}

export interface FormValues {
  name: string;
  email: string;
  phone: string;
  planType: string;
  isYearly: boolean;
  addOns: string[];
}
