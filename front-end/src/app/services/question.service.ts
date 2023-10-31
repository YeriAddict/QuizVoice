import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Question } from '../models/question.model';
import { API_URL } from '../utils/constants';

@Injectable({
  providedIn: 'root'
})
export class QuestionService {

  constructor(private http: HttpClient) { }

  // permet de récupérer l'ensemble des thèmes stockés en base de données
  public getThemes(): Observable<string[]> {
    return this.http.get<string[]>(API_URL + "/get_themes")
  }


  // permet de récupérer une question à poser à l'utilisateur avec son nom d'utilisateur et le thème choisi
  public getQuestion(username: string, theme: any): Observable<Question> {
    const body = { "user": username, "theme": theme }
    return this.http.post<Question>(API_URL + "/get_question", body)
  }

}
