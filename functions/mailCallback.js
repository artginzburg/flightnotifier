const Coordinates = require('coordinate-parser');

const geoCallback = require('./geoCallback');

const defaults = {
  locale: 'ru-RU',
  timeZone: 'Europe/Moscow',
};

module.exports = function mailCallback(botCallback, geo) {
  return (mail) => {
    const { headers, subject, text } = mail;

    // if (!headers.from.includes('no-reply@spidertracks.com')) {
    //   return;
    // }
    if (!(subject.includes('TAKE OFF') || subject.includes('LANDING'))) {
      return;
    }

    const flight = {};

    const subjectSplitted = subject.split(':');
    flight.type = subjectSplitted.pop().trim().toLowerCase();
    flight.name = subjectSplitted.pop().trim();

    text.split('\n').forEach((element) => {
      const el = element.split(':');
      const key = el.shift().toLowerCase();
      const value = el.join(':');
      if (value && !key.includes('*') && !key.includes('<') && !(value[0] === ' ')) {
        flight[key] = value;
      }
    });

    flight.custom = {};

    const timeSplitter = ' ';
    const timeSplit = flight.time.split(timeSplitter);

    flight.custom.timeZone = timeSplit.pop() ?? defaults.timeZone;
    flight.custom.locale = flight.custom.timeZone.split('/')[0];

    const datetime = new Date(timeSplit.join(timeSplitter));

    const { timeZone } = flight.custom;

    flight.custom.date = datetime.toLocaleDateString(defaults.locale, {
      day: 'numeric',
      month: 'numeric',
      timeZone,
    });
    flight.custom.time = datetime.toLocaleTimeString(defaults.locale, {
      timeStyle: 'short',
      timeZone,
    });

    const coordinates = new Coordinates(`${flight.latitude} ${flight.longitude}`);

    flight.custom.latitude = coordinates.latitude;
    flight.custom.longitude = coordinates.longitude;

    flight.custom.latlng = `${flight.custom.latitude}, ${flight.custom.longitude}`;

    if (geo) {
      geo.find(flight.custom.latlng, geoCallback(flight, botCallback));
    } else {
      // Send notification without detailed geo info
      botCallback(
        `<b>${flight.name} ${flight.type}</b>\n\n${flight.custom.time} ${flight.custom.date}\n\n<code>${flight.custom.latlng}</code>\n`
      );
    }
  };
};
