export type CategoryId =
  | 'all'
  | 'honey'
  | 'dates'
  | 'personal-care'
  | 'oils'
  | 'nuts'
  | 'derivatives';

export interface ProductCategory {
  id: CategoryId;
  name: string;
  shortName: string;
  icon: string;
  coverImage?: string;
  description: string;
  corporateSummary: string;
  origins?: string[];
}

export interface HealthTag {
  id: string;
  label: string;
  keywords: string[];
}

export interface Product {
  code: string;
  displayCode?: string;
  name: string;
  category: Exclude<CategoryId, 'all'>;
  subCategory: string;
  unit: string;
  price: number | null;
  altPrices: string[];
  badge?: string;
  featured: boolean;
  image: string;
  gallery: string[];
  benefits: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface BranchInfo {
  id: string;
  name: string;
  city: string;
  type: string;
  address: string;
  phone: string;
  hours: string;
  notes: string;
}

export interface CompanyServiceItem {
  id: string;
  icon: string;
  title: string;
  audience: string;
  summary: string;
  features: string[];
}

export interface SiteConfig {
  companyName: string;
  companyNameEn: string;
  slogan: string;
  sloganEn: string;
  establishedNote: string;
  description: string;
  currency: string;
  contact: {
    phonePrimary: string;
    phoneSecondary: string;
    whatsapp: string;
    whatsappDisplay: string;
    email: string;
    website: string;
    websiteUrl: string;
    addressMain: string;
    workingHours: string;
  };
  social: {
    handle: string;
    instagram: string;
    facebook: string;
    twitter: string;
    snapchat: string;
    youtube: string;
  };
}
