import {Rx} from '@cycle/core';

import caretPosition from 'textarea-caret';

export default function intent ({DOM}) {
  const keyPress$ = DOM
    .select('.container')
    .events('keydown');

  return {
    rhymePress$: rhymePress$(DOM, keyPress$),
    caretPosition$: caretPosition$(DOM),
    toggleInstructionVisibility$: toggleInstructionVisibility$(DOM),
    textUpdate$: textUpdate$(DOM),
    selectRhymeScheme$: selectRhymeScheme$(DOM),
    shiftTabPress$: shiftTabPress$(DOM, keyPress$),
    rhymeSuggestionClick$: rhymeSuggestionClick$(DOM)
  }
}

function shiftTabPress$ (DOM, keyPress$) {
  return keyPress$
    .filter(ev => ev.shiftKey && keyPressed('Tab', 9)(ev))
    .do(ev => ev.preventDefault());
}

function rhymePress$ (DOM, keyPress$) {
  const tabPress$ = keyPress$
    .filter(ev => !ev.shiftKey && keyPressed('Tab', 9)(ev));

  const rhymeButtonClick$ = DOM
    .select('.rhyme')
    .events('click');

  return Rx.Observable.merge(
    tabPress$,
    rhymeButtonClick$
  ).do(ev => ev.preventDefault());
}

function rhymeSuggestionClick$ (DOM) {
  return DOM
    .select('.rhyme-suggestion')
    .events('click');
}

function caretPosition$ (DOM) {
  return DOM
    .select('.text')
    .events('input')
    .map(event => caretPosition(event.target, event.target.selectionEnd))
    .startWith({top: 0, left: 0});
}

function toggleInstructionVisibility$ (DOM) {
  return DOM
    .select('.toggle-instructions')
    .events('click');
}

function selectRhymeScheme$ (DOM) {
  return DOM
    .select('.rhyme-schemes input')
    .events('change');
}

function textUpdate$ (DOM) {
  return DOM
    .select('.text')
    .events('input');
}

function keyPressed (key, number) {
  return ev => {
    return ev.key === key || ev.keyIdentifier === key || ev.keyCode === number;
  };
}
