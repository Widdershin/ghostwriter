export default function selectRhymeScheme (rhymeScheme) {
  return state => Object.assign({}, state, {rhymeScheme});
}