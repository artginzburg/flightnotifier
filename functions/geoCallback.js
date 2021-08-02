module.exports = function geoCallback(flight, botCallback) {
  return (err, res) => {
    if (err) {
      console.log(err);
      return;
    }

    const location = res[0];

    const { city, airport, locality, administrative_area_level_1, country, formatted_address } =
      location;

    if (city) {
      flight.custom.city = city;
    }

    if (airport) {
      flight.custom.airport = airport.short_name ?? airport.long_name;
    }

    if (locality) {
      flight.custom.locality = locality.short_name ?? locality.long_name;
    } else {
      if (administrative_area_level_1) {
        flight.custom.locality =
          administrative_area_level_1.short_name ?? administrative_area_level_1.long_name;
      }
    }

    if (country) {
      flight.custom.country = country.long_name ?? country.short_name;
    }

    if (formatted_address) {
      flight.custom.formatted_address = formatted_address;
    }

    const readableAddress = [flight.custom.airport, flight.custom.locality, flight.custom.country];

    flight.custom.readableAddress = readableAddress.filter(Boolean).join(', ');

    botCallback(
      `<b>${flight.name} ${flight.type}</b>\n\n${flight.custom.readableAddress}\n${flight.custom.time} ${flight.custom.date}\n\n${flight.custom.formatted_address}\n<code>${flight.custom.latlng}</code>\n`
    );
  };
};
