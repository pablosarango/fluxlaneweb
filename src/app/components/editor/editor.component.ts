import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.css']
})
export class EditorComponent implements OnInit {
  lastItemID = 'crear';
  constructor() { }

  ngOnInit() {
  }

  selected(id: string) {
    document.getElementById(this.lastItemID).classList.remove('editor-option-selected');
    document.getElementById(id).classList.add('editor-option-selected');
    this.lastItemID = id;
  }

}
