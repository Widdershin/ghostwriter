import {run, Rx} from '@cycle/core';
import {makeDOMDriver, h} from '@cycle/dom';
import CycleTimeTravel from 'cycle-time-travel';
import $ from 'jquery';
import _ from 'lodash';
import rhyme from 'rhyme';

Rx.config.longStackSupport = true;

function log (label) {
  return console.log.bind(console, label);
}

function keyPressed (key) {
  return ev => ev.key === key || ev.keyIdentifier === key;
}

function addRhyme (wordToRhyme, rhyme) {
  return text => {
    let availableRhymes = rhyme.rhyme(wordToRhyme);

    if (availableRhymes === undefined) {
      availableRhymes = [];
    }

    const madeRhyme = _.sample(availableRhymes) || '';

    return text + madeRhyme.toLowerCase();
  }
}

function updateText (text) {
  return oldText => text;
}

function main ({DOM}) {
  const textUpdate$ = DOM.select('.text').events('input')
    .map(event => event.target.value)
    .startWith('');

  const keyPress$ = Rx.Observable
    .fromEvent(document.body, 'keypress');

  const tabPress$ = Rx.Observable.merge(
    keyPress$.filter(keyPressed('Tab')),
    DOM.select('.rhyme').events('click')
  );

  const wordToRhyme$ = textUpdate$.map(
    text => _.chain(text.split('\n'))
      .map(_.trim)
      .select(line => line !== '')
      .map(line => line.split(' '))
      .thru(lines => {
        if (lines.length > 1) {
          return lines[lines.length - 2];
        }

        return _.last(lines);
      })
      .last().value()
  );

  const rhyme$ = Rx.Observable.fromCallback(rhyme)();

  tabPress$.forEach(ev => ev.preventDefault());

  const editorText$ = Rx.Observable.merge(
    tabPress$.withLatestFrom(wordToRhyme$, rhyme$, (ev, wordToRhyme, rhyme) => addRhyme(wordToRhyme, rhyme)),
    textUpdate$.map(text => updateText(text))
  ).scan((text, modifier) => modifier(text), '');

  return {
    DOM: Rx.Observable.combineLatest(
      editorText$,
      wordToRhyme$,
      (text, timeTravelBar, wordToRhyme) => (
        h('.container', [
          h('h1', 'Ghostwriter'),
          h('.app-inner', [
            h('button.rhyme', 'RHYME'),
            h('textarea.text', {rows: 18, value: text})
          ])
        ])
      ))
  };
}

const drivers = {
  DOM: makeDOMDriver('.app')
};

$(() => run(main, drivers));
