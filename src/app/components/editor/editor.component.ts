import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.css']
})
export class EditorComponent implements OnInit {
  lastItemID = 'crear';
  constructor(private router: Router) { }

  ngOnInit() {
    this.goToInicio();
  }

  selected(id: string) {
    document.getElementById(this.lastItemID).classList.remove('editor-option-selected');
    document.getElementById(id).classList.add('editor-option-selected');
    this.lastItemID = id;
  }

  goToInicio() {
    this.router.navigate(['/home/editor/inicio']);
  }

}
