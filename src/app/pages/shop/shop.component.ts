import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CategoryId, Product } from '../../models/catalog.models';
import { CartService } from '../../services/cart.service';
import { CatalogService } from '../../services/catalog.service';

@Component({
  selector: 'app-shop',
  standalone: true,
  imports: [RouterLink, FormsModule],
  template: `
    <section class="shop-header-band">
      <div class="container shop-header-inner">
        <div>
          <div class="breadcrumb">
            <a routerLink="/">الرئيسية</a>
            <span>/</span>
            <span>المتجر الإلكتروني</span>
          </div>
          <h1>🛍️ المتجر الإلكتروني — عالم العسل اليمني</h1>
          <p>
            تصفح كافة المنتجات الموثقة، قارن الأسعار والفوائد الطبية، وأضف طلباتك إلى السلة لإرسالها
            مباشرة عبر واتساب.
          </p>
        </div>
        <a routerLink="/shop/cart" class="btn-gold">
          <span>🛒 عرض السلة ({{ cart.totalCount() }})</span>
        </a>
      </div>
    </section>

    <section class="shop-body">
      <div class="container">
        <!-- تبويبات الأقسام -->
        <div class="shop-cats-strip">
          @for (cat of catalog.categories; track cat.id) {
            <button
              type="button"
              class="shop-cat-pill"
              [class.active]="selectedCategory() === cat.id"
              (click)="selectCategory(cat.id)"
            >
              <span>{{ cat.icon }}</span>
              <span>{{ cat.shortName }}</span>
              <span class="pill-count">{{ catalog.getCountByCategory(cat.id) }}</span>
            </button>
          }
        </div>

        <!-- شريط البحث والفلاتر -->
        <div class="shop-toolbar">
          <div class="toolbar-row">
            <div class="search-wrap">
              <span class="search-ic">🔍</span>
              <input
                type="search"
                [ngModel]="searchQuery()"
                (ngModelChange)="searchQuery.set($event)"
                placeholder="ابحث باسم المنتج، رقم الصنف (مثال: 11005)، أو الفائدة الطبية (السكري، المناعة، الشعر)..."
              />
            </div>

            <select
              [ngModel]="selectedSubCategory()"
              (ngModelChange)="selectedSubCategory.set($event)"
              class="shop-select"
            >
              <option value="all">كل التصنيفات الفرعية ({{ subCategories().length }})</option>
              @for (sub of subCategories(); track sub) {
                <option [value]="sub">{{ sub }}</option>
              }
            </select>

            <select
              [ngModel]="sortBy()"
              (ngModelChange)="sortBy.set($event)"
              class="shop-select"
            >
              <option value="default">الترتيب: الافتراضي</option>
              <option value="price-asc">السعر: الأقل للأعلى</option>
              <option value="price-desc">السعر: الأعلى للأقل</option>
              <option value="code-asc">رقم الصنف: تصاعدياً</option>
            </select>

            <div class="view-toggle">
              <button
                type="button"
                [class.active]="viewMode() === 'grid'"
                (click)="viewMode.set('grid')"
              >
                ⊞ بطاقات
              </button>
              <button
                type="button"
                [class.active]="viewMode() === 'table'"
                (click)="viewMode.set('table')"
              >
                ☰ جدول
              </button>
            </div>
          </div>
        </div>

        <!-- عداد النتائج -->
        <div class="results-meta">
          <span>
            عرض <strong>{{ filteredProducts().length }}</strong> من أصل
            <strong>{{ catalog.products.length }}</strong> صنف
          </span>
          @if (hasActiveFilters()) {
            <button type="button" class="reset-btn" (click)="resetFilters()">
              ↺ إعادة ضبط الفلاتر
            </button>
          }
        </div>

        <!-- عرض البطاقات -->
        @if (viewMode() === 'grid') {
          <div class="products-grid">
            @for (item of filteredProducts(); track item.code) {
              <article class="product-card">
                <a [routerLink]="['/shop/product', item.code]" class="product-media">
                  <div class="media-badges">
                    <span class="sku-tag">رقم الصنف: {{ item.displayCode || item.code }}</span>
                    @if (item.badge) {
                      <span class="feat-tag">{{ item.badge }}</span>
                    }
                  </div>
                  <img [src]="item.image" [alt]="item.name" loading="lazy" />
                </a>

                <div class="product-info">
                  <div class="info-top">
                    <span>{{ item.subCategory }}</span>
                    <span class="unit-tag">{{ item.unit }}</span>
                  </div>
                  <a [routerLink]="['/shop/product', item.code]" class="product-name">
                    {{ item.name }}
                  </a>
                  <p class="product-benefit-snippet">{{ item.benefits }}</p>

                  <div class="product-bottom">
                    <div class="price-row">
                      <div>
                        <span class="price-lbl">سعر التجزئة</span>
                        <div class="price-val">
                          {{ catalog.formatPrice(item.price) }}
                          @if (item.price) {
                            <small>{{ catalog.siteConfig.currency }}</small>
                          }
                        </div>
                      </div>
                      @if (item.altPrices.length > 0) {
                        <span class="alt-price-note">📦 {{ item.altPrices[0] }}</span>
                      }
                    </div>

                    <div class="card-btns">
                      <button
                        type="button"
                        class="btn-cart-add"
                        [class.added]="justAddedCode() === item.code"
                        (click)="addToCart(item)"
                      >
                        <span>{{ justAddedCode() === item.code ? '✓ تمت الإضافة' : '🛒 أضف للسلة' }}</span>
                      </button>
                      <a [routerLink]="['/shop/product', item.code]" class="btn-view">
                        <span>التفاصيل</span>
                        <span class="btn-view-arrow">←</span>
                      </a>
                    </div>
                  </div>
                </div>
              </article>
            } @empty {
              <div class="empty-box">
                <h3>لم يتم العثور على منتجات مطابقة</h3>
                <p>جرّب تغيير كلمات البحث أو إعادة ضبط الفلاتر.</p>
                <button type="button" class="btn-gold" (click)="resetFilters()">
                  عرض كافة المنتجات
                </button>
              </div>
            }
          </div>
        } @else {
          <!-- عرض الجدول -->
          <div class="table-wrap">
            <table class="shop-table">
              <thead>
                <tr>
                  <th>الصورة</th>
                  <th>رقم الصنف</th>
                  <th>اسم الصنف</th>
                  <th>الوحدة</th>
                  <th>السعر</th>
                  <th>الفوائد الطبية الموثقة</th>
                  <th>إجراء</th>
                </tr>
              </thead>
              <tbody>
                @for (item of filteredProducts(); track item.code) {
                  <tr>
                    <td><img [src]="item.image" [alt]="item.name" class="tbl-img" /></td>
                    <td><span class="sku-tag">{{ item.displayCode || item.code }}</span></td>
                    <td>
                      <a [routerLink]="['/shop/product', item.code]" class="tbl-name">
                        {{ item.name }}
                      </a>
                      <div class="tbl-sub">{{ catalog.getCategoryName(item.category) }}</div>
                    </td>
                    <td>{{ item.unit }}</td>
                    <td>
                      <strong>
                        {{ catalog.formatPrice(item.price) }}
                        {{ item.price ? catalog.siteConfig.currency : '' }}
                      </strong>
                      @if (item.altPrices.length > 0) {
                        <div class="alt-price-note">{{ item.altPrices.join(' | ') }}</div>
                      }
                    </td>
                    <td class="tbl-benefits">{{ item.benefits }}</td>
                    <td>
                      <div style="display:flex;gap:0.35rem;">
                        <button type="button" class="btn-cart-add" (click)="cart.addItem(item, 1)">
                          🛒
                        </button>
                        <a [routerLink]="['/shop/product', item.code]" class="btn-view">عرض</a>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      </div>
    </section>
  `,
  styles: [`
    .shop-header-band {
      background: linear-gradient(135deg, #16100A, #261B11);
      color: #FFFFFF;
      padding: 2.25rem 0;
      border-bottom: 2px solid var(--gold-primary);
    }

    .shop-header-inner {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 1.5rem;
      flex-wrap: wrap;
    }

    .shop-header-band h1 {
      font-size: 1.9rem;
      font-weight: 900;
      margin-bottom: 0.35rem;
    }

    .shop-header-band p {
      color: #D7C8B6;
      font-size: 0.95rem;
    }

    .shop-body {
      padding: 2rem 0 4rem;
    }

    .shop-cats-strip {
      display: flex;
      gap: 0.6rem;
      flex-wrap: wrap;
      margin-bottom: 1.25rem;
    }

    .shop-cat-pill {
      display: inline-flex;
      align-items: center;
      gap: 0.45rem;
      background: var(--bg-card);
      border: 1.5px solid var(--border-color);
      color: var(--obsidian);
      padding: 0.52rem 1rem;
      border-radius: 999px;
      font-weight: 800;
      font-size: 0.86rem;
      cursor: pointer;
      transition: var(--transition);
      box-shadow: var(--shadow-sm);
    }

    .shop-cat-pill:hover {
      border-color: var(--gold-primary);
      transform: translateY(-2px);
      box-shadow: var(--shadow-md);
    }

    .shop-cat-pill.active {
      background: linear-gradient(145deg, #1E160E, var(--obsidian));
      color: var(--gold-bright);
      border-color: var(--gold-bright);
      box-shadow: var(--shadow-gold);
    }

    .pill-count {
      background: var(--bg-alt);
      color: var(--text-secondary);
      padding: 0.05rem 0.5rem;
      border-radius: 999px;
      font-size: 0.74rem;
    }

    .shop-cat-pill.active .pill-count {
      background: var(--gold-bright);
      color: var(--obsidian);
    }

    .shop-toolbar {
      background: var(--bg-card);
      border: 1.5px solid var(--border-color);
      border-radius: var(--radius-lg);
      padding: 1.15rem;
      box-shadow: var(--shadow-sm);
      margin-bottom: 1.15rem;
    }

    .toolbar-row {
      display: grid;
      grid-template-columns: 1fr auto auto auto;
      gap: 0.75rem;
      margin-bottom: 0.9rem;
    }

    .search-wrap {
      position: relative;
      display: flex;
      align-items: center;
    }

    .search-ic {
      position: absolute;
      right: 0.9rem;
      pointer-events: none;
    }

    .search-wrap input {
      width: 100%;
      padding: 0.72rem 2.5rem 0.72rem 1rem;
      border: 1.5px solid var(--border-color);
      border-radius: var(--radius-sm);
      background: var(--bg-main);
      font-size: 0.92rem;
      font-weight: 600;
      transition: var(--transition);
    }

    .search-wrap input:focus,
    .shop-select:focus {
      outline: none;
      border-color: var(--gold-primary);
      box-shadow: 0 0 0 3px rgba(200, 141, 42, 0.18);
      background: #FFFFFF;
    }

    .shop-select {
      padding: 0.72rem 0.9rem;
      border: 1.5px solid var(--border-color);
      border-radius: var(--radius-sm);
      background: var(--bg-main);
      font-weight: 700;
      font-size: 0.88rem;
    }

    .view-toggle {
      display: inline-flex;
      background: var(--bg-main);
      border: 1.5px solid var(--border-color);
      border-radius: var(--radius-sm);
      padding: 0.15rem;
    }

    .view-toggle button {
      border: none;
      background: transparent;
      padding: 0.5rem 0.85rem;
      border-radius: 8px;
      font-weight: 700;
      font-size: 0.84rem;
      cursor: pointer;
    }

    .view-toggle button.active {
      background: var(--obsidian);
      color: var(--gold-bright);
    }

    .results-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
      font-size: 0.92rem;
      color: var(--text-secondary);
    }

    .reset-btn {
      background: none;
      border: 1px solid var(--gold-primary);
      color: var(--gold-dark);
      padding: 0.25rem 0.75rem;
      border-radius: 999px;
      font-weight: 700;
      cursor: pointer;
    }

    .products-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(295px, 1fr));
      gap: 1.35rem;
    }

    .product-card {
      background: var(--bg-card);
      border: 1.5px solid var(--border-color);
      border-radius: var(--radius-lg);
      overflow: hidden;
      box-shadow: var(--shadow-sm);
      display: flex;
      flex-direction: column;
      transition: var(--transition);
    }

    .product-card:hover {
      transform: translateY(-6px);
      border-color: var(--gold-primary);
      box-shadow: var(--shadow-lg), 0 0 0 1px rgba(229, 184, 75, 0.25);
    }

    .product-media {
      position: relative;
      height: 235px;
      background: radial-gradient(circle, #FFFFFF, #F4EFE6);
      border-bottom: 1px solid var(--border-color);
      display: block;
      overflow: hidden;
    }

    .product-media img {
      width: 100%;
      height: 100%;
      object-fit: contain;
      padding: 0.5rem;
      transition: transform 0.5s cubic-bezier(0.22, 1, 0.36, 1);
    }

    .product-card:hover .product-media img {
      transform: scale(1.07);
    }

    .media-badges {
      position: absolute;
      top: 0.65rem;
      right: 0.65rem;
      left: 0.65rem;
      display: flex;
      justify-content: space-between;
      gap: 0.4rem;
      z-index: 2;
    }

    .sku-tag {
      background: rgba(21, 16, 11, 0.88);
      color: var(--gold-bright);
      font-size: 0.74rem;
      font-weight: 800;
      padding: 0.18rem 0.6rem;
      border-radius: 999px;
    }

    .feat-tag {
      background: var(--gold-bright);
      color: var(--obsidian);
      font-size: 0.73rem;
      font-weight: 800;
      padding: 0.18rem 0.6rem;
      border-radius: 999px;
    }

    .product-info {
      padding: 1.15rem;
      display: flex;
      flex-direction: column;
      flex: 1;
    }

    .info-top {
      display: flex;
      justify-content: space-between;
      font-size: 0.76rem;
      font-weight: 700;
      color: var(--gold-dark);
      margin-bottom: 0.3rem;
    }

    .unit-tag {
      background: var(--bg-alt);
      color: var(--text-secondary);
      padding: 0.05rem 0.55rem;
      border-radius: 999px;
    }

    .product-name {
      font-size: 1.08rem;
      font-weight: 800;
      color: var(--obsidian);
      margin-bottom: 0.55rem;
      line-height: 1.38;
    }

    .product-benefit-snippet {
      font-size: 0.84rem;
      color: var(--text-secondary);
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
      background: rgba(242, 234, 224, 0.55);
      padding: 0.55rem 0.75rem;
      border-radius: var(--radius-sm);
      border-right: 3px solid var(--gold-primary);
      margin-bottom: 1rem;
      flex: 1;
    }

    .product-bottom {
      display: flex;
      flex-direction: column;
      gap: 0.85rem;
      padding-top: 0.9rem;
      border-top: 1px dashed var(--border-color);
    }

    .price-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      gap: 0.5rem;
      flex-wrap: wrap;
    }

    .price-lbl {
      display: block;
      font-size: 0.72rem;
      color: var(--text-muted);
      font-weight: 700;
    }

    .price-val {
      font-size: 1.32rem;
      font-weight: 900;
      color: var(--obsidian);
      line-height: 1.2;
    }

    .price-val small {
      font-size: 0.8rem;
      color: var(--gold-dark);
    }

    .alt-price-note {
      display: inline-block;
      font-size: 0.72rem;
      color: var(--amber-accent);
      background: rgba(200, 141, 42, 0.1);
      border: 1px solid rgba(200, 141, 42, 0.25);
      padding: 0.18rem 0.55rem;
      border-radius: 999px;
      font-weight: 700;
    }

    .card-btns {
      display: grid;
      grid-template-columns: 1.35fr 0.85fr;
      gap: 0.55rem;
    }

    .btn-cart-add {
      position: relative;
      overflow: hidden;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.4rem;
      background: linear-gradient(135deg, #F3CE6A 0%, var(--gold-bright) 50%, var(--gold-primary) 100%);
      color: var(--obsidian);
      border: 1px solid rgba(255, 240, 195, 0.65);
      padding: 0.62rem 0.9rem;
      border-radius: 999px;
      font-size: 0.85rem;
      font-weight: 800;
      cursor: pointer;
      transition: var(--transition);
      box-shadow: 0 4px 14px rgba(200, 141, 42, 0.25);
    }

    .btn-cart-add:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(200, 141, 42, 0.4);
      filter: brightness(1.04);
    }

    .btn-cart-add:active {
      transform: scale(0.97);
    }

    .btn-cart-add.added {
      background: linear-gradient(135deg, #16A34A, #15803D);
      color: #FFFFFF;
      border-color: #22C55E;
      box-shadow: 0 6px 18px rgba(21, 128, 61, 0.35);
    }

    .btn-view {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.3rem;
      background: rgba(21, 16, 11, 0.04);
      color: var(--obsidian);
      border: 1.5px solid var(--border-gold);
      padding: 0.62rem 0.85rem;
      border-radius: 999px;
      font-size: 0.84rem;
      font-weight: 800;
      transition: var(--transition);
    }

    .btn-view-arrow {
      transition: transform 0.25s ease;
    }

    .btn-view:hover {
      background: var(--obsidian);
      color: var(--gold-bright);
      border-color: var(--obsidian);
      transform: translateY(-2px);
      box-shadow: var(--shadow-sm);
    }

    .btn-view:hover .btn-view-arrow {
      transform: translateX(-3px);
    }

    .table-wrap {
      background: var(--bg-card);
      border: 1.5px solid var(--border-color);
      border-radius: var(--radius-lg);
      overflow-x: auto;
    }

    .shop-table {
      width: 100%;
      border-collapse: collapse;
      min-width: 850px;
      text-align: right;
    }

    .shop-table thead {
      background: var(--obsidian);
      color: var(--gold-bright);
    }

    .shop-table th, .shop-table td {
      padding: 0.85rem 1rem;
      border-bottom: 1px solid var(--border-color);
      font-size: 0.88rem;
      vertical-align: middle;
    }

    .tbl-img {
      width: 52px;
      height: 52px;
      object-fit: cover;
      border-radius: 8px;
    }

    .tbl-name {
      font-weight: 800;
      color: var(--obsidian);
    }

    .tbl-sub {
      font-size: 0.76rem;
      color: var(--gold-dark);
    }

    .tbl-benefits {
      max-width: 380px;
      font-size: 0.82rem;
      color: var(--text-secondary);
    }

    .empty-box {
      grid-column: 1 / -1;
      text-align: center;
      padding: 3rem;
      background: var(--bg-card);
      border: 1.5px dashed var(--border-color);
      border-radius: var(--radius-lg);
    }

    @media (max-width: 960px) {
      .toolbar-row {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 640px) {
      .shop-header-band {
        padding: 1.75rem 0;
      }
      .shop-header-band h1 {
        font-size: 1.45rem;
      }
      .shop-cats-strip {
        flex-wrap: nowrap;
        overflow-x: auto;
        -webkit-overflow-scrolling: touch;
        scrollbar-width: none;
        padding-bottom: 0.4rem;
        margin-bottom: 1rem;
      }
      .shop-cats-strip::-webkit-scrollbar {
        display: none;
      }
      .shop-cat-pill {
        flex-shrink: 0;
        padding: 0.45rem 0.88rem;
        font-size: 0.82rem;
      }
      .shop-toolbar {
        padding: 0.9rem;
      }
      .view-toggle {
        width: 100%;
      }
      .view-toggle button {
        flex: 1;
      }
      .products-grid {
        grid-template-columns: 1fr;
        gap: 1rem;
      }
      .product-media {
        height: 210px;
      }
      .card-btns {
        grid-template-columns: 1.25fr 0.85fr;
        gap: 0.45rem;
      }
      .btn-cart-add,
      .btn-view {
        padding: 0.58rem 0.7rem;
        font-size: 0.81rem;
      }
    }
  `]
})
export class ShopComponent implements OnInit {
  readonly catalog = inject(CatalogService);
  readonly cart = inject(CartService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly selectedCategory = signal<CategoryId>('all');
  readonly selectedSubCategory = signal<string>('all');
  readonly searchQuery = signal<string>('');
  readonly sortBy = signal<'default' | 'price-asc' | 'price-desc' | 'code-asc'>('default');
  readonly viewMode = signal<'grid' | 'table'>('grid');
  readonly justAddedCode = signal<string | null>(null);

  addToCart(item: Product): void {
    this.cart.addItem(item, 1);
    this.justAddedCode.set(item.code);
    setTimeout(() => {
      if (this.justAddedCode() === item.code) {
        this.justAddedCode.set(null);
      }
    }, 1400);
  }

  readonly subCategories = computed(() => {
    const cat = this.selectedCategory();
    const pool =
      cat === 'all'
        ? this.catalog.products
        : this.catalog.products.filter((p) => p.category === cat);
    return Array.from(new Set(pool.map((p) => p.subCategory)));
  });

  readonly hasActiveFilters = computed(
    () =>
      this.selectedCategory() !== 'all' ||
      this.selectedSubCategory() !== 'all' ||
      this.searchQuery().trim() !== ''
  );

  readonly filteredProducts = computed<Product[]>(() => {
    const cat = this.selectedCategory();
    const sub = this.selectedSubCategory();
    const q = this.searchQuery().trim().toLowerCase();
    const sort = this.sortBy();

    let list = this.catalog.products.filter((item) => {
      if (cat !== 'all' && item.category !== cat) return false;
      if (sub !== 'all' && item.subCategory !== sub) return false;
      if (q) {
        const codeStr = (item.displayCode || item.code).toLowerCase();
        const hay = `${item.name} ${codeStr} ${item.benefits} ${item.subCategory} ${item.unit}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });

    list = [...list];
    if (sort === 'price-asc') {
      list.sort((a, b) => (a.price ?? 9999999) - (b.price ?? 9999999));
    } else if (sort === 'price-desc') {
      list.sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
    } else if (sort === 'code-asc') {
      list.sort((a, b) =>
        (a.displayCode || a.code).localeCompare(b.displayCode || b.code)
      );
    }
    return list;
  });

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params) => {
      const cat = (params.get('category') as CategoryId) || 'all';
      if (this.catalog.categories.some((c) => c.id === cat)) {
        this.selectedCategory.set(cat);
        this.selectedSubCategory.set('all');
      }
    });
  }

  selectCategory(cat: CategoryId): void {
    this.selectedCategory.set(cat);
    this.selectedSubCategory.set('all');
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: cat === 'all' ? {} : { category: cat }
    });
  }

  resetFilters(): void {
    this.selectCategory('all');
    this.searchQuery.set('');
    this.sortBy.set('default');
  }
}
