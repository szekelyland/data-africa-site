import React from "react";

import {BarChart} from "d3plus-react";
import {SectionColumns, SectionTitle} from "datawheel-canon";

import {fetchData} from "datawheel-canon";
import {COLORS_POVERTY} from "helpers/colors";
import {tooltipBody} from "helpers/d3plus";
import {DICTIONARY} from "helpers/dictionary";
import {formatPlaceName, FORMATTERS} from "helpers/formatters";
import {povertyContent, makeGeoSelector} from "pages/Profile/poverty/shared";
import Download from "components/Download";

const url = "api/join/?geo=<geoid>&show=year,poverty_level&sumlevel=latest_by_geo,all&required=hc,povgap,sevpov,num,poverty_geo_name,poverty_geo_parent_name";

class Poverty extends SectionColumns {
  constructor(props) {
    super(props);
    this.state = {targetGeo: null};
    this.onChangeGeo = this.onChangeGeo.bind(this);
  }

  onChangeGeo(event) {
    this.setState({targetGeo: event.target.value});
  }

  render() {
    const {embed, profile} = this.props;
    const {povertyLevelData} = this.context.data;
    const level = povertyLevelData[0].geo && povertyLevelData[0].geo !== profile.geo ? "adm0" : profile.level;
    const targetGeo = this.state.targetGeo;
    const {filteredData, vizData, selector} = makeGeoSelector(profile, povertyLevelData,
                                                              targetGeo, this.onChangeGeo);

    return (
      <SectionColumns>

        <article className="section-text">
        <SectionTitle>Poverty Levels</SectionTitle>
          {selector}
          {povertyContent(profile, filteredData)}
          <Download component={ this }
            title={ `Poverty Levels in ${ profile.name } (${ vizData[0].year })` }
            url={ url.replace("<geoid>", povertyLevelData[0].geo).replace("join/", "join/csv/") } />
        </article>
        <BarChart ref={ comp => this.viz = comp } config={{
          data: vizData,
          discrete: "y",
          groupBy: "measure",
          groupPadding: 64,
          height: embed ? undefined : 500,
          label: d => `${DICTIONARY[d.measure]}`,
          shapeConfig: {
            fill: d => COLORS_POVERTY[d.measure],
            label: false
          },
          tooltipConfig: {
            body: d => `${ d.poverty_geo_name !== profile.name ? `<span class="d3plus-body-sub">Based on data from ${formatPlaceName(d, "poverty", level)}</span>` : "" }${tooltipBody.bind(["year", "poverty_prop"])(d)}`
          },
          x: "poverty_prop",
          xConfig: {
            domain: [0, 1],
            tickFormat: FORMATTERS.shareWhole,
            title: "Proportion of Poor Population"
          },
          y: "poverty_level",
          yConfig: {
            tickFormat: d => DICTIONARY[d],
            title: "Poverty Level"
          }
        }} />
    </SectionColumns>
    );
  }
}

Poverty.need = [
  fetchData("povertyLevelData", url)
];

export default Poverty;
