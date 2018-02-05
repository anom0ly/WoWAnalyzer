import S from 'common/SPELLS/MONK';

/*
 * Fields:
 * int: spell scales with Intellect
 * crit: spell scales with (is able to or procced from) Critical Strike
 * hasteHpm: spell does more healing due to Haste, e.g. HoTs that gain more ticks
 * hasteHpct: spell can be cast more frequently due to Haste, basically any spell except for non haste scaling CDs
 * mastery: spell is boosted by Mastery
 * masteryStack: spell's HoT counts as a Mastery Stack
 * vers: spell scales with Versatility
 * multiplier: spell scales with whatever procs it, should be ignored for purpose of weights and for 'total healing' number
 * ignored: spell should be ignored for purpose of stat weights
 */

// This only works with actual healing events; casts are not recognized.

// "default" behavior (not spammable, not a HOT)
const def = (changed = {}) => {
  return {
      int: true,
      crit: true,
      vers: true,
      mastery: false,        // only gust of mists entries scale with mastery
      hasteHpm: false,       // true if it is a HOT
      hasteHpct: false,      // true if it is spammable (HPCT currently not calculated though)
      ...changed,
  };
};

export default {
  [S.EFFUSE.id] : def({ hasteHpct : true }),
  [S.ENVELOPING_MISTS.id] : def({ hasteHpm : true, hasteHpct : true }),
  [S.ESSENCE_FONT.id] : def(),
  [S.ESSENCE_FONT_BUFF.id] : def({ hasteHpm : true }),
  [S.LIFE_COCOON.id] : def(),
  [S.RENEWING_MIST_HEAL.id] : def({ hasteHpm : true }),
  [S.REVIVAL.id] : def(),
  [S.SHEILUNS_GIFT.id] : def(),
  //note: uplifting trance would scale with haste. meh...
  [S.VIVIFY.id] : def({ hasteHpct : true }),
  //hpm or hpct? (wouldnt matter much since its free and weak)
  [S.SOOTHING_MIST.id] : def({ hasteHpct : true }),
  [S.CHI_BURST_HEAL.id] : def(),
  [S.REFRESHING_JADE_WIND_HEAL.id] : def({ hasteHpct : true }),
  //hpm or hpct?
  [S.CRANE_HEAL.id] : def({ hasteHpct : true }),
  [S.GUSTS_OF_MISTS.id] : def({ mastery : true }),
  [S.WHISPERS_OF_SHAOHAO.id] : def(),
  [S.MISTS_OF_SHEILUN.id] : def(),
  [S.CELESTIAL_BREATH.id] : def(),
  [S.BLESSINGS_OF_YULON.id] : def(),
  [S.SHELTER_OF_RIN_HEAL.id] : def(), //chest legendary
  [S.TRANQUIL_MIST.id] : def({ hasteHpm : true }), //t21 2p
  [S.CHI_BOLT.id] : def(),  //t21 4p
};