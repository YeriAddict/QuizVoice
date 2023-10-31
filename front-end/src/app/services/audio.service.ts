import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_URL } from '../utils/constants';

@Injectable({
  providedIn: 'root'
})
export class AudioService {

  constructor(private http: HttpClient) { }

  // permet de répondre à une question en fournissant le blob et le nom d'utilisateur
  answerQuestion(username: String, blob: Blob): any {

    var reader = new FileReader();
    reader.readAsDataURL(blob);
    var self = this;
    return new Promise(function (resolve) {
      reader.onloadend = async () => {
        var base64data = reader.result;
        var data = (<string>reader.result).split(",").pop();

        const body = { "user": username, "audio": data };

        var answer = await self.sendRequest(body);
        return resolve(answer);
      }

    }).then((value) => {
      return (value);
    });
  }

  sendRequest = async (body: any) => {
    const data = await this.http.post<any>(API_URL + "/send_audio", body).toPromise();
    return data;
  }

}
