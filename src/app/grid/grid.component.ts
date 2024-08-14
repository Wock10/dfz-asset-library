import {
  Component,
  Input,
  OnInit,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-grid',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './grid.component.html',
  styleUrls: ['./grid.component.css'],
})
export class GridComponent implements OnInit, OnChanges {
  @Input() token = '';
  gridItems: string[] = Array(9).fill(''); // Array to store image paths

  ngOnInit() {
    console.log('GridComponent initialized with token:', this.token);
    this.setGridItems();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['token']) {
      console.log(
        'GridComponent token changed:',
        changes['token'].currentValue
      );
      this.setGridItems();
    }
  }

  setGridItems() {
    const tokenNumber = this.token; // Default to 1 if token is not a number
    this.gridItems[0] = `assets/spritesheet/${tokenNumber}.png`; // Set the first box to the image corresponding to the token
    this.gridItems[1] = `assets/Full/${tokenNumber}.png`; // Set the second box to the image corresponding to the token
    this.gridItems[2] = `assets/Heads/${tokenNumber}.png`; // Set the third box to the image corresponding to the token
  }
}
