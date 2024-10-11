/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import CategoricalColorScale from './CategoricalColorScale';
import { ColorsLookup, ChartColorsLookup } from './types';
import getCategoricalSchemeRegistry from './CategoricalSchemeRegistrySingleton';
import stringifyAndTrim from './stringifyAndTrim';

export default class CategoricalColorNamespace {
  name: string;

  forcedItems: ColorsLookup;
  perChartForcedItems: ChartColorsLookup;

  scales: {
    [key: string]: CategoricalColorScale;
  };

  constructor(name: string) {
    this.name = name;
    this.scales = {};
    this.forcedItems = {};
    this.perChartForcedItems = {};
  }

  getScale(schemeId?: string) {
    const id = schemeId ?? getCategoricalSchemeRegistry().getDefaultKey() ?? '';
    const scheme = getCategoricalSchemeRegistry().get(id);
    return new CategoricalColorScale(
      scheme?.colors ?? [], this.forcedItems, this.perChartForcedItems
    );
  }

  /**
   * Enforce specific color for given value
   * This will apply across all color scales
   * in this namespace.
   * @param {*} value value
   * @param {*} forcedColor color
   */
  setColor(value: string, forcedColor: string, chartId?: string) {
    if (chartId != null) {
      let cleanChartId = stringifyAndTrim(chartId);
      let perChart = this.perChartForcedItems[cleanChartId] || {};
      perChart[stringifyAndTrim(value)] = forcedColor;
      this.perChartForcedItems[cleanChartId] = perChart;
    } else {
      this.forcedItems[stringifyAndTrim(value)] = forcedColor;
    }

    return this;
  }

  resetColors() {
    this.forcedItems = {};
    this.perChartForcedItems = {};
  }
}

const namespaces: {
  [key: string]: CategoricalColorNamespace;
} = {};

export const DEFAULT_NAMESPACE = 'GLOBAL';

export function getNamespace(name: string = DEFAULT_NAMESPACE) {
  const instance = namespaces[name];
  if (instance) {
    return instance;
  }
  const newInstance = new CategoricalColorNamespace(name);
  namespaces[name] = newInstance;

  return newInstance;
}

export function getColor(
  value?: string,
  schemeId?: string,
  namespace?: string,
) {
  return getNamespace(namespace).getScale(schemeId).getColor(value);
}

/*
  Returns a new scale instance within the same namespace.
  Especially useful when a chart is booting for the first time
*/
export function getScale(scheme?: string, namespace?: string) {
  return getNamespace(namespace).getScale(scheme);
}
