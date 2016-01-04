import {Rx} from '@cycle/core';
import _ from 'lodash';
import rhyme from 'rhyme';

function appendNextRhyme (wordToRhyme, state, madeRhyme) {
  if (wordToRhyme === state.lastWord) {
    const words = state.text.split(' ');

    const textWithoutRhyme = words
      .slice(0, words.length - 1)
      .join(' ');

    return `${textWithoutRhyme.trim()} ${madeRhyme.toLowerCase()}`;
  } else {
    return `${state.text.trim()} ${madeRhyme.toLowerCase()}`;
  }
}

function addRhyme (rhymingDictionary) {
  return state => {
    const wordToRhyme = findWordToRhyme(state);
    let availableRhymes = state.availableRhymes;
    let selectedRhymeIndex = state.selectedRhymeIndex;

    if (wordToRhyme !== state.lastWord) {
      selectedRhymeIndex = 0;

      availableRhymes = rhymingDictionary.rhyme(wordToRhyme);
    } else {
      selectedRhymeIndex = (selectedRhymeIndex + 1) % availableRhymes.length;
    }

    if (_.isEmpty(availableRhymes)) {
      return Object.assign({}, state, {notification: 'No Rhymes', rhymeSuggestionsVisible: false});
    }

    const madeRhyme = availableRhymes[selectedRhymeIndex];

    const text = appendNextRhyme(wordToRhyme, state, madeRhyme);

    const stateUpdates = {
      text,
      notification: '',
      lastWord: wordToRhyme,
      availableRhymes,
      selectedRhymeIndex,
      rhymeSuggestionsVisible: true
    };

    return Object.assign({}, state, stateUpdates);
  };
}

function selectRhymeScheme (rhymeScheme) {
  return state => Object.assign({}, state, {rhymeScheme});
}

function findWordToRhyme (state) {
  const lineToRhymeWith = {
    'AABB': 1,
    'ABAB': 2
  };

  return lastWord(state.text, lineToRhymeWith[state.rhymeScheme]);
}

function lastWord (text, lineOffset) {
  return _.chain(text.split('\n'))
    .map(_.trim)
    .select(line => line !== '')
    .map(line => line.split(' '))
    .thru(lines => {
      if (lines.length > lineOffset) {
        return lines[lines.length - 1 - lineOffset];
      }

      return _.last(lines);
    })
    .last().value();
}

function updateText (textEnteredByUser) {
  return state => Object.assign({}, state, {text: textEnteredByUser, notification: '', rhymeSuggestionsVisible: false});
}

function toggleInstructionVisibility (state) {
  return Object.assign(
    {},
    state,
    {instructionsVisible: !state.instructionsVisible}
  );
}

export default function model ({rhymePress$, caretPosition$, toggleInstructionVisibility$, textUpdate$, selectRhymeScheme$}) {
  const rhymingDictionary$ = Rx.Observable.fromCallback(rhyme)();

  const action$ = Rx.Observable.merge(
    rhymePress$.withLatestFrom(rhymingDictionary$, (ev, rhymingDictionary) => addRhyme(rhymingDictionary)),
    textUpdate$.map(event => updateText(event.target.value)),
    toggleInstructionVisibility$.map(_ => toggleInstructionVisibility),
    selectRhymeScheme$.map(event => selectRhymeScheme(event.target.value))
  );

  const initialState = {
    text: '',
    notification: '',
    instructionsVisible: true,
    rhymeScheme: 'AABB',
    availableRhymes: [],
    selectedRhymeIndex: 0,
    rhymeSuggestionsVisible: false
  };

  const state$ = action$
    .scan((state, action) => action(state), initialState)
    .startWith(initialState)

  return state$
    .withLatestFrom(caretPosition$, (state, caretPosition) => Object.assign({}, state, {caretPosition}))
    .do(state => console.log('state', JSON.stringify(state)));
}