import { Injectable, computed, signal } from '@angular/core';
import { SITE_CONFIG } from '../data/site-config.data';
import { CartItem, Product } from '../models/catalog.models';

const STORAGE_KEY = 'YHW_NG_CART_V1';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private readonly itemsSignal = signal<CartItem[]>(this.loadFromStorage());
  private readonly toastSignal = signal<string | null>(null);
  private toastTimer: ReturnType<typeof setTimeout> | null = null;

  readonly items = this.itemsSignal.asReadonly();
  readonly toastMessage = this.toastSignal.asReadonly();

  readonly totalCount = computed(() =>
    this.itemsSignal().reduce((sum, item) => sum + item.quantity, 0)
  );

  readonly totalPrice = computed(() =>
    this.itemsSignal().reduce((sum, item) => {
      const unitPrice = item.product.price ?? 0;
      return sum + unitPrice * item.quantity;
    }, 0)
  );

  readonly hasUnpricedItems = computed(() =>
    this.itemsSignal().some((item) => item.product.price === null)
  );

  addItem(product: Product, quantity = 1): void {
    const current = [...this.itemsSignal()];
    const existingIndex = current.findIndex((c) => c.product.code === product.code);

    if (existingIndex >= 0) {
      current[existingIndex] = {
        ...current[existingIndex],
        quantity: current[existingIndex].quantity + quantity
      };
    } else {
      current.push({ product, quantity });
    }

    this.itemsSignal.set(current);
    this.saveToStorage(current);
    this.showToast(`تمت إضافة "${product.name}" إلى سلة الطلبات`);
  }

  updateQuantity(code: string, delta: number): void {
    const updated = this.itemsSignal()
      .map((item) =>
        item.product.code === code
          ? { ...item, quantity: item.quantity + delta }
          : item
      )
      .filter((item) => item.quantity > 0);

    this.itemsSignal.set(updated);
    this.saveToStorage(updated);
  }

  removeItem(code: string): void {
    const updated = this.itemsSignal().filter((item) => item.product.code !== code);
    this.itemsSignal.set(updated);
    this.saveToStorage(updated);
  }

  clearCart(): void {
    this.itemsSignal.set([]);
    this.saveToStorage([]);
  }

  buildWhatsAppOrderUrl(customer: {
    name?: string;
    phone?: string;
    address?: string;
    notes?: string;
  }): string {
    const items = this.itemsSignal();
    const lines: string[] = [
      'السلام عليكم ورحمة الله وبركاته',
      '🍯 *طلب جديد من المتجر الإلكتروني — شركة عالم العسل اليمني*',
      '────────────────────'
    ];

    items.forEach((entry, idx) => {
      const p = entry.product;
      const sku = p.displayCode || p.code;
      const lineTotal = p.price ? p.price * entry.quantity : 0;
      const priceLabel = p.price
        ? `${p.price.toLocaleString('en-US')} ${SITE_CONFIG.currency}`
        : 'حسب الطلب';
      const lineTotalLabel = p.price
        ? ` = ${lineTotal.toLocaleString('en-US')} ${SITE_CONFIG.currency}`
        : '';

      lines.push(
        `${idx + 1}. *${p.name}*`,
        `   • رقم الصنف: ${sku} | الوحدة: ${p.unit}`,
        `   • الكمية: ${entry.quantity} × ${priceLabel}${lineTotalLabel}`
      );
    });

    lines.push('────────────────────');
    lines.push(
      `💰 *الإجمالي التقديري:* ${this.totalPrice().toLocaleString('en-US')} ${SITE_CONFIG.currency}${
        this.hasUnpricedItems() ? ' (+ أصناف حسب الطلب)' : ''
      }`
    );

    if (customer.name || customer.phone || customer.address || customer.notes) {
      lines.push('────────────────────');
      lines.push('👤 *بيانات العميل والتوصيل:*');
      if (customer.name) lines.push(`• الاسم: ${customer.name}`);
      if (customer.phone) lines.push(`• الجوال: ${customer.phone}`);
      if (customer.address) lines.push(`• المدينة / العنوان: ${customer.address}`);
      if (customer.notes) lines.push(`• ملاحظات إضافية: ${customer.notes}`);
    }

    const waNumber = SITE_CONFIG.contact.whatsapp.replace(/[^0-9]/g, '') || '967773019999';
    return `https://wa.me/${waNumber}?text=${encodeURIComponent(lines.join('\n'))}`;
  }

  private showToast(message: string): void {
    this.toastSignal.set(message);
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => {
      this.toastSignal.set(null);
    }, 2800);
  }

  private loadFromStorage(): CartItem[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  private saveToStorage(items: CartItem[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Ignore storage quota errors
    }
  }
}
