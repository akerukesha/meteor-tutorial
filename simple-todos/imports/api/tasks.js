import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';

export const Tasks = new Mongo.Collection('tasks');

if (Meteor.isServer) {
  // This code only runs on the server
  // Only publish tasks that are public or belong to the current user
  Meteor.publish('tasks', function tasksPublication() {
    return Tasks.find({
      $or: [
        { private: { $ne: true } },
        { owner: this.userId },
      ],
    });
  });
}

Meteor.methods({
  'tasks.test'(){
    Meteor.call('tasks.getReplacedMessageForNotify')
    .then((res) => {
      console.log('showString then', res);
    })
    .catch((err) => (console.log('e', e)))
  },
  'tasks.getReplacedMessageForNotify'(){
    return new Promise( (resolve, reject) => {
      let str = '/{linkForTrack}///';
      let url = "https://app.relog.kz/";

      var trackPromise = Meteor.call('tasks.getBitlyResponse', str.includes('{linkForTrack}') ? `${url}track/` : "");
      var feedbackPromise = Meteor.call('tasks.getBitlyResponse', str.includes('{linkForFeedback}') ? `${url}rate/` : "");

      console.log('trackPromise', trackPromise);
      console.log('feedbackPromise', feedbackPromise);

      Promise.all([trackPromise, feedbackPromise]
      ).then( (res) => {
        console.log('getReplacedMessageForNotify', res);
        resolve(str
          .replace(/{linkForTrack}/g, res[0].url || "")
          .replace(/{linkForFeedback}/g, res[1].url || "")
        );
      })
      .catch(e => reject(e));
    });
  },
  'tasks.getBitlyResponse'(url) {
    return new Promise( (resolve, reject) => {

      if(url == "") resolve("");

      let accessToken = '622e80082fcdb21f4a000fe352171334d5c740ff';
      const { BitlyClient } = require('bitly');
      const bitly = new BitlyClient(accessToken, {});

      let result;
      try {
        bitly.shorten(url)
          .then( (res) => {
            console.log('here', res);
            resolve(res);
          })
          .catch(e => reject(e));
      } catch(e) {
        reject(e);
        throw e;
      }
    });
  },
  'tasks.insert'(text) {
    check(text, String);

    // Make sure the user is logged in before inserting a task
    if (! this.userId) {
      throw new Meteor.Error('not-authorized');
    }

    Tasks.insert({
      text,
      createdAt: new Date(),
      owner: this.userId,
      username: Meteor.users.findOne(this.userId).username,
    });
  },
  'tasks.remove'(taskId) {
    check(taskId, String);

    const task = Tasks.findOne(taskId);
    if (task.private && task.owner !== this.userId) {
      // If the task is private, make sure only the owner can delete it
      throw new Meteor.Error('not-authorized');
    }

    Tasks.remove(taskId);
  },
  'tasks.setChecked'(taskId, setChecked) {
    check(taskId, String);
    check(setChecked, Boolean);

    const task = Tasks.findOne(taskId);
    if (task.private && task.owner !== this.userId) {
      // If the task is private, make sure only the owner can check it off
      throw new Meteor.Error('not-authorized');
    }

    Tasks.update(taskId, { $set: { checked: setChecked } });
  },
  'tasks.setPrivate'(taskId, setToPrivate) {
    check(taskId, String);
    check(setToPrivate, Boolean);

    const task = Tasks.findOne(taskId);

    // Make sure only the task owner can make a task private
    if (task.owner !== this.userId) {
      throw new Meteor.Error('not-authorized');
    }

    Tasks.update(taskId, { $set: { private: setToPrivate } });
  },
});