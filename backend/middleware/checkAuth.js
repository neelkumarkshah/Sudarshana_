module.exports = (req, res, next) => {
  try {
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ message: "Authentication required!" });
    }

    req.userData = { userId: req.session.userId };
    return next();
  } catch (err) {
    return res.status(403).json({ message: "Authentication failed!" });
  }
};
