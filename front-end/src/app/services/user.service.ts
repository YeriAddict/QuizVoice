import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/user.model';
import { API_URL } from '../utils/constants';

@Injectable({
  providedIn: 'root'
})
export class UserService {


  constructor(private http: HttpClient) { }

  // permet de récupérer les X meilleurs joueurs pour le leaderboard
  getTopPlayers(size: string): Observable<User[]> {
    return this.http.get<User[]>(API_URL + "/get_leaderboard?size=" + size)
  }

  // permet de récupérer le score d'un joueur à partir de son nom d'utilisateur
  getScoreByUsername(username: string): Observable<any> {
    return this.http.get<any>(API_URL + "/get_score?user=" + username)
  }

  // permet de créer un compte pour un nouvel utilisateur
  register(username: any, password: any, email: any, country: any, gender: any): Observable<User> {
    return this.http.post<User>(API_URL + '/register', {
      user: {
        username: username,
        password: password,
        email: email,
        country: country,
        gender: gender
      }
    })
  }

  // permet de se connecter
  login(username: any, password: any): Observable<User> {
    return this.http.post<User>(API_URL + '/login', {
      user: {
        username: username,
        password: password,
      }
    })
  }

  // permet de récupérer les informations de l'utilisateur connecté
  getMyUser(username: string): Observable<User> {
    return this.http.get<User>(API_URL + '/getmyuser', { params: { "user": username } });
  }

}