import { Injectable } from '@angular/core';

const USER_KEY = 'auth-user';
const THEME_KEY = 'theme';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  constructor() { }

  // permet de vider le stockage de la session
  clean(): void {
    window.sessionStorage.clear();
  }


  // permet de sauvegarder l'utilisateur dans le stockage
  public saveUser(user: any): void {
    window.sessionStorage.removeItem(USER_KEY);
    window.sessionStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  // permet de récupérer l'utilisateur stocké
  public getUser(): any {
    const user = window.sessionStorage.getItem(USER_KEY);
    if (user) {
      return JSON.parse(user);
    }
    return {};
  }

  // permet de savoir si l'utilisateur est connecté
  public isLoggedIn(): boolean {
    const user = window.sessionStorage.getItem(USER_KEY);
    if (user) {
      return true;
    } else {
      return false;
    }
  }

  // permet de sauvegarder le thème choisi par l'utilisateur dans le stockage
  public saveTheme(theme: any): void {
    window.sessionStorage.removeItem(THEME_KEY);
    window.sessionStorage.setItem(THEME_KEY, theme);
  }

  // permet de récupérer le thème stocké
  public getTheme(): any {
    const theme = window.sessionStorage.getItem(THEME_KEY);
    return theme;
  }
}