"use strict"

var customerConnection;

function startCustomerChat() {
    customerConnection = new signalR.HubConnectionBuilder().withUrl("/ChatHub").withAutomaticReconnect().build();
    customerConnection.start()
        .then(() => {
            console.info("Connected");
            var chatInfo = JSON.parse(sessionStorage.getItem("chatInfo"));
            if (chatInfo) {
                customerConnection.invoke("NewConnectionId", chatInfo.id);
                console.info(chatInfo.id, typeof chatInfo.id);
            }
            enableCustomerChat();
        })
        .catch((err) => {
            console.error(err.toString());
            setTimeout(() => startCustomerChat(), 5000);
        })
}

function enableCustomerChat() {
    const chatContainer = document.getElementById('chat-container');
    const chatHeader = document.getElementById('chat-header');
    const closeButton = document.getElementById('close-button');
    const chatBox = document.getElementById('chat-box');
    const messageInput = document.getElementById('message-input');
    const sendButton = document.getElementById('send-button');
    const toggleButton = document.getElementById('toggle-button');

    chatContainer.style.display = 'none';
    toggleButton.style.display = 'block';

    toggleButton.addEventListener('click', function () {
        chatContainer.style.display = 'block';
        toggleButton.style.display = 'none';
    });

    chatHeader.addEventListener('click', function () {
        chatContainer.style.display = 'none';
        toggleButton.style.display = 'block';
    });

    sendButton.addEventListener('click', function () {
        const message = messageInput.value;
        if (message) {
            sendMessage(message);
            messageInput.value = '';
        }
    });

    customerConnection.on("Sent", (sent, message, chatId) => {
        if (sent) {
            var htmlMessage = '<div class="message user-message">Você: ' + message + '</div >';
            $("#chat-box").append(htmlMessage);
            $("#chat-box")[0].scrollTop = 9999999;

            var chatInfo = { id: chatId };
            sessionStorage.setItem("chatInfo", JSON.stringify(chatInfo));
        }
    })

    customerConnection.on("CustomerReceive", (message, chatId) => {
        var htmlMessage = '<div class="message other-message">Agente: ' + message + '</div >';
        $("#chat-box").append(htmlMessage);
        chatBox.scrollTop = 9999999;
    })

    customerConnection.on("ChatClosed", (closed) => {
        console.info(closed);
        if (closed) {
            var messageInput = $(`#message-input`)[0];
            var sendButton = $(`#send-button`)[0];

            messageInput.disabled = true;
            messageInput.value = "Chat encerrado."
            sendButton.disabled = true;

            sessionStorage.removeItem("chatInfo");
        }
    })
}

function sendMessage(message) {
    var chatInfo = JSON.parse(sessionStorage.getItem("chatInfo"));
    var chatId;

    if (chatInfo) {
        chatId = chatInfo.id;
    }
    else {
        chatId = 0;
    }

    customerConnection.invoke("SendMessage", message, chatId);
}