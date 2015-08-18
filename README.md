# `/time` slash command for Slack

## inputs

    params: (from slash command webhook)
      token:
      channel_id:
      user_id:
      text: 

    config: (private Slack API info)
      SLASH_TOKEN:
      BOT_HOST:
      BOT_PATH:
      BOT_TOKEN:
      API_TOKEN:
      GENERAL_ID:

    callback: (log success / error)

## server setup

Includes example setup for [iron.io](https://www.iron.io/).

## time formats

* Today, Tomorrow, Yesterday, last Friday, etc
* 10/13/2013
* this Friday 13:00
* Saturday, 17 August 2013
* Sat Aug 17 2013 18:40:39 GMT+0900 (JST)

(Examples from the excellent [chrono](http://wanasit.github.io/pages/chrono/) library.)

