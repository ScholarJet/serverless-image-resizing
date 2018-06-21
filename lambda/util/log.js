const DEBUG = true;

const log = DEBUG ? console.log.bind(console) : () => {};

module.exports.log = log;
