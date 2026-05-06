import { Component } from '@angular/core';
import { SparkTopbarComponent } from '../shared/components/topbar/topbar.component';
import { SparkFooterComponent } from '../shared/components/footer/footer.component';

@Component({
  selector: 'app-como-funciona',
  standalone: true,
  imports: [SparkTopbarComponent, SparkFooterComponent],
  template: `<app-spark-topbar></app-spark-topbar><main style="min-height:100vh"></main><app-spark-footer></app-spark-footer>`
})
export class ComoFuncionaComponent {}
