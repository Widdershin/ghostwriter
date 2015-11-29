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

function addRhyme (wordToRhyme, rhymingDictionary) {
  return state => {
    let availableRhymes = rhymingDictionary.rhyme(wordToRhyme);
    state.notification = ""

    if (_.isEmpty(availableRhymes)) {
      state.notification = "No Rhymes"
    }

    const madeRhyme = _.sample(availableRhymes) || '';

    return {
      text: state.text + madeRhyme.toLowerCase(),
      notification: state.notification
    };
  };
}

function updateText (textEnteredByUser) {
  return state => ({text: textEnteredByUser, notification: ""});
}

function main ({DOM}) {
  const textUpdate$ = DOM.select('.text').events('input')
    .map(event => event.target.value);

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

  const rhymingDictionary$ = Rx.Observable.fromCallback(rhyme)();

  rhymePress$.forEach(ev => ev.preventDefault());

  const action$ = Rx.Observable.merge(
    rhymePress$.withLatestFrom(wordToRhyme$, rhymingDictionary$, (ev, wordToRhyme, rhymingDictionary) => addRhyme(wordToRhyme, rhymingDictionary)),
    textUpdate$.map(text => updateText(text))
  );

  const initialState = {
    text: '',
    notification: ''
  }

  const state$ = action$.scan((state, action) => action(state), initialState)
    .startWith(initialState)
    .do(function(state){
      console.log("state", JSON.stringify(state))
    })

  return {
    DOM: state$.map(({text, notification}) => (
        h('.container', [
          h('h1', 'Ghostwriter'),
          h('.app-inner', [
            h('button.rhyme', 'RHYME'),
            h('textarea.text', {rows: 18, value: text}),
            h('.notification', notification)
          ])
        ])
      ))
  };
}

const drivers = {
  DOM: makeDOMDriver('.app')
};

$(() => run(main, drivers));
