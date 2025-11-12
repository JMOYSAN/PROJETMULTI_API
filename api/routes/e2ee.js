// routes/e2ee.js
const express = require("express");
const router = express.Router();
const db = require("../db"); // adjust to your knex instance path

// POST /e2ee/devices/register
router.post("/devices/register", async (req, res) => {
    try {
        const { user_id, device_id, ik_pub, sig_pub, spk_pub, spk_sig, opks } = req.body;

        if (!user_id || !device_id || !ik_pub || !sig_pub || !spk_pub || !spk_sig)
            return res.status(400).json({ error: "missing_fields" });

        await db("devices")
            .insert({ user_id, device_id, ik_pub, sig_pub })
            .onConflict(["user_id", "device_id"])
            .ignore();

        await db("prekeys")
            .insert({
                user_id,
                device_id,
                spk_pub,
                spk_sig,
                opk_pub: opks?.[0] || null,
                opk_id: 1,
            })
            .onConflict(["user_id", "device_id"])
            .merge();

        return res.json({ ok: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "server_error" });
    }
});

// GET /e2ee/devices/:userId
router.get("/devices/:userId", async (req, res) => {
    try {
        const devices = await db("devices")
            .join("prekeys", function () {
                this.on("devices.user_id", "prekeys.user_id").andOn(
                    "devices.device_id",
                    "prekeys.device_id"
                );
            })
            .where("devices.user_id", req.params.userId)
            .select(
                "devices.device_id",
                "devices.ik_pub",
                "devices.sig_pub",
                "prekeys.spk_pub",
                "prekeys.spk_sig",
                "prekeys.opk_pub",
                "prekeys.opk_id"
            );

        res.json(devices);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "server_error" });
    }
});

// POST /e2ee/prekeys/claim
router.post("/prekeys/claim", async (req, res) => {
    try {
        const { user_id, device_id } = req.body;
        if (!user_id || !device_id)
            return res.status(400).json({ error: "missing_fields" });

        const prekey = await db("prekeys")
            .where({ user_id, device_id })
            .select("opk_id", "opk_pub")
            .first();

        if (!prekey || !prekey.opk_pub)
            return res.json({ none: true });

        await db("prekeys").where({ user_id, device_id }).update({ opk_pub: null });
        res.json(prekey);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "server_error" });
    }
});

module.exports = router;
