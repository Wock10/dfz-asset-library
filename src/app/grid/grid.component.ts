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
import { debounceTime } from 'rxjs/operators';
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
  gridItems: string[] = Array(48);
  loadingState: boolean[] = Array(48).fill(true);
  jsonData: any;
  private abortController: AbortController | null = null;

  // Store the loaded image in memory
  private imageCache: { [key: string]: string } = {};

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadJsonData()
      .pipe(debounceTime(300))
      .subscribe((data) => {
        this.jsonData = data;
        this.setGridItems();
      });

    this.observeImageLoading();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['token']) {
      this.abortOngoingOperations(); // Cancel any ongoing operations

      this.gridItems = Array(48);
      this.loadingState = Array(48).fill(true);
      this.setGridItems();
    }
  }

  loadJsonData(): Observable<any> {
    const jsonUrl = 'bodyAndGrades.json';
    return this.http.get(jsonUrl);
  }

  async setGridItems() {
    if (!this.jsonData) {
      return;
    }

    const tokenNumber = this.token;
    const rootUrl = 'https://deadfellaz-asset-library.s3.amazonaws.com/';
    const record = this.jsonData[tokenNumber];

    if (record) {
      const initialImages = [
        `${rootUrl}og-10k/${tokenNumber}.png`,
        `${rootUrl}pixel-spritesheet/${tokenNumber}.png`,
        `${rootUrl}pixel-forward-walking-gif/${tokenNumber}.gif`,
        `${rootUrl}fff-head/${tokenNumber}.png`,
        `${rootUrl}fff-full/${tokenNumber}.png`,
      ];

      for (let i = 0; i < initialImages.length; i++) {
        this.gridItems[i] = await this.loadAndCacheImage(initialImages[i]);
        this.loadingState[i] = false;
      }

      const assetRoot = `${rootUrl}DFZDF10KPROPKIT/`;
      const bodyGrade = record.bodyGrade;
      const body = record.body.replace(/\s+/g, '_');

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

  async loadAndCacheImage(url: string): Promise<string> {
    if (this.imageCache[url]) {
      // Return the cached image if it exists
      return this.imageCache[url];
    }

    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      // Cache the image in memory
      this.imageCache[url] = objectUrl;
      return objectUrl;
    } catch (error) {
      console.error('Error loading image:', error);
      return url; // Fallback to the original URL if there's an error
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
    const baseImageUrl = this.gridItems[4];
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

    let gridIndex = 5;
    this.abortController = new AbortController(); // Initialize the AbortController

    for (const propSet of propSets) {
      const matchedFolder = matchedFolders[propSet.suffix];

      if (matchedFolder) {
        for (const prop of propSet.props) {
          if (this.abortController.signal.aborted) {
            console.log('Aborted loading images');
            return; // Exit if aborted
          }

          const overlayImageUrl = `${assetRoot}${matchedFolder}/${prop}`;

          const combinedImage = await this.createCombinedImage(
            baseImageUrl,
            overlayImageUrl,
            this.abortController.signal // Pass the abort signal
          );

          if (this.abortController.signal.aborted) return; // Exit if aborted

          this.gridItems[gridIndex] = combinedImage;
          this.loadingState[gridIndex] = false;
          gridIndex++;
          await this.delay(25);
        }
      }
    }
  }

  delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  createCombinedImage(
    baseImageUrl: string,
    overlayImageUrl: string,
    signal: AbortSignal
  ): Promise<string> {
    const canvas = new OffscreenCanvas(512, 512);
    const context = canvas.getContext('2d');

    return Promise.all([
      this.loadImage(baseImageUrl, signal),
      this.loadImage(overlayImageUrl, signal),
    ])
      .then(([baseImage, overlayImage]) => {
        if (signal.aborted) throw new Error('Operation aborted');

        canvas.width = baseImage.width;
        canvas.height = baseImage.height;
        context!.drawImage(baseImage, 0, 0);
        context!.drawImage(overlayImage, 0, 0);

        return canvas.convertToBlob({ type: 'image/png' });
      })
      .then((blob) => {
        if (signal.aborted) throw new Error('Operation aborted');

        return URL.createObjectURL(blob);
      })
      .catch((error) => {
        if (signal.aborted) {
          console.log('Operation aborted');
        } else {
          console.error('Error loading images:', error);
        }
        return '';
      });
  }

  loadFolderStructure(): Observable<string[]> {
    const folderStructureUrl = 'folderStructure.json';
    return this.http.get<string[]>(folderStructureUrl);
  }

  loadImage(src: string, signal: AbortSignal): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.src = src;

      signal.addEventListener('abort', () => {
        img.src = ''; // Stop loading the image
        reject(new Error('Image loading aborted'));
      });

      img.onload = () => resolve(img);
      img.onerror = reject;
    });
  }

  observeImageLoading() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          img.src = img.getAttribute('data-src')!;
          observer.unobserve(img);
        }
      });
    });

    document.querySelectorAll('img[data-src]').forEach((img) => {
      observer.observe(img);
    });
  }

  abortOngoingOperations() {
    if (this.abortController) {
      this.abortController.abort(); // Abort any ongoing operations
    }
  }
}
