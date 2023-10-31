import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { StorageService } from 'src/app/services/storage.service';
import { UserService } from 'src/app/services/user.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  hide = true;
  username = new FormControl('', [Validators.required])
  password = new FormControl('', [Validators.required])

  constructor(private userService: UserService, private storage: StorageService, private router: Router, private snackBar: MatSnackBar) { }

  ngOnInit(): void {
    let isLoggedIn = this.storage.isLoggedIn();

    if (isLoggedIn) {
      this.router.navigate(['/game']);
    }
  }

  onSubmit(): void {
    let username = this.username.value;
    let password = this.password.value;


    this.userService.login(username, password).subscribe({
      next: (data) => {
        this.storage.saveUser(data);
        this.username.setValue("");
        this.password.setValue("");
        this.router.navigate(['/game']).then(_ => {
          window.location.reload();
        })
      },
      error: err => {
        this.snackBar.open("Nom d'utilisateur et/ou mot de passe incorrect(s)", "X", { duration: 5000 })
      }

    })
  }

}
