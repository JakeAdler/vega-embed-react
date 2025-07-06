import React from "react";
import { useVegaEmbed, VegaEmbed } from "./VegaEmbed";
import type { VisualizationSpec } from "vega-embed";

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
  return (
    <VegaEmbed
      spec={BasicSpec}
    /
    >
  );
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

  const result = useVegaEmbed({
    ref,
    spec: {
      ...BasicSpec,
      width: "container",
      height: "container",
    },
  });

  React.useEffect(() => {
    if (!result) return;
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

      result.view.width(width).height(height).runAsync();
    }, 10);
    return () => clearInterval(interval);
  }, [result]);

  return <div ref={ref} />;
};

export const Controlled = () => {
  const [height, setHeight] = React.useState(400);
  const [width, setWidth] = React.useState(400);
  const [data, setData] = React.useState(makeRandomData());

  const embedEl = React.useRef<HTMLDivElement>(null);

  const result = useVegaEmbed({
    ref: embedEl,
    spec: {
      $schema: "https://vega.github.io/schema/vega-lite/v6.json",
      data: { name: "values" },
      width: "container",
      height: "container",
      autosize: {
        type: "fit",
        contains: "padding",
      },
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
  });

  function makeRandomData() {
    const values: any[] = [];
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    for (let i = 0; i < 9; i++) {
      values.push({
        a: chars[i],
        b: Math.floor(Math.random() * 100),
      });
    }
    return { values };
  }

  React.useEffect(() => {
    if (!result) return;
    result.view.data("values", data.values).runAsync();
  }, [data, result]);

  React.useEffect(() => {
    if (!result) return;
    result.view.width(width).height(height).runAsync();
  }, [result, width, height]);

  return (
    <div>
      <div>
        <div>
          <label>Height</label>
          <input
            style={{ display: "inline-block", marginLeft: "8px" }}
            value={height}
            onChange={(e) =>
              Number(e.target.value) && setHeight(Number(e.target.value))
            }
          />
        </div>
        <label>Width</label>
        <input
          style={{ display: "inline-block", marginLeft: "8px" }}
          value={width}
          onChange={(e) =>
            Number(e.target.value) && setWidth(Number(e.target.value))
          }
        />
        <button
          style={{ display: "block", marginTop: "8px" }}
          onClick={() => setData(makeRandomData())}
        >
          Randomize Data
        </button>
      </div>
      <div ref={embedEl} />
    </div>
  );
};
