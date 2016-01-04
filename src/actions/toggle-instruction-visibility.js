export default function toggleInstructionVisibility (state) {
  return Object.assign(
    {},
    state,
    {instructionsVisible: !state.instructionsVisible}
  );
}