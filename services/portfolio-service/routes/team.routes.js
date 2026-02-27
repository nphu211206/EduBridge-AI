// routes/team.routes.js
const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const teamService = require('../services/team-builder.service');

router.post('/', authenticate, async (req, res) => {
    try {
        const project = await teamService.createProject(req.user.id, req.body);
        res.json({ success: true, data: project });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.get('/me', authenticate, async (req, res) => {
    try {
        const projects = await teamService.getMyProjects(req.user.id);
        res.json({ success: true, data: projects });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.get('/invites', authenticate, async (req, res) => {
    try {
        const invites = await teamService.getMyInvites(req.user.id);
        res.json({ success: true, data: invites });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.get('/:projectId/candidates/:roleId', authenticate, async (req, res) => {
    try {
        const candidates = await teamService.findCandidates(req.params.projectId, req.params.roleId);
        res.json({ success: true, data: candidates });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.post('/invite', authenticate, async (req, res) => {
    try {
        const { projectId, roleId, invitedUserId, message } = req.body;
        await teamService.inviteUser(projectId, roleId, invitedUserId, req.user.id, message);
        res.json({ success: true, message: 'Invite sent!' });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.put('/invite/:inviteId', authenticate, async (req, res) => {
    try {
        const result = await teamService.respondInvite(req.params.inviteId, req.user.id, req.body.accept);
        res.json({ success: true, data: result });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;
