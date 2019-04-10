import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { first } from 'rxjs/operators';

import { User } from '../../_models';
import { UserService } from '../../_services';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  users: User[] = [];
  lastItemID = 'rutas';

  selected(id: string) {
    document.getElementById(this.lastItemID).classList.remove('item-active');
    document.getElementById(this.lastItemID).querySelector('i').classList.remove('icon-active');
    document.getElementById(id).classList.add('item-active');
    document.getElementById(id).querySelector('i').classList.add('icon-active');
    this.lastItemID = id;
  }

  constructor(
    private router: Router,
    private userService: UserService) { }

  ngOnInit() {
    /*this.userService.getAll().pipe(first()).subscribe(users => {
      this.users = users;
    });*/
    this.router.navigate(['/home/editor']);
    this.selected('editor');
  }

}
