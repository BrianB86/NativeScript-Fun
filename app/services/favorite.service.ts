import { Injectable } from '@angular/core';
import { Dish } from '../shared/dish';
import { DishService } from '../services/dish.service';
import { CouchbaseService } from '../services/couchbase.service';
import { Observable, throwError } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class FavoriteService {

    favorites: Array<string>;
    docId: string = "favorites";

    constructor(private dishservice: DishService, private couchbaseService: CouchbaseService) {
      this.favorites = [];

      let doc = this.couchbaseService.getDocument(this.docId);
      if( doc == null) {
        this.couchbaseService.createDocument({"favorites": []}, this.docId);
      }
      else {
        this.favorites = doc.favorites;
      }

    }

    isFavorite(id: string): boolean {
        return this.favorites.some(el => el === id);
    }

    addFavorite(id: number): boolean {
      if (!this.isFavorite(id)) {
        this.favorites.push(id);
        this.couchbaseService.updateDocument(this.docId, {"favorites": this.favorites});
      }

      return true;
    }

    getFavorites(): Observable<Dish[]> {
        return this.dishservice.getDishes()
            .pipe(map(dishes => dishes.filter(dish => this.favorites.some(el => el === dish.id))));
    }

    deleteFavorite(id: number): Observable<Dish[]> {
        let index = this.favorites.indexOf(id);
        if (index >= 0) {
          this.favorites.splice(index,1);
          this.couchbaseService.updateDocument(this.docId, {"favorites": this.favorites});
          return this.getFavorites();
        }
        else {
          return throwError('Deleting non-existant favorite');
        }
      }
}
