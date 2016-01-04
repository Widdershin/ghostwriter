import {Rx} from '@cycle/core';

import caretPosition from 'textarea-caret-position';

export default function intent ({DOM}) {
  return {
    rhymePress$: rhymePress$(DOM),
    caretPosition$: caretPosition$(DOM),
    toggleInstructionVisibility$: toggleInstructionVisibility$(DOM),
    textUpdate$: textUpdate$(DOM),
    selectRhymeScheme$: selectRhymeScheme$(DOM)
  }
}

function rhymePress$ (DOM) {
  const tabPress$ = DOM
    .select('.container')
    .events('keydown')
    .filter(keyPressed('Tab', 9));

  const rhymeButtonClick$ = DOM
    .select('.rhyme')
    .events('click');

  return Rx.Observable.merge(
    tabPress$,
    rhymeButtonClick$
  ).do(ev => ev.preventDefault());
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
