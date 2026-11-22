import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CatalogService } from '../../services/catalog.service';

@Component({
  selector: 'app-activities',
  standalone: true,
  imports: [RouterLink],
  template: `
    <section class="page-hero">
      <div class="container">
        <div class="breadcrumb">
          <a routerLink="/">الرئيسية</a>
          <span>/</span>
          <span>أنشطتنا وقطاعاتنا</span>
        </div>
        <span class="page-hero-eyebrow">🐝 مجالات العمل والإنتاج</span>
        <h1>أنشطة وقطاعات شركة عالم العسل اليمني</h1>
        <p>
          نعمل عبر ستة قطاعات تخصصية متكاملة تغطي منتجات النحل، التمور الفاخرة، الزيوت الطبيعية،
          العناية الشخصية، المكسرات اليمنية، والمكملات الحيوية.
        </p>
      </div>
    </section>

    <section class="section-block">
      <div class="container activities-list">
        @for (cat of catalog.categories; track cat.id) {
          @if (cat.id !== 'all') {
            <article class="activity-row">
              <div class="activity-media">
                <img [src]="cat.coverImage" [alt]="cat.name" loading="lazy" />
              </div>
              <div class="activity-content">
                <div class="activity-top">
                  <span class="activity-badge">{{ cat.icon }} {{ catalog.getCountByCategory(cat.id) }} صنفاً موثقاً</span>
                </div>
                <h2>{{ cat.name }}</h2>
                <p class="activity-summary">{{ cat.corporateSummary }}</p>
                <p class="activity-desc">{{ cat.description }}</p>

                @if (cat.origins && cat.origins.length > 0) {
                  <div class="origins-tags">
                    <strong>المصادر المعتمدة:</strong>
                    @for (org of cat.origins; track org) {
                      <span class="origin-pill">{{ org }}</span>
                    }
                  </div>
                }

                <div class="activity-actions">
                  <a routerLink="/shop" [queryParams]="{ category: cat.id }" class="btn-gold">
                    🛍️ تصفح أصناف هذا القطاع في المتجر
                  </a>
                  <a routerLink="/contact" class="btn-outline-dark">استفسار تجاري / جملة</a>
                </div>
              </div>
            </article>
          }
        }
      </div>
    </section>
  `,
  styles: [`
    .activities-list {
      display: flex;
      flex-direction: column;
      gap: 1.75rem;
    }

    .activity-row {
      display: grid;
      grid-template-columns: 320px 1fr;
      gap: 2rem;
      background: var(--bg-card);
      border: 1.5px solid var(--border-color);
      border-radius: var(--radius-lg);
      overflow: hidden;
      box-shadow: var(--shadow-sm);
      align-items: center;
    }

    .activity-media {
      height: 100%;
      min-height: 260px;
      background: #1B130B;
    }

    .activity-media img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .activity-content {
      padding: 1.75rem 0 1.75rem 1.75rem;
    }

    .activity-badge {
      display: inline-block;
      background: var(--bg-alt);
      color: var(--gold-dark);
      font-weight: 800;
      font-size: 0.8rem;
      padding: 0.2rem 0.75rem;
      border-radius: 999px;
      margin-bottom: 0.65rem;
    }

    .activity-content h2 {
      font-size: 1.45rem;
      font-weight: 900;
      color: var(--obsidian);
      margin-bottom: 0.5rem;
    }

    .activity-summary {
      font-size: 0.96rem;
      color: var(--text-primary);
      font-weight: 600;
      margin-bottom: 0.45rem;
    }

    .activity-desc {
      font-size: 0.9rem;
      color: var(--text-secondary);
      margin-bottom: 1rem;
    }

    .origins-tags {
      display: flex;
      align-items: center;
      gap: 0.45rem;
      flex-wrap: wrap;
      margin-bottom: 1.25rem;
      font-size: 0.85rem;
    }

    .origin-pill {
      background: #FFFDF9;
      border: 1px solid var(--border-gold);
      color: var(--obsidian);
      padding: 0.18rem 0.65rem;
      border-radius: 999px;
      font-weight: 700;
      font-size: 0.8rem;
    }

    .activity-actions {
      display: flex;
      gap: 0.75rem;
      flex-wrap: wrap;
    }

    @media (max-width: 900px) {
      .activity-row {
        grid-template-columns: 1fr;
      }
      .activity-media {
        height: 220px;
      }
      .activity-content {
        padding: 1.25rem;
      }
    }
  `]
})
export class ActivitiesComponent {
  readonly catalog = inject(CatalogService);
}
