import _ from 'lodash';

export default function addRhyme (rhymingDictionary) {
  return state => {
    const wordToRhyme = findWordToRhyme(state);
    const makingNewRhyme = wordToRhyme !== state.lastWord
    const availableRhymes = rhymesToChooseFrom(makingNewRhyme, rhymingDictionary, state.availableRhymes, wordToRhyme);
    const selectedRhymeIndex = nextRhymeIndex(makingNewRhyme, state);

    if (_.isEmpty(availableRhymes)) {
      return Object.assign({}, state, {notification: 'No Rhymes', rhymeSuggestionsVisible: false});
    }

    const madeRhyme = availableRhymes[selectedRhymeIndex];

    const text = appendNextRhyme(makingNewRhyme, state.text, madeRhyme);

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

function findWordToRhyme (state) {
  const lineToRhymeWith = {
    'AABB': 1,
    'ABAB': 2
  };

  return lastWord(state.text, lineToRhymeWith[state.rhymeScheme]);
}

function lastWord (text, lineOffset) {
  function lineToRhymeWith (lines) {
    if (lines.length > lineOffset) {
      return lines[lines.length - 1 - lineOffset];
    }

    return _.last(lines);
  }

  return _.chain(text)
    .thru(text => text.split('\n'))
    .map(line => _.trim(line).split(' '))
    .select(line => !_.isEmpty(line))
    .thru(lineToRhymeWith)
    .last()
    .value();
}

function rhymesToChooseFrom (makingNewRhyme, rhymingDictionary, availableRhymes, wordToRhyme) {
  if (makingNewRhyme) {
    return rhymingDictionary.rhyme(wordToRhyme);
  }

  return availableRhymes;
}

function nextRhymeIndex (makingNewRhyme, state) {
  if (makingNewRhyme) {
    return 0;
  }

  return (state.selectedRhymeIndex + 1) % state.availableRhymes.length;
}

function appendNextRhyme (makingNewRhyme, text, madeRhyme) {
  if (makingNewRhyme) {
    return `${text.trim()} ${madeRhyme.toLowerCase()}`;
  }

  const words = text.split(' ');

  const textWithoutRhyme = words
    .slice(0, words.length - 1)
    .join(' ');

  return `${textWithoutRhyme.trim()} ${madeRhyme.toLowerCase()}`;
}