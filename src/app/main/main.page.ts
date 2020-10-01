import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { ResizeEvent } from 'angular-resizable-element';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { PDFDocumentProxy, PDFProgressData, PdfViewerComponent } from 'ng2-pdf-viewer';
import { FileUploader } from 'ng2-file-upload';
declare var require: any
import { PDFDocument } from 'pdf-lib'

@Component({
  selector: 'app-main',
  templateUrl: './main.page.html',
  styleUrls: ['./main.page.scss'],
})
export class MainPage implements OnInit {
  
  @ViewChild(PdfViewerComponent, {static: false})
  private pdfComponent: PdfViewerComponent;
  /***************************************Emojis Filename************************************/
  emojiFiles:string[]=[
    "100000001.png","100000002.png","100000003.png",
    "100000004.png","100000005.png","100000006.png",
    "100000007.png","100000008.png","100000009.png",
    "100000010.png","100000011.png","100000012.png",
    "100000013.png","100000014.png","100000015.png",
    "100000016.png"
  ]
  @ViewChild('pdfViewerr') pdfViewerr :ElementRef;
  pdfViewerWidth:any;
  //default pdf src
  pdfSrc = "https://vadimdez.github.io/ng2-pdf-viewer/assets/pdf-test.pdf";
  pdfDoc:any;
  pngImageBytes:any;

/***************************************Tab Properties************************************/
  typedText = ""
  selectedEmoji:string=""
  commentColor:string="black";
  commentFontSize = 16
  commentFontStyle = 'normal'
  imgSrc:any;
  display:'block';
  circularImg=100
  commentStyle={
    'font-size':this.commentFontSize,
    'color':this.commentColor,
    'font-style':this.commentFontStyle
  }

  /***************************************for tab Switching*****************************/
  imageTab:boolean = false;
  stickerTab:boolean = true;
  textTab:boolean = false;
  settingTab = false;
  public uploader: FileUploader = new FileUploader({
    url: 'http://localhost:3000/api/upload',
    itemAlias: 'pdf'
  });

  openTab(whichTab:string){
    switch(whichTab){
      case 'imageTab':
        this.imageTab = true;
        this.stickerTab = false;
        this.textTab = false;
        this.settingTab = false;
        break;
      case 'textTab':
          this.imageTab = false;
          this.stickerTab = false;
          this.textTab = true;
          this.settingTab = false;
          break;
      case 'stickerTab':
            this.imageTab = false;
            this.stickerTab = true;
            this.textTab = false;
            this.settingTab = false;
            break;
      case 'settingTab':
            this.imageTab = false;
            this.stickerTab = false;
            this.textTab = false;
            this.settingTab = true;
            break;
    }
  }
  /***************************************Text or Emoji position for edit**********************/
  dataObj = {
    image:true,
    text:false,
    imagePath:"",
    textContent:"",
    textColor:"",
    textFontSize:"",
    textStyle:"",
    topPos:0,
    leftPos:0
  }
  constructor( private http : HttpClient) { }

  ngOnInit() {
      this.uploader.onAfterAddingFile = (file) => {
      file.withCredentials = false;
    };
    this.uploader.onCompleteItem = (item: any, status: any) => {
      console.log('Uploaded File Details:', item);
    };

  }
  selectEmoji(emoji:string , event){
    this.selectedEmoji = emoji;
  }
  /***************************************For Selecting Image**********************/

  changeListener(event) : void {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];

      const reader = new FileReader();
      reader.onload = e => this.imgSrc = reader.result;

      reader.readAsDataURL(file);
  }
    
  }
   /***************************************Resize Event**********************/
  onResizeEnd(event: ResizeEvent): void {
    console.log('Element was resized', event);
  }
  /***************************************parameters for pdfs **********************/

  uploadedFiles: any;
  originalSize = true;
  error: any;
  page = 1;
  rotation = 0;
  zoom = 1.0;
  zoomScale = 'page-width';
  pdf: any;
  renderText = true;
  progressData: PDFProgressData;
  isLoaded = false;
  stickToPage = false;
  showAll = true;
  autoresize = true;
  fitToPage = false;
  outline: any[];
  isOutlineShown = false;
  pdfQuery = '';
  fileChange(element){
    this.uploadedFiles = element.target.files;
  }
  /***************************************MAIN FUNCTION TO EDIT**********************/
  async callEditPDF(){
    /*const headers = new HttpHeaders()
    .set('Authorization', 'my-auth-token')
    .set('Content-Type', 'application/json')
    .set('responseType','text');
    
    this.http.post('http://localhost:3000/api/editPdf', JSON.stringify(this.dataObj),{
      responseType : 'arraybuffer',
      headers:new HttpHeaders().append('Content-Type','application/json')
  })
    .subscribe(response => {
     console.log(response);
      var file = new Blob([response], { type: 'application/pdf' })
      var fileURL = URL.createObjectURL(file);
      this.pdfSrc = fileURL;
      console.log(fileURL)
      this.selectedEmoji='';
    });*/
    console.log(this.pdfComponent.pageChange);
    const pngImageBytes = await fetch("./assets/emoji/"+this.selectedEmoji).then((res) => res.arrayBuffer())
    const pngImage = await this.pdfDoc.embedPng(pngImageBytes)
    const pages = this.pdfDoc.getPages()
    const currentPage = pages[this.page-1]
    const pngDims = pngImage.scale(1)
    const navELement = document.querySelector("ion-toolbar");
    const boundingClientRectNavELement = navELement.getBoundingClientRect();
    const navHeight = boundingClientRectNavELement.height;
    console.log( this.dataObj.leftPos+" "+(currentPage.getHeight() - this.dataObj.topPos - pngDims.height/2))
    // Get the width and height of the first page
    const { width, height } = currentPage.getSize()
    currentPage.drawImage(pngImage, {
      x: this.dataObj.leftPos/(this.pdfViewerWidth/currentPage.getWidth()),
      y: currentPage.getHeight()-70-Math.abs(this.dataObj.topPos/1.325),
      width: 70,
      height: 70,
    })
    const pdfBytes = await this.pdfDoc.save()
    this.pdfSrc = URL.createObjectURL(new Blob([pdfBytes], {
      type: "application/pdf"
    }));
    this.pdfDoc = await PDFDocument.load(pdfBytes);

  }

  element:any; ///for text Layer element
  /***************************************GETTING CO-ORDINATES**********************/

  onDragEnded($event) {
    this.element = document.querySelector(".textLayer");
    const boundingClientRect = this.element.getBoundingClientRect();
    this.pdfViewerWidth = boundingClientRect.width;
    const emoji = document.querySelector("#emojiImg");
    const boundingClientRectEmo = emoji.getBoundingClientRect();
    this.dataObj.leftPos = boundingClientRectEmo.x-boundingClientRect.x;
    this.dataObj.topPos = boundingClientRectEmo.y-boundingClientRect.y;
    this.dataObj.imagePath = this.selectedEmoji;
    console.log(this.pdfViewerWidth+" "+boundingClientRect.x+" "+boundingClientRect.y+" "
    +boundingClientRectEmo.width+" "+boundingClientRectEmo.x+" "+boundingClientRectEmo.y);
    console.log(this.dataObj)
     
  }
  

  /*getPosition(el) {
    let x = 0;
    let y = 0;
    while (el && !isNaN(el.offsetLeft) && !isNaN(el.offsetTop)) {
      x += el.offsetLeft - el.scrollLeft;
      y += el.offsetTop - el.scrollTop;
      el = el.offsetParent;
    }
    return { top: y, left: x };
  }*/



/***************************************DOWNLOADING PDF**********************/

  downloadPDF() {
    const FileSaver = require('file-saver');
    FileSaver.saveAs(this.pdfSrc, "download.pdf");
}
/*****************************SELECTING PDFS********************************/

   onFileSelected() {
    const $pdf: any = document.querySelector('#file');
    if (typeof FileReader !== 'undefined') {
      const reader = new FileReader();
      reader.readAsArrayBuffer($pdf.files[0]);
      reader.onload = async (e: any) => {
        this.pdfSrc = e.target.result;
        this.pdfDoc = await PDFDocument.load(this.pdfSrc)
      };
      //this.uploadedFiles = this.pdfSrc;
      
      //this.uploader.uploadAll();
    }
    
  }

  /***************************************METHODS FOR PDF**********************/

  afterLoadComplete(pdf: PDFDocumentProxy) {
    this.pdf = pdf;

    this.loadOutline();
  }
  loadOutline() {
    this.pdf.getOutline().then((outline: any[]) => {
      this.outline = outline;
    });
  }
  pageRendered(e: CustomEvent) {
    //this.pdfComponent.pdfViewer.currentScaleValue = 'page-fit';
  }

  /**
   * Pdf loading progress callback
   * @param {PDFProgressData} progressData
   */
  onProgress(progressData: PDFProgressData) {
    console.log(progressData);
    this.progressData = progressData;

    this.isLoaded = progressData.loaded >= progressData.total;
    this.error = null; // clear error
  }

  incrementZoom(amount: number) {
    this.zoom += amount;
    
  }
  incrementPage(amount: number) {
    this.page += amount;
  }
  rotate(angle: number) {
    this.rotation += angle;
  }
  navigateTo(destination: any) {
    this.pdfComponent.pdfLinkService.navigateTo(destination);
  }
  searchQueryChanged(newQuery: string) {
    if (newQuery !== this.pdfQuery) {
      this.pdfQuery = newQuery;
      this.pdfComponent.pdfFindController.executeCommand('find', {
        query: this.pdfQuery,
        highlightAll: true
      });
    } else {
      this.pdfComponent.pdfFindController.executeCommand('findagain', {
        query: this.pdfQuery,
        highlightAll: true
      });
    }
  }
  getInt(value: number): number {
    return Math.round(value);
  }
}

/*


 



*/
