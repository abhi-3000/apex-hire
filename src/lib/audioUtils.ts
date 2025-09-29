import * as Tone from 'tone';
const synth = new Tone.Synth().toDestination();
export const playSuccessSound = () => {
  synth.triggerAttackRelease("C5", "8n", Tone.now());
};

export const playStartSound = () => {
  synth.triggerAttackRelease("E5", "8n", Tone.now());
  synth.triggerAttackRelease("G5", "8n", Tone.now() + 0.2);
};

export const playCompletionSound = () => {
  synth.triggerAttackRelease("C5", "8n", Tone.now());
  synth.triggerAttackRelease("E5", "8n", Tone.now() + 0.2);
  synth.triggerAttackRelease("G5", "8n", Tone.now() + 0.4);
};
