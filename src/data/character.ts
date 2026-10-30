export interface Character {
  name: string; alias: string; id: string; affiliation: string; faction: string;
  occupation?: string; augmentation?: string; threat?: string; clearance?: string;
  status?: string; biography?: string; notes?: string[];
  classified?: { title: string; secret: string; mission: string; passphrase: string };
}
// Fictional sample values. Replace this record with your own character.
export const character: Character = {
  name: 'L3 Ultra', alias: 'den enögde dåren', id: 'NX–077–V',
  affiliation: 'Bruhe Applied Human Systems', faction: 'Independent / unverified',
  // occupation: 'Signal broker', augmentation: '03 modifications detected',
  //threat: 'Neutral', clearance: 'Level 04', status: 'At large',
  // biography: 'A former corporate asset with an expensive taste for trouble. Last seen trading encrypted memories in the lower city. Maintains no fixed address, no known allegiances, and an immaculate cover story.',
  // notes: ['Optical implant serial number has been removed.', 'Subject is not to be approached by unaccompanied personnel.'],
  // classified: {
  //   title: 'The ghost in the network',
  //   secret: 'Subject did not escape Bruhe. Subject purchased Bruhe. The board has not been informed.',
  //   mission: 'Find the wearer of this identity. Deliver the passphrase discreetly to establish contact. Your reward is one extremely classified conversation.',
  //   passphrase: 'Chrome has a memory.'
  // }
};
export const settings = {
  // Keep the unfinished intelligence and breach features available for later.
  showUnfinishedSections: false,
  // Restore the full dossier without removing its data or components.
  showDossierDetails: false,
  boot: { durationMs: 3800, reducedMotionMs: 450, errorDelayMs: 1200 },
  terminalVersion: 'OS 4.09',
  // Change the key to reset saved unlocks when changing the story.
  storageKey: 'nexus-breach-v1',
  bust: { frameCount: 36 as 24 | 36 | 48, path: '/assets/bust', extension: 'webp', secondsPerTurn: 18, resumeAfterMs: 4000, pixelsPerTurn: 380 }
};
