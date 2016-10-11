import "run-with-mocha";
import assert from "assert";
import clone from "lodash.clonedeep";
import * as actionCreators from "../../../src/client/actions";
import reducer from "../../../src/client/reducer";

describe("reducer", () => {
  it("init state", () => {
    const initState = clone(reducer(undefined, {}));

    assert(typeof initState === "object");
  });

  it("set state", () => {
    const action = actionCreators.setState({ value: 100 });
    const initState = clone(reducer(undefined, {}));
    const expected = clone(initState); {
      expected.value = 100;
    }
    const actual = reducer(initState, action);

    assert(actual !== initState);
    assert.deepEqual(actual, expected);
    assert(actual.data === initState.data);
  });
});
