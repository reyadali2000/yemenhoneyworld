import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { CatalogService } from '../../services/catalog.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [RouterLink, FormsModule],
  template: `
    <section class="page-hero">
      <div class="container">
        <div class="breadcrumb">
          <a routerLink="/">الرئيسية</a>
          <span>/</span>
          <a routerLink="/shop">المتجر الإلكتروني</a>
          <span>/</span>
          <span>سلة الطلبات</span>
        </div>
        <span class="page-hero-eyebrow">🛒 مراجعة الطلب وإرساله</span>
        <h1>سلة الطلبات</h1>
        <p>
          راجع الأصناف والكميات المختارة، وأرسل طلبك مباشرة عبر واتساب إلى الرقم الرسمي
          <strong dir="ltr">{{ catalog.siteConfig.contact.whatsappDisplay }}</strong>.
        </p>
      </div>
    </section>

    <section class="section-block">
      <div class="container">
        @if (cart.items().length === 0) {
          <div class="empty-cart-box">
            <div class="empty-icon">🛒</div>
            <h2>سلة الطلبات فارغة حالياً</h2>
            <p>يمكنك تصفح أقسام المتجر الإلكتروني وإضافة الأصناف التي ترغب في طلبها.</p>
            <a routerLink="/shop" class="btn-gold">🛍️ الانتقال إلى المتجر الإلكتروني</a>
          </div>
        } @else {
          <div class="cart-grid">
            <!-- قائمة الأصناف -->
            <div class="cart-items-col">
              @for (entry of cart.items(); track entry.product.code) {
                <article class="cart-row-card">
                  <img [src]="entry.product.image" [alt]="entry.product.name" />
                  <div class="cart-row-info">
                    <span class="sku-tag">رقم الصنف: {{ entry.product.displayCode || entry.product.code }}</span>
                    <h3>
                      <a [routerLink]="['/shop/product', entry.product.code]">
                        {{ entry.product.name }}
                      </a>
                    </h3>
                    <div class="unit-note">
                      الوحدة: {{ entry.product.unit }} • سعر الوحدة:
                      {{ catalog.formatPrice(entry.product.price) }}
                      {{ entry.product.price ? catalog.siteConfig.currency : '' }}
                    </div>
                  </div>

                  <div class="cart-row-actions">
                    <div class="qty-stepper">
                      <button type="button" (click)="cart.updateQuantity(entry.product.code, -1)">−</button>
                      <span>{{ entry.quantity }}</span>
                      <button type="button" (click)="cart.updateQuantity(entry.product.code, 1)">+</button>
                    </div>
                    <div class="line-total">
                      {{
                        entry.product.price
                          ? catalog.formatPrice(entry.product.price * entry.quantity) + ' ' + catalog.siteConfig.currency
                          : 'حسب الطلب'
                      }}
                    </div>
                    <button
                      type="button"
                      class="remove-btn"
                      (click)="cart.removeItem(entry.product.code)"
                    >
                      🗑️ حذف
                    </button>
                  </div>
                </article>
              }

              <div class="cart-bottom-links">
                <a routerLink="/shop" class="btn-outline-dark">← متابعة التسوق في المتجر</a>
                <button type="button" class="clear-all-btn" (click)="cart.clearCart()">
                  إفراغ السلة بالكامل
                </button>
              </div>
            </div>

            <!-- ملخص الطلب وبيانات العميل -->
            <aside class="checkout-panel">
              <h2>📋 ملخص الطلب وإرساله للواتساب</h2>

              <div class="summary-box">
                <div class="sum-line">
                  <span>عدد الأصناف المختارة:</span>
                  <strong>{{ cart.totalCount() }}</strong>
                </div>
                <div class="sum-line total">
                  <span>الإجمالي التقديري:</span>
                  <strong>
                    {{ catalog.formatPrice(cart.totalPrice()) }} {{ catalog.siteConfig.currency }}
                  </strong>
                </div>
                @if (cart.hasUnpricedItems()) {
                  <p class="unpriced-note">* توجد أصناف في السلة يتم تسعيرها حسب الطلب عند التواصل.</p>
                }
              </div>

              <div class="customer-fields">
                <h3>👤 بيانات العميل والتوصيل (اختياري)</h3>
                <input type="text" [(ngModel)]="customer.name" placeholder="الاسم الكريم" />
                <input type="text" dir="ltr" [(ngModel)]="customer.phone" placeholder="رقم الجوال للتواصل" />
                <input type="text" [(ngModel)]="customer.address" placeholder="المدينة / العنوان" />
                <textarea rows="2" [(ngModel)]="customer.notes" placeholder="أي ملاحظات إضافية على الطلب..."></textarea>
              </div>

              <button type="button" class="btn-whatsapp-checkout" (click)="sendToWhatsApp()">
                💬 إرسال الطلب الآن إلى واتساب ({{ catalog.siteConfig.contact.whatsappDisplay }})
              </button>
            </aside>
          </div>
        }
      </div>
    </section>
  `,
  styles: [`
    .empty-cart-box {
      text-align: center;
      padding: 4rem 1.5rem;
      background: var(--bg-card);
      border: 1.5px dashed var(--border-color);
      border-radius: var(--radius-lg);
    }

    .empty-icon {
      font-size: 3.5rem;
      margin-bottom: 0.75rem;
    }

    .empty-cart-box p {
      color: var(--text-secondary);
      margin: 0.5rem 0 1.5rem;
    }

    .cart-grid {
      display: grid;
      grid-template-columns: 1.25fr 0.75fr;
      gap: 2rem;
      align-items: start;
    }

    .cart-items-col {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .cart-row-card {
      display: grid;
      grid-template-columns: 88px 1fr auto;
      gap: 1.1rem;
      align-items: center;
      background: var(--bg-card);
      border: 1.5px solid var(--border-color);
      border-radius: var(--radius-md);
      padding: 1rem;
    }

    .cart-row-card img {
      width: 88px;
      height: 88px;
      object-fit: contain;
      background: #FFFFFF;
      border-radius: 10px;
      border: 1px solid var(--border-color);
    }

    .sku-tag {
      background: var(--bg-alt);
      color: var(--gold-dark);
      font-size: 0.75rem;
      font-weight: 800;
      padding: 0.12rem 0.55rem;
      border-radius: 999px;
      display: inline-block;
      margin-bottom: 0.25rem;
    }

    .cart-row-info h3 {
      font-size: 1.05rem;
      font-weight: 800;
      color: var(--obsidian);
      margin-bottom: 0.2rem;
    }

    .unit-note {
      font-size: 0.84rem;
      color: var(--text-secondary);
    }

    .cart-row-actions {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 0.5rem;
    }

    .qty-stepper {
      display: inline-flex;
      align-items: center;
      border: 1px solid var(--border-color);
      border-radius: 8px;
      overflow: hidden;
      background: var(--bg-main);
    }

    .qty-stepper button {
      width: 30px;
      height: 30px;
      border: none;
      background: var(--bg-alt);
      font-weight: 900;
      cursor: pointer;
    }

    .qty-stepper span {
      min-width: 30px;
      text-align: center;
      font-weight: 800;
    }

    .line-total {
      font-size: 1rem;
      font-weight: 900;
      color: var(--obsidian);
    }

    .remove-btn {
      background: none;
      border: none;
      color: var(--danger);
      font-size: 0.82rem;
      font-weight: 700;
      cursor: pointer;
    }

    .cart-bottom-links {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 0.5rem;
      flex-wrap: wrap;
      gap: 0.75rem;
    }

    .clear-all-btn {
      background: #FEE2E2;
      color: #991B1B;
      border: 1px solid #FCA5A5;
      padding: 0.65rem 1.15rem;
      border-radius: 999px;
      font-weight: 800;
      cursor: pointer;
    }

    .checkout-panel {
      background: var(--bg-card);
      border: 1.5px solid var(--gold-primary);
      border-radius: var(--radius-lg);
      padding: 1.5rem;
      box-shadow: var(--shadow-md);
    }

    .checkout-panel h2 {
      font-size: 1.2rem;
      font-weight: 900;
      color: var(--obsidian);
      margin-bottom: 1rem;
    }

    .summary-box {
      background: var(--obsidian);
      color: #FFFFFF;
      padding: 1rem 1.15rem;
      border-radius: var(--radius-md);
      margin-bottom: 1.25rem;
    }

    .sum-line {
      display: flex;
      justify-content: space-between;
      font-size: 0.92rem;
      margin-bottom: 0.4rem;
    }

    .sum-line.total {
      border-top: 1px solid rgba(229, 184, 75, 0.25);
      padding-top: 0.55rem;
      margin-top: 0.4rem;
      font-size: 1.08rem;
    }

    .sum-line.total strong {
      color: var(--gold-bright);
    }

    .unpriced-note {
      font-size: 0.78rem;
      color: var(--gold-light);
      margin-top: 0.35rem;
    }

    .customer-fields {
      display: flex;
      flex-direction: column;
      gap: 0.65rem;
      margin-bottom: 1.25rem;
    }

    .customer-fields h3 {
      font-size: 0.92rem;
      font-weight: 800;
      color: var(--obsidian);
    }

    .customer-fields input, .customer-fields textarea {
      padding: 0.65rem 0.9rem;
      border: 1.5px solid var(--border-color);
      border-radius: var(--radius-sm);
      background: var(--bg-main);
      font-size: 0.9rem;
    }

    .btn-whatsapp-checkout {
      width: 100%;
      background: #15803D;
      color: #FFFFFF;
      border: none;
      padding: 0.95rem 1.2rem;
      border-radius: var(--radius-md);
      font-size: 0.98rem;
      font-weight: 800;
      cursor: pointer;
    }

    .btn-whatsapp-checkout:hover {
      background: #166534;
    }

    @media (max-width: 900px) {
      .cart-grid {
        grid-template-columns: 1fr;
      }
      .cart-row-card {
        grid-template-columns: 70px 1fr;
      }
      .cart-row-actions {
        grid-column: span 2;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
        width: 100%;
      }
    }
  `]
})
export class CartComponent {
  readonly catalog = inject(CatalogService);
  readonly cart = inject(CartService);

  customer = {
    name: '',
    phone: '',
    address: '',
    notes: ''
  };

  sendToWhatsApp(): void {
    const url = this.cart.buildWhatsAppOrderUrl(this.customer);
    window.open(url, '_blank', 'noopener');
  }
}
