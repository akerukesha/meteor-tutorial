import React, { Component } from 'react';
import { Meteor } from 'meteor/meteor';
import { Promise } from 'meteor/promise';
import classnames from 'classnames';

import { Tasks } from '../api/tasks.js';

// Task component - represents a single todo item
export default class Task extends Component {

  // getBitlyResponse(url) {
  //   return new Promise( (resolve, reject) => {
  //     let accessToken = '622e80082fcdb21f4a000fe352171334d5c740ff';
  //     const { BitlyClient } = require('bitly');
  //     const bitly = new BitlyClient(accessToken, {});

  //     let result;
  //     try {
  //       bitly.shorten(url)
  //         .then( (res) => {
  //           console.log('here', res);
  //           resolve(res);
  //         })
  //         .catch(e => reject(e));
  //     } catch(e) {
  //       reject(e);
  //       throw e;
  //     }
  //   });
  // };

  // getReplacedMessageForNotify(){
  //   return new Promise( (resolve, reject) => {
  //     let str = '/{linkForTrack}//{linkForFeedback}/';
  //     let url = "https://app.relog.kz/";

  //     var trackPromise = getBitlyResponse(`${url}track/`);
  //     var feedbackPromise = getBitlyResponse(`${url}rate/`);

  //     console.log('trackPromise', trackPromise);
  //     console.log('feedbackPromise', feedbackPromise);

  //     Promise.all([trackPromise, feedbackPromise]
  //     ).then( (res) => {
  //       console.log('getReplacedMessageForNotify', res);
  //       resolve(str
  //         .replace(/{linkForTrack}/g, res[0].url || "")
  //         .replace(/{linkForFeedback}/g, res[1].url || "")
  //       );
  //     })
  //     .catch(e => reject(e));
  //   });
  // }

  showString(event){
    event.preventDefault();

    // getReplacedMessageForNotify()
    // .then((res) => {
    //   console.log('showString then', res);
    //   this.setState({
    //     testString: res,
    //   });
    // })
    // .catch((err) => (console.log('e', e)))
    Meteor.call('tasks.test');
  }

  toggleChecked() {
    // Set the checked property to the opposite of its current value
    Meteor.call('tasks.setChecked', this.props.task._id, !this.props.task.checked);
  }

  deleteThisTask() {
    Meteor.call('tasks.remove', this.props.task._id);
  }

  togglePrivate() {
    Meteor.call('tasks.setPrivate', this.props.task._id, !this.props.task.private);
  }

  render() {
    // Give tasks a different className when they are checked off,
    // so that we can style them nicely in CSS
    const taskClassName = classnames({
      checked: this.props.task.checked,
      private: this.props.task.private,
    });

    return (
      <li className={taskClassName}>
        <button className="delete" onClick={this.deleteThisTask.bind(this)}>
          &times;
        </button>

        <button className="test" onClick={this.showString.bind(this)}>Test</button>

        <input
          type="checkbox"
          readOnly
          checked={!!this.props.task.checked}
          onClick={this.toggleChecked.bind(this)}
        />

        { this.props.showPrivateButton ? (
          <button className="toggle-private" onClick={this.togglePrivate.bind(this)}>
            { this.props.task.private ? 'Private' : 'Public' }
          </button>
        ) : ''}

        <span className="text">
          <strong>{this.props.task.username}</strong>: {this.props.task.text}
        </span>
      </li>
    );
  }
}
