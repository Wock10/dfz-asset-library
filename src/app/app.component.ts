import { Component } from '@angular/core';
import { GridComponent } from './grid/grid.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [GridComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  token = '';

  search(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    let value = Number(inputElement.value);

    if (value < 1) {
      value = 1;
    } else if (value > 10000) {
      value = 10000;
    }

    this.token = value.toString();
    inputElement.value = this.token;
    console.log('Searching for token:', this.token);
  }
}
