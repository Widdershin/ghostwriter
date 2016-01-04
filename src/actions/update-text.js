export default function updateText (textEnteredByUser) {
  return state => {
    return Object.assign(
      {},
      state,
      {
        text: textEnteredByUser,
        notification: '',
        rhymeSuggestionsVisible: false
      }
    )
  };
}