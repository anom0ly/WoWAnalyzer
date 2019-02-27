import React from 'react';
import { Trans } from '@lingui/macro';

import NewsIcon from 'interface/icons/Megaphone';
import MasteryRadiusImage from 'interface/images/mastery-radius.png';
import ScrollFilledIcon from 'interface/icons/ScrollFilled';
import ChangelogPanel from 'interface/home/ChangelogPanel';
import Panel from 'interface/others/Panel';

class About extends React.PureComponent {
  render() {
    return (
      <>
        <Panel
          title="About WoWAnalyzer"
        >
          <img src={MasteryRadiusImage} alt="Mastery radius" className="pull-right" style={{ margin: 15 }} />
          <Trans>
            WoWAnalyzer is a tool to help you analyze and improve your World of Warcraft raiding performance through various relevant metrics and gameplay suggestions.<br /><br />

            We give detailed insight into various things such as cast behavior, buff uptimes, downtime, cooldown usage, wasted resources and more. We also give insight into useful and interesting statistics such as the (throughput) gain of your talents, trinkets, traits, set bonuses, and other special items and effects.<br /><br />

            Using all this data we provide automatic gameplay suggestions that analyzes your actual behavior in a fight and gives pointers to help you improve your performance.<br /><br />

            The analysis is custom for each specialization to focus on the things that are important for your spec. It's created by and together with class experts to give you the best possible insights.<br /><br />

            Using WoWAnalyzer you will find a wealth of information about the mechanics of your spec, your actual behavior in fights and the optimal playstyle. Analyze your raids after every raid night to continuously improve your performance and become a better player. Whether you're a new player learning a spec for the first time or an experienced player looking for information to help you min-max, WoWAnalyzer is a great tool to have in your arsenal!
          </Trans><br /><br />

          <Trans>Wondering how to use WoWAnalyzer? See the <a href="https://www.wowhead.com/how-to-use-wowanalyzer"><img src="/img/wowhead-tiny.png" style={{ height: '1em' }} alt="Wowhead" /> Wowhead guide</a>. If you want to see an example report, click on your spec in the <a href="/#Specializations">Specializations</a> list.</Trans>
        </Panel><br />

        <header>
          <div className="row">
            <div className="col-md-12 text-center">
              <h1><ScrollFilledIcon /> <Trans>Changelog</Trans></h1>
            </div>
          </div>
        </header>

        <div className="row">
          <div className="col-md-12">
            <ChangelogPanel />
          </div>
        </div>
      </>
    );
  }
}

export default About;
