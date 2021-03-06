import React from "react";

import {sum} from "d3-array";

import {BarChart, Treemap} from "d3plus-react";
import {SectionRows, SectionColumns, SectionTitle} from "datawheel-canon";
import {titleCase} from "d3plus-text";

import {fetchData} from "datawheel-canon";
import {tooltipBody} from "helpers/d3plus";
import {FORMATTERS, VARIABLES} from "helpers/formatters";
import Selector from "components/Selector";
import {COLORS_CROP} from "helpers/colors";
import Download from "components/Download";

const url = "api/join/?geo=<geoid>&sumlevel=lowest,lowest&show=crop,water_supply&required=crop_parent,harvested_area,value_of_production,crop_name";

class CropsBySupply extends SectionRows {
  constructor(props) {
    super(props);
    this.state = {metric: "harvested_area"};
    this.onChange = this.onChange.bind(this);
  }

  onChange(event) {
    this.setState({metric: event.target.value});
  }

  render() {

    const {embed, profile} = this.props;
    const {metric} = this.state;
    const {waterData} = this.context.data;
    const irrData = waterData.filter(x => x.water_supply === "irrigated");
    const rainData = waterData.filter(x => x.water_supply === "rainfed");
    const metricLabel = metric === "harvested_area" ? "harvested area" : "production value";
    const irrTotal = sum(irrData, d => d[metric]);
    const rainTotal = sum(rainData, d => d[metric]);
    const totalHa = sum(waterData, d => d[metric]);

    const pctRainfall = rainTotal / (rainTotal + irrTotal);
    const opts = [{value: "harvested_area", label: "Harvested Area"},
                  {value: "value_of_production", label: "Production Value"}];
    return (
      <SectionColumns>
        <article className="section-text">
          <SectionTitle>Water Supply for Crops</SectionTitle>
          <Selector options={opts} callback={this.onChange}/>
          <div className="stat-flex">
            <div className="stat">
              <div className="stat-value">{ FORMATTERS.shareWhole(pctRainfall) }</div>
              <div className="stat-label">Rainfed</div>
            </div>
            <div className="stat">
              <div className="stat-value">{ FORMATTERS.shareWhole(1 - pctRainfall) }</div>
              <div className="stat-label">Irrigated</div>
            </div>
          </div>
          <p>
            In { waterData[0].year }, <strong>{FORMATTERS.shareWhole(pctRainfall)}</strong> of the crops produced in {profile.name} by {metricLabel} were rainfed, compared to <strong>{FORMATTERS.shareWhole(1 - pctRainfall)}</strong> irrigated.
          </p>
          <Download component={ this }
            title={ `Water Supply for Crops by ${ titleCase(metricLabel) } in ${ profile.name } (${ waterData[0].year })` }
            url={ url.replace("<geoid>", waterData[0].geo).replace("join/", "join/csv/") } />
          <div className="data-source">Data provided by <a href="http://www.ifpri.org/publication/cell5m-geospatial-data-and-analytics-platform-harmonized-multi-disciplinary-data-layers" target="_blank">IFPRI's Cell5M Repository</a></div>
        </article>
        <SectionRows ref={ comp => this.viz = comp }>
          <div className="noFlex">
            <BarChart config={{
              barPadding: 0,
              data: waterData.sort(a => a.water_supply === "rainfed" ? -1 : 1),
              discrete: "y",
              groupBy: ["water_supply"],
              groupPadding: 0,
              height: 150,
              label: d => titleCase(d.water_supply),
              legendTooltip: {
                body: tooltipBody.bind([metric, d => `<span class="d3plus-body-key">Share:</span> <span class="d3plus-body-value">${ FORMATTERS.shareWhole(d.water_supply === "rainfed" ? pctRainfall : 1 - pctRainfall) }</span>`])
              },
              shapeConfig: {
                fill: d => d.water_supply === "rainfed" ? "#A0C9E6" : "#0477C1",
                label: d => d[metric] > totalHa / 5 ? titleCase(d.water_supply) : false,
                Bar: {
                  labelConfig: {
                    textAnchor: "center"
                  }
                }
              },
              stacked: true,
              tooltipConfig: {
                body: tooltipBody.bind([metric, d => `<span class="d3plus-body-key">Share:</span> <span class="d3plus-body-value">${ FORMATTERS.shareWhole(d.water_supply === "rainfed" ? pctRainfall : 1 - pctRainfall) }</span>`])
              },
              x: metric,
              xConfig: {
                tickFormat: VARIABLES[metric],
                title: titleCase(metricLabel)
              },
              y: () => "",
              yConfig: {
                gridSize: 0,
                tickFormat: d => titleCase(d),
                title: ""
              }
            }} />
          </div>
          <SectionColumns>
            <Treemap config={{
              data: rainData,
              groupBy: ["crop_parent", "crop_name"],
              height: embed ? undefined : 250,
              label: d => d.crop_name instanceof Array ? d.crop_parent : d.crop_name,
              legend: false,
              shapeConfig: {
                fill: d => COLORS_CROP[d.crop_parent]
              },
              tooltipConfig: {
                body: tooltipBody.bind([metric, d => `<span class="d3plus-body-key">Share:</span> <span class="d3plus-body-value">${ FORMATTERS.share(d[metric] / rainTotal) }</span>`])
              },
              sum: d => d[metric],
              title: `Rainfed Crops (${FORMATTERS.shareWhole(pctRainfall)} of crops)`
            }} />

            <Treemap config={{
              data: irrData,
              groupBy: ["crop_parent", "crop_name"],
              height: embed ? undefined : 250,
              label: d => d.crop_name instanceof Array ? d.crop_parent : d.crop_name,
              legend: false,
              shapeConfig: {
                fill: d => COLORS_CROP[d.crop_parent]
              },
              tooltipConfig: {
                body: tooltipBody.bind([metric, d => `<span class="d3plus-body-key">Share:</span> <span class="d3plus-body-value">${ FORMATTERS.share(d[metric] / irrTotal) }</span>`])
              },
              sum: d => d[metric],
              title: `Irrigated Crops (${FORMATTERS.shareWhole(1 - pctRainfall)} of crops)`
            }} />
          </SectionColumns>
        </SectionRows>
      </SectionColumns>
    );
  }
}

CropsBySupply.need = [
  fetchData("waterData", url)
];

export default CropsBySupply;
