"use strict"

var employeeConnection = new signalR.HubConnectionBuilder().withUrl('/ChatHub').withAutomaticReconnect().build();
var currentChatId;
var isConnected = false;

function startEmployeeChat() {
    employeeConnection.start()
        .then(() => {
            enableEmployeeChat();
        })
        .catch((err) => {
            console.error(err.toString());
            setTimeout(() => startEmployeeChat(), 5000);
        })
}

function enableEmployeeChat() {
    var messageInput = $(`#message-input${currentChatId}`);
    var sendButton = $(`#send-button${currentChatId}`);

    if (sendButton) {
        sendButton.click(() => {
            var messageText = messageInput.val();
            if (messageText) {
                sendMessageToCustomer(messageText);
                messageInput.val('');
            }
        })
    }

    employeeConnection.on('EmployeesReceive', (message, isImage,chat) => {
        var startTime = new Date(chat.startTime);
        var html = `<li class="list-group-item open" id="${chat.id}" onclick="showChat('${chat.id}')">
        Chat ${chat.id}
        <strong style="color:green" id="newMessages${chat.id}"></strong> <br/>
        <i>${moment(startTime).format('DD/MM HH:mm')}</i>
        </li>`;

        console.log(startTime);

        var chatItem = $(`#${chat.id}`);
        if (chatItem.length) {
            html = $(`#${chat.id}`);
            $(`#${chat.id}`).remove();
        }
        $('.list-group').prepend(html);

        var htmlMessage;
        if (chat.id == currentChatId) {
            htmlMessage = isImage ? `<div class="message other-message">Cliente: <img class="img-fluid" src="${message}"/></div >` : `<div class="message other-message">Cliente: ${message}</div >`;

            $(`#chat-container${chat.id}`).append(htmlMessage);
        } else {
            var count = $(`#newMessages${chat.id}`).text();

            $(`#newMessages${chat.id}`).html(++count);
        }

        $(`#chat-container${chat.id}`).scrollTop = 9999999;
    })

    employeeConnection.on('EmployeesSent', (sent, message, chatId) => {
        if (sent) {
            var htmlMessage = `<div class="message user-message">Você: ${message}</div >`;
            $(`#chat-container${chatId}`).append(htmlMessage);
            $(`#chat-container${chatId}`).scrollTop = 9999999;

            var html = $(`#${chatId}`);
            $(`#${chatId}`).remove();
            $(".list-group").prepend(html);
        }
    })
}

function changeChats() {
    var selectChats = $('#selectChats');
    if (selectChats.val() == 'open') {
        showOpenChats();
    }
    else {
        showClosedChats();
    }
}

function showOpenChats() {
    $('.open').show();

    $('.closed').hide();
}

function showClosedChats() {
    $('.open').hide();

    $('.closed').show();
}

function sendMessageToCustomer(message) {
    employeeConnection.invoke('SendMessageToCustomer', message, parseInt(currentChatId));
}

function showChat(chatId) {
    currentChatId = chatId;

    $(`#newMessages${chatId}`).html('');

    employeeConnection.invoke('GetMessagesByChatId', parseInt(chatId));

    employeeConnection.on('ReceiveMessages', (messages, chat) => {
        var disabled = chat.closed ? 'disabled' : ''
        var chatMessage = chat.closed ? 'Chat encerrado' : '';

        var htmlMessage = `<div class="col-md-8" id="chat">
            <div class="d-flex justify-content-between">
                <h2>Chat ${chat.id} ${chatMessage ? '- ' + chatMessage : ''}</h2>
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

        $('#chat').remove();
        $(`#chat-area`).append(htmlMessage);

        var messageInput = $(`#message-input${chat.id}`);
        var sendButton = $(`#send-button${chat.id}`);

        if (sendButton) {
            sendButton.click(() => {
                var messageText = messageInput.val();
                if (messageText) {
                    sendMessageToCustomer(messageText);
                    messageInput.val('');
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

    
}

function getHtmlMessages(messages) {
    var html = '';

    messages.forEach((msg) => {
        var htmlClass = msg.sender == "Employee" ? "user" : "other";
        var sender = msg.sender == "Employee" ? "Você" : "Cliente";
        html += msg.isImage ? `<div class="message ${htmlClass}-message">${sender}: <img class="img-fluid" src="${msg.text}"/></div >` : `<div class="message ${htmlClass}-message">${sender}: ${msg.text}</div> \n`
    })
    
    return html;
}

function endChat(chatId) {
    employeeConnection.invoke('EndChat', parseInt(chatId));

    employeeConnection.on('ChatClosed', (closed) => {
        if (closed) {
            $(`#${currentChatId}`).addClass('closed');
            $(`#${currentChatId}`).removeClass('open');
            $(`#${currentChatId}`).hide();
            $('#chat').remove();
        }
    })
}