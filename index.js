import {run, Rx} from '@cycle/core';
import {makeDOMDriver, h} from '@cycle/dom';
import CycleTimeTravel from 'cycle-time-travel';
import $ from 'jquery';
import _ from 'lodash';
import rhyme from 'rhyme';

const INSTRUCTIONS = `
Write your sick raps in the text box below.<br />
Reach the end of the line and don't know where to go? <br /><br />

Hit TAB on your keyboard or RHYME on the screen <br />
And there you will find the word for your <a href="https://www.wikiwand.com/en/Rhyme_scheme" target="_blank">scheme</a><br /><br />

Don't like it? That's cool, hit it again<br />
You'll get a new rhyme for your rap and then<br /><br />

Impress all your friends with your linguistic skill<br />
And do it again, now you know the drill.<br /><br />
`;

Rx.config.longStackSupport = true;

function log (label) {
  return console.log.bind(console, label);
}

function keyPressed (key, number) {
  return ev => {
    return ev.key === key || ev.keyIdentifier === key || ev.keyCode === number;
  };
}

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
    const availableRhymes = rhymingDictionary.rhyme(wordToRhyme);
    const madeRhyme = _.shuffle(availableRhymes).slice(0, 1)[0];

    if (_.isEmpty(availableRhymes)) {
      return Object.assign({}, state, {notification: 'No Rhymes'});
    }

    const text = appendNextRhyme(wordToRhyme, state, madeRhyme);

    const stateUpdates = {
      text,
      notification: '',
      lastWord: wordToRhyme
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
  return state => Object.assign({}, state, {text: textEnteredByUser, notification: ''});
}

function toggleInstructionVisibility (state) {
  return Object.assign(
    {},
    state,
    {instructionsVisible: !state.instructionsVisible}
  );
}

function main ({DOM}) {
  const toggleInstructionVisibility$ = DOM
    .select('.toggle-instructions')
    .events('click')
    .map(_ => toggleInstructionVisibility);

  const textUpdate$ = DOM.select('.text').events('input')
    .map(event => event.target.value);

  const keyPress$ = DOM.select('.container').events('keydown');

  const tabPress$ = keyPress$.filter(keyPressed('Tab', 9));

  const rhymePress$ = Rx.Observable.merge(
    tabPress$,
    DOM.select('.rhyme').events('click')
  );

  const selectRhymeScheme$ = DOM
    .select('.rhyme-schemes input')
    .events('change')
    .map(event => selectRhymeScheme(event.target.value));

  const rhymingDictionary$ = Rx.Observable.fromCallback(rhyme)();

  rhymePress$.forEach(ev => ev.preventDefault());

  const action$ = Rx.Observable.merge(
    rhymePress$.withLatestFrom(rhymingDictionary$, (ev, rhymingDictionary) => addRhyme(rhymingDictionary)),
    textUpdate$.map(text => updateText(text)),
    toggleInstructionVisibility$,
    selectRhymeScheme$
  );

  const initialState = {
    text: '',
    notification: '',
    instructionsVisible: true,
    rhymeScheme: 'AABB'
  };

  const state$ = action$.scan((state, action) => action(state), initialState)
    .startWith(initialState)
    .do(function (state) {
      console.log('state', JSON.stringify(state));
    });

  return {
    DOM: state$.map(({text, notification, instructionsVisible, rhymeScheme}) => (
      h('.container', [
        h('button.toggle-instructions', `${instructionsVisible ? 'HIDE' : 'SHOW'} INSTRUCTIONS`),
        h('.instructions', {innerHTML: INSTRUCTIONS, style: {display: instructionsVisible ? 'block' : 'none'}}),
        h('.app-inner', [
          h('button.rhyme', 'RHYME'),
          h('a', {href: 'https://www.wikiwand.com/en/Rhyme_scheme', target: '_blank'}, 'SELECT A RHYME SCHEME'),
          h('.rhyme-schemes', [
            h('input', {type: 'radio', value: 'AABB', name:'rhyme-scheme', checked: rhymeScheme === 'AABB' ? true : false}),
            h('label', 'AABB'),
            h('input', {type: 'radio', name:'rhyme-scheme', value: 'ABAB', checked: rhymeScheme === 'ABAB' ? true : false}),
            h('label', 'ABAB')
          ]),
          h('.text', [
            h('.notification', notification),
            h('textarea', {rows: 18, value: text})
          ])
        ])
      ])
    ))
  };
}

const drivers = {
  DOM: makeDOMDriver('.app')
};

$(() => run(main, drivers));
