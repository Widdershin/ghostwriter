export function appendNextRhyme (makingNewRhyme, text, madeRhyme) {
  if (makingNewRhyme) {
    return `${text.trim()} ${madeRhyme.toLowerCase()}`;
  }

  const words = text.split(' ');

  const textWithoutRhyme = words
    .slice(0, words.length - 1)
    .join(' ');

  return `${textWithoutRhyme.trim()} ${madeRhyme.toLowerCase()}`;
}