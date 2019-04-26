import { Component, OnInit, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

export interface DialogAyuda {
  sliders: [];
}

@Component({
  selector: 'app-ayuda',
  templateUrl: './ayuda.component.html',
  styleUrls: ['./ayuda.component.css']
})
export class AyudaComponent implements OnInit {

  constructor(public dialog: MatDialog) { }

  ngOnInit() {
  }

  openDialogCrearRuta() {
    const data = [
      '../../../assets/img/recursos/cr/cr1.png',
      '../../../assets/img/recursos/cr/cr2.png',
      '../../../assets/img/recursos/cr/cr3.png',
      '../../../assets/img/recursos/cr/cr4.png',
      '../../../assets/img/recursos/cr/cr5.png',
      '../../../assets/img/recursos/cr/cr6.png',
      '../../../assets/img/recursos/cr/cr7.png',
      '../../../assets/img/recursos/cr/cr8.png'
    ];
    const dialogRef = this.dialog.open(DialogAyudaComponent, {
      width: '70%',
      data: {
        sliders: data
      },
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('Dialogo CREAR-RUTA-AYUDA cerrado');
    });
  }


  openDialogOpcionesRuta() {
    const data = [
      '../../../assets/img/recursos/or/or1.png',
      '../../../assets/img/recursos/or/or2.png',
      '../../../assets/img/recursos/or/or3.png',
      '../../../assets/img/recursos/or/or4.png',
      '../../../assets/img/recursos/or/or5.png',
      '../../../assets/img/recursos/or/or6.png'
    ];
    const dialogRef = this.dialog.open(DialogAyudaComponent, {
      width: '70%',
      data: {
        sliders: data
      },
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('Dialogo OPCIONES-RUTA-AYUDA cerrado');
    });
  }

  openDialogGestionRuta() {
    const data = [
      '../../../assets/img/recursos/gr/gr1.png',
      '../../../assets/img/recursos/gr/gr2.png',
      '../../../assets/img/recursos/gr/gr3.png',
      '../../../assets/img/recursos/gr/gr4.png',
      '../../../assets/img/recursos/gr/gr5.png',
      '../../../assets/img/recursos/gr/gr6.png'
    ];
    const dialogRef = this.dialog.open(DialogAyudaComponent, {
      width: '70%',
      data: {
        sliders: data
      },
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('Dialogo OPCIONES-RUTA-AYUDA cerrado');
    });
  }

}

@Component({
  selector: 'app-dialog-ayuda',
  templateUrl: './dialog/dialog-ayuda.html',
  styleUrls: ['./dialog/dialog-ayuda.component.css']
})
export class DialogAyudaComponent implements OnInit {
  slideIndex = 1;
  slides = [];
  isLoading = true;
  disNext = false;
  disPrev = true;
  length = 0;

  constructor(
    public dialogRef: MatDialogRef<DialogAyudaComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogAyuda) {}

  ngOnInit(): void {
    this.slides = this.data.sliders;
    setTimeout(() => {
      this.isLoading = false;
      this.showDivs(this.slideIndex);
    }, 500);
  }

  close(): void {
    this.dialogRef.close();
  }


  plusDivs(n) {
    this.showDivs(this.slideIndex += n);
    switch (this.slideIndex) {
      case this.length:
        this.disNext = true;
        break;
      case 1:
        this.disPrev = true;
        break;
      default:
        this.disNext = false;
        this.disPrev = false;
        break;
    }
  }

  showDivs(n) {
    let i;
    const x = document.getElementsByClassName('mySlide') as HTMLCollectionOf<HTMLElement>;
    this.length = x.length;
    if (n > x.length) {
      this.slideIndex = 1;
      console.log('1');
    }

    if (n < 1) {
      this.slideIndex = x.length;
      console.log('2');
    }

    for (i = 0; i < x.length; i++) {
      x[i].style.display = 'none';
      console.log('3');
    }
    x[this.slideIndex - 1].style.display = 'block';
  }
}

