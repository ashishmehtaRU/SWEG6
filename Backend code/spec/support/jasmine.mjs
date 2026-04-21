export default {
  spec_dir: "spec",
  spec_files: [
    "**/*Spec.js",
    "**/*spec.js",
    "**/*Spec.mjs",
    "**/*spec.mjs"
  ],
  helpers: [
    "support/**/*.js",
    "support/**/*.mjs"
  ],
  env: {
    stopSpecOnExpectationFailure: false,
    random: true,
    forbidDuplicateNames: true
  }
}