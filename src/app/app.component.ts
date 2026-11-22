import { Component, computed, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { CartService } from './services/cart.service';
import { CatalogService } from './services/catalog.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  readonly catalog = inject(CatalogService);
  readonly cart = inject(CartService);
  private readonly router = inject(Router);

  readonly currentUrl = signal<string>(this.router.url);
  readonly mobileMenuOpen = signal<boolean>(false);

  readonly isShopRoute = computed(() => this.currentUrl().startsWith('/shop'));
  readonly showCartButton = computed(
    () => this.isShopRoute() || this.cart.totalCount() > 0
  );

  constructor() {
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe((event) => {
        this.currentUrl.set(event.urlAfterRedirects);
        this.mobileMenuOpen.set(false);
      });
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen.update((v) => !v);
  }
}
