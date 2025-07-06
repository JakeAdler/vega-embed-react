import React from "react";
import { useVegaEmbed, VegaEmbed } from "./VegaEmbed";
import { vega, type VisualizationSpec } from "vega-embed";

const BasicSpec: VisualizationSpec = {
  $schema: "https://vega.github.io/schema/vega-lite/v6.json",
  data: {
    values: [
      { a: "A", b: 28 },
      { a: "B", b: 55 },
      { a: "C", b: 43 },
      { a: "D", b: 91 },
      { a: "E", b: 81 },
      { a: "F", b: 53 },
      { a: "G", b: 19 },
      { a: "H", b: 87 },
      { a: "I", b: 52 },
    ],
  },
  params: [{ name: "selection", select: { type: "point", fields: ["b"] } }],
  mark: "bar",
  encoding: {
    x: { field: "a", type: "ordinal" },
    y: { field: "b", type: "quantitative" },
    tooltip: { field: "b", type: "quantitative" },
    color: {
      condition: { param: "selection", value: "steelblue" },
      value: "grey",
    },
  },
};

export const Basic = () => {
  return <VegaEmbed spec={BasicSpec} />;
};

export const VegaLite = () => {
  return (
    <VegaEmbed
      spec={{
        $schema: "https://vega.github.io/schema/vega-lite/v6.json",
        data: {
          url: "https://vega.github.io/vega-datasets/data/sp500.csv",
        },
        vconcat: [
          {
            width: 480,
            mark: "area",
            encoding: {
              x: {
                field: "date",
                type: "temporal",
                scale: {
                  domain: { param: "brush" },
                },
                axis: { title: "" },
              },
              y: { field: "price", type: "quantitative" },
            },
          },
          {
            width: 480,
            height: 60,
            mark: "area",
            params: [
              {
                name: "brush",
                select: { type: "interval", encodings: ["x"] },
              },
            ],
            encoding: {
              x: {
                field: "date",
                type: "temporal",
                axis: { format: "%Y" },
              },
              y: {
                field: "price",
                type: "quantitative",
                axis: { tickCount: 3, grid: false },
              },
            },
          },
        ],
      }}
      options={{
        mode: "vega-lite",
      }}
    />
  );
};

export const Vega = () => {
  return (
    <VegaEmbed
      spec="https://vega.github.io/vega/examples/global-development.vg.json"
      options={{
        loader: {
          baseURL: "https://vega.github.io/vega-datasets/",
        },
      }}
    />
  );
};

export const ChangingDimensions = () => {
  const ref = React.useRef<HTMLDivElement>(null);

  const vegaEmbed = useVegaEmbed({
    ref,
    spec: {
      ...BasicSpec,
      width: "container",
      height: "container",
    },
  });

  React.useEffect(() => {
    if (!vegaEmbed) return;
    const FLOOR = 200;
    const CEILING = 600;

    let width = 400;
    let height = 400;
    let direction = "up";

    const interval = setInterval(() => {
      if (width + 1 >= CEILING) {
        direction = "down";
      } else if (width - 1 <= FLOOR) {
        direction = "up";
      }
      width = width + (direction === "up" ? 1 : -1);
      height = height + (direction === "up" ? 1 : -1);

      vegaEmbed.view.width(width).height(height).runAsync();
    }, 10);
    return () => clearInterval(interval);
  }, [vegaEmbed]);

  return <div ref={ref} />;
};

export const Controlled = () => {
  const embedEl = React.useRef<HTMLDivElement>(null);

  const vegaEmbed = useVegaEmbed({
    ref: embedEl,
    spec: {
      $schema: "https://vega.github.io/schema/vega-lite/v6.json",
      data: {
        name: "values",
      },
      width: 400,
      height: 400,
      params: [{ name: "selection", select: { type: "point", fields: ["a"] } }],
      mark: "bar",
      encoding: {
        x: { field: "a", type: "ordinal" },
        y: { field: "b", type: "quantitative" },
        tooltip: { field: "b", type: "quantitative" },
        color: {
          condition: { param: "selection", value: "steelblue" },
          value: "grey",
        },
      },
    },
    onEmbed: (embed) => {
      makeRandomData(embed);
    },
  });

  function makeRandomData(embed: typeof vegaEmbed) {
    if (!embed) return;
    const values: any[] = [];
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    for (let i = 0; i < 9; i++) {
      values.push({
        a: chars[i],
        b: Math.floor(Math.random() * 100),
      });
    }
    const newData = { values };
    embed.view.data("values", newData.values).runAsync();
  }

  return (
    <div>
      {vegaEmbed && (
        <div>
          <div>
            <label>Height</label>
            <input
              style={{ display: "inline-block", marginLeft: "8px" }}
              onChange={(e) =>
                Number(e.target.value) &&
                vegaEmbed.view.height(Number(e.target.value)).runAsync()
              }
            />
          </div>
          <div>
            <label>Width</label>
            <input
              style={{ display: "inline-block", marginLeft: "8px" }}
              onChange={(e) =>
                Number(e.target.value) &&
                vegaEmbed.view.width(Number(e.target.value)).runAsync()
              }
            />
          </div>
          <button
            style={{ display: "block", marginTop: "8px" }}
            onClick={() => makeRandomData(vegaEmbed)}
          >
            Randomize Data
          </button>
        </div>
      )}
      <div ref={embedEl} />
    </div>
  );
};
