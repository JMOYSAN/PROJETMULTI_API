module.exports = (req, res, next) => {
    const currentTime = new Date().toLocaleString();
    console.log(`Request ${req.method} at ${req.url} received at time: ${currentTime}`);
    next();
};
