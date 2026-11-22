import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CatalogService } from '../../services/catalog.service';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [RouterLink],
  template: `
    <section class="page-hero">
      <div class="container">
        <div class="breadcrumb">
          <a routerLink="/">الرئيسية</a>
          <span>/</span>
          <span>عن الشركة</span>
        </div>
        <span class="page-hero-eyebrow">🏛️ الهوية المؤسسية والتاريخ</span>
        <h1>عن {{ catalog.siteConfig.companyName }}</h1>
        <p>
          مسيرة ريادة في تقديم العسل اليمني الأصيل ومشتقات النحل والمنتجات الطبيعية الموثقة من
          أودية وجبال اليمن إلى الأسواق المحلية والعالمية.
        </p>
      </div>
    </section>

    <section class="section-block">
      <div class="container story-grid">
        <div>
          <div class="section-heading">
            <span class="eyebrow">✦ قصتنا وهويتنا</span>
            <h2>من مناحل اليمن العريقة إلى موائد العالم</h2>
            <p>
              تأسست شركة عالم العسل اليمني انطلاقاً من رسالة واضحة: الحفاظ على سمعة العسل اليمني
              عالمياً وتقديمه بصورة مؤسسية موثوقة تجمع بين الأصالة التراثية والدقة العلمية.
            </p>
          </div>
          <p class="body-p">
            نحن لا نكتفي بتجارة العسل فحسب، بل نشرف على منظومة متكاملة تبدأ من اختيار المراعي
            الموسمية في وادي دوعن وعصيم وأبين وتهامة وإب، مروراً بفرز الدرجات (القطفة الأولى الملكي،
            الفاخر، الممتاز)، وانتهاءً بالتعبئة المحكمة وتوثيق الفوائد الطبية والبيولوجية لكل صنف.
          </p>
          <p class="body-p">
            إلى جانب قطاع العسل، وسّعت الشركة أنشطتها لتشمل التمور الفاخرة، الزيوت الطبيعية
            المعصورة على البارد، مستحضرات العناية الشخصية المستخلصة من العسل والبروبلس وسم النحل،
            والمكسرات اليمنية كاللوز البلدي والزبيب الرازقي والدماجي.
          </p>
        </div>

        <div class="vision-cards">
          <div class="v-card">
            <h3>🎯 رؤيتنا</h3>
            <p>
              أن نكون المرجع المؤسسي والتجاري الأول للعسل اليمني ومشتقات النحل الطبيعية في المنطقة
              والعالم تحت شعار «نحل اليمن إلى العالم».
            </p>
          </div>
          <div class="v-card">
            <h3>🌿 رسالتنا</h3>
            <p>
              تقديم منتجات طبيعية 100% مفحوصة وموثقة طبياً وبيولوجياً، تلبي احتياجات المستهلك
              الباحث عن الصحة والشفاء، والتاجر الباحث عن الجودة المضمونة.
            </p>
          </div>
          <div class="v-card">
            <h3>⚖️ قيمنا المؤسسية</h3>
            <p>
              الأمانة في المصدر، الشفافية في التصنيف والأسعار، الالتزام بمعايير السلامة الغذائية،
              وبناء شراكات تجارية مستدامة.
            </p>
          </div>
        </div>
      </div>
    </section>

    <section class="section-block-alt">
      <div class="container">
        <div class="section-heading">
          <span class="eyebrow">✦ خريطة المصادر والمناحل</span>
          <h2>أبرز المناطق التي نستمد منها أصالة منتجاتنا</h2>
        </div>
        <div class="origins-grid">
          <div class="origin-card">
            <h4>🏔️ وادي دوعن — حضرموت</h4>
            <p>موطن عسل السدر الدوعني الملكي (قطفة أولى) وعسل السمر الدوعني الشهير عالمياً.</p>
          </div>
          <div class="origin-card">
            <h4>⛰️ عصيم — عمران</h4>
            <p>منبع عسل السدر العصيمي الجبلي الحر (VIP) ذي التركيز العالي والخواص العلاجية.</p>
          </div>
          <div class="origin-card">
            <h4>🌾 أبين وتهامة وإب</h4>
            <p>مراعي عسل السمر الملكي وعسل السلام التهامي (صديق السكريين) وعسل المجرى الأبيض.</p>
          </div>
          <div class="origin-card">
            <h4>🍇 صعدة والمدينة والقصيم</h4>
            <p>مصادر الزبيب الأسود الدماجي واللوز البلدي اليمني، إلى جانب تمور عجوة المدينة والسكري.</p>
          </div>
        </div>

        <div style="margin-top:2.25rem;display:flex;gap:1rem;flex-wrap:wrap;">
          <a routerLink="/activities" class="btn-obsidian">استعراض قطاعاتنا وأنشطتنا ←</a>
          <a routerLink="/shop" class="btn-gold">🛍️ زيارة المتجر الإلكتروني</a>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .story-grid {
      display: grid;
      grid-template-columns: 1.1fr 0.9fr;
      gap: 2.5rem;
      align-items: start;
    }

    .body-p {
      color: var(--text-secondary);
      margin-bottom: 1rem;
      font-size: 0.98rem;
      line-height: 1.85;
    }

    .vision-cards {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .v-card {
      background: var(--bg-card);
      border: 1.5px solid var(--border-color);
      border-right: 4px solid var(--gold-primary);
      border-radius: var(--radius-md);
      padding: 1.35rem;
      box-shadow: var(--shadow-sm);
    }

    .v-card h3 {
      font-size: 1.08rem;
      font-weight: 800;
      color: var(--obsidian);
      margin-bottom: 0.4rem;
    }

    .v-card p {
      font-size: 0.9rem;
      color: var(--text-secondary);
    }

    .origins-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1.25rem;
    }

    .origin-card {
      background: var(--bg-card);
      border: 1.5px solid var(--border-color);
      border-radius: var(--radius-md);
      padding: 1.35rem;
    }

    .origin-card h4 {
      font-size: 1.02rem;
      font-weight: 800;
      color: var(--obsidian);
      margin-bottom: 0.45rem;
    }

    .origin-card p {
      font-size: 0.87rem;
      color: var(--text-secondary);
    }

    @media (max-width: 960px) {
      .story-grid, .origins-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class AboutComponent {
  readonly catalog = inject(CatalogService);
}
