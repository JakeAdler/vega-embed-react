import React from "react";
import embed, { vega } from "vega-embed";
import type { Result, VisualizationSpec, EmbedOptions } from "vega-embed";
import fastDeepEqual from "fast-deep-equal";

export type UseVegaEmbedParams = {
  ref: React.RefObject<HTMLDivElement | null>;
  spec: VisualizationSpec | string;
  width?: number;
  height?: number;
  options?: EmbedOptions;
  data?: VisualizationSpec["data"];
  onEmbed?: (result: Result) => void;
  onError?: (error: unknown) => void;
};

export function useVegaEmbed(params: UseVegaEmbedParams): Result | null {
  const {
    ref,
    spec,
    onEmbed,
    onError,
    width,
    height,
    options = {},
    data,
  } = params;

  const resultRef = React.useRef<Result | null>(null);

  const runView = React.useCallback(() => {
    if (!resultRef.current) return;
    if (resultRef.current.view.runAsync) {
      resultRef.current.view.runAsync();
    } else {
      resultRef.current.view.run();
    }
  }, []);

  const insertData = React.useCallback(
    (data: VegaEmbedProps["data"]) => {
      if (!resultRef.current || !data) return;
      const keys = Object.keys(data);
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        resultRef.current.view.change(
          key,
          vega
            .changeset()
            .remove(() => true)
            .insert(data[key as keyof typeof data])
        );
      }
      runView();
    },
    [runView]
  );

  const updateDimensions = React.useCallback(() => {
    const v = resultRef.current?.view;
    if (!v) return;
    if (width) {
      v.width(width);
    }
    if (height) {
      v.height(height);
    }
    runView();
  }, [width, height, runView]);

  React.useEffect(() => {
    updateDimensions();
  }, [updateDimensions]);

  useDeepEffect(() => {
    let cancel = false;

    const createView = async () => {
      if (!ref.current || cancel) return;
      try {
        const prev = resultRef.current;
        prev?.finalize();

        const result = await embed(ref.current, spec, options);

        if (cancel) {
          result.view.finalize();
          return;
        }

        resultRef.current = result;

        if (data) {
          insertData(data);
        }

        updateDimensions();

        try {
          if (onEmbed) onEmbed(result);
        } catch (error) {
          console.error(`[vega-embed-react] Error in onEmbed: ${error}`);
        }
      } catch (error) {
        console.error(`[vega-embed-react] Error creating view: ${error}`);
        if (onError) {
          onError(error);
        }
      }
    };

    createView();
    return () => {
      cancel = true;
      resultRef.current?.finalize();
      resultRef.current = null;
    };
  }, [spec, options, insertData]);

  useDeepEffect(() => {
    if (!resultRef.current || !data) return;
    insertData(data);
  }, [data, insertData]);

  return resultRef.current;
}

const useDeepEffect = (
  effect: React.EffectCallback,
  deps: React.DependencyList
) => {
  const prevDeps = React.useRef<React.DependencyList>(null);
  React.useEffect(() => {
    if (!fastDeepEqual(deps, prevDeps.current)) {
      prevDeps.current = deps;
      effect();
    }
  }, deps);
};

export type VegaEmbedProps = Omit<UseVegaEmbedParams, "ref"> &
  React.HTMLAttributes<HTMLDivElement>;

export function VegaEmbed(props: VegaEmbedProps) {
  const { spec, options, data, onEmbed, onError, width, height, ...divProps } =
    props;

  const ref = React.useRef<HTMLDivElement>(null);

  useVegaEmbed({ ref, spec, onEmbed, onError, options, data, width, height });

  return <div ref={ref} {...divProps} />;
}
