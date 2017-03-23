import axios from 'axios'
import router from '../router'
import io from 'socket.io-client'

let socket = io('http://localhost:3000')
let api = axios.create({
    baseURL: 'http://localhost:3000/api/',
    timeout: 5000,
    withCredentials: true
})

let state = {
    user: {},
    error: {},
    userResults: [],
    groupResults: [],
    activeProfile: {},
    activeGroup: {},
    activeChat: {}
}

let handleError = (err) => {
    state.error = err
    console.log(err);
}

export default {
    state,
    actions: {
        listenForMessage(){
            socket.on('message', res =>{
            console.log(res.data)
            state.messages.push(res.data)
            console.log('This is from your store', state.messages)
            })
        },
        createChat(profileId){
            api.post('/profile/' + profileId + '/chat')
                .then(res => {
                    state.activeChat = res.data.data;
                    router.push({ path: '/chat/' + state.activeChat._id })
                })
                .catch(handleError);
        },
        sendChatMessage(message, chatId){
            api.post('/chat/' + chatId + '/send', message)
                .then(res => {
                    router.app.$socket.emit('chatMessage');
                })
                .catch(handleError);
        },
        setActiveChat(chatId){
            api('/chat/' + chatId)
                .then(res => {
                    state.activeChat = res.data.data;
                })
        },
        sendGroupMessage(message, groupId){
            api.post('/group/' + groupId + '/send', message)
                .then(res => {
                    router.app.$socket.emit('groupMessage');
                })
                .catch(handleError);
        },
        createGroup(selectedGame, title, description){
            api.post('group/create', {
                title: title,
                game: selectedGame,
                description: description
            })
                .then(res => {
                    state.activeGroup = res.data.data;
                })
                .catch(handleError);
        },
        setActiveGroup(groupId){
            api('group/' + groupId)
                .then(res => {
                    state.activeGroup = res.data.data;
                })
                .catch(handleError);
        },
        joinGroup(group){
            api.put('group/' + group._id + '/join')
                .then(res => {
                    state.activeGroup = res.data.data;
                })
                .catch(handleError);
        },
        leaveGroup(groupId){
            api.put('group/' + groupId + '/leave')
                .then(res => {
                    state.activeGroup = res.data.data;
                })
                .catch(handleError);
        },
        searchGroups(selectedGame){
            api.post('group/findbygame', {
                game: selectedGame
            })
                .then(res => {
                    console.log(res.data.data);
                    state.userResults = [];
                    state.groupResults = res.data.data;
                })
                .catch(handleError);
        },
        searchIndividual(selectedGame){
            console.log('hit the individual');
            api.post('find/individual', {
                game: selectedGame
            })
                .then(res => {
                    let users = res.data.data.forEach(user => {
                        user.password = null;
                    });
                    state.groupResults = [];
                    state.userResults = res.data.data;
                })
        },
        clearSearch(){
            state.userResults = [];
            state.groupResults = [];
        },
        addFriend(profileId){
            api.put('profile/' + profileId + '/invite', {
                username: state.user.username,
                userId: state.user._id
            })
                .then(res => {
                    Materialize.toast('Friend request sent', 1000);
                })
        },
        acceptFriend(invite){
            api.put('invite/accept', invite)
                .then(res => {
                    this.checkLoggedIn();
                })
        },
        declineFriend(invite){
            api.put('invite/decline', invite)
                .then(res => {
                    this.checkLoggedIn();
                })
        },
        setActiveProfile(profileId){
            api('profile/' + profileId)
                .then(res => {
                    state.activeProfile = res.data.data;
                })
                .catch(handleError);
        },
        updateBio(bio){
            api.put('myprofile/update', bio)
                .then(res => {
                    console.log('updated bio')
                    this.checkLoggedIn();
                })
                .catch(handleError);
        },
        login(username, userPass){
            api.post('http://localhost:3000/login', {
                username: username,
                password: userPass
            })
                .then(res => {
                    if(res.data.data){
                        state.user = res.data.data;
                    } else {
                        state.error = res.data.error;
                        Materialize.toast(res.data.error, 1000);
                    }
                })
                .catch(handleError)
        },
        register(username, password){
            api.post('http://localhost:3000/register', {
                username: username,
                password: password
            })
                .then(res => {
                    if(res.data.data){
                        state.user = res.data.data;
                    } else {
                        Materialize.toast('That username is already taken.', 2000);
                    }
                })
                .catch(handleError)
        },
        logout(){
            api.delete('http://localhost:3000/logout')
                .then(res => {
                    state.user = {};
                    Materialize.toast(res.data.message, 1000);
                })
                .catch(handleError);
        },
        checkLoggedIn(){
            api('http://localhost:3000/check-logged-in')
                .then(res => {
                    if(res.data.message){
                        console.log('You are not logged in');
                    } else {
                        let currentUser = res.data.data.friends.forEach(friend => {
                            friend.password = null;
                        })
                        state.user = res.data.data;
                    }
                })
        },
        linkSteam(){
            window.location.href = 'http://localhost:3000/steam/auth';
            // api('http://localhost:3000/steam/auth')
            //     .then(res => {
            //         console.log(res);
            //         state.user = res.data.user;
            //     })
        },
        updateGames(){
            api('http://localhost:3000/steam/update')
                .then(res => {
                    state.user.games = res.data.data;
                    Materialize.toast(res.data.msg, 1000);
                })
                .catch(handleError);
        }
    }
}