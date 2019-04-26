import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '../../_models';
import { UserService } from '../../_services';
import { environment } from '../../../environments/environment.prod';
import { first } from 'rxjs/operators';
import { Notification } from '../../_helpers';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  users: User[] = [];
  lastItemID = 'rutas';
  userAvatar = environment.AVATAR_URL + '/' + 'user.png';
  userName = 'FluxLane Admin';

  selected(id: string) {
    document.getElementById(this.lastItemID).classList.remove('item-active');
    document.getElementById(this.lastItemID).querySelector('i').classList.remove('icon-active');
    document.getElementById(id).classList.add('item-active');
    document.getElementById(id).querySelector('i').classList.add('icon-active');
    this.lastItemID = id;
    localStorage.setItem('lastUrl', this.lastItemID);
  }

  constructor(
    private router: Router,
    private userService: UserService,
    private notification: Notification) { }

  ngOnInit() {
    if (localStorage.getItem('lastUrl')) {
      this.router.navigate(['/home/' + localStorage.getItem('lastUrl') + '/']);
      this.selected(localStorage.getItem('lastUrl'));
    } else {
      this.router.navigate(['/home/rutas/']);
      this.selected('rutas');
    }
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.getUserById(currentUser._id);
  }

  getUserById(userId: string) {
    this.userService.getById(userId).pipe(first()).subscribe(
      user => {
        this.userAvatar = environment.AVATAR_URL + '/' + user.avatar.toString();
        this.userName = user.displayName.toString();
      },
      err => {
        console.log(err);
        this.notification.snackbarError('Imposible recuperar ususario. Contacte al administrador.');
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 15000);
      }
    );
  }

}
