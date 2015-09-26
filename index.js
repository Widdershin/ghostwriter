import {run, Rx} from '@cycle/core';
import {makeDOMDriver, h} from '@cycle/dom';

function main ({DOM}) {
  const editorText$ = Rx.Observable.just('');
  return {
    DOM: editorText$.map(text => (
      h('textarea.text', text)
    ))
  };
}

const drivers = {
  DOM: makeDOMDriver('.app')
};

run(main, drivers);
