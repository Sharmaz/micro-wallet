const sum = (a: number, b: number) => a + b;

test("sum adds two numbers", () => {
  expect(sum(1, 2)).toBe(3);
});
