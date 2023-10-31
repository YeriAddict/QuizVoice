import { Component, OnInit } from '@angular/core';
import { StorageService } from './services/storage.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  title = 'quiz-game';
  isLoggedIn = false;

  constructor(private storage: StorageService) { }

  ngOnInit(): void {
    this.isLoggedIn = this.storage.isLoggedIn();
  }
}
