import React from 'react';
import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import SpellIcon from 'common/SpellIcon';
import Wrapper from 'common/Wrapper';
import { formatMilliseconds, formatPercentage, formatNumber } from 'common/format';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import Combatants from 'Parser/Core/Modules/Combatants';
import Analyzer from 'Parser/Core/Analyzer';
import HIT_TYPES from 'Parser/Core/HIT_TYPES';

const debug = false;

const PROC_WINDOW_MS = 100;

const HOT_STREAK_CONTRIBUTORS = [
  SPELLS.FIREBALL.id,
  SPELLS.PYROBLAST.id,
  SPELLS.FIRE_BLAST.id,
  SPELLS.SCORCH.id,
  SPELLS.PHOENIXS_FLAMES.id,
];

class HotStreak extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  totalProcs = 0;
  wastedCrits = 0;
  expiredProcs = 0;
  pyroWithoutProc = 0;
  lastCastTimestamp = 0;
  buffAppliedTimestamp = 0;
  hotStreakRemoved = 0;
  bracerProcRemoved = 0;
  castsIntoHotStreak = 0;
  castedBeforeHotStreak = 0;
  noCastBeforeHotStreak = 0;

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (!HOT_STREAK_CONTRIBUTORS.includes(spellId) && spellId !== SPELLS.FLAMESTRIKE.id) {
      return;
    }
    if (spellId === SPELLS.FIREBALL.id || spellId === SPELLS.SCORCH.id) {
      this.castTimestamp = event.timestamp;
    }
    this.lastCastTimestamp = this.owner.currentTimestamp;
    this.pyromaniacProc = false;
  }

  on_byPlayer_damage(event) {
    const spellId = event.ability.guid;
    if (!HOT_STREAK_CONTRIBUTORS.includes(spellId) || !this.combatants.selected.hasBuff(SPELLS.HOT_STREAK.id) || event.hitType !== HIT_TYPES.CRIT) {
      return;
    }
    if ((spellId === SPELLS.FIREBALL.id || spellId === SPELLS.SCORCH.id || spellId === SPELLS.PYROBLAST.id) && this.pyromaniacProc) {
      debug && console.log("Wasted Crit Ignored @ " + formatMilliseconds(event.timestamp - this.owner.fight.start_time));
    } else if (HOT_STREAK_CONTRIBUTORS.includes(spellId)) {
      this.wastedCrits += 1;
      debug && console.log("Hot Streak overwritten @ " + formatMilliseconds(event.timestamp - this.owner.fight.start_time));
    }
  }

  on_toPlayer_applybuff(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.HOT_STREAK.id) {
      return;
    }
    if (this.combatants.selected.hasTalent(SPELLS.PYROMANIAC_TALENT.id) && this.buffAppliedTimestamp - this.hotStreakRemoved < PROC_WINDOW_MS) {
      this.pyromaniacProc = true;
    }
    this.totalProcs += 1;
  }

  on_toPlayer_removebuff(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.HOT_STREAK.id && spellId !== SPELLS.KAELTHAS_ULTIMATE_ABILITY.id) {
      return;
    }
    if (spellId === SPELLS.HOT_STREAK.id) {
      this.hotStreakRemoved = event.timestamp;
    } else if (spellId === SPELLS.KAELTHAS_ULTIMATE_ABILITY.id) {
      this.bracerProcRemoved = event.timestamp;
      return;
    }

    if (!this.lastCastTimestamp || this.lastCastTimestamp + PROC_WINDOW_MS < this.owner.currentTimestamp) {
      this.expiredProcs += 1;
      debug && console.log("Hot Streak proc expired @ " + formatMilliseconds(event.timestamp - this.owner.fight.start_time));
    } else if (this.hotStreakRemoved - PROC_WINDOW_MS < this.castTimestamp || this.hotStreakRemoved - PROC_WINDOW_MS < this.bracerProcRemoved) {
      this.castedBeforeHotStreak += 1;
    } else if (!this.combatants.selected.hasBuff(SPELLS.COMBUSTION.id)) {
      this.noCastBeforeHotStreak += 1;
      debug && console.log("No hard cast before Hot Streak @ " + formatMilliseconds(event.timestamp - this.owner.fight.start_time));
    }
  }

  get usedProcs() {
    return this.totalProcs - this.expiredProcs;
  }

  get expiredProcsPercent() {
    return (this.expiredProcs / this.totalProcs) || 0;
  }

  get hotStreakUtil() {
    return 1 - (this.expiredProcs / this.totalProcs) || 0;
  }

  get castBeforeHotStreakUtil() {
    return 1 - (this.noCastBeforeHotStreak / (this.castedBeforeHotStreak + this.noCastBeforeHotStreak));
  }

  get expiredProcsThresholds() {
    return {
      actual: this.expiredProcsPercent,
      isGreaterThan: {
        minor: 0.05,
        average: 0.10,
        major: 0.20,
      },
      style: 'percentage',
    };
  }

  get wastedCritsThresholds() {
    return {
      actual: this.wastedCrits,
      isGreaterThan: {
        minor: 5,
        average: 10,
        major: 15,
      },
      style: 'number',
    };
  }

  get castBeforeHotStreakThresholds() {
    return {
      actual: this.castBeforeHotStreakUtil,
      isLessThan: {
        minor: .90,
        average: .80,
        major:.70,
      },
      style: 'percentage',
    };
  }

  suggestions(when) {
    when(this.expiredProcsThresholds)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<Wrapper>You allowed {formatPercentage(this.expiredProcsThresholds)}% of your <SpellLink id={SPELLS.HOT_STREAK.id} /> procs to expire. Try to use your procs as soon as possible to avoid this.</Wrapper>)
          .icon(SPELLS.HOT_STREAK.icon)
          .actual(`${formatPercentage(this.expiredProcsPercent)}% expired`)
          .recommended(`<${formatPercentage(recommended)}% is recommended`);
      });
      when(this.wastedCritsThresholds)
        .addSuggestion((suggest, actual, recommended) => {
          return suggest(<span>You crit with {formatNumber(this.wastedCrits)} direct damage abilities while <SpellLink id={SPELLS.HOT_STREAK.id} /> was active. This is a waste since those crits could have contibuted towards your next Hot Streak. Try to use your procs as soon as possible to avoid this.</span>)
            .icon(SPELLS.HOT_STREAK.icon)
            .actual(`${formatNumber(this.wastedCrits)} crits wasted`)
            .recommended(`<${formatNumber(recommended)} is recommended`);
      });
      when(this.castBeforeHotStreakThresholds)
        .addSuggestion((suggest, actual, recommended) => {
          return suggest(<Wrapper>While <SpellLink id={SPELLS.COMBUSTION.id}/> was not active, you failed to <SpellLink id={SPELLS.FIREBALL.id}/> or <SpellLink id={SPELLS.SCORCH.id}/> just before using your <SpellLink id={SPELLS.HOT_STREAK.id}/> {this.noCastBeforeHotStreak} times ({formatPercentage(this.castBeforeHotStreakUtil)}%). Make sure you hard cast Fireball{this.combatants.selected.hasWrists(ITEMS.MARQUEE_BINDINGS_OF_THE_SUN_KING.id) ? `, a hard casted Pyroblast (if you have a bracer proc), ` : ` `}or Scorch just before each instant <SpellLink id={SPELLS.PYROBLAST.id}/> to increase the odds of getting a <SpellLink id={SPELLS.HEATING_UP.id}/> or <SpellLink id={SPELLS.HOT_STREAK.id}/> proc. Additionally, it is also acceptable to use your <SpellLink id={SPELLS.HOT_STREAK.id}/> procs if you need to move.</Wrapper>)
            .icon(SPELLS.HOT_STREAK.icon)
            .actual(`${formatPercentage(this.castBeforeHotStreakUtil)}% Utilization`)
            .recommended(`${formatPercentage(recommended)}% is recommended`);
      });
  }

  statistic() {
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.HOT_STREAK.id} />}
        value={(
          <span>
            <SpellIcon
              id={SPELLS.HOT_STREAK.id}
              style={{
                height: '1.2em',
                marginBottom: '.15em',
              }}
            />
            {' '}{formatPercentage(this.hotStreakUtil, 0)}{' %'}
            <br />
            <SpellIcon
              id={SPELLS.PYROBLAST.id}
              style={{
                height: '1.2em',
                marginBottom: '.15em',
              }}
            />
            {' '}{formatPercentage(this.castBeforeHotStreakUtil, 0)}{' %'}
          </span>
        )}
        label="Hot Streak Utilization"
        tooltip={`Every Hot Streak should be preceded by Fireball${this.combatants.selected.hasWrists(ITEMS.MARQUEE_BINDINGS_OF_THE_SUN_KING.id) ? `, a hard casted Pyroblast (if you have a bracer proc), ` : ` `}or Scorch to increase the chances of gaining a Heating Up or Hot Streak buff. The only time you should not be doing this is during Combustion or when you need to move. Additionally, ensure that you are using all of your Hot Streak Procs and not letting them expire`}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(12);
}

export default HotStreak;
