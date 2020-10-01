/*
 * Copyright (c) 2020 Bowser65
 * Licensed under the Open Software License version 3.0
 */

const { React, getModule, getModuleByDisplayName, constants: { MarketingURLs: { DEVELOPER_PORTAL } } } = require('powercord/webpack');
const { Plugin } = require('powercord/entities');
const { inject, uninject } = require('powercord/injector');

module.exports = class InAppDevPortal extends Plugin {
  startPlugin () {
    this._injectDevPortal();
    powercord.api.router.registerRoute({
      path: '/inapp-devportal',
      render: () => React.createElement('iframe', {
        className: 'inappdevportal',
        src: DEVELOPER_PORTAL,
        style: {
          width: '100%',
          height: '100%'
        }
      }),
      noSidebar: false
    });
    powercord.api.commands.registerCommand({
      command: 'devportal',
      description: 'Temp command to go to devportal until i fix the button.',
      usage: '{c}',
      executor: async () => {
        require('powercord/webpack').getModule([ 'transitionTo' ], false).transitionTo('/_powercord/inapp-devportal');
        const doc = document.querySelector('.inappdevportal').contentDocument;
        Array.prototype.forEach.call(document.querySelectorAll('link[rel=stylesheet]'), (link) => {
          const newLink = document.createElement('link');
          newLink.rel = link.rel;
          newLink.href = link.href;
          doc.head.appendChild(newLink);
        });
        Array.prototype.forEach.call(document.querySelectorAll('style'), (link) => {
          const newLink = document.createElement('style');
          newLink.innerHTML = link.innerHTML;
          doc.head.appendChild(newLink);
        });
      }
    });
  }

  pluginWillUnload () {
    uninject('devportal-item');
    powercord.api.router.unregisterRoute('/inapp-devportal');
    powercord.api.commands.unregisterCommand('devportal');
  }

  async _injectDevPortal () {
    const PrivateChannel = await getModule([ 'LinkButton' ]);
    // const PrivateChannelsList = await getModuleByDisplayName('ConnectedPrivateChannelsList');
    const PrivateChannelsList = await getModule(m => m.default && m.default.displayName === 'ConnectedPrivateChannelsList');
    console.log(PrivateChannel, PrivateChannelsList);
    inject('devportal-item', PrivateChannelsList, 'default', (_, res) => {
      const selected = window.location.pathname === '/_powercord/inapp-devportal';
      console.log(res);
      const index = res.props.children.map(c => c && c.type && c.type.displayName && c.type.displayName.includes('FriendsButtonInner')).indexOf(true) + 1;
      if (selected) {
        res.props.children.forEach(c => {
          c.props.selected = false;
        });
      }
      res.props.children = [
        ...res.props.children.slice(0, index),
        () => React.createElement('a', {
          iconName: 'OverlayOn',
          route: '/_powercord/inapp-devportal',
          text: 'Developer Portal',
          selected
        }),
        ...res.props.children.slice(index)
      ];
      // delete res.props.children[32]
      return res;
    });
    PrivateChannelsList.default.displayName = 'ConnectedPrivateChannelsList';
  }
};
