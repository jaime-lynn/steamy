let Groups = require('../models/group');
let Users = require('../models/user');
let Chats = require('../models/chat');
let Messages = require('../models/message');

export default {
    createGroup: {
        path: '/group/create',
        reqType: 'post',
        method(req, res, next) {
            let action = 'Create group'
            Groups.create(req.body)
                .then(group => {
                    group.members.push(req.session.uid);
                    group.save()
                        .then(group => {
                            Users.findById(req.session.uid)
                                .then(user => {
                                    user.groups.push(group._id);
                                    user.save();
                                    res.send(handleResponse(action, group))
                                })
                        })
                })
                .catch(error => {
                    return next(handleResponse(action, null, error))
                })
        }
    },
    joinGroup: {
        path: '/group/:id/join',
        reqType: 'put',
        method(req, res, next){
            let action = 'Join group'
            var opts = [
                { path: 'chatHistory'}
                , { path: 'members', select: '_id username avatar steamId' }
            ]
            Groups.findById(req.params.id)
                .then(group => {
                    group.members.push(req.session.uid);
                    group.save()
                    Users.findById(req.session.uid)
                        .then(user => {
                            user.groups.push(group._id);
                            user.save()
                                .then(user => {
                                    Groups.findById(group._id).populate(opts)
                                        .then(group => {
                                            res.send(handleResponse(action, group))
                                        })
                                })
                        })
                })
                .catch(error => {
                    return next(handleResponse(action, null, error))
                })
        }
    },
    leaveGroup: {
        path: '/group/:id/leave',
        reqType: 'put',
        method(req, res, next){
            let action = 'Leave group'
            Groups.findById(req.params.id)
                .then(group => {
                    let userIndex = group.members.indexOf(req.session.uid);
                    group.members.splice(userIndex, 1);
                    group.save()
                        .then(group => {
                            Users.findById(req.session.uid)
                                .then(user => {
                                    let groupIndex = user.groups.indexOf(group._id);
                                    user.groups.splice(groupIndex, 1);
                                    user.save()
                                        .then(user => {
                                            res.send(handleResponse(action, group))
                                        })
                                })
                        })
                })
                .catch(error => {
                    return next(handleResponse(action, null, error))
                })
        }
    },
    findGroupByGame: {
        path: '/group/findbygame',
        reqType: 'post',
        method(req, res, next) {
            let action = 'Find groups by game'
            Groups.find({ game: req.body.game })
                .then(groups => {
                    let sortedGroups = groups.sort(function (a, b) {
                        return b.members.length - a.members.length
                    })
                    res.send(handleResponse(action, sortedGroups))
                })
                .catch(error => {
                    return next(handleResponse(action, null, error))
                })
        }
    },
    findGroupByTitle: {
        path: '/group/findbytitle',
        reqType: 'post',
        method(req, res, next) {
            let action = 'Find groups by title'
            Groups.find({ title: { "$regex": req.body.title, "$options": "i" } })
                .then(groups => {
                    let sortedGroups = groups.sort(function (a, b) {
                        return b.members.length - a.members.length
                    })
                    res.send(handleResponse(action, sortedGroups))
                })
                .catch(error => {
                    return next(handleResponse(action, null, error))
                })
        }
    },
    getSpecificGroup: {
        path: '/group/:id',
        reqType: 'get',
        method(req, res, next) {
            let action = 'Go to specific group'
            var opts = [
                { path: 'chatHistory'}
                ,{ path: 'members', select: '_id username avatar steamId' }
            ]
            Groups.findById(req.params.id).populate(opts)
                .then(group => {
                    if(group.chatHistory.length > 50){
                        group.chatHistory = group.chatHistory.slice(group.chatHistory.length - 50, 50)
                    }
                    res.send(handleResponse(action, group))
                })
                .catch(error => {
                    return next(handleResponse(action, null, error))
                })
        }
    },
    sendGroupMessage: {
        path: '/group/:id/send',
        reqType: 'post',
        method(req, res, next){
            let action = 'send group message'
            Messages.create({
                username: req.body.username,
                userId: req.session.uid,
                content: req.body.message
            }).then(message => {
                Groups.findById(req.params.id)
                .then(group => {
                    group.chatHistory.push(message._id)
                    group.save()
                    res.send(handleResponse(action, message))
                })
            })
        }
    }
}

function handleResponse(action, data, error) {
    var response = {
        action: action,
        data: data
    }
    if (error) {
        response.error = error;
    }
    return response;
}