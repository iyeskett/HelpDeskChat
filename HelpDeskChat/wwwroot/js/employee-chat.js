"use strict"

var employeeConnection;
var currentChatId;
var isConnected = false;

function startEmployeeChat() {
    employeeConnection = new signalR.HubConnectionBuilder().withUrl("/ChatHub").withAutomaticReconnect().build();

    employeeConnection.start()
        .then(() => {
            console.info("Connected");
            enableEmployeeChat();
        })
        .catch((err) => {
            console.error(err.toString());
            setTimeout(() => startEmployeeChat(), 5000);
        })
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
    employeeConnection.on("EmployeesReceive", (message, chatId) => {
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

    employeeConnection.on("EmployeesSent", (sent, message, chatId) => {
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

function sendMessageToCustomer(message) {
    employeeConnection.invoke("SendMessageToCustomer", message, parseInt(currentChatId));
}

function showChat(chatId) {
    currentChatId = chatId;

    $(`#newMessages${chatId}`).html('');

    employeeConnection.invoke("GetMessagesByChatId", parseInt(chatId));

    employeeConnection.on("ReceiveMessages", (messages, chat) => {
        var disabled = chat.closed ? "disabled" : ""
        var chatMessage = chat.closed ? "Chat encerrado" : "";

        var htmlMessage = `<div class="col-md-8" id="chat">
            <div class="d-flex justify-content-between">
                <h2>Chat ${chat.id} ${chatMessage ? "- " + chatMessage : ""}</h2>
                <button id="end-button${chat.id}" class="btn bg-danger text-white" style="margin-top: 5px;" onclick="endChat('${chat.id}')" ${disabled}>Encerrar</button>
            </div>

            <div class="chat-container" id="chat-container${chat.id}">
                ${getHtmlMessages(messages)}
            </div>
            <div class="input-container">
                <textarea id="message-input${chat.id}" style="max-height:150px;" class="form-control" placeholder="${chatMessage}" ${disabled} placeholder="${chatMessage}"></textarea>
                <button id="send-button${chat.id}" class="btn btn-primary" style="margin-top: 5px;" ${disabled}>Enviar</button>
            </div>
            </div>`;

        $("#chat").remove();
        $(`#chat-area`).append(htmlMessage);

        var messageInput = $(`#message-input${chat.id}`)[0];
        var sendButton = $(`#send-button${chat.id}`)[0];

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

    employeeConnection.on("ChatClosed", (closed) => {
        if (closed) {
            var endButton = $(`#end-button${currentChatId}`)[0];
            var messageInput = $(`#message-input${currentChatId}`)[0];
            var sendButton = $(`#send-button${currentChatId}`)[0];

            endButton.disabled = true;
            messageInput.disabled = true;
            messageInput.value = "Chat encerrado."
            sendButton.disabled = true;
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

function endChat(chatId) {
    employeeConnection.invoke("EndChat", parseInt(chatId));

    employeeConnection.on("ChatClosed", (closed) => {
        if (closed) {
            var endButton = $(`#end-button${currentChatId}`)[0];
            var messageInput = $(`#message-input${currentChatId}`)[0];
            var sendButton = $(`#send-button${currentChatId}`)[0];

            $(`#${currentChatId}`).addClass("closed");
            $(`#${currentChatId}`).removeClass("open");
            $(`#${currentChatId}`).hide();
            $(`#chat`).remove();
            endButton.disabled = true;
            messageInput.disabled = true;
            messageInput.value = "Chat encerrado."
            sendButton.disabled = true;
        }
    })
}