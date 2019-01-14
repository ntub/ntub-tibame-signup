import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SignUpFormComponent } from './sign-up-form/sign-up-form.component';
import { PrivatePolicyComponent } from './private-policy/private-policy.component';

const routes: Routes = [
  {path: 'private-policy', component: PrivatePolicyComponent},
  {path: '', component: SignUpFormComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
exports: [RouterModule]
})
export class AppRoutingModule { }
