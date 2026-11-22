import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CatalogService } from '../../services/catalog.service';

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [RouterLink],
  template: `
    <section class="page-hero">
      <div class="container">
        <div class="breadcrumb">
          <a routerLink="/">الرئيسية</a>
          <span>/</span>
          <span>خدماتنا</span>
        </div>
        <span class="page-hero-eyebrow">🤝 خدمات الأفراد والشركات</span>
        <h1>الخدمات التجارية والمؤسسية</h1>
        <p>
          نقدّم باقة متكاملة من الخدمات التي تخدم المستهلك الفردي، المتاجر والموزعين، وشركاء
          التصدير والاستيراد.
        </p>
      </div>
    </section>

    <section class="section-block">
      <div class="container services-full-grid">
        @for (srv of catalog.services; track srv.id) {
          <article class="service-full-card">
            <div class="srv-head">
              <div class="srv-icon">{{ srv.icon }}</div>
              <div>
                <span class="srv-audience">{{ srv.audience }}</span>
                <h2>{{ srv.title }}</h2>
              </div>
            </div>
            <p class="srv-summary">{{ srv.summary }}</p>
            <ul class="srv-features">
              @for (feat of srv.features; track feat) {
                <li>{{ feat }}</li>
              }
            </ul>
          </article>
        }
      </div>
    </section>

    <section class="section-block-alt">
      <div class="container service-cta-box">
        <div>
          <h2>هل لديكم طلب جملة أو شراكة تصدير أو هدايا مؤسسية؟</h2>
          <p>
            فريق المبيعات المؤسسية في شركة عالم العسل جاهز لتزويدكم بعروض الأسعار الخاصة بالجالونات
            والدرازن والكراتين.
          </p>
        </div>
        <div style="display:flex;gap:0.85rem;flex-wrap:wrap;">
          <a routerLink="/contact" class="btn-obsidian">تقديم طلب تواصل أو عرض سعر</a>
          <a routerLink="/shop" class="btn-gold">🛍️ تصفح المتجر الإلكتروني</a>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .services-full-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1.5rem;
    }

    .service-full-card {
      background: var(--bg-card);
      border: 1.5px solid var(--border-color);
      border-radius: var(--radius-lg);
      padding: 1.75rem;
      box-shadow: var(--shadow-sm);
    }

    .srv-head {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .srv-icon {
      width: 56px;
      height: 56px;
      border-radius: 16px;
      background: var(--obsidian);
      color: var(--gold-bright);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.75rem;
      flex-shrink: 0;
    }

    .srv-audience {
      font-size: 0.78rem;
      font-weight: 800;
      color: var(--gold-dark);
    }

    .srv-head h2 {
      font-size: 1.25rem;
      font-weight: 900;
      color: var(--obsidian);
    }

    .srv-summary {
      font-size: 0.94rem;
      color: var(--text-secondary);
      margin-bottom: 1rem;
    }

    .srv-features {
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      background: var(--bg-main);
      padding: 1rem 1.15rem;
      border-radius: var(--radius-sm);
      border-right: 3px solid var(--gold-primary);
    }

    .srv-features li {
      font-size: 0.88rem;
      font-weight: 600;
      color: var(--text-primary);
    }

    .srv-features li::before {
      content: "✦ ";
      color: var(--gold-primary);
      font-weight: 900;
    }

    .service-cta-box {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 1.5rem;
      flex-wrap: wrap;
    }

    .service-cta-box h2 {
      font-size: 1.45rem;
      font-weight: 900;
      color: var(--obsidian);
      margin-bottom: 0.3rem;
    }

    .service-cta-box p {
      color: var(--text-secondary);
    }

    @media (max-width: 860px) {
      .services-full-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class ServicesComponent {
  readonly catalog = inject(CatalogService);
}
