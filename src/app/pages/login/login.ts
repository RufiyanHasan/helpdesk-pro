import { Component, inject, signal } from '@angular/core';
import {FormGroup, FormControl, ReactiveFormsModule} from '@angular/forms';
import { Router } from '@angular/router';


@Component({
  imports: [ReactiveFormsModule],
  selector: 'app-login',
  styleUrl: './login.scss',
  templateUrl: './login.html',
})
export class Login {
  private router = inject(Router);

  form = new FormGroup({
    username: new FormControl(''),
    password: new FormControl('')
  })

  loginFailed = signal(false);

  onSubmit(){
    console.log(this.form.value);

    const { username, password } = this.form.value;
    if (username !== 'admin' || password !== '123') {
      this.loginFailed.set(true);
      return;
    }

    this.loginFailed.set(false);
    this.router.navigate(['/dashboard']);
  }
}
