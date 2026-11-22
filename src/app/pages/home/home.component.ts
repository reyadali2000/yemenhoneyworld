import { Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CategoryId, Product } from '../../models/catalog.models';
import { CartService } from '../../services/cart.service';
import { CatalogService } from '../../services/catalog.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink],
  template: `
    <!-- الواجهة المؤسسية الرئيسية للشركة -->
    <section class="corp-hero">
      <div class="hero-ambient-orb"></div>
      <div class="container corp-hero-grid">
        <div class="corp-hero-content">
          <div class="corp-badge">🏛️ الموقع الرسمي والمؤسسي لشركة عالم العسل اليمني</div>
          <h1>
            نحل اليمن إلى العالم<br />
            <span>أصالة الطبيعة اليمنية بمعايير تجارية وعلمية موثقة</span>
          </h1>
          <p class="corp-lead">
            {{ catalog.siteConfig.description }}
          </p>
          <div class="corp-hero-actions">
            <a routerLink="/shop" class="btn-gold">🛍️ الدخول إلى المتجر الإلكتروني</a>
            <a routerLink="/about" class="btn-outline-light">تعرّف على شركة عالم العسل</a>
          </div>
          <div class="hero-trust-row">
            <span class="trust-pill">✓ فحص مخبري معتمد</span>
            <span class="trust-pill">✓ 13 فرعاً باليمن</span>
            <span class="trust-pill">✓ تجزئة وجملة وتصدير</span>
          </div>
        </div>

        <div class="corp-hero-visual">
          @if (activeSpotlight(); as spot) {
            <div class="visual-card main-visual">
              <span class="visual-royal-tag">{{ spot.tag }}</span>
              <span class="visual-purity-seal">🐝 نقي 100%</span>
              <img
                [src]="spot.image"
                [alt]="spot.title"
                class="spotlight-img"
              />
              <div class="visual-caption">
                <span>{{ spot.eyebrow }}</span>
                <strong>{{ spot.title }}</strong>
              </div>
            </div>
          }
          <div class="visual-subgrid">
            @for (item of spotlightItems; track item.title; let i = $index) {
              <button
                type="button"
                class="visual-card visual-thumb-btn"
                [class.active]="activeSpotlightIndex() === i"
                (click)="selectSpotlight(i)"
              >
                <img [src]="item.image" [alt]="item.title" />
                <span class="thumb-label">{{ item.shortTitle }}</span>
              </button>
            }
          </div>
        </div>
      </div>
    </section>

    <!-- أرقام ومؤشرات الشركة العائمة -->
    <section class="milestones-strip">
      <div class="container milestones-grid">
        @for (m of catalog.milestones; track m.label) {
          <div class="milestone-card">
            <div class="milestone-num">{{ m.number }}</div>
            <div class="milestone-label">{{ m.label }}</div>
            <p>{{ m.detail }}</p>
          </div>
        }
      </div>
    </section>

    <!-- نبذة مؤسسية سريعة -->
    <section class="section-block">
      <div class="container about-preview-grid">
        <div>
          <div class="section-heading">
            <span class="eyebrow">✦ الهوية المؤسسية</span>
            <h2>شركة متكاملة تجمع بين أصالة المناحل اليمنية والتوثيق العلمي الحديث</h2>
            <p>
              تعمل شركة عالم العسل اليمني كمنظومة تجارية متخصصة في إنتاج وفرز وتعبئة العسل اليمني
              بأصنافه النادرة، إلى جانب التمور الفاخرة، الزيوت الطبيعية النقية، مستحضرات العناية
              الشخصية، والمكسرات اليمنية.
            </p>
          </div>
          <div class="pillars-list">
            <div class="pillar-item">
              <strong>✓ انتشار في 6 محافظات:</strong>
              <span>13 فرعاً في صنعاء، عدن، تعز، الحديدة، إب، وعمران لخدمتكم.</span>
            </div>
            <div class="pillar-item">
              <strong>✓ توثيق طبي وبيولوجي:</strong>
              <span>دليل معرفي موثق للفوائد العلاجية والغذائية لكل صنف.</span>
            </div>
            <div class="pillar-item">
              <strong>✓ تجزئة وجملة وتصدير:</strong>
              <span>خدمة الأفراد، المتاجر، المؤسسات، وأسواق التصدير الدولية.</span>
            </div>
          </div>
          <div style="margin-top:1.75rem;display:flex;gap:0.85rem;flex-wrap:wrap;">
            <a routerLink="/about" class="btn-obsidian">اقرأ قصة الشركة الكاملة ←</a>
            <a routerLink="/branches" class="btn-outline-dark">استعرض الفروع والانتشار</a>
          </div>
        </div>

        <div class="corporate-quote-box">
          <div class="quote-emblem">
            <img src="assets/logo.png" alt="شعار عالم العسل اليمني" style="width:74px;height:74px;object-fit:contain;" />
          </div>
          <blockquote>
            «رؤيتنا أن نكون السفير الأول لمنتجات النحل والطبيعة اليمنية عالمياً، عبر الجمع بين
            النقاء الفطري من أودية اليمن وجبالها، وأعلى معايير التوثيق والجودة والتغليف.»
          </blockquote>
          <div class="quote-author">
            <strong>{{ catalog.siteConfig.companyName }}</strong>
            <span>{{ catalog.siteConfig.slogan }} — {{ catalog.siteConfig.sloganEn }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- تشكيلة مختارة من الكنوز اليمنية -->
    <section class="section-block-alt">
      <div class="container">
        <div class="section-heading" style="display:flex;justify-content:space-between;align-items:flex-end;flex-wrap:wrap;gap:1rem;">
          <div>
            <span class="eyebrow">✦ كنوزنا المختارة</span>
            <h2>إصدارات ملكية من قلب المناحل اليمنية</h2>
            <p>تنقّل بين الأقسام لاستكشاف مختاراتنا المنتقاة بعناية والمتوفرة للطلب الفوري.</p>
          </div>
          <a routerLink="/shop" class="btn-gold">استعرض المتجر كاملاً ←</a>
        </div>

        <div class="curated-tabs">
          @for (cat of catalog.categories; track cat.id) {
            @if (cat.id !== 'all') {
              <button
                type="button"
                class="curated-tab-btn"
                [class.active]="curatedCategory() === cat.id"
                (click)="curatedCategory.set(cat.id)"
              >
                <span>{{ cat.icon }}</span>
                <span>{{ cat.shortName }}</span>
              </button>
            }
          }
        </div>

        <div class="curated-grid">
          @for (item of featuredProducts(); track item.code) {
            <article class="curated-card">
              <a [routerLink]="['/shop/product', item.code]" class="curated-media">
                @if (item.badge) {
                  <span class="curated-badge">{{ item.badge }}</span>
                }
                <img [src]="item.image" [alt]="item.name" loading="lazy" />
              </a>
              <div class="curated-body">
                <span class="curated-cat">{{ item.subCategory }} • {{ item.unit }}</span>
                <a [routerLink]="['/shop/product', item.code]" class="curated-title">{{ item.name }}</a>
                <div class="curated-footer">
                  <div class="curated-price">
                    {{ catalog.formatPrice(item.price) }}
                    @if (item.price) {
                      <small>{{ catalog.siteConfig.currency }}</small>
                    }
                  </div>
                  <div class="curated-actions">
                    <button
                      type="button"
                      class="curated-add-btn"
                      [class.added]="justAddedCode() === item.code"
                      (click)="quickAdd(item)"
                    >
                      {{ justAddedCode() === item.code ? '✓ أُضيف' : '🛒 أضف' }}
                    </button>
                    <a [routerLink]="['/shop/product', item.code]" class="curated-view-btn" title="تفاصيل المنتج">←</a>
                  </div>
                </div>
              </div>
            </article>
          }
        </div>
      </div>
    </section>

    <!-- رحلة القطرة الذهبية — معايير الفخامة والنقاء -->
    <section class="journey-strip">
      <div class="container">
        <div class="journey-header">
          <span class="page-hero-eyebrow">✦ معايير الفخامة والنقاء</span>
          <h2>رحلة القطرة الذهبية — من المنحل إلى مائدتك</h2>
        </div>
        <div class="journey-grid">
          @for (step of journeySteps; track step.num) {
            <div class="journey-card">
              <div class="journey-hex">{{ step.icon }}</div>
              <span class="journey-num">المرحلة {{ step.num }}</span>
              <h3>{{ step.title }}</h3>
              <p>{{ step.desc }}</p>
            </div>
          }
        </div>
      </div>
    </section>

    <!-- قطاعات العمل الستة (عرض مؤسسي بدون أسعار) -->
    <section class="section-block">
      <div class="container">
        <div class="section-heading" style="display:flex;justify-content:space-between;align-items:flex-end;flex-wrap:wrap;gap:1rem;">
          <div>
            <span class="eyebrow">✦ أنشطة وقطاعات الشركة</span>
            <h2>ستة قطاعات تخصصية تحت سقف واحد</h2>
            <p>تغطي أنشطتنا التجارية دورة الإنتاج والتوريد لستة قطاعات رئيسية من الطبيعة اليمنية.</p>
          </div>
          <a routerLink="/activities" class="btn-outline-dark">تفاصيل كافة القطاعات ←</a>
        </div>

        <div class="sectors-grid">
          @for (cat of catalog.categories; track cat.id) {
            @if (cat.id !== 'all') {
              <article class="sector-card">
                <div class="sector-img-wrap">
                  <img [src]="cat.coverImage" [alt]="cat.name" loading="lazy" />
                  <span class="sector-icon-badge">{{ cat.icon }}</span>
                </div>
                <div class="sector-body">
                  <h3>{{ cat.name }}</h3>
                  <p>{{ cat.corporateSummary }}</p>
                  <div class="sector-actions">
                    <a routerLink="/activities" class="sector-link">عن القطاع</a>
                    <a routerLink="/shop" [queryParams]="{ category: cat.id }" class="sector-shop-link">
                      تسوق في المتجر ←
                    </a>
                  </div>
                </div>
              </article>
            }
          }
        </div>
      </div>
    </section>

    <!-- خدماتنا للأفراد والأعمال -->
    <section class="section-block-alt">
      <div class="container">
        <div class="section-heading" style="display:flex;justify-content:space-between;align-items:flex-end;flex-wrap:wrap;gap:1rem;">
          <div>
            <span class="eyebrow">✦ خدماتنا المؤسسية والتجارية</span>
            <h2>حلول متكاملة للأفراد والتجار وشركاء التصدير</h2>
          </div>
          <a routerLink="/services" class="btn-outline-dark">كافة الخدمات ←</a>
        </div>

        <div class="services-preview-grid">
          @for (srv of catalog.services; track srv.id) {
            <div class="service-card">
              <div class="service-icon">{{ srv.icon }}</div>
              <span class="service-audience">{{ srv.audience }}</span>
              <h3>{{ srv.title }}</h3>
              <p>{{ srv.summary }}</p>
            </div>
          }
        </div>
      </div>
    </section>

    <!-- بوابة الانتقال السلس إلى المتجر الإلكتروني أو التواصل -->
    <section class="cta-bridge">
      <div class="container cta-bridge-inner">
        <div>
          <span class="page-hero-eyebrow">🛍️ تجربة التسوق الإلكتروني</span>
          <h2>هل تبحث عن طلب منتجاتنا أو الاطلاع على الأسعار والفوائد الطبية؟</h2>
          <p>
            انتقل إلى المتجر الإلكتروني الرسمي لاستعراض كافة الأصناف الـ {{ catalog.products.length }}،
            مقارنة الأسعار، قراءة الفوائد البيولوجية، وإرسال طلبك مباشرة عبر السلة.
          </p>
        </div>
        <div class="cta-bridge-actions">
          <a routerLink="/shop" class="btn-gold">🛍️ الانتقال إلى المتجر الإلكتروني</a>
          <a routerLink="/contact" class="btn-outline-light">📞 تواصل مع الإدارة والمبيعات</a>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .corp-hero {
      position: relative;
      overflow: hidden;
      background:
        radial-gradient(circle at 82% 22%, rgba(229, 184, 75, 0.28) 0%, transparent 48%),
        radial-gradient(circle at 15% 80%, rgba(200, 141, 42, 0.14) 0%, transparent 45%),
        linear-gradient(145deg, #100B06 0%, #22180E 55%, #120D08 100%);
      color: #FFFFFF;
      padding: 4.5rem 0 6.25rem;
      border-bottom: 3px solid var(--gold-primary);
    }

    .hero-ambient-orb {
      position: absolute;
      width: 420px;
      height: 420px;
      top: -120px;
      left: 8%;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(229, 184, 75, 0.18) 0%, transparent 70%);
      filter: blur(24px);
      pointer-events: none;
    }

    .corp-hero::before {
      content: '';
      position: absolute;
      inset: 0;
      opacity: 0.065;
      pointer-events: none;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='56' height='98' viewBox='0 0 56 98'%3E%3Cpath fill='none' stroke='%23E5B84B' stroke-width='1.2' d='M28 0l28 16.3v32.7L28 65.3 0 49V16.3L28 0zm0 98l28-16.3V49L28 32.7 0 49v32.7L28 98z'/%3E%3C/svg%3E");
    }

    .corp-hero-grid {
      position: relative;
      z-index: 1;
      display: grid;
      grid-template-columns: 1.15fr 0.85fr;
      gap: 2.75rem;
      align-items: center;
    }

    .corp-hero-content {
      animation: fadeUpIn 0.65s ease-out both;
    }

    .corp-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      background: rgba(255, 255, 255, 0.08);
      backdrop-filter: var(--glass-blur);
      -webkit-backdrop-filter: var(--glass-blur);
      border: 1px solid rgba(255, 255, 255, 0.22);
      color: var(--gold-bright);
      padding: 0.4rem 1.1rem;
      border-radius: 999px;
      font-size: 0.85rem;
      font-weight: 700;
      margin-bottom: 1.15rem;
      box-shadow: var(--glass-specular-dark), 0 8px 22px rgba(0, 0, 0, 0.22);
    }

    .corp-hero h1 {
      font-size: 2.85rem;
      font-weight: 900;
      line-height: 1.25;
      margin-bottom: 1rem;
      background: linear-gradient(135deg, #FFFFFF 0%, #FBF0D1 55%, #E5B84B 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .corp-hero h1 span {
      display: block;
      font-family: 'Amiri', serif;
      font-size: 1.6rem;
      font-weight: 700;
      background: linear-gradient(135deg, #F7E7C0 0%, #E5B84B 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin-top: 0.45rem;
    }

    .corp-lead {
      color: #D7C8B6;
      font-size: 1.05rem;
      line-height: 1.85;
      max-width: 600px;
      margin-bottom: 1.85rem;
    }

    .corp-hero-actions {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .hero-trust-row {
      display: flex;
      gap: 0.75rem;
      flex-wrap: wrap;
      margin-top: 1.5rem;
    }

    .trust-pill {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      font-size: 0.8rem;
      font-weight: 700;
      color: #F3E6D3;
      background: rgba(255, 255, 255, 0.07);
      backdrop-filter: blur(14px) saturate(160%);
      -webkit-backdrop-filter: blur(14px) saturate(160%);
      border: 1px solid rgba(255, 255, 255, 0.18);
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.2);
      padding: 0.34rem 0.85rem;
      border-radius: 999px;
    }

    .corp-hero-visual {
      display: flex;
      flex-direction: column;
      gap: 0.9rem;
      animation: fadeUpIn 0.8s ease-out 0.12s both;
    }

    .visual-card {
      position: relative;
      border-radius: var(--radius-md);
      overflow: hidden;
      border: 1.5px solid rgba(229, 184, 75, 0.4);
      background: #1B130B;
      box-shadow: 0 18px 40px rgba(0, 0, 0, 0.42);
      transition: var(--transition);
    }

    .visual-card:hover {
      border-color: var(--gold-bright);
      box-shadow: 0 22px 48px rgba(0, 0, 0, 0.55), 0 0 22px rgba(229, 184, 75, 0.22);
    }

    .visual-royal-tag {
      position: absolute;
      top: 0.85rem;
      right: 0.85rem;
      z-index: 2;
      background: rgba(18, 13, 8, 0.85);
      backdrop-filter: blur(8px);
      color: var(--gold-bright);
      border: 1px solid rgba(229, 184, 75, 0.55);
      padding: 0.28rem 0.85rem;
      border-radius: 999px;
      font-size: 0.78rem;
      font-weight: 800;
      animation: floatSlow 4s ease-in-out infinite;
    }

    .visual-purity-seal {
      position: absolute;
      top: 0.85rem;
      left: 0.85rem;
      z-index: 2;
      background: linear-gradient(135deg, rgba(229, 184, 75, 0.95), rgba(200, 141, 42, 0.95));
      color: var(--obsidian);
      padding: 0.26rem 0.75rem;
      border-radius: 999px;
      font-size: 0.75rem;
      font-weight: 900;
      box-shadow: 0 4px 14px rgba(0, 0, 0, 0.3);
    }

    .main-visual {
      height: 300px;
    }

    .spotlight-img {
      animation: spotlightFade 0.45s ease-out;
    }

    .visual-subgrid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 0.75rem;
    }

    .visual-thumb-btn {
      height: 92px;
      padding: 0;
      cursor: pointer;
      opacity: 0.72;
      text-align: right;
    }

    .visual-thumb-btn.active,
    .visual-thumb-btn:hover {
      opacity: 1;
      border-color: var(--gold-bright);
      transform: translateY(-2px);
      box-shadow: 0 10px 22px rgba(0, 0, 0, 0.45), 0 0 14px rgba(229, 184, 75, 0.28);
    }

    .thumb-label {
      position: absolute;
      inset: auto 0 0 0;
      padding: 0.45rem 0.55rem 0.35rem;
      background: linear-gradient(to top, rgba(12, 8, 4, 0.94), transparent);
      color: #F7E7C0;
      font-size: 0.72rem;
      font-weight: 800;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .visual-card img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.6s cubic-bezier(0.22, 1, 0.36, 1);
    }

    .visual-card:hover img {
      transform: scale(1.07);
    }

    .visual-caption {
      position: absolute;
      inset: auto 0.65rem 0.65rem 0.65rem;
      border-radius: 14px;
      background: rgba(16, 11, 7, 0.56);
      backdrop-filter: var(--glass-blur);
      -webkit-backdrop-filter: var(--glass-blur);
      border: 1px solid rgba(255, 255, 255, 0.2);
      box-shadow: var(--glass-specular-dark), 0 8px 24px rgba(0, 0, 0, 0.35);
      padding: 0.8rem 1rem;
      display: flex;
      flex-direction: column;
    }

    .visual-caption span {
      font-size: 0.76rem;
      color: var(--gold-bright);
      font-weight: 700;
    }

    .visual-caption strong {
      font-size: 0.96rem;
      color: #FFFFFF;
    }

    .milestones-strip {
      position: relative;
      z-index: 4;
      margin-top: -2.85rem;
      padding: 0 0 1.25rem;
      color: #FFFFFF;
    }

    .milestones-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1.15rem;
    }

    .milestone-card {
      position: relative;
      overflow: hidden;
      background: rgba(22, 16, 10, 0.62);
      backdrop-filter: var(--glass-blur);
      -webkit-backdrop-filter: var(--glass-blur);
      border: 1px solid rgba(255, 255, 255, 0.18);
      border-radius: var(--radius-md);
      padding: 1.35rem;
      box-shadow: var(--glass-specular-dark), 0 18px 40px rgba(0, 0, 0, 0.26);
      transition: var(--transition-fluid);
    }

    .milestone-card::before {
      content: '';
      position: absolute;
      top: 0;
      right: 0;
      left: 0;
      height: 3px;
      background: linear-gradient(90deg, transparent, var(--gold-bright), transparent);
      opacity: 0.6;
      transition: opacity 0.3s;
    }

    .milestone-card:hover {
      transform: translateY(-4px);
      background: rgba(229, 184, 75, 0.07);
      border-color: rgba(229, 184, 75, 0.55);
      box-shadow: 0 12px 28px rgba(0, 0, 0, 0.35);
    }

    .milestone-card:hover::before {
      opacity: 1;
    }

    .milestone-num {
      font-size: 1.7rem;
      font-weight: 900;
      color: var(--gold-bright);
      line-height: 1.2;
    }

    .milestone-label {
      font-size: 0.95rem;
      font-weight: 800;
      margin: 0.2rem 0;
    }

    .milestone-card p {
      font-size: 0.82rem;
      color: #C7B6A2;
    }

    .about-preview-grid {
      display: grid;
      grid-template-columns: 1.15fr 0.85fr;
      gap: 2.5rem;
      align-items: center;
    }

    .pillars-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .pillar-item {
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-right: 4px solid var(--gold-primary);
      padding: 0.92rem 1.15rem;
      border-radius: var(--radius-sm);
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
      font-size: 0.93rem;
      box-shadow: var(--shadow-sm);
      transition: var(--transition);
    }

    .pillar-item:hover {
      transform: translateX(-5px);
      border-color: var(--gold-primary);
      box-shadow: var(--shadow-md);
    }

    .pillar-item strong {
      color: var(--obsidian);
    }

    .corporate-quote-box {
      position: relative;
      overflow: hidden;
      background: linear-gradient(145deg, #17110B, #291E13);
      color: #FFFFFF;
      padding: 2.35rem;
      border-radius: var(--radius-lg);
      border: 2px solid var(--gold-primary);
      box-shadow: var(--shadow-lg), 0 0 30px rgba(200, 141, 42, 0.15);
    }

    .corporate-quote-box::before {
      content: '';
      position: absolute;
      inset: 0;
      opacity: 0.05;
      pointer-events: none;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='56' height='98' viewBox='0 0 56 98'%3E%3Cpath fill='none' stroke='%23E5B84B' stroke-width='1.2' d='M28 0l28 16.3v32.7L28 65.3 0 49V16.3L28 0zm0 98l28-16.3V49L28 32.7 0 49v32.7L28 98z'/%3E%3C/svg%3E");
    }

    .quote-emblem {
      font-size: 2.2rem;
      margin-bottom: 0.75rem;
    }

    .corporate-quote-box blockquote {
      font-family: 'Amiri', serif;
      font-size: 1.38rem;
      line-height: 1.75;
      color: var(--gold-light);
      margin-bottom: 1.25rem;
    }

    .quote-author {
      display: flex;
      flex-direction: column;
      border-top: 1px solid rgba(229, 184, 75, 0.25);
      padding-top: 0.85rem;
    }

    .quote-author span {
      font-size: 0.84rem;
      color: #C7B6A2;
    }

    .curated-tabs {
      display: flex;
      gap: 0.55rem;
      flex-wrap: wrap;
      margin-bottom: 1.5rem;
    }

    .curated-tab-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      background: var(--bg-card);
      border: 1.5px solid var(--border-color);
      color: var(--obsidian);
      padding: 0.48rem 1rem;
      border-radius: 999px;
      font-size: 0.85rem;
      font-weight: 800;
      cursor: pointer;
      transition: var(--transition);
    }

    .curated-tab-btn:hover {
      border-color: var(--gold-primary);
      transform: translateY(-2px);
    }

    .curated-tab-btn.active {
      background: linear-gradient(145deg, #1E160E, var(--obsidian));
      color: var(--gold-bright);
      border-color: var(--gold-bright);
      box-shadow: var(--shadow-gold);
    }

    .curated-actions {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
    }

    .curated-view-btn {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      border: 1.5px solid var(--border-gold);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      color: var(--obsidian);
      transition: var(--transition);
    }

    .curated-view-btn:hover {
      background: var(--obsidian);
      color: var(--gold-bright);
      border-color: var(--obsidian);
    }

    .journey-strip {
      position: relative;
      overflow: hidden;
      background:
        radial-gradient(circle at 20% 25%, rgba(229, 184, 75, 0.18) 0%, transparent 45%),
        linear-gradient(145deg, #120D08 0%, #21170E 55%, #130E09 100%);
      color: #FFFFFF;
      padding: 3.75rem 0;
      border-top: 2px solid var(--gold-primary);
      border-bottom: 2px solid var(--gold-primary);
    }

    .journey-header {
      text-align: center;
      margin-bottom: 2.25rem;
    }

    .journey-header h2 {
      font-size: 1.85rem;
      font-weight: 900;
      color: #FFFFFF;
    }

    .journey-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1.25rem;
    }

    .journey-card {
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(229, 184, 75, 0.25);
      border-radius: var(--radius-lg);
      padding: 1.5rem 1.25rem;
      text-align: center;
      transition: var(--transition);
    }

    .journey-card:hover {
      transform: translateY(-6px);
      background: rgba(229, 184, 75, 0.08);
      border-color: var(--gold-bright);
      box-shadow: 0 16px 34px rgba(0, 0, 0, 0.38);
    }

    .journey-hex {
      width: 58px;
      height: 58px;
      margin: 0 auto 0.75rem;
      border-radius: 16px;
      background: linear-gradient(135deg, rgba(229, 184, 75, 0.22), rgba(200, 141, 42, 0.08));
      border: 1.5px solid var(--gold-bright);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.65rem;
      transition: var(--transition);
    }

    .journey-card:hover .journey-hex {
      background: linear-gradient(135deg, var(--gold-bright), var(--gold-primary));
      transform: scale(1.08) rotate(-5deg);
    }

    .journey-num {
      display: inline-block;
      font-size: 0.74rem;
      font-weight: 800;
      color: var(--gold-bright);
      margin-bottom: 0.3rem;
    }

    .journey-card h3 {
      font-size: 1.04rem;
      font-weight: 800;
      margin-bottom: 0.45rem;
      color: #FFFFFF;
    }

    .journey-card p {
      font-size: 0.84rem;
      color: #D1C1AE;
      line-height: 1.65;
    }

    .curated-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1.25rem;
    }

    .curated-card {
      background: rgba(255, 253, 249, 0.72);
      backdrop-filter: blur(16px) saturate(170%);
      -webkit-backdrop-filter: blur(16px) saturate(170%);
      border: 1.5px solid rgba(255, 255, 255, 0.8);
      border-radius: var(--radius-lg);
      overflow: hidden;
      box-shadow: var(--glass-specular-light), var(--shadow-sm);
      display: flex;
      flex-direction: column;
      transition: var(--transition-fluid);
    }

    .curated-card:hover {
      transform: translateY(-7px) scale(1.01);
      border-color: rgba(229, 184, 75, 0.75);
      box-shadow: var(--glass-specular-light), var(--shadow-lg), 0 0 24px rgba(229, 184, 75, 0.18);
    }

    .curated-media {
      position: relative;
      height: 210px;
      background: radial-gradient(circle at 50% 45%, #FFFFFF 0%, #F3ECE0 100%);
      border-bottom: 1px solid var(--border-color);
      overflow: hidden;
      display: block;
    }

    .curated-media img {
      width: 100%;
      height: 100%;
      object-fit: contain;
      padding: 0.75rem;
      transition: transform 0.5s cubic-bezier(0.22, 1, 0.36, 1);
    }

    .curated-card:hover .curated-media img {
      transform: scale(1.08);
    }

    .curated-badge {
      position: absolute;
      top: 0.7rem;
      right: 0.7rem;
      z-index: 2;
      background: linear-gradient(135deg, var(--gold-bright), var(--gold-primary));
      color: var(--obsidian);
      font-size: 0.72rem;
      font-weight: 800;
      padding: 0.2rem 0.65rem;
      border-radius: 999px;
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.14);
    }

    .curated-body {
      padding: 1.1rem;
      display: flex;
      flex-direction: column;
      flex: 1;
    }

    .curated-cat {
      font-size: 0.74rem;
      font-weight: 700;
      color: var(--gold-dark);
      margin-bottom: 0.25rem;
    }

    .curated-title {
      font-size: 1rem;
      font-weight: 800;
      color: var(--obsidian);
      line-height: 1.4;
      margin-bottom: 0.9rem;
      flex: 1;
    }

    .curated-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 0.5rem;
      padding-top: 0.75rem;
      border-top: 1px dashed var(--border-color);
    }

    .curated-price {
      font-size: 1.15rem;
      font-weight: 900;
      color: var(--obsidian);
    }

    .curated-price small {
      font-size: 0.75rem;
      color: var(--gold-dark);
    }

    .curated-add-btn {
      background: linear-gradient(135deg, #F3CE6A, var(--gold-primary));
      color: var(--obsidian);
      border: 1px solid rgba(255, 240, 195, 0.65);
      padding: 0.45rem 0.9rem;
      border-radius: 999px;
      font-size: 0.8rem;
      font-weight: 800;
      cursor: pointer;
      transition: var(--transition);
    }

    .curated-add-btn:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-gold);
    }

    .curated-add-btn.added {
      background: #15803D;
      color: #FFFFFF;
      border-color: #16A34A;
    }

    .sectors-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1.5rem;
    }

    .sector-card {
      background: var(--bg-card);
      border: 1.5px solid var(--border-color);
      border-radius: var(--radius-lg);
      overflow: hidden;
      box-shadow: var(--shadow-sm);
      transition: var(--transition);
      display: flex;
      flex-direction: column;
    }

    .sector-card:hover {
      transform: translateY(-6px);
      border-color: var(--gold-primary);
      box-shadow: var(--shadow-lg), 0 0 0 1px rgba(229, 184, 75, 0.25);
    }

    .sector-img-wrap {
      position: relative;
      height: 195px;
      background: #1B130B;
      overflow: hidden;
    }

    .sector-img-wrap img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.55s cubic-bezier(0.22, 1, 0.36, 1);
    }

    .sector-card:hover .sector-img-wrap img {
      transform: scale(1.08);
    }

    .sector-icon-badge {
      position: absolute;
      bottom: 0.75rem;
      right: 0.75rem;
      width: 44px;
      height: 44px;
      border-radius: 12px;
      background: rgba(21, 16, 11, 0.92);
      border: 1.5px solid var(--gold-bright);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.3rem;
      transition: var(--transition);
      box-shadow: 0 6px 14px rgba(0, 0, 0, 0.35);
    }

    .sector-card:hover .sector-icon-badge {
      transform: scale(1.1) rotate(-6deg);
      background: var(--gold-bright);
    }

    .sector-body {
      padding: 1.25rem;
      display: flex;
      flex-direction: column;
      flex: 1;
    }

    .sector-body h3 {
      font-size: 1.12rem;
      font-weight: 800;
      color: var(--obsidian);
      margin-bottom: 0.45rem;
    }

    .sector-body p {
      font-size: 0.88rem;
      color: var(--text-secondary);
      flex: 1;
      margin-bottom: 1rem;
    }

    .sector-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 0.75rem;
      border-top: 1px solid var(--border-color);
      font-size: 0.85rem;
      font-weight: 800;
    }

    .sector-link {
      color: var(--text-secondary);
    }

    .sector-shop-link {
      color: var(--obsidian);
      background: var(--gold-light);
      border: 1px solid rgba(200, 141, 42, 0.45);
      padding: 0.28rem 0.75rem;
      border-radius: 999px;
      transition: var(--transition);
    }

    .sector-shop-link:hover {
      background: linear-gradient(135deg, var(--gold-bright), var(--gold-primary));
      box-shadow: var(--shadow-gold);
    }

    .services-preview-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1.25rem;
    }

    .service-card {
      position: relative;
      overflow: hidden;
      background: var(--bg-card);
      border: 1.5px solid var(--border-color);
      border-radius: var(--radius-md);
      padding: 1.55rem;
      box-shadow: var(--shadow-sm);
      transition: var(--transition);
    }

    .service-card::before {
      content: '';
      position: absolute;
      top: 0;
      right: 0;
      left: 0;
      height: 3px;
      background: linear-gradient(90deg, var(--gold-primary), var(--gold-bright));
      transform: scaleX(0);
      transform-origin: right;
      transition: transform 0.35s ease;
    }

    .service-card:hover {
      transform: translateY(-5px);
      border-color: var(--gold-primary);
      box-shadow: var(--shadow-md);
    }

    .service-card:hover::before {
      transform: scaleX(1);
    }

    .service-icon {
      width: 52px;
      height: 52px;
      border-radius: 14px;
      background: linear-gradient(135deg, rgba(229, 184, 75, 0.2), rgba(200, 141, 42, 0.08));
      border: 1px solid rgba(200, 141, 42, 0.35);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.7rem;
      margin-bottom: 0.85rem;
    }

    .service-audience {
      display: inline-block;
      font-size: 0.75rem;
      font-weight: 800;
      color: var(--gold-dark);
      background: var(--bg-alt);
      padding: 0.15rem 0.6rem;
      border-radius: 999px;
      margin-bottom: 0.5rem;
    }

    .service-card h3 {
      font-size: 1.05rem;
      font-weight: 800;
      margin-bottom: 0.5rem;
      color: var(--obsidian);
    }

    .service-card p {
      font-size: 0.86rem;
      color: var(--text-secondary);
    }

    .cta-bridge {
      background: linear-gradient(135deg, #16100A 0%, #2B1F13 100%);
      color: #FFFFFF;
      padding: 3.25rem 0;
      border-top: 2px solid var(--gold-primary);
    }

    .cta-bridge-inner {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 2rem;
      flex-wrap: wrap;
    }

    .cta-bridge h2 {
      font-size: 1.7rem;
      font-weight: 900;
      margin-bottom: 0.45rem;
    }

    .cta-bridge p {
      color: #D7C8B6;
      max-width: 620px;
    }

    .cta-bridge-actions {
      display: flex;
      gap: 0.85rem;
      flex-wrap: wrap;
    }

    @media (max-width: 1024px) {
      .corp-hero-grid,
      .about-preview-grid {
        grid-template-columns: 1fr;
      }
      .milestones-grid,
      .curated-grid,
      .journey-grid,
      .services-preview-grid,
      .sectors-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (max-width: 640px) {
      .corp-hero {
        padding: 2.5rem 0 2.75rem;
      }
      .corp-hero-grid {
        gap: 1.75rem;
      }
      .corp-badge {
        font-size: 0.76rem;
        padding: 0.32rem 0.85rem;
      }
      .corp-hero h1 {
        font-size: 1.85rem;
      }
      .corp-hero h1 span {
        font-size: 1.2rem;
      }
      .corp-lead {
        font-size: 0.95rem;
        margin-bottom: 1.35rem;
      }
      .hero-trust-row {
        gap: 0.45rem;
        margin-top: 1.15rem;
      }
      .trust-pill {
        font-size: 0.74rem;
        padding: 0.25rem 0.65rem;
      }
      .main-visual {
        height: 225px;
      }
      .visual-thumb-btn {
        height: 78px;
      }
      .milestones-strip {
        margin-top: -1.5rem;
        padding: 0 0 1rem;
      }
      .milestones-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 0.75rem;
      }
      .milestone-card {
        padding: 1rem;
      }
      .milestone-num {
        font-size: 1.35rem;
      }
      .curated-grid,
      .journey-grid,
      .sectors-grid,
      .services-preview-grid {
        grid-template-columns: 1fr;
      }
      .corporate-quote-box {
        padding: 1.5rem;
      }
      .corporate-quote-box blockquote {
        font-size: 1.15rem;
      }
      .cta-bridge {
        padding: 2.25rem 0;
      }
      .cta-bridge h2 {
        font-size: 1.35rem;
      }
    }

    @media (max-width: 480px) {
      .corp-hero-actions,
      .cta-bridge-actions {
        flex-direction: column;
        width: 100%;
      }
      .corp-hero-actions > a,
      .cta-bridge-actions > a {
        width: 100%;
      }
    }
  `]
})
export class HomeComponent implements OnInit, OnDestroy {
  readonly catalog = inject(CatalogService);
  private readonly cart = inject(CartService);
  private spotlightTimer: ReturnType<typeof setInterval> | null = null;

  readonly spotlightItems = [
    {
      shortTitle: 'السدر الملكي',
      tag: '👑 قطفة أولى ملكية',
      eyebrow: 'الهوية اليمنية الأصيلة',
      title: 'عسل السدر الدوعني الملكي — من مناحل دوعن إلى العالم',
      image: 'assets/products/قسم العسل الطبيعي/السدر/عسل السدر الدوعني الملكي(قطفة أولئ).png'
    },
    {
      shortTitle: 'التمور الفاخرة',
      tag: '🌴 انتقاء موسمي فاخر',
      eyebrow: 'تراث الضيافة العربية',
      title: 'أجود أنواع التمور المنتقاة بتغليف فاخر ومثالي للإهداء',
      image: 'assets/products/التمور/التمور.jpg'
    },
    {
      shortTitle: 'العناية الطبيعية',
      tag: '✨ خلاصة النحل النقية',
      eyebrow: 'جمال مستوحى من الطبيعة',
      title: 'مستحضرات عناية شخصية غنية بالعسل الملكي والبروبلس',
      image: 'assets/products/قسم العناية الشخصية/1.png'
    }
  ];

  readonly journeySteps = [
    {
      num: '01',
      icon: '🐝',
      title: 'المناحل الجبلية والوديان',
      desc: 'رعي طبيعي في أودية دوعن وعصيم وجبال اليمن الغنية بأشجار السدر والزهور البرية.'
    },
    {
      num: '02',
      icon: '🏺',
      title: 'الفرز البارد الخام',
      desc: 'استخلاص تقليدي بدون بسترة حرارية للحفاظ على الإنزيمات الحيوية وحبوب اللقاح.'
    },
    {
      num: '03',
      icon: '🔬',
      title: 'الفحص والتوثيق المخبري',
      desc: 'اختبار كل قطفة للتأكد من النقاء ومطابقة المواصفات القياسية المعتمدة.'
    },
    {
      num: '04',
      icon: '🌍',
      title: 'التغليف الملكي والتوريد',
      desc: 'تعبئة فاخرة تحفظ الخواص العلاجية وتلبي طلبات الأفراد والتجار والتصدير الدولي.'
    }
  ];

  readonly activeSpotlightIndex = signal(0);
  readonly activeSpotlight = computed(() => this.spotlightItems[this.activeSpotlightIndex()]);
  readonly curatedCategory = signal<CategoryId>('honey');
  readonly featuredProducts = computed(() =>
    this.catalog.products
      .filter((p) => p.category === this.curatedCategory())
      .slice(0, 4)
  );
  readonly justAddedCode = signal<string | null>(null);

  ngOnInit(): void {
    this.spotlightTimer = setInterval(() => {
      this.activeSpotlightIndex.update((i) => (i + 1) % this.spotlightItems.length);
    }, 4500);
  }

  ngOnDestroy(): void {
    if (this.spotlightTimer) {
      clearInterval(this.spotlightTimer);
    }
  }

  selectSpotlight(index: number): void {
    this.activeSpotlightIndex.set(index);
    if (this.spotlightTimer) {
      clearInterval(this.spotlightTimer);
    }
  }

  quickAdd(product: Product): void {
    this.cart.addItem(product, 1);
    this.justAddedCode.set(product.code);
    setTimeout(() => {
      if (this.justAddedCode() === product.code) {
        this.justAddedCode.set(null);
      }
    }, 1400);
  }
}
