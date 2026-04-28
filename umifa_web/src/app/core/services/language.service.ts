import { inject, Injectable, signal, computed, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';

export type AppLang = 'fr' | 'ar';

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private translate = inject(TranslateService);
  private platformId = inject(PLATFORM_ID);

  currentLang = signal<AppLang>('fr');
  isRTL = computed(() => this.currentLang() === 'ar');

  init(): Promise<void> {
    let lang: AppLang = 'fr';
    if (isPlatformBrowser(this.platformId)) {
      const saved = localStorage.getItem('umifa_lang') as AppLang | null;
      if (saved === 'fr' || saved === 'ar') lang = saved;
    }
    this.currentLang.set(lang);
    if (isPlatformBrowser(this.platformId)) {
      document.documentElement.lang = lang;
    }
    return new Promise(resolve => {
      this.translate.use(lang).subscribe({ complete: () => resolve() });
    });
  }

  toggle(): void {
    this.setLanguage(this.currentLang() === 'fr' ? 'ar' : 'fr');
  }

  setLanguage(lang: AppLang): void {
    this.applyLanguage(lang);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('umifa_lang', lang);
    }
  }

  private applyLanguage(lang: AppLang): void {
    this.currentLang.set(lang);
    this.translate.use(lang);
    if (isPlatformBrowser(this.platformId)) {
      document.documentElement.lang = lang;
    }
  }
}
