export default {
  "*.{js,jsx,ts,tsx}": ["prettier --write", () => "bunx turbo run lint:fix"],
  "*.sol": ['bash -c "cd contracts && forge fmt"'],
};
