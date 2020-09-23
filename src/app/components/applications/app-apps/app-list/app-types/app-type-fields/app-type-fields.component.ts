import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmationModalComponent } from '../../../../../../shared/modals/confirmation-modal/confirmation-modal.component';
import { AddFieldModalComponent } from '../../../../../../shared/modals/add-field-modal/add-field-modal.component';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-app-type-fields',
  templateUrl: './app-type-fields.component.html',
  styleUrls: ['./app-type-fields.component.scss']
})
export class AppTypeFieldsComponent implements OnInit {

  /** App fields input data */
  @Input() fieldDefinitions = [];
  /** Sending fields data to the parent */
  @Output() fieldsChanging = new EventEmitter<any>();

  constructor(private modalService: NgbModal) { }

  ngOnInit(): void {
  }

  deleteField(index: number): void {
    const modalRef = this.modalService.open(ConfirmationModalComponent);

    modalRef.componentInstance.modalText = 'Are you sure you want to delete '
      + this.fieldDefinitions[index].label + ' field?';
    modalRef.componentInstance.action = 'Delete';
    modalRef.componentInstance.buttonText = 'DELETE';

    modalRef.result.then(result => {
      if (result === 'success') {
        this.fieldDefinitions.splice(index, 1);
        this.fieldsChanging.emit(this.fieldDefinitions);
      }
    });
  }

  editField(fullFieldData?: any, index?: number): void {
    const modalRef = this.modalService.open(AddFieldModalComponent);

    modalRef.componentInstance.fieldData = fullFieldData;

    modalRef.result.then(result => {
      if (result.status === 'success') {
        if (index) {
          this.fieldDefinitions.splice(index, 1, result.fieldData);
        } else {
          this.fieldDefinitions.push(result.fieldData);
        }
        this.fieldsChanging.emit(this.fieldDefinitions);
      }
    });
  }

  previewField(fullFieldData): void {
    // todo open preview modal
  }

  itemDropped(event: CdkDragDrop<any[]>) {
    moveItemInArray(this.fieldDefinitions, event.previousIndex, event.currentIndex);
    this.fieldsChanging.emit(this.fieldDefinitions);
  }
}
