import _ from 'lodash';

export default function addRhyme (rhymingDictionary) {
  return state => {
    const wordToRhyme = findWordToRhyme(state);
    let availableRhymes = state.availableRhymes;
    let selectedRhymeIndex = state.selectedRhymeIndex;

    if (wordToRhyme !== state.lastWord) {
      selectedRhymeIndex = 0;

      availableRhymes = rhymingDictionary.rhyme(wordToRhyme);
    } else {
      selectedRhymeIndex = (selectedRhymeIndex + 1) % availableRhymes.length;
    }

    if (_.isEmpty(availableRhymes)) {
      return Object.assign({}, state, {notification: 'No Rhymes', rhymeSuggestionsVisible: false});
    }

    const madeRhyme = availableRhymes[selectedRhymeIndex];

    const text = appendNextRhyme(wordToRhyme, state, madeRhyme);

    const stateUpdates = {
      text,
      notification: '',
      lastWord: wordToRhyme,
      availableRhymes,
      selectedRhymeIndex,
      rhymeSuggestionsVisible: true
    };

    return Object.assign({}, state, stateUpdates);
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