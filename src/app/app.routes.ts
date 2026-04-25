import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/gift-card-list/gift-card-list.component').then(m => m.GiftCardListComponent)
  },
  {
    path: 'card/:id',
    loadComponent: () => import('./components/gift-card-detail/gift-card-detail.component').then(m => m.GiftCardDetailComponent)
  },
  {
    path: 'shared/:id',
    loadComponent: () => import('./components/shared-card/shared-card.component').then(m => m.SharedCardComponent)
  },
  {
    path: '**',
    redirectTo: ''
  }
];
