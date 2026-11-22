import { Injectable } from '@angular/core';
import { HEALTH_TAGS, PRODUCTS_DATA, PRODUCT_CATEGORIES } from '../data/catalog.data';
import {
  COMPANY_BRANCHES,
  COMPANY_MILESTONES,
  COMPANY_SERVICES,
  SITE_CONFIG
} from '../data/site-config.data';
import { CategoryId, HealthTag, Product, ProductCategory } from '../models/catalog.models';

@Injectable({
  providedIn: 'root'
})
export class CatalogService {
  readonly siteConfig = SITE_CONFIG;
  readonly branches = COMPANY_BRANCHES;
  readonly services = COMPANY_SERVICES;
  readonly milestones = COMPANY_MILESTONES;
  readonly categories: ProductCategory[] = PRODUCT_CATEGORIES;
  readonly healthTags: HealthTag[] = HEALTH_TAGS;
  readonly products: Product[] = PRODUCTS_DATA;

  getCategoryById(id: CategoryId): ProductCategory | undefined {
    return this.categories.find((c) => c.id === id);
  }

  getCategoryName(id: CategoryId): string {
    return this.getCategoryById(id)?.name ?? id;
  }

  getProductByCode(code: string): Product | undefined {
    return this.products.find((p) => p.code === code || p.displayCode === code);
  }

  getCountByCategory(id: CategoryId): number {
    if (id === 'all') return this.products.length;
    return this.products.filter((p) => p.category === id).length;
  }

  getRelatedProducts(product: Product, limit = 4): Product[] {
    return this.products
      .filter((p) => p.category === product.category && p.code !== product.code)
      .slice(0, limit);
  }

  parseMedicalBenefits(text: string): string[] {
    if (!text) return ['منتج طبيعي أصيل من شركة عالم العسل اليمني.'];
    const parts = text
      .split(/\.(?=\s*[^\d\s])/g)
      .map((s) => s.trim())
      .filter((s) => s.length > 3);
    if (parts.length === 0) return [text];
    return parts.map((part) => (part.endsWith('.') ? part : `${part}.`));
  }

  formatPrice(price: number | null): string {
    if (price === null || price === undefined || Number.isNaN(price)) {
      return 'حسب الطلب';
    }
    return Number(price).toLocaleString('en-US');
  }
}
