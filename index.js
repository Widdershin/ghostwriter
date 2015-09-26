import {run, Rx} from '@cycle/core';
import {makeDOMDriver, h} from '@cycle/dom';

import CycleTimeTravel from 'cycle-time-travel';

function log (label) {
  return console.log.bind(console, label);
}

function keyPressed (key) {
  return (ev) => ev.key === key || ev.keyIdentifier === key;
}

function main ({DOM}) {
  const editorText$ = DOM.select('.text').events('input')
    .map(event => event.target.value)
    .debounce(300)
    .startWith('');

  const keyPress$ = Rx.Observable
    .fromEvent(document.body, 'keypress')
    .map(ev => ev.key);

  const tabPress$ = keyPress$.filter(keyPressed('Tab'));

  const timeTravel = CycleTimeTravel(DOM, [
    {stream: editorText$, label: 'editorText$'},
    {stream: keyPress$, label: 'keyPress$'},
    {stream: tabPress$, label: 'tabPress$'}
  ]);

  return {
    DOM: Rx.Observable.combineLatest(
      timeTravel.timeTravel.editorText$,
      timeTravel.DOM,
      (text, timeTravelBar) => (
        h('.app-inner', [
          h('textarea.text', {rows: 20, cols: 50, value: text}),
          timeTravelBar
        ])
      ))
  };
}

const drivers = {
  DOM: makeDOMDriver('.app')
};

run(main, drivers);
