export default function updateText (textEnteredByUser) {
  return state => Object.assign({}, state, {text: textEnteredByUser, notification: '', rhymeSuggestionsVisible: false});
}