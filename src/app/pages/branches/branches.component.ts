import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CatalogService } from '../../services/catalog.service';

@Component({
  selector: 'app-branches',
  standalone: true,
  imports: [RouterLink],
  template: `
    <section class="page-hero">
      <div class="container">
        <div class="breadcrumb">
          <a routerLink="/">الرئيسية</a>
          <span>/</span>
          <span>الفروع والانتشار</span>
        </div>
        <span class="page-hero-eyebrow">📍 شبكة المعارض الرسمية</span>
        <h1>فروع شركة عالم العسل اليمني</h1>
        <p>
          نتواجد لخدمتكم عبر <strong>{{ catalog.branches.length }} فرعاً</strong> منتشرة في
          <strong>{{ cities().length }} محافظات</strong> (صنعاء، عدن، تعز، الحديدة، إب، وعمران).
        </p>
      </div>
    </section>

    <section class="section-block">
      <div class="container">
        <!-- تصفية حسب المحافظة -->
        <div class="city-filter-bar">
          <button
            type="button"
            class="city-pill"
            [class.active]="selectedCity() === 'الكل'"
            (click)="selectedCity.set('الكل')"
          >
            جميع المحافظات ({{ catalog.branches.length }})
          </button>
          @for (city of cities(); track city) {
            <button
              type="button"
              class="city-pill"
              [class.active]="selectedCity() === city"
              (click)="selectedCity.set(city)"
            >
              📍 {{ city }} ({{ countByCity(city) }})
            </button>
          }
        </div>

        <div class="branches-grid">
          @for (b of filteredBranches(); track b.id) {
            <article class="branch-card">
              <div class="branch-top">
                <span class="branch-city">📍 {{ b.city }}</span>
                <span class="branch-type">{{ b.type }}</span>
              </div>
              <h2>{{ b.name }}</h2>
              <ul class="branch-details">
                <li><strong>العنوان:</strong> <span>{{ b.address }}</span></li>
                <li>
                  <strong>الهاتف:</strong>
                  <a [href]="'tel:' + b.phone.replace('/', '')" dir="ltr" class="phone-link">{{ b.phone }}</a>
                </li>
                <li><strong>الدوام:</strong> <span>{{ b.hours }}</span></li>
                <li><strong>الخدمات:</strong> <span>{{ b.notes }}</span></li>
              </ul>
            </article>
          }
        </div>

        <div style="margin-top:2.75rem;text-align:center;">
          <a routerLink="/contact" class="btn-gold">📞 تواصل مع الإدارة أو أقرب فرع</a>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .city-filter-bar {
      display: flex;
      gap: 0.6rem;
      flex-wrap: wrap;
      margin-bottom: 1.75rem;
    }

    .city-pill {
      background: var(--bg-card);
      border: 1.5px solid var(--border-color);
      color: var(--obsidian);
      padding: 0.5rem 1.05rem;
      border-radius: 999px;
      font-weight: 800;
      font-size: 0.88rem;
      cursor: pointer;
      transition: var(--transition);
    }

    .city-pill.active,
    .city-pill:hover {
      background: var(--obsidian);
      color: var(--gold-bright);
      border-color: var(--gold-bright);
    }

    .branches-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1.4rem;
    }

    .branch-card {
      background: var(--bg-card);
      border: 1.5px solid var(--border-color);
      border-radius: var(--radius-lg);
      padding: 1.55rem;
      box-shadow: var(--shadow-sm);
      transition: var(--transition);
    }

    .branch-card:hover {
      border-color: var(--gold-primary);
      box-shadow: var(--shadow-md);
    }

    .branch-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.85rem;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .branch-city {
      background: var(--obsidian);
      color: var(--gold-bright);
      padding: 0.2rem 0.75rem;
      border-radius: 999px;
      font-size: 0.8rem;
      font-weight: 800;
    }

    .branch-type {
      background: var(--bg-alt);
      color: var(--gold-dark);
      padding: 0.2rem 0.75rem;
      border-radius: 999px;
      font-size: 0.78rem;
      font-weight: 700;
    }

    .branch-card h2 {
      font-size: 1.15rem;
      font-weight: 900;
      color: var(--obsidian);
      margin-bottom: 0.9rem;
    }

    .branch-details {
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 0.6rem;
      font-size: 0.89rem;
      color: var(--text-secondary);
    }

    .branch-details strong {
      color: var(--obsidian);
    }

    .phone-link {
      color: var(--gold-dark);
      font-weight: 800;
    }

    @media (max-width: 1024px) {
      .branches-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (max-width: 680px) {
      .branches-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class BranchesComponent {
  readonly catalog = inject(CatalogService);
  readonly selectedCity = signal<string>('الكل');

  readonly cities = computed(() =>
    Array.from(new Set(this.catalog.branches.map((b) => b.city)))
  );

  readonly filteredBranches = computed(() => {
    const city = this.selectedCity();
    if (city === 'الكل') return this.catalog.branches;
    return this.catalog.branches.filter((b) => b.city === city);
  });

  countByCity(city: string): number {
    return this.catalog.branches.filter((b) => b.city === city).length;
  }
}
