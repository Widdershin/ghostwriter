import {run, Rx} from '@cycle/core';
import {makeDOMDriver} from '@cycle/dom';

import view from './src/view';
import intent from './src/intent';
import model from './src/model';

Rx.config.longStackSupport = true;

function main ({DOM}) {
  return {
    DOM: view(model(intent({DOM})))
  };
}

const drivers = {
  DOM: makeDOMDriver('.app')
};

run(main, drivers)
