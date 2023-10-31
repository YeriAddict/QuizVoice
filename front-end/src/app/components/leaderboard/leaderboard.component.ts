import { Component, OnInit } from '@angular/core';
import { User } from 'src/app/models/user.model';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-leaderboard',
  templateUrl: './leaderboard.component.html',
  styleUrls: ['./leaderboard.component.css']
})
export class LeaderboardComponent implements OnInit {

  // Récuperer la liste de tous les users
  users: User[] = [];

  columns: string[] = ['ranking', 'username', 'country', 'score'];

  constructor(private userService: UserService) { }

  ngOnInit(): void {

    this.userService.getTopPlayers("10").subscribe(_ => {
      this.users = _;
    })

  }

}
