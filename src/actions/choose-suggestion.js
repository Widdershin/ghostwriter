import _ from 'lodash';

import { appendNextRhyme } from '../helpers';

export default function chooseSuggestion (clickedRhyme) {
  return state => {
    const text = appendNextRhyme(false, state.text, clickedRhyme);
    const selectedRhymeIndex = chooseRhymeAtIndex(state.availableRhymes, clickedRhyme);

    const stateUpdates = {
      text,
      selectedRhymeIndex
    }

    return Object.assign({}, state, stateUpdates)
  }
}

function chooseRhymeAtIndex (availableRhymes, rhyme) {
  return _.indexOf(availableRhymes, rhyme);
}