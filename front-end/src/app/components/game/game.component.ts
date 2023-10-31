import { Component, OnInit } from '@angular/core';
import { QuestionService } from 'src/app/services/question.service';
import { UserService } from 'src/app/services/user.service';
declare var $: any;
import * as RecordRTC from 'recordrtc';
import { DomSanitizer } from '@angular/platform-browser';
import { AudioService } from 'src/app/services/audio.service';
import { Question } from 'src/app/models/question.model';
import { StorageService } from 'src/app/services/storage.service';
import { FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})
export class GameComponent implements OnInit {

  title = 'micRecorder';
  //Lets declare Record OBJ
  record: any;
  //Will use this flag for toggeling recording
  recording = false;
  //URL of Blob
  url: any;
  error: any;
  four_answer: boolean;


  isLoggedIn: boolean;
  gameStarted: boolean;
  gameEnded: boolean;
  finalScore: string = "";
  themes: String[] = [];
  themeControl = new FormControl<string>("", Validators.required);

  question_actual: Question = new Question;


  constructor(
    private userService: UserService, private domSanitizer: DomSanitizer, private audioService: AudioService, private questionService: QuestionService, private storage: StorageService
  ) { }

  sanitize(url: string) {
    return this.domSanitizer.bypassSecurityTrustUrl(url);
  }
  /**
   * Start recording.
   */

  timeLeft: number = 15;
  interval: any;
  answering: boolean = false;

  ngOnDestroy() {
    if (this.interval) {
      clearInterval(this.interval);
    }
  }

  instantAnswer() {
    this.timeLeft = 0;
  }

  startTimerQuestion() {
    this.interval = setInterval(() => {
      if (this.timeLeft > 0) {
        this.timeLeft--;
      } else {
        if (!this.answering) {
          this.timeLeft = 3;
          //Activation micro phone
          this.initiateRecording();
        } else {
          this.timeLeft = 15;
          //Desactivation micro
          clearInterval(this.interval);
          this.stopRecording(); //ca envoie automatiquement la réponse
        }
        this.answering = !this.answering;
      }
    }, 1000)
  }

  pauseTimer() {
    clearInterval(this.interval);
  }


  initiateRecording() {

    this.recording = true;
    let mediaConstraints = {
      video: false,
      audio: true
    };
    navigator.mediaDevices
      .getUserMedia(mediaConstraints)
      .then(this.successCallback.bind(this), this.errorCallback.bind(this));
  }
  /**
   * Will be called automatically.
   */
  successCallback(stream: any) {
    var options = {
      type: "audio",
      mimeType: 'audio/mp3',
      numberOfAudioChannels: 1,
      sampleRate: 48000
    };
    //Start Actuall Recording
    var StereoAudioRecorder = RecordRTC.StereoAudioRecorder;
    this.record = new StereoAudioRecorder(stream, options ? undefined : undefined);
    this.record.record();
  }
  /**
   * Stop recording.
   */
  stopRecording() {
    this.recording = false;
    this.record.stop(this.processRecording.bind(this));
  }
  /**
   * processRecording Do what ever you want with blob
   * @param  {any} blob Blog
   */
  processRecording(blob: any) {
    this.url = URL.createObjectURL(blob);
    let user = this.storage.getUser();
    var answer = this.audioService.answerQuestion(user.username, blob).then((value: any) => {
      if (value.result == "good") {
        this.question_actual.question = "Bonne réponse!";
      } else {
        this.question_actual.question = "Mauvaise réponse!";
      }
      setTimeout(() => {
        this.nextQuestion();
      }, 3000);

      //Determine what to do now

    });

  }
  /**
   * Process Error.
   */
  errorCallback(error: any) {
    this.error = 'Can not play audio in your browser';
  }

  ngOnInit(): void {
    let mediaConstraints = {
      video: false,
      audio: true
    };
    navigator.mediaDevices
      .getUserMedia(mediaConstraints)
      .then(null, this.errorCallback.bind(this));
    this.isLoggedIn = this.storage.isLoggedIn();

    if (this.isLoggedIn) {
      this.questionService.getThemes().subscribe(_ => {
        this.themes = _;
      })
    }


  }

  getQuestion(aleatoire: boolean): void {
    this.gameStarted = true;
    this.startTimerQuestion();
    let user = this.storage.getUser();

    if (aleatoire) {
      this.storage.saveTheme("");

      this.questionService.getQuestion(user.username, "").subscribe((res: any) => {

        this.question_actual = res;
        if (this.question_actual.question_type == 1) {
          this.four_answer = false;
        } else {
          this.four_answer = true;
        }
      });
    } else {

      this.storage.saveTheme(this.themeControl.value);

      this.questionService.getQuestion(user.username, this.themeControl.value).subscribe((res: any) => {
        this.question_actual = res;
        if (this.question_actual.question_type == 1) {
          this.four_answer = false;
        } else {
          this.four_answer = true;
        }
      });

    }
  }

  nextQuestion(): void {
    let user = this.storage.getUser();
    let theme = this.storage.getTheme();
    this.startTimerQuestion();
    this.questionService.getQuestion(user.username, theme).subscribe((res: any) => {
      this.question_actual = res;
      if (this.question_actual.question_type == 1) {
        this.four_answer = false;
      } else {
        this.four_answer = true;
      }
    });
  }

  endGame(): void {
    this.gameEnded = true;

    let user = this.storage.getUser();

    this.userService.getScoreByUsername(user.username).subscribe(_ => {
      this.finalScore = _.score;
    })
  }


  restart(): void {
    window.location.reload();
  }
}
