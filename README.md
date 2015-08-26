# `/time` slash command for Slack

![slash-time](https://cloud.githubusercontent.com/assets/395307/9330787/6bb176f2-4589-11e5-917a-889170ea9331.png)

## inputs

    params: (automatically passed from slash command webhook)
      token:
      channel_id:
      user_id:
      text: 

    config: (your Slack API info, must be configured)
      SLASH_TOKEN: (see below)
      API_TOKEN: (see below)
      GENERAL_ID: (see below)
      BOT_NAME: clockbot
      BOT_EMOJI: :hourglass:
      DAY_START: 9 (first hour to show sun emoji)
      DAY_END: 22 (last hour to show sun emoji)

    callback: (log success / error)

## server setup

Includes example setup for [Iron.io] which doesn't require server setup. More info: [Super Easy Serverless Slack Bots]. slash-time-iron.js and slash-time.worker are specific to iron.io setup. You'll also need iron.json.

[Iron.io]: https://www.iron.io/
[Super Easy Serverless Slack Bots]: http://www.iron.io/blog/2015/03/super-easy-serverless-slack-bots.html

General steps:

* Create a project on [Iron.io] and download the iron.json file
* Copy config.json.template to config.json
* Create a [Slack API token] and set the token as `API_TOKEN` in config.json
* Create a new [Slack slash command] `/time` and set the token as `SLASH_TOKEN` in config.json
* [Get the ID of your general channel](channel id) by clicking on the #general link. Set the id to `GENERAL_ID` in config.json
* Deploy once with `iron_worker upload slash-time.worker --worker-config config.json`
* Set the URL of the slash command to the webhook URL for your Iron Worker (found under your project, Worker, Code tab, then worker details page)
* Type `/time 3pm tomorrow` in Slack and be amazed!

[Slack API token]: https://api.slack.com/web
[Slack slash command]: https://munirent.slack.com/services/new/slash-commands
[channel id]: https://api.slack.com/methods/channels.info/test

## time formats

* Today, Tomorrow, Yesterday, last Friday, etc
* 10/13/2013
* this Friday 13:00
* Saturday, 17 August 2013
* Sat Aug 17 2013 18:40:39 GMT+0900 (JST)

(Examples from the excellent [chrono](http://wanasit.github.io/pages/chrono/) library.)

