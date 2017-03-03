let Groups = require('../models/group');
let Users = require('../models/user');
let Chats = require('../models/chat');

export default {
    sendInvite: {
        path: '/profile/:id/invite',
        reqType: 'put',
        method(req, res, next){
            let action = 'Send invite'
            Users.findById(req.params.id)
            .then(user=>{
                user.invites.push(req.body)
                user.save()
                res.send(handleResponse(action, { message: 'Successfully sent friend request', user: user }))
            })
        }
    },
    acceptInvite: {
        path: '/invite/accept',
        reqType: 'put',
        method(req, res, next){
            let action = 'Accept invite'
            Users.findById(req.session.uid)
            .then(user=>{
                user.friends.push(req.body.userId)
                let index = user.invites.indexOf(req.body)
                user.invites.splice(index, 1)
                user.save()
                Users.findById(req.body.userId)
                .then(friendUser =>{
                    friendUser.friends.push(req.session.uid)
                    friendUser.save()
                    res.send(handleResponse(action, user))
                })
            })
            .catch(error=>{
                return next(handleResponse(action, null, error))
            })
        }
    },
    declineInvite: {
        path: '/invite/decline',
        reqType: 'put',
        method(req, res, next){
            let action = 'Decline invite'
            Users.findById(req.session.uid)
            .then(user=>{
                let index = user.invites.indexOf(req.body)
                user.invites.splice(index, 1)
                user.save()
                res.send(handleResponse(action, user))
            })
            .catch(error=>{
                return next(handleResponse(action, null, error))
            })
        }
    },
    addToGroup: {
        path: 'profile/:id/groupadd',
        reqType: 'put',
        method(req, res, next){
            let action = 'Add to group'
            Users.findById(req.params.id)
            .then(user =>{
                user.groups.push(req.body.groupId)
                user.save()
                Groups.findById(req.body.groupId)
                .then(group=>{
                    group.members.push(req.params.id)
                    group.save()
                    res.send(handleResponse(action, group))
                })
            })
            .catch(error=>{
                return next(handleResponse(action, null, error))
            })
        }
    },
    updateBio: {
        path: 'myprofile/update',
        reqType: 'put',
        method(req, res, next){
            let action = 'Update bio'
            Users.findByIdAndUpdate(req.session.uid, {$set: {bio: req.body.bio}})
            .then(user =>{
                res.send(action, user)
            })
            .catch(error=>{
                return next(handleResponse(action, null, error))
            })
        }
    }
}

function handleResponse(action, data, error){
    var response = {
        action: action,
        data: data
    }
    if(error){
        response.error = error;
    }
    return response;
}