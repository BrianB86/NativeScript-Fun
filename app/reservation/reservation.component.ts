import { TextField } from 'ui/text-field';
import { Switch } from 'ui/switch';
import { Validators, FormBuilder, FormGroup} from '@angular/forms';
import { Component, OnInit, Inject, ChangeDetectorRef, ViewContainerRef } from '@angular/core';
import { ModalDialogService, ModalDialogOptions } from "nativescript-angular/modal-dialog";
import { ReservationModalComponent } from "../reservationmodal/reservationmodal.component";
import * as app from "application";
import { RadSideDrawer } from "nativescript-ui-sidedrawer";
import { Page } from "ui/page";
import { View } from "ui/core/view";
import { Animation, AnimationDefinition } from "ui/animation";
import { CouchbaseService } from '../services/couchbase.service';
import * as enums from "ui/enums";

@Component({
    selector: 'app-reservation',
    moduleId: module.id,
    templateUrl: './reservation.component.html',
    styleUrls: ['./reservation.component.css']
})
export class ReservationComponent implements OnInit {

    reservation: FormGroup;
    showFormCard: boolean = true;
    showResultCard: boolean = false;
    formCard: View;
    resultsCard: View;
    docId: string = "reservations";

    constructor(private formBuilder: FormBuilder, private modalService: ModalDialogService,
    private vcRef: ViewContainerRef, private couchbaseService: CouchbaseService) {

            this.reservation = this.formBuilder.group({
                guests: 3,
                smoking: false,
                dateTime: ['', Validators.required]
            });
    }

    ngOnInit() {

    }

    onDrawerButtonTap(): void {
    const sideDrawer = <RadSideDrawer>app.getRootView();
    sideDrawer.showDrawer();
}

    createModalView(args) {

    let options: ModalDialogOptions = {
        viewContainerRef: this.vcRef,
        context: args,
        fullscreen: false
    };

    this.modalService.showModal(ReservationModalComponent, options)
        .then((result: any) => {
            if (args === "guest") {
                this.reservation.patchValue({guests: result});
            }
            else if (args === "date-time") {
                this.reservation.patchValue({ dateTime: result});
            }
        });
      }

    onSmokingChecked(args) {
        let smokingSwitch = <Switch>args.object;
        if (smokingSwitch.checked) {
            this.reservation.patchValue({ smoking: true });
        }
        else {
            this.reservation.patchValue({ smoking: false });
        }
    }

    onGuestChange(args) {
        let textField = <TextField>args.object;

        this.reservation.patchValue({ guests: textField.text});
    }

    onDateTimeChange(args) {
        let textField = <TextField>args.object;

        this.reservation.patchValue({ dateTime: textField.text});
    }

    onSubmit() {
        console.log(JSON.stringify(this.reservation.value));
        //Store form data here.
        let doc = this.couchbaseService.getDocument(this.docId);
        if( doc == null) {
          this.couchbaseService.createDocument({"reservations": [{
            "guests": string,
            "smoking": boolean,
            "dateTime": string
          }]}, this.docId);
        }
        else {
          this.reservation = doc.reservation;
        }

        let req = this.reservation.value;

        this.couchbaseService.updateDocument(this.docId, {
          "guests": this.req.reservations[0],
          "smoking": this.req.reservations[1],
          "dateTime": this.req.reservations[2]});



        this.formCard = this.page.getViewById<View>('formCard');
        this.resultsCard = this.page.getViewById<View>('resultCard');

        this.formCard.animate({
          scale: { x: 0.2, y: 0.2},
          opacity: 0.1,
          duration: 500
        }).then(() => {
          this.resultsCard.animate({
            scale: { x: 0.2, y: 0.2},
            opacity: 0.1,
            duration: 500
          }).then(() => {
            this.showFormCard = false;
            this.showResultCard = true;
            this.resultsCard.animate({
              scale: { x: 1, y: 1},
              opacity: 1,
              duration: 500
            });
          });
        });
    }
}
