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
  gridItems: string[] = Array();

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
    const tokenNumber = this.token;
    this.gridItems[0] = `https://deadfellaz-asset-library.s3.amazonaws.com/og-10k/${tokenNumber}.png`;
    this.gridItems[1] = `https://deadfellaz-asset-library.s3.amazonaws.com/fff-head/${tokenNumber}.png`;
    this.gridItems[2] = `https://deadfellaz-asset-library.s3.amazonaws.com/fff-full/${tokenNumber}.png`;
    this.gridItems[3] = `https://deadfellaz-asset-library.s3.amazonaws.com/pixel-spritesheet/${tokenNumber}.png`;
    this.gridItems[4] = `https://deadfellaz-asset-library.s3.amazonaws.com/pixel-forward-walking-gif/${tokenNumber}.gif`;
  }
}
