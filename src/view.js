import {h} from '@cycle/dom';

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

function renderApp(state) {
  return (
    h('.container', [
      renderInstructions(state.instructionsVisible),
      h('.app-inner', [
        h('button.rhyme', 'RHYME'),
        renderRhymeSchemeSelector(state.rhymeScheme),
        h('.text', [
          renderRhymeSuggestions(state),
          h('.notification', state.notification),
          h('textarea', {rows: 18, value: state.text})
        ])
      ])
    ])
  )
}

function renderInstructions(instructionsVisible) {
  return (
    h('div', [
      h('a.toggle-instructions', {href: "#"}, `${instructionsVisible ? 'HIDE' : 'SHOW'} INSTRUCTIONS`),
      h('.instructions', {innerHTML: INSTRUCTIONS, style: {display: instructionsVisible ? 'block' : 'none'}})
    ])
  );
}

function renderRhymeSchemeSelector (rhymeScheme) {
  return (
    h('div', [
      h('a', {href: 'https://www.wikiwand.com/en/Rhyme_scheme', target: '_blank'}, 'SELECT A RHYME SCHEME'),
      h('.rhyme-schemes', [
        h('input', {type: 'radio', value: 'AABB', name:'rhyme-scheme', checked: rhymeScheme === 'AABB' ? true : false}),
        h('label', 'AABB'),
        h('input', {type: 'radio', value: 'ABAB', name:'rhyme-scheme', checked: rhymeScheme === 'ABAB' ? true : false}),
        h('label', 'ABAB')
      ])
    ])
  );
}

function renderRhymeSuggestions ({availableRhymes, rhymeSuggestionsVisible, selectedRhymeIndex, caretPosition}) {
  return (
    h('.rhyme-suggestions',
      {
        style: {
          display: rhymeSuggestionsVisible ? 'block' : 'none',
          top: `${caretPosition.top + 55}px`, left: `${caretPosition.left + 15}px`
        }
      },

      availableRhymes.map((rhyme, index) => renderRhymeSuggestion(rhyme, index === selectedRhymeIndex, index))
    )
  )
}

function renderRhymeSuggestion (rhyme, isSelected, key) {
 return h(`.rhyme-suggestion ${isSelected ? '.active' : ''}`, {key}, rhyme)
}

export default function view (state$) {
  return state$.map(renderApp);
}