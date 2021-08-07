const Coordinates = require('coordinate-parser');

const geocoder = require('../geocoder');

const defaults = {
  locale: 'ru-RU',
  timeZone: 'Europe/Moscow',
};

const mailCallback = (botCallback) => async (mail) => {
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

  try {
    const res = await geocoder.reverse({
      lat: flight.custom.latitude,
      lon: flight.custom.longitude,
    });

    if (!res) {
      throw 'Nothing found in geocoder reverse search';
    }

    const location = res[0];

    const { formattedAddress, extra, administrativeLevels, city, country, countryCode } = location;

    if (formattedAddress) {
      flight.custom.formattedAddress = formattedAddress;
    }

    if (extra) {
      if (extra.establishment) {
        flight.custom.airport = extra.establishment;
      } else {
        flight.custom.airport = extra.neighborhood;
      }
    }

    if (city) {
      flight.custom.city = city;
    } else {
      if (administrativeLevels) {
        flight.custom.city = administrativeLevels.level1short ?? administrativeLevels.level2short;
      }
    }

    if (country) {
      flight.custom.country = country ?? countryCode;
    }

    const readableAddress = [flight.custom.airport, flight.custom.city, flight.custom.country];

    flight.custom.readableAddress = readableAddress.filter(Boolean).join(', ');

    botCallback(
      `<b>${flight.name} ${flight.type}</b>\n\n${flight.custom.readableAddress}\n${flight.custom.time} ${flight.custom.date}\n\n${flight.custom.formattedAddress}\n<code>${flight.custom.latlng}</code>\n`
    );
  } catch (err) {
    console.log(err);
    // Send notification without detailed geo info
    botCallback(
      `<b>${flight.name} ${flight.type}</b>\n\n${flight.custom.time} ${flight.custom.date}\n\n<code>${flight.custom.latlng}</code>\n`
    );
  }
};

module.exports = mailCallback;
