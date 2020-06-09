'use strict';

const EventEmitter = require('events');

const Assistant = require('./components/assistant');
const Auth = require('./components/auth');
const Conversation = require('./components/conversation');

function GoogleAssistant(authConfig) {
  // EventEmitter inheritance
  EventEmitter.call(this);

  if (authConfig === null) {
    this.emit('error', new Error('Missing auth config object'))
  }

  this.authConfig = authConfig;
  this.assistant = null;
}

// EventEmitter inheritance
GoogleAssistant.prototype = Object.create(EventEmitter.prototype);

GoogleAssistant.prototype.assistantReady = function() {
  this.assistant && this.emit('ready', this.assistant);
}

GoogleAssistant.prototype.setup = function() {
  if (this.authConfig.oauth2Client) {
    this.assistant = new Assistant(this.authConfig.oauth2Client);
    this.assistantReady();
  } else {
    const auth = new Auth(this.authConfig);
    auth.on('ready', client => {
      this.assistant = new Assistant(client);
      this.assistantReady();
    }) 
  }
}

GoogleAssistant.prototype.start = function(conversationConfig) {
  if (this.assistant === null) {
    const error = new Error('Tried calling start() before the ready event!');
    this.emit('error', error);
    return;
  }

  const conversation = new Conversation(this.assistant, conversationConfig);
  this.emit('started', conversation);
}

module.exports = GoogleAssistant;
