import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { FormBuilder, Validators, FormArray, FormGroup, FormControl } from '@angular/forms';
import { Tibame, departs } from './tibame-model';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subject } from 'rxjs';
import { debounceTime, filter } from 'rxjs/operators';

@Component({
  selector: 'ntub-sign-up-form',
  templateUrl: './sign-up-form.component.html',
  styleUrls: ['./sign-up-form.component.scss']
})
export class SignUpFormComponent implements OnInit {

  tapAction$ = new Subject<boolean>();

  constructor(private fb: FormBuilder, private http: HttpClient, private spinner: NgxSpinnerService) {
    this.departments = departs;
  }
  isInputOther = false;
  url = 'https://docs.google.com/forms/d/e/1FAIpQLSdorIgY_JRM7YyBPTJ_Qwe6M4Vpu9_uMcebsE-jJmzA5a021w/formResponse';

  tibameClass: [Tibame];
  selectedClass: Tibame;

  departments;
  email = '';

  radioOptions = [
    '大一',
    '大二',
    '大三',
    '大四',
    '研究生',
    '博士生',
    '剛畢業(一年內)',
    '其他'
  ];

  fieldMapping = {
    name: 'entry.245711150',
    phone: 'entry.1225130926',
    email: 'emailAddress',
    depart: 'entry.1337474422',
    id: 'entry.1517481286',
    select_class: 'entry.1303094566',
    time: 'entry.1582443492',
    other: 'entry.1517481286.other_option_response'
  };

  formData: FormGroup = this.fb.group({
    name: ['', Validators.required],
    phone: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    depart: ['', Validators.required],
    id: ['', Validators.required],
    select_class: ['', Validators.required],
  });

  ngOnInit() {
    const tibameURL = 'https://ntub-tibame.herokuapp.com/api';
    this.spinner.show();
    this.http.get(tibameURL).subscribe(
      data => {
        this.tibameClass = data as [Tibame];
        this.handleRx();
        this.spinner.hide();
      },
      error => {
        console.log(error);
        this.spinner.hide();
      }
    );
  }
  onEmailChange(email: string) {
    const text = email.split('@ntub.edu.tw').map(txt => txt.split('@')[0]).join('');
    this.email = email;
    this.formData.patchValue({
      email: this.email
    });
  }

  keyOther(val) {
    if (val === '其他') {
      this.formData.addControl('other', new FormControl('', Validators.required));
      this.isInputOther = true;
    } else {
      this.formData.removeControl('other');
      this.isInputOther = false;
    }
  }

  setClass(item: any) {
    if (!item) { return; }

    this.selectedClass = this.tibameClass.filter(it => {
      return it.title === item;
    })[0];
  }

  save() {
    this.tapAction$.next(true);
  }

  handleRx() {
    this.tapAction$.pipe(
      filter(v => v),
      debounceTime(300),
    ).subscribe( _ => {
      if (this.formData.valid) {
        const rawValue = this.formData.getRawValue();
        let body = new HttpParams();
        Object.entries(rawValue).forEach(([key, value]) => {
          if (value === '其他') {
            body = body.append(this.fieldMapping[key], '__other_option__');
          } else {
            body = body.append(this.fieldMapping[key], value as string);
          }
        });
        body = body.append(this.fieldMapping['time'], this.selectedClass.time);
        const headers = new HttpHeaders();
        headers
        .set('Content-Type', 'application/x-www-form-urlencoded');
        const httpOptions = {
          headers: headers
        };
        this.http.post(this.url, body, httpOptions).subscribe(data => {}, (err) => {});
        this.formData.reset();
        alert('報名成功');
        window.location.href = 'https://www.tibame.com/offline';
      } else {
        alert('欄位漏填！');
      }
    });
  }

}
