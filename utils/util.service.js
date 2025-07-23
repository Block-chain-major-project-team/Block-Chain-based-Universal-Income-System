const toOriginal = require("await-to-js").to;
const pe = require("parse-error");

// Async/Await error handling wrapper
module.exports.to = async (promise) => {
    const [err, res] = await toOriginal(promise);
    if (err) return [pe(err), null];
    return [null, res];
};

// Error Web Response
module.exports.ReE = (res, err, code = 422) => {
    let errorMessage = err;
    if (typeof err === "object" && err.message) {
        errorMessage = err.message;
    }
    return res.status(code).json({ success: false, error: errorMessage });
};

// Success Web Response
module.exports.ReS = (res, data, code = 200) => {
    return res.status(code).json({ success: true, ...data });
};

// Throw Error Utility (TE stands for Throw Error)
module.exports.TE = (err_message, log = false) => {
    if (log) {
        console.error(err_message);
    }
    throw new Error(err_message);
};