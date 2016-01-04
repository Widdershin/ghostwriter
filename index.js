import {run, Rx} from '@cycle/core';
import {makeDOMDriver} from '@cycle/dom';
import CycleTimeTravel from 'cycle-time-travel';
import $ from 'jquery';
import _ from 'lodash';
import rhyme from 'rhyme';

import view from './view';
import intent from './intent';
import model from './model';

Rx.config.longStackSupport = true;

function main ({DOM}) {
  return {
    DOM: view(model(intent({DOM})))
  };
}

const drivers = {
  DOM: makeDOMDriver('.app')
};

$(() => run(main, drivers));
