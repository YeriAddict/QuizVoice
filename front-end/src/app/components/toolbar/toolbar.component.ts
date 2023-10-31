import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';
import { StorageService } from 'src/app/services/storage.service';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.css']
})
export class ToolbarComponent implements OnInit {


  @Input() isLoggedIn: boolean;

  constructor(private storage: StorageService, private router: Router) { }

  ngOnInit(): void {

  }

  logout(): void {
    this.storage.clean();
    this.router.navigate(['/']).then(_ => {
      window.location.reload();
    });
  }
}
