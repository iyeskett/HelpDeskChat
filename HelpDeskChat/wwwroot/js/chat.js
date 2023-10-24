"use strict"

var connection = new signalR.HubConnectionBuilder().withUrl("/ChatHub").withAutomaticReconnect().build();
var currentChatId;
var isConnected = false;

start();

function changeChats() {
    var selectChats = document.querySelector("#selectChats");
    if (selectChats.value == 'open') {
        showOpenChats();
    }
    else {
        showClosedChats();
    }
}

function showOpenChats() {
    var open = document.querySelectorAll('.open');
    var closed = document.querySelectorAll('.closed');

    open.forEach((chat) => {
        chat.style.display = 'block';
    })

    closed.forEach((closed) => {
        closed.style.display = 'none';
    })
}

function showClosedChats() {
    var open = document.querySelectorAll('.open');
    var closed = document.querySelectorAll('.closed');

    open.forEach((chat) => {
        chat.style.display = 'none';
    })

    closed.forEach((closed) => {
        closed.style.display = 'block';
    })
}

function start() {
    connection.start()
        .then(() => {
            console.info("Connected");
            var chatInfo = JSON.parse(sessionStorage.getItem("chatInfo"));
            if (chatInfo) {
                connection.invoke("NewConnectionId", chatInfo.id);
                console.info(chatInfo.id, typeof chatInfo.id);
            }
        })
        .catch((err) => {
            console.error(err.toString());
            setTimeout(() => start(), 5000);
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

    connection.invoke("SendMessage", message, chatId);
}

function sendMessageToCustomer(message) {
    connection.invoke("SendMessageToCustomer", message, parseInt(currentChatId));
}

function enableEmployeeChat() {
    var messageInput = $(`#message-input${currentChatId}`)[0];
    var sendButton = $(`#send-button${currentChatId}`)[0];

    if (sendButton) {
        sendButton.addEventListener('click', () => {
            var messageText = messageInput.value;
            if (messageText) {
                sendMessageToCustomer(messageText);
                messageInput.value = '';
            }
        })
    }

    console.info("Chat iniciado");
    connection.on("EmployeesReceive", (message, chatId) => {
        var html = `<li class="list-group-item" id="${chatId}" onclick="showChat('${chatId}')">Chat ${chatId} <strong style="color:green" id="newMessages${chatId}"></strong></li>`;

        var chatItem = $(`#${chatId}`)[0];
        if (!chatItem) {
            $(".list-group").prepend(html);
        } else {
            html = $(`#${chatId}`)[0];
            $(`#${chatId}`).remove();
            $(".list-group").prepend(html);
        }

        var htmlMessage;
        if (chatId == currentChatId) {
            htmlMessage = `<div class="message other-message">Cliente: ${message}</div >`;

            $(`#chat-container${chatId}`).append(htmlMessage);
        } else {
            var count = $(`#newMessages${chatId}`).text();

            $(`#newMessages${chatId}`).html(++count);
        }

        $(`#chat-container${chatId}`).scrollTop = 9999999;
    })

    connection.on("EmployeesSent", (sent, message, chatId) => {
        if (sent) {
            var htmlMessage = `<div class="message user-message">Você: ${message}</div >`;
            $(`#chat-container${chatId}`).append(htmlMessage);
            $(`#chat-container${chatId}`)[0].scrollTop = 9999999;

            var html = $(`#${chatId}`)[0];
            $(`#${chatId}`).remove();
            $(".list-group").prepend(html);
        }
    })
}

function showChat(chatId) {
    currentChatId = chatId;

    $(`#newMessages${chatId}`).html('');

    connection.invoke("GetMessagesByChatId", parseInt(chatId));

    connection.on("ReceiveMessages", (messages, chat) => {
        var disabled = chat.closed ? "disabled" : ""
        var chatMessage = chat.closed ? "Chat encerrado" : "";

        var htmlMessage = `<div class="col-md-8" id="chat">
            <div class="d-flex justify-content-between">
                <h2>Chat ${chat.id} ${chatMessage ? "- " + chatMessage : ""}</h2>
                <button id="send-button10" class="btn bg-danger text-white" style="margin-top: 5px;" ${disabled}>Encerrar</button>
            </div>

            <div class="chat-container" id="chat-container${chat.id}">
                ${getHtmlMessages(messages)}
            </div>
            <div class="input-container">
                <textarea id="message-input${chat.id}" style="max-height:150px;" class="form-control" placeholder="${chatMessage}" ${disabled}></textarea>
                <button id="send-button${chat.id}" class="btn btn-primary" style="margin-top: 5px;" ${disabled}>Enviar</button>
            </div>
            </div>`;

        $("#chat").remove();
        $(`#chat-area`).append(htmlMessage);

        var messageInput = $(`#message-input${currentChatId}`)[0];
        var sendButton = $(`#send-button${currentChatId}`)[0];

        if (sendButton) {
            sendButton.addEventListener('click', () => {
                var messageText = messageInput.value;
                if (messageText) {
                    sendMessageToCustomer(messageText);
                    messageInput.value = '';
                }
            })
        }
    })

    function getHtmlMessages(messages) {
        var html = '';

        messages.forEach((msg) => {
            var htmlClass = msg.sender == "Employee" ? "user" : "other";
            var sender = msg.sender == "Employee" ? "Você" : "Cliente";
            html += `<div class="message ${htmlClass}-message">${sender}: ${msg.text}</div> \n`
        })

        return html;
    }
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

    connection.on("Sent", (sent, message, chatId) => {
        if (sent) {
            var htmlMessage = '<div class="message user-message">Você: ' + message + '</div >';
            $("#chat-box").append(htmlMessage);
            $("#chat-box")[0].scrollTop = 9999999;

            var chatInfo = { id: chatId };
            sessionStorage.setItem("chatInfo", JSON.stringify(chatInfo));
        }
    })

    connection.on("CustomerReceive", (message, chatId) => {
        var htmlMessage = '<div class="message other-message">Agente: ' + message + '</div >';
        $("#chat-box").append(htmlMessage);
        chatBox.scrollTop = 9999999;
    })
    //messageInput.addEventListener('keypress', function (e) {
    //    if (e.key === 'Enter') {
    //        sendButton.click();
    //    }
    //});
}