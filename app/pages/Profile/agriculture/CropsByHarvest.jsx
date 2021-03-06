import React from "react";

import {sum} from "d3-array";
import {Treemap} from "d3plus-react";
import {SectionColumns, SectionTitle} from "datawheel-canon";

import {fetchData} from "datawheel-canon";
import {COLORS_CROP} from "helpers/colors";
import {tooltipBody} from "helpers/d3plus";
import {FORMATTERS, VARIABLES} from "helpers/formatters";
import Download from "components/Download";

const url = "api/join/?geo=<geoid>&sumlevel=lowest&show=crop&required=harvested_area,value_of_production,crop_parent,crop_name&order=harvested_area&sort=desc";

class CropsByHarvest extends SectionColumns {

  render() {

    const {embed, profile} = this.props;
    const data = this.context.data.harvested_area;
    const total = sum(data, d => d.harvested_area);


    return (
      <SectionColumns>

        <article className="section-text">
          <SectionTitle>Crops by Harvested Area</SectionTitle>
          <div className="stat">
            <div className="stat-value">{ data[0].crop_name }</div>
            <div className="stat-label">Most Common Crop by Harvested Area</div>
            <div className="data-source">Data provided by <a href="http://www.ifpri.org/publication/cell5m-geospatial-data-and-analytics-platform-harmonized-multi-disciplinary-data-layers" target="_blank">IFPRI's Cell5M Repository</a></div>
          </div>
          <p>
            In { data[0].year }, the most common crop in { profile.name } by harvested area was { data[0].crop_name } with <strong>{ VARIABLES.harvested_area(data[0].harvested_area) }</strong>.
          </p>
          <Download component={ this }
            title={ `Crops by Harvested Area in ${ profile.name } (${ data[0].year })` }
            url={ url.replace("<geoid>", data[0].geo).replace("join/", "join/csv/") } />
        </article>
        <Treemap ref={ comp => this.viz = comp } config={{
          data,
          groupBy: ["crop_parent", "crop_name"],
          height: embed ? undefined : 450,
          label: d => d.crop_name instanceof Array ? d.crop_parent : d.crop_name,
          shapeConfig: {
            fill: d => COLORS_CROP[d.crop_parent]
          },
          tooltipConfig: {
            body: tooltipBody.bind(["harvested_area", d => `<span class="d3plus-body-key">Share:</span> <span class="d3plus-body-value">${ FORMATTERS.share(d.harvested_area / total) }</span>`])
          },
          sum: d => d.harvested_area
        }} />
    </SectionColumns>
    );
  }
}

CropsByHarvest.need = [
  fetchData("harvested_area", url)
];

export default CropsByHarvest;
