"use strict"

var customerConnection = new signalR.HubConnectionBuilder().withUrl("/ChatHub").withAutomaticReconnect().build();

function startCustomerChat() {
    // Start signalr connection
    customerConnection.start()
        .then(() => {
            var chatInfo = JSON.parse(sessionStorage.getItem("chatInfo"));
            if (chatInfo) {
                customerConnection.invoke("NewConnectionId", chatInfo.id);
            }
            enableCustomerChat();
        })
        .catch((err) => {
            console.error(err.toString());
            setTimeout(() => startCustomerChat(), 5000);
        })
}

function enableCustomerChat() {
    const chatContainer = $('#chat-container');
    const chatHeader = $('#chat-header');
    const closeButton = $('#close-button');
    const chatBox = $('#chat-box');
    const messageInput = $('#message-input');
    const sendButton = $('#send-button');
    const toggleButton = $('#toggle-button');

    chatContainer.hide();
    toggleButton.show();

    toggleButton.click(() => {
        chatContainer.show();
        toggleButton.hide();
    });

    chatHeader.click(() => {
        chatContainer.hide();
        toggleButton.show();
    });

    sendButton.click(() => {
        const message = messageInput.val();
        if (message) {
            sendMessage(message);
            messageInput.val('');
        }
    });

    customerConnection.on("CustomerReceive", (message, chatId) => {
        var htmlMessage = `<div class="message other-message">Agente: ${message}</div >`;
        $('#chat-box').append(htmlMessage);
        chatBox.scrollTop = 9999999;
    })

    customerConnection.on('ChatClosed', (closed, chatId) => {
        var chatInfo = JSON.parse(sessionStorage.getItem('chatInfo'));
        if (closed && chatInfo.id == chatId) {
            var messageInput = $('#message-input');
            var sendButton = $('#send-button');

            messageInput.prop('disabled', true);
            messageInput.val('Chat encerrado.');
            sendButton.prop('disabled', true);

            sessionStorage.removeItem('chatInfo');
        }
    })

    customerConnection.on('Sent', (sent, message, chatId) => {
        if (sent) {
            var htmlMessage = `<div class="message user-message">Você: ${message}</div >`;
            $('#chat-box').append(htmlMessage);
            $('#chat-box').scrollTop(9999999);

            var chatInfo = { id: chatId };
            sessionStorage.setItem("chatInfo", JSON.stringify(chatInfo));
        }
    })
}

function sendMessage(message) {
    var chatInfo = JSON.parse(sessionStorage.getItem('chatInfo'));
    var chatId;

    if (chatInfo) {
        chatId = chatInfo.id;
    }
    else {
        chatId = 0;
    }

    customerConnection.invoke('SendMessage', message, chatId);
}

// Send image
function sendImage() {
    $('#imageUpload').trigger('click');
    $('#imageUpload').one('change',() => {
        uploadImage();
    })
    $('#imageUpload').val('');
}

// Upload image
function uploadImage() {
    var formData = new FormData();
    var fileUpload = $('#imageUpload').get(0);
    var files = fileUpload.files;
    formData.append('image', files[0]);

    $.ajax({
        url: 'Chat/UploadImage',
        type: 'POST',
        contentType: false,
        processData: false,
        data: formData,
        success: function (result) {
            var htmlMessage = `<div class="message user-message">Você: <img class="img-fluid" src="${result.src}"/></div >`;
            $('#chat-box').append(htmlMessage);
            setTimeout(() => {
                $('#chat-box').scrollTop(9999999);
            }, 500)
        }
    })
}
