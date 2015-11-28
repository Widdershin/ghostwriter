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

function keyPressed (key, number) {
  return ev => {
    return ev.key === key || ev.keyIdentifier === key || ev.keyCode === number;
  };
}

function addRhyme (wordToRhyme, rhyme) {
  return text => {
    let availableRhymes = rhyme.rhyme(wordToRhyme);

    if (availableRhymes === undefined) {
      availableRhymes = [];
    }

    const madeRhyme = _.sample(availableRhymes) || '';

    return text + madeRhyme.toLowerCase();
  };
}

function updateText (text) {
  return oldText => text;
}

function main ({DOM}) {
  const textUpdate$ = DOM.select('.text').events('input')
    .map(event => event.target.value)
    .startWith('');

  const keyPress$ = DOM.select('.container').events('keydown');

  const tabPress$ = keyPress$.filter(keyPressed('Tab', 9));

  const rhymePress$ = Rx.Observable.merge(
    tabPress$,
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

  rhymePress$.forEach(ev => ev.preventDefault());

  const action$ = Rx.Observable.merge(
    rhymePress$.withLatestFrom(wordToRhyme$, rhyme$, (ev, wordToRhyme, rhyme) => addRhyme(wordToRhyme, rhyme)),
    textUpdate$.map(text => updateText(text))
  );

  const editorText$ = action$.scan((text, action) => action(text), '');

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
