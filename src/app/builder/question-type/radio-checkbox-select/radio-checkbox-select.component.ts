import {Component, Input, OnInit} from '@angular/core';
import {AppState} from '../../../store/app.state';
import {select, Store} from '@ngrx/store';
import * as fromRoot from '../../../store/app.reducer';
import {IOptionAnswersMap} from '../../../models/option-answers.model';
import {IElements} from '../../../models/elements.model';
import {fromEvent, Observable} from 'rxjs';
import {
  SurveyAddOptionAnswersAction,
  SurveyDragOptionAnswerAction,
  SurveyUpdateQuestionPageFlowModifierAction
} from '../../../store/survey/survey.actions';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import {map} from 'rxjs/operators';

@Component({
  selector: 'sb-radio-checkbox-select',
  templateUrl: './radio-checkbox-select.component.html',
  styleUrls: ['./radio-checkbox-select.component.scss']
})
export class RadioCheckboxSelectComponent implements OnInit {
  @Input() data: any;

  element: IElements;
  optionAnswers$: Observable<IOptionAnswersMap>;
  optionAnswersSize: number;
  pageId: string;
  isPageNavChecked = false;
  isSaved = false;

  constructor(
    private store: Store<AppState>,
  ) {
  }

  ngOnInit() {
    this.element = this.data.element;
    this.pageId = this.data.element.pageId;
    this.optionAnswers$ = this.store.pipe(
      select(fromRoot.getOptionAnswers,
        { pageId: this.pageId, elementId: this.element.id }
        ));

    this.optionAnswers$.subscribe(res => {
      this.optionAnswersSize = res.size;
    });

    setTimeout(() => {
      this.onSaveQuestionClick();
    }, 300);
  }

  togglePageNavChecked(e) {
    this.isPageNavChecked = e.target.checked;
    this.store.dispatch(new SurveyUpdateQuestionPageFlowModifierAction(
      { pageId: this.pageId,
        elementId: this.element.id,
        pageFlowModifier: this.isPageNavChecked
      }));
  }

  addOptionInput() {
    this.store.dispatch(new SurveyAddOptionAnswersAction({ pageId: this.element.pageId, elementId: this.element.id }));
  }

  drop(event: CdkDragDrop<string[]>) {
    this.store.dispatch(new SurveyDragOptionAnswerAction({
      pageId: this.pageId,
      elementId: this.element.id,
      startIndex: event.previousIndex,
      endIndex: event.currentIndex,
    }));
  }

  onSaveQuestionClick() {
    const $saveQuestionButton = document.getElementById(`save-question-button-${this.element.id}`);

    fromEvent($saveQuestionButton, 'click').pipe(
      map(event => event)
    ).subscribe(res => {
      if (res) {
        this.isSaved = true;
        this.onEditQuestionClick();
      }
    });
  }

  onEditQuestionClick() {
    const $editQuestionButton = document.getElementById(`edit-question-button-${this.element.id}`);

    fromEvent($editQuestionButton, 'click').pipe(
      map(event => event)
    ).subscribe(res => {
      if (res) {
        this.isSaved = false;
        this.onSaveQuestionClick();
      }
    });
  }

  trackElement(index: number, element: any) {
    return element ? element.key : null;
  }
}