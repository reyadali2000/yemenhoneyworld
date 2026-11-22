import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Product } from '../../models/catalog.models';
import { CartService } from '../../services/cart.service';
import { CatalogService } from '../../services/catalog.service';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [RouterLink],
  template: `
    @if (product(); as p) {
      <section class="detail-hero">
        <div class="container">
          <div class="breadcrumb">
            <a routerLink="/">الرئيسية</a>
            <span>/</span>
            <a routerLink="/shop">المتجر الإلكتروني</a>
            <span>/</span>
            <a routerLink="/shop" [queryParams]="{ category: p.category }">
              {{ catalog.getCategoryName(p.category) }}
            </a>
            <span>/</span>
            <span>{{ p.name }}</span>
          </div>
        </div>
      </section>

      <section class="section-block" style="padding-top:2rem;">
        <div class="container detail-grid">
          <!-- معرض الصور -->
          <div class="gallery-col">
            <div class="main-img-box">
              <img [src]="activeImage()" [alt]="p.name" />
            </div>
            @if (p.gallery.length > 1) {
              <div class="thumbs-row">
                @for (img of p.gallery; track img) {
                  <button
                    type="button"
                    class="thumb-btn"
                    [class.active]="activeImage() === img"
                    (click)="selectedImage.set(img)"
                  >
                    <img [src]="img" [alt]="p.name" />
                  </button>
                }
              </div>
            }
          </div>

          <!-- تفاصيل المنتج -->
          <div class="info-col">
            <div class="meta-pills">
              <span class="sku-pill">رقم الصنف: {{ p.displayCode || p.code }}</span>
              <span class="cat-pill">{{ catalog.getCategoryName(p.category) }}</span>
              <span class="cat-pill">الوحدة: {{ p.unit }}</span>
              @if (p.badge) {
                <span class="badge-pill">{{ p.badge }}</span>
              }
            </div>

            <h1>{{ p.name }}</h1>

            <div class="price-box">
              <div>
                <span class="p-lbl">سعر التجزئة المعتمد ({{ p.unit }})</span>
                <div class="p-val">
                  {{ catalog.formatPrice(p.price) }}
                  @if (p.price) {
                    <span>{{ catalog.siteConfig.currency }}</span>
                  }
                </div>
              </div>
              @if (p.altPrices.length > 0) {
                <div class="alt-prices">
                  @for (ap of p.altPrices; track ap) {
                    <span class="alt-pill">📦 {{ ap }}</span>
                  }
                </div>
              }
            </div>

            <div class="benefits-box">
              <h3>🩺 الفوائد الطبية والبيولوجية الموثقة</h3>
              <ul>
                @for (point of benefitsList(); track point) {
                  <li>{{ point }}</li>
                }
              </ul>
            </div>

            <div class="purchase-bar">
              <div class="qty-box">
                <button type="button" (click)="changeQty(-1)">−</button>
                <span>{{ quantity() }}</span>
                <button type="button" (click)="changeQty(1)">+</button>
              </div>
              <button type="button" class="btn-gold" style="flex:1;" (click)="addToCart(p)">
                <span>🛒 إضافة إلى سلة الطلبات</span>
              </button>
              <a routerLink="/shop/cart" class="btn-obsidian">عرض السلة ({{ cart.totalCount() }})</a>
            </div>
          </div>
        </div>

        <!-- منتجات مشابهة -->
        @if (relatedProducts().length > 0) {
          <div class="container" style="margin-top:4rem;">
            <div class="section-heading">
              <span class="eyebrow">✦ من نفس القسم</span>
              <h2>منتجات أخرى قد تهمك</h2>
            </div>
            <div class="related-grid">
              @for (rel of relatedProducts(); track rel.code) {
                <a [routerLink]="['/shop/product', rel.code]" class="rel-card">
                  <img [src]="rel.image" [alt]="rel.name" loading="lazy" />
                  <div class="rel-body">
                    <h4>{{ rel.name }}</h4>
                    <span class="rel-price">
                      {{ catalog.formatPrice(rel.price) }}
                      {{ rel.price ? catalog.siteConfig.currency : '' }}
                    </span>
                  </div>
                </a>
              }
            </div>
          </div>
        }
      </section>
    } @else {
      <section class="section-block">
        <div class="container" style="text-align:center;">
          <h2>لم يتم العثور على المنتج المطلوب</h2>
          <p style="margin:0.75rem 0 1.5rem;">ربما تم تغيير رقم الصنف أو الرابط غير صحيح.</p>
          <a routerLink="/shop" class="btn-gold">العودة إلى المتجر الإلكتروني</a>
        </div>
      </section>
    }
  `,
  styles: [`
    .detail-hero {
      background: #1C140C;
      padding: 1.15rem 0;
      border-bottom: 1px solid rgba(229, 184, 75, 0.25);
    }

    .detail-hero .breadcrumb {
      margin-bottom: 0;
    }

    .detail-grid {
      display: grid;
      grid-template-columns: 0.9fr 1.1fr;
      gap: 2.5rem;
      align-items: start;
    }

    .main-img-box {
      background: radial-gradient(circle, #FFFFFF, #F3ECE0);
      border: 1.5px solid var(--border-color);
      border-radius: var(--radius-lg);
      height: 410px;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }

    .main-img-box img {
      width: 100%;
      height: 100%;
      object-fit: contain;
      padding: 0.75rem;
    }

    .thumbs-row {
      display: flex;
      gap: 0.65rem;
      margin-top: 0.85rem;
      flex-wrap: wrap;
    }

    .thumb-btn {
      width: 74px;
      height: 74px;
      border-radius: 10px;
      border: 2px solid var(--border-color);
      overflow: hidden;
      cursor: pointer;
      background: #FFFFFF;
      padding: 2px;
    }

    .thumb-btn.active {
      border-color: var(--gold-primary);
    }

    .thumb-btn img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 7px;
    }

    .meta-pills {
      display: flex;
      gap: 0.45rem;
      flex-wrap: wrap;
      margin-bottom: 0.8rem;
    }

    .sku-pill {
      background: var(--obsidian);
      color: var(--gold-bright);
      padding: 0.2rem 0.75rem;
      border-radius: 999px;
      font-size: 0.78rem;
      font-weight: 800;
    }

    .cat-pill {
      background: var(--bg-alt);
      color: var(--text-secondary);
      padding: 0.2rem 0.75rem;
      border-radius: 999px;
      font-size: 0.78rem;
      font-weight: 700;
    }

    .badge-pill {
      background: var(--gold-bright);
      color: var(--obsidian);
      padding: 0.2rem 0.75rem;
      border-radius: 999px;
      font-size: 0.78rem;
      font-weight: 800;
    }

    .info-col h1 {
      font-size: 1.85rem;
      font-weight: 900;
      color: var(--obsidian);
      margin-bottom: 1rem;
      line-height: 1.35;
    }

    .price-box {
      background: linear-gradient(135deg, #17110B, #2B2014);
      color: #FFFFFF;
      padding: 1.25rem 1.45rem;
      border-radius: var(--radius-md);
      border: 1.5px solid var(--gold-primary);
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1rem;
      margin-bottom: 1.35rem;
    }

    .p-lbl {
      font-size: 0.8rem;
      color: #C7B6A2;
      display: block;
    }

    .p-val {
      font-size: 1.75rem;
      font-weight: 900;
      color: var(--gold-bright);
    }

    .p-val span {
      font-size: 1rem;
    }

    .alt-prices {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
    }

    .alt-pill {
      background: rgba(229, 184, 75, 0.16);
      border: 1px solid rgba(229, 184, 75, 0.4);
      color: var(--gold-light);
      padding: 0.22rem 0.75rem;
      border-radius: 999px;
      font-size: 0.82rem;
      font-weight: 700;
    }

    .benefits-box {
      background: var(--bg-card);
      border: 1.5px solid var(--border-color);
      border-radius: var(--radius-md);
      padding: 1.25rem 1.4rem;
      margin-bottom: 1.5rem;
    }

    .benefits-box h3 {
      font-size: 1.05rem;
      font-weight: 800;
      margin-bottom: 0.75rem;
      color: var(--obsidian);
    }

    .benefits-box ul {
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 0.55rem;
    }

    .benefits-box li {
      position: relative;
      padding-right: 1.25rem;
      font-size: 0.93rem;
      color: var(--text-secondary);
    }

    .benefits-box li::before {
      content: "✦";
      position: absolute;
      right: 0;
      color: var(--gold-primary);
    }

    .purchase-bar {
      display: flex;
      gap: 0.75rem;
      flex-wrap: wrap;
      align-items: center;
    }

    .qty-box {
      display: inline-flex;
      align-items: center;
      background: var(--bg-card);
      border: 1.5px solid var(--border-color);
      border-radius: 999px;
      overflow: hidden;
    }

    .qty-box button {
      width: 38px;
      height: 42px;
      border: none;
      background: var(--bg-alt);
      font-size: 1.15rem;
      font-weight: 900;
      cursor: pointer;
    }

    .qty-box span {
      min-width: 38px;
      text-align: center;
      font-weight: 800;
    }

    .related-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1.25rem;
    }

    .rel-card {
      background: var(--bg-card);
      border: 1.5px solid var(--border-color);
      border-radius: var(--radius-md);
      overflow: hidden;
      transition: var(--transition);
    }

    .rel-card:hover {
      border-color: var(--gold-primary);
      transform: translateY(-3px);
    }

    .rel-card img {
      width: 100%;
      height: 170px;
      object-fit: contain;
      background: #FFFFFF;
      padding: 0.4rem;
    }

    .rel-body {
      padding: 0.9rem;
    }

    .rel-body h4 {
      font-size: 0.95rem;
      font-weight: 800;
      color: var(--obsidian);
      margin-bottom: 0.35rem;
    }

    .rel-price {
      font-size: 0.9rem;
      font-weight: 900;
      color: var(--gold-dark);
    }

    @media (max-width: 900px) {
      .detail-grid {
        grid-template-columns: 1fr;
      }
      .related-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }
  `]
})
export class ProductDetailComponent implements OnInit {
  readonly catalog = inject(CatalogService);
  readonly cart = inject(CartService);
  private readonly route = inject(ActivatedRoute);

  readonly product = signal<Product | undefined>(undefined);
  readonly selectedImage = signal<string | null>(null);
  readonly quantity = signal<number>(1);

  readonly activeImage = computed(
    () => this.selectedImage() || this.product()?.image || ''
  );

  readonly benefitsList = computed(() =>
    this.catalog.parseMedicalBenefits(this.product()?.benefits || '')
  );

  readonly relatedProducts = computed(() => {
    const p = this.product();
    return p ? this.catalog.getRelatedProducts(p, 4) : [];
  });

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const code = params.get('code') || '';
      const found = this.catalog.getProductByCode(code);
      this.product.set(found);
      this.selectedImage.set(found?.image || null);
      this.quantity.set(1);
    });
  }

  changeQty(delta: number): void {
    this.quantity.update((q) => Math.max(1, q + delta));
  }

  addToCart(p: Product): void {
    this.cart.addItem(p, this.quantity());
  }
}
