import {Rx} from '@cycle/core';

import caretPosition from 'textarea-caret-position';

function keyPressed (key, number) {
  return ev => {
    return ev.key === key || ev.keyIdentifier === key || ev.keyCode === number;
  };
}

export default function intent ({DOM}) {
  const toggleInstructionVisibility$ = DOM
    .select('.toggle-instructions')
    .events('click')

  const textUpdate$ = DOM.select('.text').events('input')

  const selectRhymeScheme$ = DOM
    .select('.rhyme-schemes input')
    .events('change')

  const keyPress$ = DOM.select('.container').events('keydown');

  const tabPress$ = keyPress$.filter(keyPressed('Tab', 9));

  const rhymePress$ = Rx.Observable.merge(
    tabPress$,
    DOM.select('.rhyme').events('click')
  );

  rhymePress$.forEach(ev => ev.preventDefault());

  const caretPosition$ = DOM
    .select('.text')
    .events('input')
    .map(event => caretPosition(event.target, event.target.selectionEnd))
    .startWith({top: 0, left: 0});

  return {
    rhymePress$,
    caretPosition$,
    toggleInstructionVisibility$,
    textUpdate$,
    selectRhymeScheme$
  }
}