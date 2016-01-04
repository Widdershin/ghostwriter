import { appendNextRhyme } from '../helpers';

export default function selectPreviousRhyme (state) {
  const selectedRhymeIndex = previousRhymeIndex(state);
  const previousRhyme = state.availableRhymes[selectedRhymeIndex];
  const text = appendNextRhyme(false, state.text, previousRhyme);

  return Object.assign({}, state, {selectedRhymeIndex, text})
}

function previousRhymeIndex (state) {
  if (state.selectedRhymeIndex === 0) {
    return state.availableRhymes.length - 1
  }

  return state.selectedRhymeIndex - 1
}