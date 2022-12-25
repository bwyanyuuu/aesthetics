const notes = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
const addOctaveNumbers = (scale, octaveNumber) => scale.map(note => {
  const firstOctaveNoteIndex = scale.indexOf('C') !== -1 ? scale.indexOf('C') : scale.indexOf('C#')
  const noteOctaveNumber = scale.indexOf(note) < firstOctaveNoteIndex ? octaveNumber - 1 : octaveNumber;
  return `${note}${noteOctaveNumber}`
});
function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}
const generateChords = (num_of_notes, octave_number) => {
  let chord = []
  let high_chord = []
  let bass_note;
  let octave = octave_number
  let index = getRandomInt(notes.length)
  for (let i = 0; i < num_of_notes; i++) {
    if (i==0) bass_note = `${notes[index]}${octave-1}`
    chord.push(`${notes[index]}${octave}`);
    high_chord.push(`${notes[index]}${octave+1}`);
    index += (getRandomInt(2)+1);
    if (index >= notes.length) {
      index -= notes.length
      octave += 1
    }
  }
  return [chord, high_chord, bass_note];
}