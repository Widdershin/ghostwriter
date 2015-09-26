import {run, Rx} from '@cycle/core';
import {makeDOMDriver, h} from '@cycle/dom';

import CycleTimeTravel from 'cycle-time-travel';

function log (label) {
  return console.log.bind(console, label);
}

function keyPressed (key) {
  return ev => ev.key === key || ev.keyIdentifier === key;
}

function addRhyme (text) {
  return text + ' bluh!';
}

function updateText (text) {
  return oldText => text;
}

function main ({DOM}) {
  const keyPress$ = Rx.Observable
    .fromEvent(document.body, 'keypress')
    .map(ev => ev.key);

  const tabPress$ = keyPress$.filter(keyPressed('Tab'));

  const textUpdate$ = DOM.select('.text').events('input')
    .map(event => event.target.value)
    .startWith('');

  const editorText$ = Rx.Observable.merge(
    tabPress$.map(log('tab')).map(ev => addRhyme),
    textUpdate$.map(text => updateText(text))
  ).scan((text, modifier) => modifier(text), '');

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
