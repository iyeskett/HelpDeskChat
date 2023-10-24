"use strict"
function getUser() {
    const userJSON = localStorage.getItem("user");
    if (userJSON) {
        var user = JSON.parse(userJSON);
        return user;
    }

    return null;
}

function setUser(user) {
    localStorage.setItem("user", JSON.stringify(user));
}

function deleteUser() {
    localStorage.removeItem("user");
}