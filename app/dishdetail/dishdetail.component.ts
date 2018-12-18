import { Component, OnInit, Inject, ViewContainerRef } from '@angular/core';
import { Dish } from '../shared/dish';
import { Comment } from '../shared/comment';
import { DishService } from '../services/dish.service';
import { ActivatedRoute, Params } from '@angular/router';
import { RouterExtensions } from 'nativescript-angular/router';
import { FavoriteService } from '../services/favorite.service';
import { TNSFontIconService } from 'nativescript-ngx-fonticon';
import { ModalDialogService, ModalDialogOptions } from "nativescript-angular/modal-dialog";
import { Toasty } from 'nativescript-toasty';
import { action } from "tns-core-modules/ui/dialogs";
import { switchMap } from 'rxjs/operators';

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


  constructor(private dishservice: DishService,
    private route: ActivatedRoute,
    private routerExtensions: RouterExtensions,
    private favoriteservice: FavoriteService,
    private fonticon: TNSFontIconService,
    private modalService: ModalDialogService,
    private viewContainerRef: ViewContainerRef,
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
        this.dishservice.putDish(this.dish)
          .subscribe(dish => {
            this.dish = dish;
          },
            errmess => { this.dish = null; this.errMess = <any>errmess; });
      });
  }
}
