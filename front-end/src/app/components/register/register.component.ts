import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { genderList } from 'src/app/utils/genders';
import { countryList } from 'src/app/utils/countries';
import { UserService } from 'src/app/services/user.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { StorageService } from 'src/app/services/storage.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {

  Genders: any = genderList;
  Countries: any = countryList;
  hide = true;
  username = new FormControl('', [Validators.required])
  email = new FormControl('', [Validators.required, Validators.email])
  password = new FormControl('', [Validators.required])
  gender = new FormControl('', [Validators.required])
  country = new FormControl('', [Validators.required])

  isOkay: boolean;

  constructor(private userService: UserService, private router: Router, private snackBar: MatSnackBar, private storage: StorageService) { }

  ngOnInit(): void {

    let isLoggedIn = this.storage.isLoggedIn();

    if (isLoggedIn) {
      this.router.navigate(['/game']);
    }
  }

  onSubmit(): void {

    let username = this.username.value;
    let password = this.password.value;
    let email = this.email.value;
    let gender = this.gender.value;
    let country = this.country.value;

    this.userService.register(username, password, email, country, gender).subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
      error: err => {
        this.snackBar.open("Nom d'utilisateur et/ou email déjà pris", "X", {
          duration: 5000
        });
      }

    })
  }

}
