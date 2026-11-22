import { Routes } from '@angular/router';
import { AboutComponent } from './pages/about/about.component';
import { ActivitiesComponent } from './pages/activities/activities.component';
import { BranchesComponent } from './pages/branches/branches.component';
import { CartComponent } from './pages/cart/cart.component';
import { ContactComponent } from './pages/contact/contact.component';
import { HomeComponent } from './pages/home/home.component';
import { ProductDetailComponent } from './pages/product-detail/product-detail.component';
import { ServicesComponent } from './pages/services/services.component';
import { ShopComponent } from './pages/shop/shop.component';

export const routes: Routes = [
  // صفحات الهوية المؤسسية للشركة
  {
    path: '',
    component: HomeComponent,
    title: 'شركة عالم العسل اليمني | الموقع الرسمي'
  },
  {
    path: 'about',
    component: AboutComponent,
    title: 'عن الشركة | شركة عالم العسل اليمني'
  },
  {
    path: 'activities',
    component: ActivitiesComponent,
    title: 'أنشطتنا وقطاعاتنا | شركة عالم العسل اليمني'
  },
  {
    path: 'services',
    component: ServicesComponent,
    title: 'خدماتنا | شركة عالم العسل اليمني'
  },
  {
    path: 'branches',
    component: BranchesComponent,
    title: 'الفروع والانتشار | شركة عالم العسل اليمني'
  },
  {
    path: 'contact',
    component: ContactComponent,
    title: 'تواصل معنا | شركة عالم العسل اليمني'
  },

  // صفحات المتجر الإلكتروني
  {
    path: 'shop',
    component: ShopComponent,
    title: 'المتجر الإلكتروني | شركة عالم العسل اليمني'
  },
  {
    path: 'shop/product/:code',
    component: ProductDetailComponent,
    title: 'تفاصيل المنتج | متجر عالم العسل اليمني'
  },
  {
    path: 'shop/cart',
    component: CartComponent,
    title: 'سلة الطلبات | متجر عالم العسل اليمني'
  },

  // إعادة التوجيه لأي مسار غير معروف
  {
    path: '**',
    redirectTo: ''
  }
];
