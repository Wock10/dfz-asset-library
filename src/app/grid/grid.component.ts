import {
  Component,
  Input,
  OnInit,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-grid',
  standalone: true,
  imports: [CommonModule, HttpClientModule], // Import HttpClientModule here
  templateUrl: './grid.component.html',
  styleUrls: ['./grid.component.css'],
})
export class GridComponent implements OnInit, OnChanges {
  @Input() token = '';
  gridItems: string[] = Array();
  jsonData: any;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    console.log('GridComponent initialized with token:', this.token);
    this.loadJsonData().subscribe((data) => {
      this.jsonData = data;
      this.setGridItems();
    });
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

  loadJsonData(): Observable<any> {
    const jsonUrl = 'bodyAndGrades.json'; // Adjust the path as needed
    return this.http.get(jsonUrl);
  }

  setGridItems() {
    if (!this.jsonData) {
      return;
    }

    const tokenNumber = this.token;
    const rootUrl = 'https://deadfellaz-asset-library.s3.amazonaws.com/';
    const record = this.jsonData[tokenNumber];

    if (record) {
      this.gridItems[0] = `${rootUrl}og-10k/${tokenNumber}.png`;
      this.gridItems[1] = `${rootUrl}fff-head/${tokenNumber}.png`;
      this.gridItems[2] = `${rootUrl}fff-full/${tokenNumber}.png`;
      this.gridItems[3] = `${rootUrl}pixel-spritesheet/${tokenNumber}.png`;
      this.gridItems[4] = `${rootUrl}pixel-forward-walking-gif/${tokenNumber}.gif`;

      // Update the path for gridItems[5] to reference the public folder
      const assetRoot = `assets/DFZDF10KPROPKIT/`;
      const bodyGrade = record.bodyGrade;
      const body = record.body.replace(/\s+/g, '_'); // Replace spaces with underscores

      // Fetch folder structure to match the correct path
      this.loadFolderStructure().subscribe((folderStructure: string[]) => {
        const matchedFolder = folderStructure.find((folder) =>
          folder.includes(`${bodyGrade}/Fresh_${body}`)
        );

        if (matchedFolder) {
          this.gridItems[5] = `${assetRoot}${matchedFolder}/Prop_Blank_Title_Card.png`;
        } else {
          console.warn(
            `No matching folder found for ${bodyGrade}/Fresh_${body}`
          );
        }

        console.log('Record found:', record);
        console.log('Body:', record.body);
        console.log('Body Grade:', record.bodyGrade);
        console.log('Matched Folder:', matchedFolder);
      });
    } else {
      console.warn(`No record found for token ID ${tokenNumber}`);
    }
  }

  // New method to load folder structure
  loadFolderStructure(): Observable<string[]> {
    const folderStructureUrl = 'folderStructure.json'; // Adjust the path as needed
    return this.http.get<string[]>(folderStructureUrl);
  }
}
