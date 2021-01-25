import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {HomeComponent} from './pages/home/home.component';
import {CommonLayoutComponent} from './pages/common-layout.component';

const routes: Routes = [
  {
    path: '',
    component: CommonLayoutComponent,
    children: [
      { path: '', component: HomeComponent },
    ],
  },
  { path: '', loadChildren: () => import('./pages/general/general.module').then(m => m.GeneralModule) },
  { path: '', loadChildren: () => import('./pages/common-layout.module').then(m => m.CommonLayoutModule) },
  { path: '**', redirectTo: '/not-found' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
