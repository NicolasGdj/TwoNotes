module.exports = {
  async whoami(req, res) {
    // #swagger.tags = ['JWT']
    // #swagger.summary = 'Who am i'
    /* #swagger.security = [{
        "apiKeyAuth": []
    }]
    */
    res.status(200).json({ data: req.tokenDecoded });
  },
};
