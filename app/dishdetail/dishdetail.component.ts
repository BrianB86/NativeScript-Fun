import { Component, OnInit, Inject, ViewContainerRef } from '@angular/core';
import { Dish } from '../shared/dish';
import { Comment } from '../shared/comment';
import { CommentComponent } from "../comment/comment.component";
import { DishService } from '../services/dish.service';
import { ActivatedRoute, Params } from '@angular/router';
import { RouterExtensions } from 'nativescript-angular/router';
import { FavoriteService } from '../services/favorite.service';
import { TNSFontIconService } from 'nativescript-ngx-fonticon';
import { ModalDialogService, ModalDialogOptions } from "nativescript-angular/modal-dialog";
import { Toasty } from 'nativescript-toasty';
import { action } from "tns-core-modules/ui/dialogs";
import { switchMap } from 'rxjs/operators';
import { Page } from "ui/page";
import { Animation, AnimationDefinition } from "ui/animation";
import { View } from "ui/core/view";
import { SwipeGestureEventData, SwipeDirection } from "ui/gestures";
import { Color } from 'color';
import * as enums from "ui/enums";

@Component({
  selector: 'app-dishdetail',
  moduleId: module.id,
  templateUrl: './dishdetail.component.html',
  styleUrls: ['./dishdetail.component.css']
})
export class DishdetailComponent implements OnInit {

  dish: Dish;
  comment: Comment;
  errMess: string;
  avgstars: string;
  numcomments: number;
  favorite: boolean = false;
  showComments: boolean = false;

  cardImage: View;
  commentList: View;
  cardLayout: View;


  constructor(private dishservice: DishService,
    private route: ActivatedRoute,
    private routerExtensions: RouterExtensions,
    private favoriteservice: FavoriteService,
    private fonticon: TNSFontIconService,
    private modalService: ModalDialogService,
    private viewContainerRef: ViewContainerRef,
    private page: Page,

    @Inject('baseURL') private baseURL) { }

  ngOnInit() {

    this.route.params
      .pipe(switchMap((params: Params) => this.dishservice.getDish(params['id'])))
      .subscribe(dish => {
        this.dish = dish;
        this.favorite = this.favoriteservice.isFavorite(this.dish.id);
        this.numcomments = this.dish.comments.length;

        let total = 0;
        this.dish.comments.forEach(comment => total += comment.rating);
        this.avgstars = (total / this.numcomments).toFixed(2);
      },
        errmess => { this.dish = null; this.errMess = <any>errmess; });
  }

  addToFavorites() {
    if (!this.favorite) {
      console.log('Adding to Favorites', this.dish.id);
      this.favorite = this.favoriteservice.addFavorite(this.dish.id);
      const toast = new Toasty("Added Dish " + this.dish.id, "short", "bottom");
      toast.show();
    }
  }

  goBack(): void {
    this.routerExtensions.back();
  }

  showMenu() {
    let options = {
      title: "Actions",
      cancelButtonText: "Cancel",
      actions: ["Add to Favorites", "Add Comment"]
    };

    action(options).then((result) => {
      if (result.localeCompare("Add to Favorites")) {
        this.addToFavorites();
      } else {
        this.showModal();
      }
    });
  }

  showModal() {
    let options: ModalDialogOptions = {
      viewContainerRef: this.viewContainerRef
    };

    this.modalService.showModal(CommentComponent, options)
      .then((result: any) => {
        this.dish.comments.push(result);
      });
  }

  onSwipe(args: SwipeGestureEventData) {

  if (this.dish) {
    this.cardImage = <View>this.page.getViewById<View>("cardImage");
    this.cardLayout = <View>this.page.getViewById<View>("cardLayout");
    this.commentList = <View>this.page.getViewById<View>("commentList");

    if (args.direction === SwipeDirection.up && !this.showComments ) {
      this.animateUp();
    }
    else if (args.direction === SwipeDirection.down && this.showComments ) {
      this.showComments = false;
      this.animateDown();
    }
  }

}

showAndHideComments() {
    this.cardImage = <View>this.page.getViewById<View>("cardImage");
    this.cardLayout = <View>this.page.getViewById<View>("cardLayout");
    this.commentList = <View>this.page.getViewById<View>("commentList");

    if (!this.showComments ) {
      this.animateUp();
    }
    else if (this.showComments ) {
      this.showComments = false;
      this.animateDown();
    }
}

animateUp() {
  let definitions = new Array<AnimationDefinition>();
  let a1: AnimationDefinition = {
      target: this.cardImage,
      scale: { x: 1, y: 0 },
      translate: { x: 0, y: -200 },
      opacity: 0,
      duration: 500,
      curve: enums.AnimationCurve.easeIn
  };
  definitions.push(a1);

  let a2: AnimationDefinition = {
      target: this.cardLayout,
      backgroundColor: new Color("#ffc107"),
      duration: 500,
      curve: enums.AnimationCurve.easeIn
  };
  definitions.push(a2);

  let animationSet = new Animation(definitions);

  animationSet.play().then(() => {
    this.showComments = true;
  })
  .catch((e) => {
      console.log(e.message);
  });
}

animateDown() {
  let definitions = new Array<AnimationDefinition>();
  let a1: AnimationDefinition = {
      target: this.cardImage,
      scale: { x: 1, y: 1 },
      translate: { x: 0, y: 0 },
      opacity: 1,
      duration: 500,
      curve: enums.AnimationCurve.easeIn
  };
  definitions.push(a1);

  let a2: AnimationDefinition = {
      target: this.cardLayout,
      backgroundColor: new Color("#ffffff"),
      duration: 500,
      curve: enums.AnimationCurve.easeIn
  };
  definitions.push(a2);

  let animationSet = new Animation(definitions);

  animationSet.play().then(() => {
  })
  .catch((e) => {
      console.log(e.message);
  });
}
}
