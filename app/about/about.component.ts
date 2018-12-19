import { Component, OnInit, Inject } from '@angular/core';
import { Leader } from '../shared/leader';
import { LeaderService } from '../services/leader.service';
import * as app from "application";
import { RadSideDrawer } from "nativescript-ui-sidedrawer";

@Component({
  selector: 'app-about',
  moduleId: module.id,
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.css']
})
export class AboutComponent implements OnInit {

  leaders: Leader[];
  errMess: string;

  constructor(private leaderService: LeaderService,
    @Inject('baseURL') private baseURL) { }

  ngOnInit() {
    this.leaderService.getLeaders()
      .subscribe(leaders => this.leaders = leaders,
        errmess => this.errMess = <any>errmess);
  }

  onDrawerButtonTap(): void {
    const sideDrawer = <RadSideDrawer>app.getRootView();
    sideDrawer.showDrawer();
}

}
