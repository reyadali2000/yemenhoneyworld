import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CatalogService } from '../../services/catalog.service';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [RouterLink, FormsModule],
  template: `
    <section class="page-hero">
      <div class="container">
        <div class="breadcrumb">
          <a routerLink="/">الرئيسية</a>
          <span>/</span>
          <span>تواصل معنا</span>
        </div>
        <span class="page-hero-eyebrow">📞 قنوات التواصل الرسمية</span>
        <h1>تواصل مع {{ catalog.siteConfig.companyName }}</h1>
        <p>
          نسعد باستقبال استفساراتكم العامة، طلبات الجملة والتصدير، وملاحظاتكم عبر قنواتنا الرسمية.
        </p>
      </div>
    </section>

    <section class="section-block">
      <div class="container contact-layout">
        <!-- معلومات التواصل -->
        <div class="contact-info-stack">
          <div class="info-card">
            <h3>📱 الاتصال المباشر والواتساب</h3>
            <ul class="info-list">
              <li>
                <strong>الجوال والواتساب الرسمي:</strong>
                <a [href]="'tel:' + catalog.siteConfig.contact.phonePrimary" dir="ltr">
                  {{ catalog.siteConfig.contact.phonePrimary }}
                </a>
              </li>
              <li>
                <strong>الهاتف الإضافي:</strong>
                <a [href]="'tel:' + catalog.siteConfig.contact.phoneSecondary" dir="ltr">
                  {{ catalog.siteConfig.contact.phoneSecondary }}
                </a>
              </li>
              <li>
                <strong>ساعات العمل:</strong>
                <span>{{ catalog.siteConfig.contact.workingHours }}</span>
              </li>
            </ul>
            <a
              [href]="'https://wa.me/' + catalog.siteConfig.contact.whatsapp"
              target="_blank"
              rel="noopener"
              class="btn-wa-direct"
            >
              💬 محادثة مباشرة عبر واتساب
            </a>
          </div>

          <div class="info-card">
            <h3>🌐 القنوات الرقمية والعنوان</h3>
            <ul class="info-list">
              <li>
                <strong>البريد الإلكتروني:</strong>
                <a [href]="'mailto:' + catalog.siteConfig.contact.email" dir="ltr">
                  {{ catalog.siteConfig.contact.email }}
                </a>
              </li>
              <li>
                <strong>الموقع الإلكتروني:</strong>
                <a [href]="catalog.siteConfig.contact.websiteUrl" target="_blank" rel="noopener" dir="ltr">
                  {{ catalog.siteConfig.contact.website }}
                </a>
              </li>
              <li>
                <strong>المركز الرئيسي:</strong>
                <span>{{ catalog.siteConfig.contact.addressMain }}</span>
              </li>
              <li>
                <strong>حسابات التواصل:</strong>
                <span dir="ltr">{{ catalog.siteConfig.social.handle }}</span>
              </li>
            </ul>
          </div>
        </div>

        <!-- نموذج مراسلة رسمي -->
        <div class="contact-form-card">
          <h2>✉️ أرسل رسالة أو استفساراً رسمياً</h2>
          <p>سيتم تجهيز رسالتك وإرسالها مباشرة إلى فريق خدمة العملاء والمبيعات عبر واتساب.</p>

          <form (ngSubmit)="submitInquiry()" class="inquiry-form">
            <div class="form-row">
              <div class="field">
                <label for="inqName">الاسم / الجهة</label>
                <input id="inqName" type="text" [(ngModel)]="form.name" name="name" placeholder="الاسم الكامل أو اسم الشركة" required />
              </div>
              <div class="field">
                <label for="inqPhone">رقم الهاتف</label>
                <input id="inqPhone" type="text" dir="ltr" [(ngModel)]="form.phone" name="phone" placeholder="+967 ..." required />
              </div>
            </div>

            <div class="field">
              <label for="inqType">موضوع التواصل</label>
              <select id="inqType" [(ngModel)]="form.subject" name="subject">
                <option value="استفسار عام">استفسار عام عن الشركة والمنتجات</option>
                <option value="طلب جملة أو توزيع">طلب أسعار الجملة أو وكالة توزيع</option>
                <option value="طلب تصدير دولي">طلب تصدير وشحن دولي</option>
                <option value="تجهيز هدايا شركات">تجهيز هدايا ومناسبات رسمية</option>
                <option value="ملاحظات واقتراحات">ملاحظات واقتراحات</option>
              </select>
            </div>

            <div class="field">
              <label for="inqMsg">تفاصيل الرسالة</label>
              <textarea id="inqMsg" rows="4" [(ngModel)]="form.message" name="message" placeholder="اكتب رسالتك أو استفسارك هنا..." required></textarea>
            </div>

            <button type="submit" class="btn-gold" style="width:100%;">
              💬 إرسال الرسالة عبر واتساب الرسمي
            </button>

            @if (submittedNotice()) {
              <div class="sent-notice">
                ✅ تم فتح واتساب بنص الرسالة المجهّز إلى الرقم {{ catalog.siteConfig.contact.whatsappDisplay }}.
              </div>
            }
          </form>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .contact-layout {
      display: grid;
      grid-template-columns: 0.9fr 1.1fr;
      gap: 2rem;
      align-items: start;
    }

    .contact-info-stack {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .info-card, .contact-form-card {
      background: var(--bg-card);
      border: 1.5px solid var(--border-color);
      border-radius: var(--radius-lg);
      padding: 1.65rem;
      box-shadow: var(--shadow-sm);
    }

    .info-card h3, .contact-form-card h2 {
      font-size: 1.2rem;
      font-weight: 900;
      color: var(--obsidian);
      margin-bottom: 0.9rem;
    }

    .contact-form-card p {
      font-size: 0.9rem;
      color: var(--text-secondary);
      margin-bottom: 1.25rem;
    }

    .info-list {
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 0.7rem;
      font-size: 0.92rem;
      color: var(--text-secondary);
      margin-bottom: 1.15rem;
    }

    .info-list strong {
      color: var(--obsidian);
      display: inline-block;
      margin-left: 0.4rem;
    }

    .btn-wa-direct {
      display: inline-flex;
      width: 100%;
      justify-content: center;
      align-items: center;
      background: #15803D;
      color: #FFFFFF;
      font-weight: 800;
      padding: 0.75rem 1rem;
      border-radius: var(--radius-sm);
    }

    .inquiry-form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    .field {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
    }

    .field label {
      font-size: 0.85rem;
      font-weight: 800;
      color: var(--obsidian);
    }

    .field input, .field select, .field textarea {
      padding: 0.75rem 0.95rem;
      border: 1.5px solid var(--border-color);
      border-radius: var(--radius-sm);
      background: var(--bg-main);
      font-size: 0.92rem;
    }

    .field input:focus, .field select:focus, .field textarea:focus {
      outline: none;
      border-color: var(--gold-primary);
      background: #FFFFFF;
    }

    .sent-notice {
      background: #DCFCE7;
      color: #166534;
      padding: 0.75rem 1rem;
      border-radius: var(--radius-sm);
      font-size: 0.88rem;
      font-weight: 700;
    }

    @media (max-width: 900px) {
      .contact-layout, .form-row {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class ContactComponent {
  readonly catalog = inject(CatalogService);
  readonly submittedNotice = signal(false);

  form = {
    name: '',
    phone: '',
    subject: 'استفسار عام',
    message: ''
  };

  submitInquiry(): void {
    const lines = [
      'السلام عليكم ورحمة الله وبركاته',
      `📩 *رسالة تواصل رسمية — ${this.form.subject}*`,
      `• الاسم / الجهة: ${this.form.name || 'غير محدد'}`,
      `• رقم الهاتف: ${this.form.phone || 'غير محدد'}`,
      `• التفاصيل: ${this.form.message || '—'}`
    ];
    const wa = this.catalog.siteConfig.contact.whatsapp.replace(/[^0-9]/g, '');
    window.open(`https://wa.me/${wa}?text=${encodeURIComponent(lines.join('\n'))}`, '_blank', 'noopener');
    this.submittedNotice.set(true);
  }
}
