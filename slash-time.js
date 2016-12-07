var request = require('request');
var https = require('https');
var chrono = require('chrono-node');

function sortObjectToArray(obj) {
  out = [];
  Object
    .keys(obj)
    .sort(
      function (a, b) {
        return parseInt(a) - parseInt(b);
      }
    )
    .forEach(
      function (key) {
        out.push(obj[key]);
      }
    );
  return out;
}


module.exports = SlashTime = function(params, config, callback) {
  // Minimal webhook safety
  if (params.token !== config.SLASH_TOKEN) { return; }

  // Save from 2 API calls
  var everybody = null;
  var members = null;

  
  var sendToSlack = function(channel, content) {
    request.post(
      {
        url: params.response_url,
        body: content
      }, 
      function (err, response, body) {
        if (err) {
          errorOut(err);
        }
        if (response && response.statusCode == 200) {
          callback('Success: ' + content);
        }
      }
    );
  };

  // Get everybody's info
  var usersOptions = {
    url: 'https://slack.com/api/users.list?token=' + config.API_TOKEN
  };
  function usersCallback(error, response, body) {
    if (!error && response.statusCode == 200) {
      var info = JSON.parse(body);
      if (info.ok) {
        everybody = info.members;
        filterChannelUsers(everybody, members);
      } else {
        errorOut("Users API error :( " + info.error);
      }
    } else {
      errorOut("Users request error :( " + error);
    }
  }
  request(usersOptions, usersCallback);

  // Get channel's members
  channel_id = params.channel_id;
  if (params.channel_name === 'directmessage') {
    // Can't get DM user list :(
    channel_id = config.GENERAL_ID;
  }
  var channelOptions = {
    url: 'https://slack.com/api/channels.info' +
      '?channel=' + channel_id + 
      '&token=' + config.API_TOKEN
  };
  function channelCallback(error, response, body) {
    if (!error && response.statusCode == 200) {
      var info = JSON.parse(body);
      if (info.ok) {
        members = info.channel.members;
        filterChannelUsers(everybody, members);
      } else {
        errorOut("Channel API error :( " + info.error);
      }
    } else {
      errorOut("Channel request error :( " + error);
    }
  }
  request(channelOptions, channelCallback);

  var filterChannelUsers = function (everybody, members) {
    if (!everybody || !members) { 
      // Wait for both API results
      return; 
    }
    var zoneHash = {};
    for (var i=0; i<everybody.length; i++) {
      var person = everybody[i];
      if (members.indexOf(person.id) === -1) {
        // Not in channel
        continue;
      }
      if (!person.tz || !person.tz_offset) {
        continue;
      }
      if (person.id === params.user_id) {
        var userTimezoneOffset = person.tz_offset;
      }

      // Save to hash
      if (zoneHash[person.tz_offset]) {
        zoneHash[person.tz_offset].people.push(person.profile.real_name_normalized);
      } else {
        zoneHash[person.tz_offset] = {
          offset: person.tz_offset,
          label: person.tz_label,
          people: [person.profile.real_name_normalized]
        };
      }
    }
    zones = sortObjectToArray(zoneHash);

    var getIcon = function (offset) {
      if (offset < -3600) {
        return ':earth_americas:'
      }
      if (-3600 <= offset && offset < 14400) {
        return ':earth_africa:';
      }
      return ':earth_asia:';
    };
    var getSleep = function (date) {
      var hour = date.getHours();
      if ( 9 <= hour && hour <= 22) {
        return ':sun_with_face:';
      }
      return ':new_moon_with_face:';
    };
    var getDate = function (date) {
      var string = ((date.getMonth()+1).toString().length === 1) ? '0' : '';
      string += (date.getMonth()+1) + '-';
      string += (date.getDate().toString().length === 1) ? '0' : '';
      string += date.getDate();
      return string;
    };
    var getDay = function (date) {
      var days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      return days[date.getDay()];
    };
    var getTime = function (date) {
      var string = (date.getHours().toString().length === 1) ? '0' : '';
      string += date.getHours() + ':';
      string += (date.getMinutes().toString().length === 1) ? '0' : '';
      string += date.getMinutes();
      return string;
    }
    var abbreviate = function (string) {
      abbr = '';
      string.split(' ').forEach(function(word){
        abbr += word.charAt(0);
      });
      return abbr;
    };
    var makeInitials = function (people) {
      return people.map(function (name) {
        return abbreviate(name);
      });
    };

    if (userTimezoneOffset != null) {
      var offTime = chrono.parseDate(params.text);
      var utcTime = new Date( Date.parse(offTime) - userTimezoneOffset*1000 );
      var times = '';
      var lastIcon = '';
      var lastDate = '';
      var lastSleep = '';
      for (var i=0; i<zones.length; i++) {
        var zone = zones[i];
        var time = new Date( Date.parse(utcTime) + zone.offset*1000 );

        var icon = getIcon(zone.offset);
        times += (icon !== lastIcon) ? icon + ' ' : '';
        lastIcon = icon;

        var dateString = '_' + getDay(time) + ' ' + getDate(time) + '_ ';
        times += (dateString !== lastDate) ? dateString : '';
        lastDate = dateString;

        var sleep = getSleep(time);
        times += (sleep !== lastSleep) ? sleep + ' ' : '';
        lastSleep = sleep;

        times += '*' + getTime(time) + '* ';
        times += '(' + 
          abbreviate(zone.label) +
          // ': ' +
          // makeInitials(zone.people).join(', ') +
          ') ';
      }
      sendToSlack(params.channel_id, times);
    } else {
      errorOut('You need to set timezone in Slack setup (slack.com/account/settings).');
    }
  };

  var errorOut = function (message) {
    callback(message);
  }

  return;
}