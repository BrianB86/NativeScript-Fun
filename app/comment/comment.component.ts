import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ModalDialogParams } from 'nativescript-angular/modal-dialog';
import { TextField } from 'ui/text-field';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';
import { Page } from 'ui/page';

@Component({
  moduleId: module.id,
  templateUrl: './comment.component.html'
})
export class CommentComponent implements OnInit {

  comment: FormGroup

  constructor(private params: ModalDialogParams,
    private page: Page, private formBuilder: FormBuilder) {

    this.comment = this.formBuilder.group({
      author: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(25)]],
      rating: 5,
      comment: ['', [Validators.required]],
      date: ['', Validators.required]
    });

  }

  ngOnInit() {

  }

  public submit() {
    var d = new Date();
    Object.assign(this.comment, { date: d.toISOString() });
    this.params.closeCallback(this.comment);
  }

  onAuthorChange(args) {
    let authorText = <TextField>args.object;
    this.comment.patchValue({ author: authorText.text });
  }

  onRatingValueChange(args) {
    let slider = <Slider>args.object;

    this.comment.patchValue({ rating: slider.value });
  }

  onCommentValueChange(args) {
    let commentView = <TextView>args.object;

    this.comment.patchValue({ comment: commentView.text });
  }
}
