import { Component, OnInit } from '@angular/core';
import { User } from 'src/app/models/user.model';
import { StorageService } from 'src/app/services/storage.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  isLoggedIn = false;
  user = new User();

  constructor(private storage: StorageService, private userService: UserService) { }

  ngOnInit(): void {

    this.isLoggedIn = this.storage.isLoggedIn();

    if (this.isLoggedIn) {
      this.userService.getMyUser(this.storage.getUser().username).subscribe(_ => {
        this.user = _;
      })
    }

  }

}
