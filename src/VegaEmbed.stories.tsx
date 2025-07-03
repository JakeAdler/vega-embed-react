import React from "react";
import { VegaEmbed } from "./VegaEmbed";

export const Basic = ({
  width,
  height,
}: {
  width?: number;
  height?: number;
}) => {
  return (
    <VegaEmbed
      height={height || 400}
      width={width || 400}
      data={{
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
      }}
      spec={{
        $schema: "https://vega.github.io/schema/vega-lite/v6.json",
        width: "container",
        height: "container",
        autosize: {
          type: "fit",
          contains: "padding",
        },
        data: {
          name: "values",
        },
        params: [
          { name: "selection", select: { type: "point", fields: ["b"] } },
        ],
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
      }}
      options={{
        mode: "vega-lite",
      }}
    />
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
  const FLOOR = 200;
  const CEILING = 600;

  const [dimensions, setDimensions] = React.useState({
    width: 400,
    height: 400,
    direction: "up",
  });

  React.useEffect(() => {
    const interval = setInterval(() => {
      setDimensions((prev) => {
        let direction = prev.direction;
        if (prev.width + 1 === CEILING) {
          direction = "down";
        } else if (prev.width - 1 === FLOOR) {
          direction = "up";
        }
        return {
          width: prev.width + (direction === "up" ? 1 : -1),
          height: prev.height + (direction === "up" ? 1 : -1),
          direction,
        };
      });
    }, 10);
    return () => clearInterval(interval);
  }, []);

  return <Basic width={dimensions.width} height={dimensions.height} />;
};
