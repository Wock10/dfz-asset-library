import {
  Component,
  Input,
  OnInit,
  OnChanges,
  SimpleChanges,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-grid',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './grid.component.html',
  styleUrls: ['./grid.component.css'],
})
export class GridComponent implements OnInit, OnChanges {
  @Input() token = '';
  @ViewChild('canvasElement') canvasElement!: ElementRef<HTMLCanvasElement>;
  gridItems: string[] = Array(54); // Array to hold initial images and combined images
  loadingState: boolean[] = Array(54)
    .fill(true)
    .map((_, index) => (index < 5 ? false : true));

  jsonData: any;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadJsonData().subscribe((data) => {
      this.jsonData = data;
      this.setGridItems();
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['token']) {
      this.gridItems = Array(54); // Reset gridItems array
      this.loadingState = Array(54)
        .fill(true)
        .map((_, index) => (index < 5 ? false : true));
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
      this.gridItems[1] = `${rootUrl}pixel-spritesheet/${tokenNumber}.png`;
      this.gridItems[2] = `${rootUrl}pixel-forward-walking-gif/${tokenNumber}.gif`;
      this.gridItems[3] = `${rootUrl}fff-head/${tokenNumber}.png`;
      this.gridItems[4] = `${rootUrl}fff-full/${tokenNumber}.png`;

      const assetRoot = `assets/DFZDF10KPROPKIT/`;
      const bodyGrade = record.bodyGrade;
      const body = record.body.replace(/\s+/g, '_'); // Replace spaces with underscores

      this.loadFolderStructure().subscribe((folderStructure: string[]) => {
        const matchedFolders = this.getMatchedFolders(
          folderStructure,
          `${bodyGrade}/Fresh_${body}`
        );

        if (matchedFolders) {
          this.setCombinedGridItems(matchedFolders, assetRoot, bodyGrade, body);
        } else {
          console.warn(
            `No matching folder found for ${bodyGrade}/Fresh_${body}`
          );
        }
      });
    } else {
      console.warn(`No record found for token ID ${tokenNumber}`);
    }
  }

  getMatchedFolders(
    folderStructure: string[],
    searchPath: string
  ): { [key: string]: string } {
    const matchedFolders: { [key: string]: string } = {};

    folderStructure.forEach((folder) => {
      if (folder.includes(searchPath)) {
        if (folder.includes('_Dual')) {
          matchedFolders['_Dual'] = folder;
        } else if (folder.includes('_Left')) {
          matchedFolders['_Left'] = folder;
        } else if (folder.includes('_Right')) {
          matchedFolders['_Right'] = folder;
        }
      }
    });

    return matchedFolders;
  }

  async setCombinedGridItems(
    matchedFolders: { [key: string]: string },
    assetRoot: string,
    bodyGrade: string,
    body: string
  ) {
    const baseImageUrl = this.gridItems[4]; // fff-full image

    const propSets = [
      {
        suffix: '_Dual',
        props: [
          'Prop_Blank_Title_Card.png',
          'Prop_Blue_Controller.png',
          'Prop_Grey_Controller.png',
          'Prop_Pink_Controller.png',
          'Prop_Racing.png',
          'Prop_Red_Controller.png',
          'Prop_Shy.png',
        ],
      },
      {
        suffix: '_Left',
        props: [
          'Prop_Beer.png',
          'Prop_Blunt.png',
          'Prop_Coffee.png',
          'Prop_Dagger.png',
          'Prop_Fist.png',
          'Prop_Flip.png',
          'Prop_Guitar.png',
          'Prop_Heart.png',
          'Prop_Knuckles.png',
          'Prop_Mic.png',
          'Prop_Okay.png',
          'Prop_Peace.png',
          'Prop_Point.png',
          'Prop_Red_Flag.png',
          'Prop_Rock.png',
          'Prop_Rock_Alt.png',
          'Prop_Wave.png',
          'Prop_White_Flag.png',
        ],
      },
      {
        suffix: '_Right',
        props: [
          'Prop_Beer.png',
          'Prop_Blunt.png',
          'Prop_Coffee.png',
          'Prop_Dagger.png',
          'Prop_Fist.png',
          'Prop_Flip.png',
          'Prop_Guitar.png',
          'Prop_Heart.png',
          'Prop_Knuckles.png',
          'Prop_Mic.png',
          'Prop_Okay.png',
          'Prop_Peace.png',
          'Prop_Point.png',
          'Prop_Red_Flag.png',
          'Prop_Rock.png',
          'Prop_Rock_Alt.png',
          'Prop_Wave.png',
          'Prop_White_Flag.png',
        ],
      },
    ];

    let gridIndex = 5; // Start at gridItems[5]

    for (const propSet of propSets) {
      const matchedFolder = matchedFolders[propSet.suffix];

      if (matchedFolder) {
        for (const prop of propSet.props) {
          const overlayImageUrl = `${assetRoot}${matchedFolder}/${prop}`;
          const combinedImage = await this.createCombinedImage(
            baseImageUrl,
            overlayImageUrl
          );
          this.gridItems[gridIndex] = combinedImage;
          this.loadingState[gridIndex] = false; // Set loading to false once the image is ready
          gridIndex++;

          // Add a short delay to reduce strain and show progressive loading
          await this.delay(100); // Adjust the delay as needed
        }
      }
    }
  }

  delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  createCombinedImage(
    baseImageUrl: string,
    overlayImageUrl: string
  ): Promise<string> {
    const canvas = this.canvasElement.nativeElement;
    const context = canvas.getContext('2d');

    return Promise.all([
      this.loadImage(baseImageUrl),
      this.loadImage(overlayImageUrl),
    ])
      .then(([baseImage, overlayImage]) => {
        canvas.width = baseImage.width;
        canvas.height = baseImage.height;
        context!.drawImage(baseImage, 0, 0);
        context!.drawImage(overlayImage, 0, 0);

        return canvas.toDataURL('image/png');
      })
      .catch((error) => {
        console.error('Error loading images:', error);
        return '';
      });
  }

  loadFolderStructure(): Observable<string[]> {
    const folderStructureUrl = 'folderStructure.json'; // Adjust the path as needed
    return this.http.get<string[]>(folderStructureUrl);
  }

  loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'Anonymous'; // This enables CORS if supported by the server
      img.src = src;
      img.onload = () => resolve(img);
      img.onerror = reject;
    });
  }

  observeImageLoading() {
    const options = { root: null, rootMargin: '0px', threshold: 0.1 };
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          const index = this.gridItems.indexOf(img.src);
          if (index !== -1) {
            this.loadingState[index] = false;
          }
          obs.unobserve(img);
        }
      });
    }, options);

    document.querySelectorAll('.grid-item img').forEach((img) => {
      observer.observe(img);
    });
  }
}
