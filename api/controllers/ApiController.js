module.exports.index = (req, res) => {
  res.json({ msg: "get" });
};
module.exports.store = (req, res) => {
  res.json({ msg: "post" });
};
module.exports.update = (req, res) => {
  res.status(405);
  res.json({ msg: "update" });
};
