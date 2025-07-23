const winston = require("winston");

// Customize the colors for each level
winston.addColors({
  levels: {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    http: 'magenta',
    verbose: 'cyan',
    debug: 'blue',
    silly: 'rainbow', // Rainbow is used for silly logs
  },
  colors: {
    error: 'bold red',
    warn: 'bold yellow',
    info: 'bold green',
    http: 'bold magenta',
    verbose: 'bold cyan',
    debug: 'bold blue',
    silly: 'bold rainbow',
  }
});

// Set the log format to colorize and include a timestamp
const logFormat = winston.format.combine(
  winston.format.colorize(),  // Adds color to log levels
  winston.format.timestamp(),  // Adds timestamp
  winston.format.printf(({ timestamp, level, message }) => {
    return `${timestamp} [${level}]: ${message}`;
  })
);

// Check for production environment to change format
const isProduction = process.env.NODE_ENV === "production";

// Create the logger
const logger = winston.createLogger({
  level: "debug",  // Default level for logging
  levels: winston.config.npm.levels,  // Default log levels
  format: isProduction ? winston.format.json() : logFormat,  // Different format for production and development
  transports: [
    new winston.transports.Console({
      format: logFormat,  // Apply colorize and custom format for console output
    }),
  ],
  exitOnError: false,  // Keeps logging even if an uncaught exception occurs
});

module.exports = logger;
