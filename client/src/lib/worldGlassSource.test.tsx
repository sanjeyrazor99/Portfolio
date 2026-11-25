import { describe, expect, it } from "vitest";
import { publishWorldFrame, subscribeWorldFrames } from "./worldGlassSource";

describe("live background frame lifecycle", () => {
  it("delivers the source synchronously before the WebGL drawing buffer is cleared", () => {
    const source = {} as HTMLCanvasElement;
    let received: HTMLCanvasElement | undefined;
    const unsubscribe = subscribeWorldFrames(canvas => {
      received = canvas;
    });
    publishWorldFrame(source);
    expect(received).toBe(source);
    unsubscribe();
  });
  it("stops delivery after a glass consumer is disposed", () => {
    let calls = 0;
    const unsubscribe = subscribeWorldFrames(() => {
      calls++;
    });
    publishWorldFrame({} as HTMLCanvasElement);
    unsubscribe();
    unsubscribe();
    publishWorldFrame({} as HTMLCanvasElement);
    expect(calls).toBe(1);
  });
});
