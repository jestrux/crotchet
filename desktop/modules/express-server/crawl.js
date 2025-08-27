// const fetch = require("node-fetch");
const express = require("express");
const crawlUrl = require("../../utils/crawlUrl");

const router = express.Router();

router.get("/:url", async (req, res) => {
	const response = await crawlUrl(req.params.url);
	res.status(200).json({ success: true, ...response });
});

module.exports = router;
