import {Rx} from '@cycle/core';
import _ from 'lodash';
import rhyme from 'rhyme';

import addRhyme from './actions/add-rhyme';
import selectPreviousRhyme from './actions/select-previous-rhyme';
import selectRhymeScheme from './actions/select-rhyme-scheme';
import toggleInstructionVisibility from './actions/toggle-instruction-visibility';
import updateText from './actions/update-text';
import chooseSuggestion from './actions/choose-suggestion';

const initialState = {
  text: '',
  notification: '',
  instructionsVisible: true,
  rhymeScheme: 'AABB',
  availableRhymes: [],
  selectedRhymeIndex: 0,
  rhymeSuggestionsVisible: false
};

export default function model ({rhymePress$, caretPosition$, toggleInstructionVisibility$, textUpdate$, selectRhymeScheme$, shiftTabPress$, rhymeSuggestionClick$}) {
  const rhymingDictionary$ = Rx.Observable.fromCallback(rhyme)();

  const action$ = Rx.Observable.merge(
    rhymePress$.withLatestFrom(rhymingDictionary$, (ev, rhymingDictionary) => addRhyme(rhymingDictionary)),
    textUpdate$.map(event => updateText(event.target.value)),
    toggleInstructionVisibility$.map(_ => toggleInstructionVisibility),
    selectRhymeScheme$.map(event => selectRhymeScheme(event.target.value)),
    shiftTabPress$.map(_ => selectPreviousRhyme),
    rhymeSuggestionClick$.map(event => chooseSuggestion(event.target.innerText))
  );

  const state$ = action$
    .scan((state, action) => action(state), initialState)
    .startWith(initialState)

  return state$
    .withLatestFrom(caretPosition$, (state, caretPosition) => Object.assign({}, state, {caretPosition}))
    .do(state => console.log('state', JSON.stringify(state)));
}